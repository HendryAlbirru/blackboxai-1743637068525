const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

class AuthController {
  // User registration
  async register(req, res) {
    try {
      const { username, email, password, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email }]
        }
      });

      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Username or email already exists'
        });
      }

      // Create new user
      const user = await User.create({
        username,
        email,
        password,
        role: role || 'gudang'
      });

      // Create audit log
      await AuditLog.create({
        user_id: user.id_user,
        aksi: 'REGISTER',
        entity: 'USER',
        entity_id: user.id_user,
        ip_address: req.ip,
        user_agent: req.get('user-agent')
      });

      return res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: {
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // User login
  async login(req, res) {
    try {
      const { username, password } = req.body;

      // Find user
      const user = await User.findOne({
        where: { username }
      });

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        });
      }

      // Validate password
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id_user,
          username: user.username,
          role: user.role 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Create audit log
      await AuditLog.create({
        user_id: user.id_user,
        aksi: 'LOGIN',
        entity: 'AUTH',
        entity_id: user.id_user,
        ip_address: req.ip,
        user_agent: req.get('user-agent')
      });

      return res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id_user,
            username: user.username,
            email: user.email,
            role: user.role
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      const user = await User.findByPk(req.user.id_user, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: user
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

module.exports = new AuthController();