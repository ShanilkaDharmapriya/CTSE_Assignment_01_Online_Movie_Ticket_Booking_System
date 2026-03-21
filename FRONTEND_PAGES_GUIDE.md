# Frontend Pages & Features Overview

## User Journey Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    MOVIE BOOKING SYSTEM                          │
└─────────────────────────────────────────────────────────────────┘

START
  │
  ├─────────────────────────────────────┐
  │                                      │
  ▼ New User?                           ▼ Existing User?
┌──────────────┐                    ┌──────────────┐
│   REGISTER   │                    │    LOGIN     │
│  (Register)  │                    │  (Login)     │
└──────┬───────┘                    └──────┬───────┘
       │                                    │
       └─────────────────┬──────────────────┘
                         │
                         ▼
                    ┌──────────────┐
                    │ HOME         │ ← Browse Movies
                    │ (Movie List) │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────────────┐
                    │ MOVIE DETAIL         │ ← See Details & Shows
                    │ (Select Show)        │
                    └──────┬───────────────┘
                           │
                           ▼
                    ┌──────────────────────┐
                    │ BOOKING              │ ← Select Seats
                    │ (Seat Selection)     │
                    └──────┬───────────────┘
                           │
                           ▼
                    ┌──────────────────────┐
                    │ CHECKOUT             │ ← Pay Now
                    │ (Payment Processing) │
                    └──────┬───────────────┘
                           │
                    ┌──────┴──────┐
                    │             │
              SUCCESS         FAILURE
                    │             │
                    ▼             ▼
            ┌─────────────────────────┐
            │ BOOKING HISTORY         │
            │ (View & Manage)         │       ◄── Can Cancel
            └─────────────────────────┘       ◄── Can Refund

                    │
                    ▼
                 LOGOUT
