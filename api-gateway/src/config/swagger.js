const swaggerJsdoc = require("swagger-jsdoc");

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "API Gateway",
      version: "1.0.0",
      description: "Gateway endpoints for movie ticketing microservices",
    },
    servers: [{ url: "/", description: "Current host" }],
    paths: {
      "/health": { get: { summary: "Health check" } },
      "/movies": { get: { summary: "List movies" }, post: { summary: "Create movie (admin)" } },
      "/movies/{id}": {
        get: { summary: "Get movie by id" },
        put: { summary: "Update movie (admin)" },
        delete: { summary: "Delete movie (admin)" },
      },
      "/shows": { get: { summary: "List shows" }, post: { summary: "Create show (admin)" } },
      "/shows/{showId}": {
        get: { summary: "Get show by id" },
        put: { summary: "Update show (admin)" },
        delete: { summary: "Delete show (admin)" },
      },
      "/shows/{showId}/seats": { get: { summary: "Get seat info" } },
      "/bookings": { get: { summary: "List bookings" }, post: { summary: "Create booking" } },
      "/bookings/{id}": {
        get: { summary: "Get booking by id" },
        delete: { summary: "Cancel booking" },
      },
      "/payments": { get: { summary: "List payments" }, post: { summary: "Process payment" } },
      "/payments/{id}": { get: { summary: "Get payment status" } },
    },
  },
  apis: [],
});

module.exports = swaggerSpec;
