import API from "./api";

// Fetch all movies — optionally filter by ?status=&genre=&language=
export const getAllMovies = (params = {}) => API.get("/movies", { params });

// Fetch a single movie by ID
export const getMovieById = (id) => API.get(`/movies/${id}`);

// Fetch movie details with its active shows (aggregator in movie-service)
export const getMovieWithShows = (id) => API.get(`/movies/${id}/shows`);

// Create a new movie
export const createMovie = (data) => API.post("/movies", data);

// Update a movie
export const updateMovie = (id, data) => API.put(`/movies/${id}`, data);

// Delete a movie
export const deleteMovie = (id) => API.delete(`/movies/${id}`);
