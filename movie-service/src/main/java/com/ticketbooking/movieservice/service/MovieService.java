package com.ticketbooking.movieservice.service;

import com.ticketbooking.movieservice.dto.MovieDTO;
import com.ticketbooking.movieservice.entity.Movie;
import com.ticketbooking.movieservice.exception.ResourceNotFoundException;
import com.ticketbooking.movieservice.repository.MovieRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MovieService {

    private final MovieRepository movieRepository;

    public MovieService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    public List<MovieDTO> getAllMovies() {
        return movieRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public MovieDTO getMovieById(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found with id: " + id));
        return mapToDTO(movie);
    }

    public MovieDTO createMovie(MovieDTO movieDTO) {
        Movie movie = mapToEntity(movieDTO);
        Movie savedMovie = movieRepository.save(movie);
        return mapToDTO(savedMovie);
    }

    public MovieDTO updateMovie(Long id, MovieDTO movieDTO) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found with id: " + id));

        movie.setTitle(movieDTO.getTitle());
        movie.setDescription(movieDTO.getDescription());
        movie.setGenre(movieDTO.getGenre());
        movie.setDuration(movieDTO.getDuration());
        movie.setTicketPrice(movieDTO.getTicketPrice());

        Movie updatedMovie = movieRepository.save(movie);
        return mapToDTO(updatedMovie);
    }

    public void deleteMovie(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found with id: " + id));
        movieRepository.delete(movie);
    }

    private MovieDTO mapToDTO(Movie movie) {
        return new MovieDTO(
                movie.getMovieId(),
                movie.getTitle(),
                movie.getDescription(),
                movie.getGenre(),
                movie.getDuration(),
                movie.getTicketPrice()
        );
    }

    private Movie mapToEntity(MovieDTO movieDTO) {
        return new Movie(
                movieDTO.getMovieId(),
                movieDTO.getTitle(),
                movieDTO.getDescription(),
                movieDTO.getGenre(),
                movieDTO.getDuration(),
                movieDTO.getTicketPrice()
        );
    }
}