```

---

## Page Details

### 1. LOGIN PAGE (`/login`)
**Status**: Public (Unauthenticated)

**Features**:
- Username/Password input fields
- Submit button
- Error message display
- Link to registration page
- Form validation

**API Calls**:
- `POST /auth/login` - Authenticate user

**Example**:
```
┌─ LOGIN ─────────────────────────┐
│                                  │
│  Username: _______________      │
│  Password: _______________      │
│                                  │
│  [      Login      ]             │
│                                  │
│  Don't have account? Register →  │
│                                  │
└──────────────────────────────────┘
```

---

### 2. REGISTER PAGE (`/register`)
**Status**: Public (Unauthenticated)

**Features**:
- Username, Email, Password inputs
- Confirm Password field
- Form validation (password match, length)
- Submit button
- Error message display
- Link to login page

**API Calls**:
- `POST /auth/register` - Create new account

**Example**:
```
┌─ REGISTER ──────────────────────┐
│                                  │
│  Username: _______________      │
│  Email: ___________________     │
│  Password: _______________      │
│  Confirm:  _______________      │
│                                  │
│  [      Register      ]          │
│                                  │
│  Already have account? Login →   │
│                                  │
└──────────────────────────────────┘
```

---

### 3. HOME PAGE (`/`)
**Status**: Protected (Authenticated only)

**Features**:
- Movie grid display (4 columns on desktop, responsive)
- Movie cards show: Title, Poster, Genre, Rating
- Hover effect (scale up on desktop)
- Click to view details
- Loading state
- Error handling

**API Calls**:
- `GET /movies` - Fetch all movies

**Example**:
```
┌─ HOME ──────────────────────────────────┐
│  [🎬 MovieBooking]  [My Bookings] [Logout]
│                                          │
│  Now Showing                             │
│                                          │
│  ┌─ Avatar ──┐  ┌─ Dune ────┐          │
│  │   [IMG]   │  │   [IMG]   │          │
│  │ Action    │  │ Sci-Fi    │          │
│  │ ★8.0      │  │ ★7.5      │          │
│  └───────────┘  └───────────┘          │
│                                          │
│  ┌─ Avatar2 ─┐  ┌─ Oppenheimer ┐      │
│  │   [IMG]   │  │   [IMG]       │      │
│  │ Adventure │  │ Drama ★8.2    │      │
│  │ ★8.0      │  └───────────────┘      │
│  └───────────┘                          │
│                                          │
└──────────────────────────────────────────┘
```

---

### 4. MOVIE DETAIL PAGE (`/movie/:movieId`)
**Status**: Protected (Authenticated only)

**Features**:
- Movie poster (left)
- Movie info: Title, Genre, Rating, Duration (right)
- Synopsis
- Available shows grid
- Show details: Theater, Date/Time, Price, Seats
- Book button (disabled if no seats)
- Back button

**API Calls**:
- `GET /movies/:movieId` - Get movie details
- `GET /shows` - Fetch shows for this movie

**Example**:
```
┌─ MOVIE DETAIL ──────────────────────────┐
│ ← Back                                   │
│                                          │
│  ┌─ Poster ┐  Avatar                   │
│  │ [Image] │  Genre: Sci-Fi             │
│  │         │  Rating: 8.0               │
│  │         │  Duration: 162 mins        │
│  │         │                            │
│  │         │  Synopsis: Epic...         │
│  │         │                            │
│  └─────────┘  Select a Show:            │
│                                          │
│     ┌──────────────┐  ┌──────────────┐ │
│     │ AMC Downtown │  │ PVR Mumbai    │ │
│     │ 2025-02-20   │  │ 2025-02-20   │ │
│     │ 6:30 PM      │  │ 9:00 PM      │ │
│     │ Rs. 250      │  │ Rs. 300      │ │
│     │ 45 seats     │  │ 10 seats     │ │
│     │[Book Tickets]│  │[Book Tickets]│ │
│     └──────────────┘  └──────────────┘ │
│                                          │
└──────────────────────────────────────────┘
```

---

### 5. BOOKING PAGE (`/booking/:movieId/:showId`)
**Status**: Protected (Authenticated only)

**Features**:
- Seat selector (10x10 grid with row labels A-J)
- Screen representation at top
- Legend (Available, Selected, Booked)
- Selected seats list
- Booking summary (right side, sticky)
- Total amount calculation
- Proceed to payment button

**API Calls**:
- `GET /movies/:movieId` - Movie title
- `GET /shows/:showId` - Show details
- `POST /bookings` - Create booking

**Example**:
```
┌─ BOOKING PAGE ────────────────────────────┐
│                                            │
│  SELECT YOUR SEATS       │ BOOKING SUMMARY│
│                          │                 │
│        [SCREEN]          │ Movie: Avatar   │
│     A: ◯ ◯ ◯ ◯ ◯        │ Theater: AMC    │
│     B: ◯ ◯ ● ● ◯        │ Date: Feb 20    │
│     C: ◯ ◯ ◯ ◯ ◯        │ Show: 6:30 PM   │
│     D: ● ◯ ◯ ◯ ◯        │                 │
│     E: ◯ ◯ ◯ ◯ ◯        │ Seats: 3 ×Rs250 │
│                          │ Total: Rs. 750  │
│ Legend:                  │                 │
│ ◯ Available              │ [Proceed >]     │
│ ● Selected               │                 │
│ ■ Booked                 │                 │
│                          │                 │
└────────────────────────────────────────────┘
```

---

### 6. CHECKOUT PAGE (`/checkout/:bookingId`)
**Status**: Protected (Authenticated only)

**Features**:
- Order summary (left): Booking ref, seats, movie, theater, amount
- Payment form (right): Cardholder name, card number, expiry, CVV
- Card number formatting (spaces)
- CVV validation
- Pay button shows total amount
- Cancel button
- Security notice

**API Calls**:
- `GET /bookings/:bookingId` - Get booking details
- `POST /payments` - Process payment

**Example**:
```
┌─ CHECKOUT ──────────────────────────────┐
│                     │                     │
│ ORDER SUMMARY       │  PAYMENT DETAILS    │
│                     │                     │
│ Ref: BK-2025-12345  │ Name: ___________  │
│ Seats: 3            │ Card: ____ ____ ... │
│ Movie: Avatar       │ Expiry: __/__ CVV:__|
│ Theater: AMC        │                     │
│ Amount: Rs. 750     │ [Pay Rs. 750]      │
│                     │ [Cancel]            │
│ 🔒 Secure encrypted │                     │
│                     │                     │
└─────────────────────────────────────────┘
```

---

### 7. BOOKING HISTORY PAGE (`/booking-history`)
**Status**: Protected (Authenticated only)

**Features**:
- Grid of booking cards (3 columns, responsive)
- Each card shows:
  - Movie title (gradient header)
  - Booking reference
  - Theater
  - Date & time
  - Seats & amount
  - Status badge (CONFIRMED, CANCELLED)
  - Refund status if applicable
  - Cancel button (if confirmed)
  - Refund amount (if refunded)

**API Calls**:
- `GET /bookings` - Get user's bookings
- `DELETE /bookings/:bookingId` - Cancel booking

**Example**:
```
┌─ BOOKING HISTORY ──────────────────────────┐
│                                             │
│ My Bookings                                 │
│                                             │
│ ┌──── Avatar ──────┐  ┌──── Dune ───────┐ │
│ │Ref: BK-2025-001 │  │Ref: BK-2025-002 │ │
│ │                  │  │                  │ │
│ │Theater: AMC      │  │Theater: PVR      │ │
│ │Date: Feb 20, 6:30PM │Date: Feb 22, 9PM│
│ │Seats: 3          │  │Seats: 2          │ │
│ │Rs. 750           │  │Rs. 600 (Refunded)│
│ │✓ CONFIRMED       │  │✗ CANCELLED       │ │
│ │                  │  │✓ Refund: Rs.600 │ │
│ │[Cancel Booking]  │  │[View Details]    │ │
│ └──────────────────┘  └──────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Components Used

