# Complete System - Getting Started Guide

## Overview

The CTSE Assignment system consists of:
- **Backend**: 6 Node.js microservices + API Gateway
- **Frontend**: React application
- **Database**: MongoDB

## Starting All Services - Quick Start

### Step 1: Start All Backend Services

Open 7 separate terminal windows (or use `npm-run-all` for parallel runs).

**Terminal 1 - Auth Service (Port 5000)**
```bash
cd auth-service
npm start
```

**Terminal 2 - Movie Service (Port 4001)**
```bash
cd movie-service
npm start
```

**Terminal 3 - Show Service (Port 4002)**
```bash
cd show-service
npm start
```

**Terminal 4 - Booking Service (Port 4003)**
```bash
cd booking-service
npm start
```

**Terminal 5 - Payment Service (Port 4004)**
```bash
cd payment-service
npm start
```

**Terminal 6 - API Gateway (Port 3000)**
```bash
cd api-gateway
npm start
```

**Terminal 7 - Frontend (Port 3001)**
```bash
cd frontend
npm start
```

### Step 2: Verify All Services Are Running

Check these URLs:
- API Gateway: http://localhost:3000
- Frontend: http://localhost:3001
- Auth Service: http://localhost:5000

### Step 3: Use the Application

1. Navigate to http://localhost:3001 in your browser
2. Register a new account or use test credentials
3. Browse movies, select shows, book tickets, and pay

---

## Startup Configuration

### Environment Variables

**auth-service/.env**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/movie-booking
JWT_SECRET=your-secret-key
JWT_EXPIRY=1h
```

**movie-service/.env**
```
PORT=4001
MONGODB_URI=mongodb://localhost:27017/movie-booking
AUTH_SERVICE_URL=http://localhost:5000
```

**show-service/.env**
```
PORT=4002
MONGODB_URI=mongodb://localhost:27017/movie-booking
AUTH_SERVICE_URL=http://localhost:5000
MOVIE_SERVICE_URL=http://localhost:4001
```

**booking-service/.env**
```
PORT=4003
MONGODB_URI=mongodb://localhost:27017/movie-booking
AUTH_SERVICE_URL=http://localhost:5000
MOVIE_SERVICE_URL=http://localhost:4001
SHOW_SERVICE_URL=http://localhost:4002
PAYMENT_SERVICE_URL=http://localhost:4004
```

**payment-service/.env**
```
PORT=4004
MONGODB_URI=mongodb://localhost:27017/movie-booking
AUTH_SERVICE_URL=http://localhost:5000
```

**api-gateway/.env**
```
PORT=3000
AUTH_SERVICE_URL=http://localhost:5000
MOVIE_SERVICE_URL=http://localhost:4001
SHOW_SERVICE_URL=http://localhost:4002
BOOKING_SERVICE_URL=http://localhost:4003
PAYMENT_SERVICE_URL=http://localhost:4004
```

**frontend/.env**
```
REACT_APP_API_URL=http://localhost:3000
```

---

## Services Architecture

```
┌─────────────────┐
│   Frontend      │
│  (React, 3001)  │
└────────┬────────┘
         │ HTTP
         │ JWT Token
┌────────▼────────────────────┐
│    API Gateway (3000)        │ Routes & Auth
├──────────┬──────────┬────────┤
│          │          │        │
▼          ▼          ▼        ▼
Auth    Movie     Show     Booking
5000    4001      4002      4003
        
        ├─────────────────────────┐
        │   Payment Service      │
        │        (4004)           │
        └─────────────────────────┘

        ┌─────────────────┐
        │   MongoDB       │
        │  (localhost)    │
        └─────────────────┘
