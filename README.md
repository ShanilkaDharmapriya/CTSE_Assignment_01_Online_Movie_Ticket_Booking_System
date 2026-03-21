# 🎬 Movie Booking Microservices System

## 📌 Overview
This project is a microservice-based movie ticket booking system developed for the CTSE (SE4010) assignment.

The system is composed of multiple independently deployable services that communicate through an API Gateway using REST APIs.

---

## 🏗️ Architecture

- API Gateway (Aggregator Pattern)
- Movie Service
- Show Service
- Booking Service
- Payment Service
- Frontend (React)

Each service has its own database to ensure loose coupling.

---

## 🔗 System Flow

1. User accesses frontend
2. Frontend sends request to API Gateway
3. API Gateway communicates with services
4. Booking Service interacts with Payment & Show Service
5. Response is returned to user

---

## ⚙️ Technologies Used

- Node.js (Express)
- MongoDB
- Docker
- GitHub Actions (CI/CD)
- REST APIs

---

## 🧩 Microservices

| Service          | Description |
|-----------------|------------|
| Movie Service   | Manages movie data |
| Show Service    | Manages showtimes and seats |
| Booking Service | Handles bookings |
| Payment Service | Processes payments |
| API Gateway     | Central communication layer |

---

## Controllers
File	                            Responsibility
controllers/movieController.js	    Proxies to movie-service + getMovieDetails aggregator
controllers/showController.js	    Proxies to show-service (full CRUD + seat update)
controllers/bookingController.js	Proxies to booking-service (create, list, get cancel)
controllers/paymentController.js	Proxies to payment-service (process + status)

## Routes
File	                Mounted at
routes/movieRoutes.js	/movies — includes GET /:id/details aggregator
routes/showRoutes.js	/shows — includes PUT /:id/seats
routes/bookingRoutes.js	/bookings
routes/paymentRoutes.js	/payments


## 🐳 Running the Project

### 1. Clone the repository
```bash
git clone https://github.com/your-repo-link
cd movie-booking-microservices