const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Auth Service API',
      version: '1.0.0',
      description:
        'JWT authentication for the movie ticket booking system. ' +
        'The API Gateway can validate tokens locally (same JWT_SECRET) or call GET /auth/validate.',
    },
    servers: [{ url: '/', description: 'Current host' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../app.js'),
  ],
};

module.exports = swaggerJsdoc(options);
