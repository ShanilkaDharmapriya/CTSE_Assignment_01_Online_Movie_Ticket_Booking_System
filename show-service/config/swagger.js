const swaggerJsdoc = require("swagger-jsdoc");

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Show Service API",
      version: "1.0.0",
      description: "Show scheduling and seat APIs",
    },
    servers: [{ url: "/", description: "Current host" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      "/health": { get: { summary: "Health check" } },
      "/shows": {
        get: { summary: "List shows" },
        post: { summary: "Create show (admin)" },
      },
      "/shows/{showId}": {
        get: { summary: "Get show by id" },
        put: { summary: "Update show (admin)" },
        delete: { summary: "Delete show (admin)" },
      },
      "/shows/{showId}/seats": {
        get: { summary: "Get seat info" },
      },
    },
  },
  apis: [],
});

module.exports = swaggerSpec;
