import API from "./api";

// Fetch all shows — optionally filter by movieId, date, or status
export const getAllShows = (params = {}) => API.get("/shows", { params });

// Fetch a single show by ID
export const getShowById = (id) => API.get(`/shows/${id}`);

// Create a new show (admin)
export const createShow = (data) => API.post("/shows", data);

// Update a show (admin)
export const updateShow = (id, data) => API.put(`/shows/${id}`, data);

// Delete a show (admin)
export const deleteShow = (id) => API.delete(`/shows/${id}`);

// Get movie details aggregated with its shows
export const getMovieWithShows = (movieId) => API.get(`/movies/${movieId}/details`);