### Navbar Component
- Hidden on login/register pages
- Shows user name when logged in
- Links to booking history
- Logout button
- Login/Register links when not authenticated

### MovieCard Component
- Reusable card for movie display
- Image/placeholder
- Title, genre, rating
- Hover effects
- Link wrapper

### SeatSelector Component
- Responsive seat grid
- Row labels (A-J)
- Screen representation
- State management for selections
- Disable booked seats
- Visual feedback for selected seats

### ProtectedRoute Component
- Wraps routes requiring authentication
- Redirects to login if not authenticated
- Shows loading state
- Checks token validity

---

## Styling Approach

### Tailwind Classes Usage
```
Colors:
- bg-gray-900: Dark background
- bg-gray-800: Card backgrounds
- text-red-600: Primary action color
- text-gray-300: Secondary text

Layout:
- grid, flex: Layout tools
- max-w-6xl: Container max width
- gap-*, p-*: Spacing

Components:
- .btn-primary: Red buttons
- .btn-secondary: Gray buttons
- .input-field: Form inputs
- .movie-card: Movie display cards
- .seat: Seat selector tiles
```

---

## State Management

### Authentication Context
- `user`: Current user object
- `token`: JWT token
- `isAuthenticated`: Boolean flag
- `login()`: Authenticate user
- `register()`: Create account
- `logout()`: Clear auth
- `loading`: Initial load state

### Page-Level State
- Local component state with useState
- Form data management
- Loading/error states
- UI interactions

### Data Fetching
- Axios interceptors add token to requests
- Auto-redirect to login if 401
- Error handling in try-catch blocks
- Loading spinners during requests

---

## Error Handling Strategy

### User-Facing Errors
- Display in colored alert boxes
- Clear error messages
- Suggest actions (retry, contact support)

### Form Validation
- Client-side validation
- Prevent submit if invalid
- Show specific error messages
- Highlight problematic fields

### API Errors
- Catch and display to user
- Log server error to console
- Redirect if unauthorized (401)
- Retry logic for network errors

---

## Performance Optimizations

1. **Code Splitting**: Routes lazy load
2. **Image Loading**: Img tags with alt text
3. **Form Input**: Debounce future searches
4. **Caching**: LocalStorage for tokens
5. **Responsive**: Mobile-first design
6. **Bundle Size**: Minified production build

---

## Browser Compatibility

- Chrome/Chromium
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Future Enhancements

1. **Search & Filter**: Movie search, genre filter
2. **Reviews & Ratings**: User reviews system
3. **Notifications**: Email/SMS booking confirmations
4. **Seat Map**: Show blocked/maintenance seats
5. **Multi-language**: i18n support
6. **Dark/Light Mode**: Theme toggling
7. **Advanced Filters**: Price range, time filters
8. **Favorites**: Save favorite movies
9. **Social Sharing**: Share bookings on social media
10. **Mobile App**: React Native version

---

**Frontend implementation complete and ready for deployment!** 🎬
