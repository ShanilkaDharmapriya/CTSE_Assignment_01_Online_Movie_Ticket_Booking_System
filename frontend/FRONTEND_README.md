# Movie Ticket Booking Frontend

A modern React frontend for the online movie ticket booking system with Tailwind CSS styling.

## Features

- **User Authentication**: Register and Login functionality with JWT tokens
- **Browse Movies**: View all available movies with details and ratings
- **Book Tickets**: Select shows, choose seats interactively, and book tickets
- **Secure Payment**: Complete payment details and process transactions
- **Booking History**: View all past bookings and cancel future bookings
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Get instant feedback on availability and status

## Tech Stack

- **React 18**: Modern UI framework
- **Tailwind CSS**: Utility-first CSS framework for styling
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **Context API**: State management for authentication

## Installation

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create a `.env` file (or update existing):

```
REACT_APP_API_URL=http://localhost:3000
```

### 3. Start Development Server

```bash
npm start
```

The application will open at `http://localhost:3000`

## Project Structure

```
frontend/
├── public/                 # Static files
│   └── index.html         # Main HTML file
├── src/
│   ├── components/        # Reusable React components
│   │   ├── Navbar.js      # Navigation bar
│   │   ├── MovieCard.js   # Movie card display
│   │   ├── SeatSelector.js # Seat selection component
│   │   └── ProtectedRoute.js # Route protection
│   ├── context/           # State management
│   │   └── AuthContext.js # Authentication context
│   ├── pages/             # Page components
│   │   ├── Login.js       # Login page
│   │   ├── Register.js    # Registration page
│   │   ├── Home.js        # Movie listing page
│   │   ├── MovieDetail.js # Movie details page
│   │   ├── Booking.js     # Seat selection page
│   │   ├── Checkout.js    # Payment page
│   │   └── BookingHistory.js # Booking history
│   ├── services/          # API services
│   │   └── api.js         # Axios instance with interceptors
│   ├── App.js             # Main App component
│   ├── index.js           # React entry point
│   ├── index.css          # Global styles + Tailwind
│   └── tailwind.config.js # Tailwind configuration
├── .env                   # Environment variables
├── package.json           # Dependencies
├── tailwind.config.js     # Tailwind config
└── postcss.config.js      # PostCSS config
```

## Available Pages

### Public Pages
- **/login** - User login
- **/register** - User registration

### Protected Pages (requires authentication)
- **/** - Home page with movie listings
- **/movie/:movieId** - Movie details and show selection
- **/booking/:movieId/:showId** - Seat selection
- **/checkout/:bookingId** - Payment processing
- **/booking-history** - View and manage bookings

## API Integration

The frontend communicates with the backend API Gateway (port 3000) through:

- **Authentication**: `/auth/login`, `/auth/register`
- **Movies**: `/movies`, `/movies/:id`
- **Shows**: `/shows`, `/shows/:id`
- **Bookings**: `/bookings`, `/bookings/:id`, DELETE `/bookings/:id`
- **Payments**: `/payments`

All requests include JWT token in Authorization header.

## Authentication Flow

1. User registers or logs in
2. Backend returns JWT token
3. Token stored in localStorage
4. Token automatically included in all API requests
5. If token expires (401), user is redirected to login

## Styling

Uses Tailwind CSS with custom components:
- `.btn-primary` - Primary action buttons (red)
- `.btn-secondary` - Secondary action buttons (gray)
- `.input-field` - Form input styling
- `.movie-card` - Movie card styling
- `.seat` - Seat selector styling (available, selected, booked)

## Error Handling

- API errors display in user-friendly messages
- 401 Unauthorized redirects to login
- Form validation before submission
- Loading states during API calls
- Network error handling

## Features in Detail

### Movie Browsing
- View all available movies
- Filter by genre and rating
- Click to see detailed information
- View available shows for each movie

### Booking Process
1. Select a movie
2. Choose a show (date, theater, time)
3. Select seats interactively
4. Review booking summary
5. Proceed to payment

### Payment
- Enter card details (Cardholder name, card number, expiry, CVV)
- See order summary
- Process payment securely
- Get booking reference

### Booking Management
- View all past bookings
- See booking status (CONFIRMED, CANCELLED)
- Cancel future bookings
- Receive refund confirmations
- Download booking reference

## Testing

### Test Credentials
- **Username**: testuser
- **Password**: test123

### Test Card (Payment)
- **Card Number**: 4532 1234 5678 9010
- **Expiry**: Any future date (MM/YY)
- **CVV**: Any 3 digits

## Building for Production

```bash
npm run build
```

Creates optimized production build in `build/` directory.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| REACT_APP_API_URL | http://localhost:3000 | Backend API endpoint |

## Troubleshooting

### "Cannot GET /" Error
- Ensure backend API Gateway is running on port 3000
- Check REACT_APP_API_URL in .env file
- Verify backend services are all running

### Login/Registration Fails
- Ensure auth-service is running
- Check browser console for error details
- Verify CORS is enabled on backend

### Movies Not Loading
- Check movie-service is running
- Verify API endpoint in browser console
- Check MongoDB connection

### Seat Selection Not Working
- Ensure show-service is responding
- Check show data includes availableSeats
- Verify no booking conflicts

## Performance Optimization

- Code splitting with React.lazy() (optional)
- Memoization for expensive components
- Debounced search (future)
- Lazy loading of images
- Local storage caching of auth tokens

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

MIT

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify all backend services are running
3. Check API logs for request details
4. Review database connectivity

---

**Happy Booking! 🎬**
