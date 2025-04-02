const express = require('express');
const router = express.Router();
const barangController = require('../controllers/barangController');
const { barangSchema, validateBarang } = require('../validations/barangValidation');

// Create new barang
router.post('/',
  validateBarang(barangSchema.create),
  barangController.create
);

// Get all barang with optional filters
router.get('/',
  barangController.getAll
);

// Get single barang by ID
router.get('/:id',
  barangController.getById
);

// Update barang
router.put('/:id',
  validateBarang(barangSchema.update),
  barangController.update
);

// Delete barang
router.delete('/:id',
  barangController.delete
);

module.exports = router;