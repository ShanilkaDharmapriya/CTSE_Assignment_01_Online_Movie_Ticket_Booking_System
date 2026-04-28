const swaggerJsdoc = require("swagger-jsdoc");

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Payment Service API",
      version: "1.0.0",
      description: "Payment processing APIs",
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
      "/payments": {
        get: { summary: "List payments" },
        post: { summary: "Process payment" },
      },
      "/payments/{id}": {
        get: { summary: "Get payment status" },
      },
      "/payments/{id}/refund": {
        post: { summary: "Refund payment" },
      },
      "/pay": {
        post: { summary: "Compatibility payment endpoint" },
      },
    },
  },
  apis: [],
});

module.exports = swaggerSpec;
