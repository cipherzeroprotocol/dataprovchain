/**
 * User routes
 */
const express = require('express');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');
const rateLimitMiddleware = require('../middleware/rate-limit.middleware');

const router = express.Router();

/**
 * @swagger
 * /users/challenge:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Generate authentication challenge
 *     description: Generates a challenge message for wallet-based authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *             properties:
 *               address:
 *                 type: string
 *                 description: Wallet address requesting authentication
 *     responses:
 *       200:
 *         description: Challenge generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/challenge',
  rateLimitMiddleware.authLimiter,
  userController.generateChallenge
);

/**
 * @swagger
 * /users/authenticate:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Authenticate with wallet signature
 *     description: Authenticates a user using wallet signature
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - signature
 *             properties:
 *               address:
 *                 type: string
 *                 description: Wallet address
 *               signature:
 *                 type: string
 *                 description: Signed message
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/authenticate',
  rateLimitMiddleware.authLimiter,
  validationMiddleware.walletAuthRules,
  validationMiddleware.validateRequest,
  userController.authenticateWithWallet
);

/**
 * @swagger
 * /users/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register new user
 *     description: Registers a new user with username, email, and wallet address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - walletAddress
 *             properties:
 *               username:
 *                 type: string
 *                 description: User's username
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email (optional)
 *               walletAddress:
 *                 type: string
 *                 description: User's wallet address
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflict - Username, email, or wallet already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/register',
  rateLimitMiddleware.authLimiter,
  validationMiddleware.userRegistrationRules,
  validationMiddleware.validateRequest,
  userController.registerUser
);

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get current user profile
 *     description: Retrieves the profile of the currently authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/me',
  authMiddleware.authenticate,
  userController.getCurrentUser
);

/**
 * @swagger
 * /users/me:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update user profile
 *     description: Updates the profile of the currently authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               bio:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflict - Username or email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/me',
  authMiddleware.authenticate,
  userController.updateUserProfile
);

/**
 * @swagger
 * /users/refresh-api-key:
 *   post:
 *     tags:
 *       - Users
 *     summary: Refresh API key
 *     description: Generates a new API key for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: API key refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   type: object
 *                   properties:
 *                     apiKey:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/refresh-api-key',
  authMiddleware.authenticate,
  userController.refreshApiKey
);

module.exports = router;