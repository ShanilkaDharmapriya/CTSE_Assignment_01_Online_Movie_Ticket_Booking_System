require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { connectToDatabase } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const authController = require('./controllers/authController');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Liveness check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is running
 */
app.get('/health', authController.health);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/auth', authRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: 'Not found', code: 'NOT_FOUND' },
  });
});

app.use(errorHandler);

if (require.main === module) {
  connectToDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`auth-service listening on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error('Failed to connect to MongoDB:', error.message);
      process.exit(1);
    });
}

module.exports = app;