```

---

## Service Responsibilities

### API Gateway (3000)
- Central entry point
- JWT authentication & validation
- Route proxying to all services
- User context forwarding (X-User-* headers)

### Auth Service (5000)
- User registration & login
- JWT token generation
- Password hashing with bcrypt
- User role management (USER, ADMIN)

### Movie Service (4001)
- Movie CRUD operations
- Movie listings
- Movie details & filtering

### Show Service (4002)
- Show scheduling
- Theater management
- Seat availability tracking
- Show date/time management

### Booking Service (4003)
- Booking creation
- User-specific booking queries
- Booking cancellation
- Refund handling
- Seat freeing workflow
- Notification triggers

### Payment Service (4004)
- Payment processing
- Payment status tracking
- Refund processing
- Transaction records

### Frontend (3001)
- Movie browsing
- Booking interface
- Seat selection
- Payment form
- Booking history
- User authentication UI

---

## Testing the System

### Test User Flow

**Create Test Account**
```
Username: testuser
Email: test@example.com
Password: password123
```

**Browse Movies**
1. Home page shows all available movies
2. Click on movie to see details
3. Select available shows

**Book Tickets**
1. Choose a show
2. Select seats interactively
3. Review booking summary
4. Proceed to payment

**Payment**
1. Enter test card: 4532 1234 5678 9010
2. Any future expiry date
3. Any 3-digit CVV
4. Receive booking reference

**View Bookings**
1. Go to "My Bookings"
2. See all your bookings
3. Cancel if needed (triggers refund)

---

## Troubleshooting

### "Cannot connect to server"
- Ensure all 6 backend services are running
- Check ports 3000, 4001, 4002, 4003, 4004, 5000 are available
- Verify no firewall blocking connections

### "Authentication failed"
- Auth service must be running on 5000
- Check user credentials correct
- Check browser for error messages
- Clear localStorage if tokens corrupted

### "Movies not loading"
- Movie service must be running on 4001
- Check MongoDB has movie documents
- Verify API Gateway can reach movie service

### "Booking fails"
- All 4 services must be running (auth, movie, show, payment)
- Check booking service logs for errors
- Verify show has available seats
- Check payment service connectivity

### "Frontend blank page"
- Ensure frontend on 3001
- Check browser console for JavaScript errors
- Verify .env file has correct API_URL
- Clear browser cache

---

## Database Setup

### Optional: Seed Initial Data

Add movies to MongoDB:
```javascript
db.movies.insertMany([
  {
    title: "Avatar",
    genre: "Sci-Fi",
    rating: 8.0,
    duration: 162,
    description: "Epic sci-fi adventure...",
    poster: "url_to_image"
  },
  // Add more movies
]);
```

Add shows to MongoDB:
```javascript
db.shows.insertMany([
  {
    movieId: "movie_id_here",
    theater: "AMC Downtown",
    date: ISODate("2025-02-25T18:30:00Z"),
    time: "6:30 PM",
    price: 250,
    availableSeats: 100,
    reservedSeats: 0
  }
]);
```

---

## Production Deployment

1. **Environment Setup**
   - Update all .env files with production URLs
   - Change JWT secret to strong key
   - Configure MongoDB Atlas for cloud

2. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy**
   - Backend services: Docker containers or cloud VM
   - Frontend: Vercel, Netlify, or cloud hosting
   - Database: MongoDB Atlas

4. **Configure CORS**
   ```javascript
   // In API Gateway
   app.use(cors({
     origin: 'https://yourdomain.com',
     credentials: true
   }));
   ```

---

## Monitoring & Logs

### View Service Logs
- Each service outputs to console
- Look for errors in request logs
- Check "Booking confirmation notification sent" messages

### Performance Metrics
- Backend response times in console
- Frontend network tab in DevTools
- Database query logs in MongoDB

---

## Next Steps

1. ✅ Confirm all services running
2. ✅ Access frontend at http://localhost:3001
3. ✅ Create test user account
4. ✅ Browse movies and complete a booking
5. ✅ Verify refund functionality
6. ✅ Check booking history

---

**System is ready for testing!** 🎬

For detailed documentation on each service, see:
- IMPLEMENTATION_STATUS.md - Detailed implementation summary
- BUSINESS_LOGIC_IMPLEMENTATION.md - Business logic details
- FRONTEND_README.md - Frontend documentation
