const swaggerJsdoc = require("swagger-jsdoc");

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Movie Service API",
      version: "1.0.0",
      description: "Movie catalog APIs",
    },
    servers: [{ url: "/", description: "Current host" }],
    paths: {
      "/health": { get: { summary: "Health check" } },
      "/movies": {
        get: { summary: "List movies" },
        post: { summary: "Create movie (admin)" },
      },
      "/movies/{id}": {
        get: { summary: "Get movie by id" },
        put: { summary: "Update movie (admin)" },
        delete: { summary: "Delete movie (admin)" },
      },
      "/movies/{id}/shows": {
        get: { summary: "Get movie with shows" },
      },
      "/movies/{id}/poster": {
        get: { summary: "Get movie poster" },
      },
    },
  },
  apis: [],
});

module.exports = swaggerSpec;
