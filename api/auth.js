// Serverless function for authentication routes
const express = require('express');
const { storage } = require('../server/storage');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // In a real app, we would check the password hash here
    // For demo purposes, we're just checking if the user exists
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );
    
    return res.status(200).json({ 
      user, 
      token 
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Authentication failed', error: process.env.NODE_ENV === 'production' ? {} : error });
  }
});

// Phone login route
router.post('/phone-login', async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }
    
    const user = await storage.getUserByPhone(phone);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found with this phone number' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );
    
    return res.status(200).json({ 
      user, 
      token 
    });
  } catch (error) {
    console.error('Phone login error:', error);
    return res.status(500).json({ message: 'Authentication failed', error: process.env.NODE_ENV === 'production' ? {} : error });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const userData = req.body;
    
    if (!userData.username) {
      return res.status(400).json({ message: 'Username is required' });
    }
    
    // Check if user already exists
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return res.status(409).json({ message: 'Username already taken' });
    }
    
    // Create new user
    const newUser = await storage.createUser({
      ...userData,
      role: userData.role || 'farmer' // Default role
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );
    
    return res.status(201).json({ 
      user: newUser, 
      token 
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Registration failed', error: process.env.NODE_ENV === 'production' ? {} : error });
  }
});

module.exports = router;