const swaggerJsdoc = require("swagger-jsdoc");

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Booking Service API",
      version: "1.0.0",
      description: "Booking lifecycle APIs",
    },
    servers: [{ url: "/", description: "Current host" }],
    paths: {
      "/health": { get: { summary: "Health check" } },
      "/bookings": {
        get: { summary: "List bookings" },
        post: { summary: "Create booking" },
      },
      "/bookings/{bookingId}": {
        get: { summary: "Get booking by id" },
      },
    },
  },
  apis: [],
});

module.exports = swaggerSpec;
