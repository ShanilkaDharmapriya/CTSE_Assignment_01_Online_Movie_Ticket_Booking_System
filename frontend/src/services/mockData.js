const MOCK_IMAGES = {
  action: 'file:///C:/Users/pathu/.gemini/antigravity/brain/b465a145-83a3-4444-9dac-456a5a533270/action_movie_poster_1_1774111867653.png',
  drama: 'file:///C:/Users/pathu/.gemini/antigravity/brain/b465a145-83a3-4444-9dac-456a5a533270/drama_movie_poster_1_1774111884972.png',
  horror: 'file:///C:/Users/pathu/.gemini/antigravity/brain/b465a145-83a3-4444-9dac-456a5a533270/horror_movie_poster_1_1774111903065.png',
  comedy: 'file:///C:/Users/pathu/.gemini/antigravity/brain/b465a145-83a3-4444-9dac-456a5a533270/comedy_movie_poster_1_1774111918753.png',
};

export const mockMovies = [
  {
    _id: 'm1',
    title: 'Star Horizon',
    genre: 'Sci-Fi / Space Opera',
    rating: 8.9,
    duration: 145,
    description: 'An epic space odyssey where a crew of explorers venture beyond the known universe to save humanity from a dying star. A visual masterpiece of futuristic exploration.',
    poster: MOCK_IMAGES.action,
  },
  {
    _id: 'm2',
    title: 'The Silent Bridge',
    genre: 'Drama / Mystery',
    rating: 8.4,
    duration: 128,
    description: 'A haunting psychological drama about a detective who returns to his hometown to solve a cold case that has lingered in the shadows for decades.',
    poster: MOCK_IMAGES.drama,
  },
  {
    _id: 'm3',
    title: 'Shadow Dweller',
    genre: 'Horror / Thriller',
    rating: 7.8,
    duration: 110,
    description: 'When a family moves into a historic Victorian mansion, they discover they are not alone. Something ancient and hungry waits in the shadows.',
    poster: MOCK_IMAGES.horror,
  },
  {
    _id: 'm4',
    title: 'Tropical Trouble',
    genre: 'Comedy / Adventure',
    rating: 7.5,
    duration: 105,
    description: 'Best friends Dave and Phil win a contest for a tropical getaway, only to realize they are stuck on a deserted island with nothing but a broken blender and their wits.',
    poster: MOCK_IMAGES.comedy,
  },
];

export const mockShows = [
  {
    _id: 's1',
    movieId: 'm1',
    theater: 'Grand Cinema Hall 1',
    date: '2026-03-25',
    time: '18:30',
    availableSeats: 42,
    price: 1200,
  },
  {
    _id: 's2',
    movieId: 'm1',
    theater: 'IMAX Deluxe',
    date: '2026-03-25',
    time: '21:00',
    availableSeats: 15,
    price: 2500,
  },
  {
    _id: 's3',
    movieId: 'm2',
    theater: 'Art House Screen A',
    date: '2026-03-26',
    time: '19:00',
    availableSeats: 20,
    price: 1500,
  },
  {
    _id: 's4',
    movieId: 'm3',
    theater: 'Midnight Cinema',
    date: '2026-03-27',
    time: '23:30',
    availableSeats: 10,
    price: 1000,
  },
  {
    _id: 's5',
    movieId: 'm4',
    theater: 'Family Screen 2',
    date: '2026-03-28',
    time: '14:00',
    availableSeats: 85,
    price: 800,
  },
];

export const mockBookings = [
  {
    _id: 'b1',
    bookingReference: 'BK-7741',
    movieTitle: 'Star Horizon',
    theaterName: 'IMAX Deluxe',
    showDateTime: '2026-03-25T21:00:00',
    seats: 2,
    amount: 5000,
    status: 'CONFIRMED',
  },
];

export const mockUser = {
  id: 'u1',
  username: 'DemoUser',
  email: 'demo@example.com',
};
