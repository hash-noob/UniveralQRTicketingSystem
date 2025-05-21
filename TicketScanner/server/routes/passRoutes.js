const express = require('express');
const router = express.Router();
const {
  getAllPasses,
  createPass,
  getPassByBarcode,
  updatePass,
  deletePass,
  getPassById,
  updateEvent,
  scanPass
} = require('../controllers/passController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Public routes

// Get all passes
router.get('/', getAllPasses);

// Get pass by barcode - specific route must come before generic ID route
router.get('/barcode/:barcode', getPassByBarcode);

// Get pass by ID - generic route should come after specific routes
router.get('/:id', getPassById);

// Scan a pass - usually done by event staff, could be protected or public
router.post('/scan/:barcode', scanPass);

// Protected routes - admin only

// Create a new pass - admin only
router.post('/', authenticate, isAdmin, createPass);

// Update a pass - admin only
router.patch('/', authenticate, isAdmin, updatePass);

// Update an event - admin only
router.patch('/event/', authenticate, isAdmin, updateEvent);

// Delete a pass - admin only
router.delete('/:id', authenticate, isAdmin, deletePass);

module.exports = router; 