const { Router } = require('express');
const authController = require('../controllers/authController');
const { requireValidJwt } = require('../middleware/authMiddleware');
const {
  customerRegisterRules,
  loginRules,
  handleValidationErrors,
} = require('../validators/authValidators');

const router = Router();

/**
 * @openapi
 * /auth/register/customer:
 *   post:
 *     summary: Register a new customer
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already registered
 */
router.post(
  '/register/customer',
  customerRegisterRules,
  handleValidationErrors,
  authController.registerCustomer
);

/**
 * @openapi
 * /auth/login/customer:
 *   post:
 *     summary: Customer login and receive JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: JWT issued
 *       401:
 *         description: Invalid credentials
 */
router.post('/login/customer', loginRules, handleValidationErrors, authController.loginCustomer);

/**
 * @openapi
 * /auth/login/admin:
 *   post:
 *     summary: Admin login and receive JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: JWT issued for admin
 *       401:
 *         description: Invalid credentials
 */
router.post('/login/admin', loginRules, handleValidationErrors, authController.loginAdmin);

/**
 * @openapi
 * /auth/validate:
 *   get:
 *     summary: Validate JWT and return user (for gateway or introspection)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token valid
 *       401:
 *         description: Missing or invalid token
 */
/** Gateway can call this with the client's Bearer token to verify before routing. */
router.get('/validate', requireValidJwt, authController.validateAuthenticated);

module.exports = router;
