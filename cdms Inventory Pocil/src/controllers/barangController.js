const { Op } = require('sequelize');
const Barang = require('../models/Barang');

class BarangController {
  // Create new barang
  async create(req, res) {
    try {
      const barang = await Barang.create(req.body);
      
      return res.status(201).json({
        status: 'success',
        message: 'Barang created successfully',
        data: barang
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          status: 'error',
          message: 'Kode barang already exists'
        });
      }
      
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get all barang with optional filters
  async getAll(req, res) {
    try {
      const { 
        kode_barang, 
        nama_barang, 
        hs_code, 
        kategori,
        page = 1,
        limit = 10
      } = req.query;

      const where = {};
      if (kode_barang) where.kode_barang = { [Op.iLike]: `%${kode_barang}%` };
      if (nama_barang) where.nama_barang = { [Op.iLike]: `%${nama_barang}%` };
      if (hs_code) where.hs_code = { [Op.iLike]: `%${hs_code}%` };
      if (kategori) where.kategori = { [Op.iLike]: `%${kategori}%` };

      const offset = (page - 1) * limit;

      const { count, rows } = await Barang.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      return res.status(200).json({
        status: 'success',
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          total_pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get single barang by ID
  async getById(req, res) {
    try {
      const barang = await Barang.findByPk(req.params.id);
      
      if (!barang) {
        return res.status(404).json({
          status: 'error',
          message: 'Barang not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: barang
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Update barang
  async update(req, res) {
    try {
      const barang = await Barang.findByPk(req.params.id);
      
      if (!barang) {
        return res.status(404).json({
          status: 'error',
          message: 'Barang not found'
        });
      }

      await barang.update(req.body);

      return res.status(200).json({
        status: 'success',
        message: 'Barang updated successfully',
        data: barang
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          status: 'error',
          message: 'Kode barang already exists'
        });
      }

      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Delete barang
  async delete(req, res) {
    try {
      const barang = await Barang.findByPk(req.params.id);
      
      if (!barang) {
        return res.status(404).json({
          status: 'error',
          message: 'Barang not found'
        });
      }

      await barang.destroy();

      return res.status(200).json({
        status: 'success',
        message: 'Barang deleted successfully'
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

module.exports = new BarangController();