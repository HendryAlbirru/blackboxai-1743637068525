const Joi = require('joi');

const barangSchema = {
  create: Joi.object({
    kode_barang: Joi.string()
      .required()
      .trim()
      .message('Kode barang is required'),
    
    nama_barang: Joi.string()
      .required()
      .trim()
      .message('Nama barang is required'),
    
    hs_code: Joi.string()
      .required()
      .min(6)
      .max(10)
      .pattern(/^[0-9]+$/)
      .message('HS Code must be between 6-10 digits'),
    
    satuan: Joi.string()
      .required()
      .trim()
      .message('Satuan is required'),
    
    kategori: Joi.string()
      .required()
      .trim()
      .message('Kategori is required')
  }),

  update: Joi.object({
    kode_barang: Joi.string()
      .trim(),
    
    nama_barang: Joi.string()
      .trim(),
    
    hs_code: Joi.string()
      .min(6)
      .max(10)
      .pattern(/^[0-9]+$/),
    
    satuan: Joi.string()
      .trim(),
    
    kategori: Joi.string()
      .trim()
  }).min(1) // At least one field must be provided for update
};

const validateBarang = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.context.key,
        message: detail.message
      }));

      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
};

module.exports = {
  barangSchema,
  validateBarang
};