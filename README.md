# Online Movie Ticket Booking System - Movie Service

This repository contains the completely built `Movie Service` microservice with:
1. **Backend**: Spring Boot, Data JPA, Security, PostgreSQL
2. **Frontend**: React (Vite), Tailwind CSS, Axios
3. **Infrastructure**: Docker, Docker Compose, GitHub Actions for CI/CD

## Running Locally

### Prerequisites
- Docker and Docker Compose installed.
- (Alternative) JDK 17, Node.js 18, and PostgreSQL installed locally if running without Docker.

### 1. Using Docker Compose (Recommended)
Navigate to the root directory and simply start all services:
```bash
docker-compose up -d --build
```

The following services will be available:
- **React Frontend**: `http://localhost:80`
- **Spring Boot Backend**: `http://localhost:8080/movies`
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **PostgreSQL Database**: runs on `localhost:5432`

### 2. Running Manually (Without Docker-Compose)

#### Start PostgreSQL
Create a database named `moviedb` with user `postgres` and password `postgrespassword`.

#### Run Backend
```bash
cd movie-service
mvn spring-boot:run
```

#### Run Frontend
```bash
cd movie-frontend
# Install dependencies if not already done
npm install axios react-router-dom lucide-react tailwindcss postcss autoprefixer
npm run dev
```

## Architecture & API
- **Clean Architecture**: Standard components (Entity, Repository, Service, Controller, Exception Handling, DTOs).
- **Validation**: Enforced using Hibernate Validator.
- **Security**: Endpoints secured with Basic Auth for mutative operations (POST/PUT/DELETE). Default Admin: `admin` / `admin123`.
- **Exposed APIs**: Enables inter-service communication (fetching movie details by Show/Booking/Payment services).
- **Swagger Documentation**: Available at `/swagger-ui.html`.

## DevSecOps & CI/CD
The project contains a `.github/workflows/ci-cd.yml` which incorporates:
1. **Build & Test**: Compiles backend, runs tests, and builds frontend bundle.
2. **Snyk Vulnerability Scanning**: SAST scanning configured (Requires `SNYK_TOKEN` secret in GitHub).
3. **Docker Image Release**: Builds and pushes Docker images to Docker Hub (Requires `DOCKER_USERNAME` & `DOCKER_PASSWORD`).
4. **Cloud Deployment (Template)**: Cloud deployment placeholder block configured at the end of the pipeline.
