const User = require("../models/User");
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { profile } = require("console");

dotenv.config();


const generateToken = (id, role) => {  // Add role parameter
    const secret = process.env.JWT_SECRET || 'defaultsecret';
    return jwt.sign({ id, role }, secret, {  // Include role in payload
        expiresIn: "30d",
    });
};

    
exports.register = async (req, res, next) => {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        firstAddress,
        secondAddress,
        city,
        country,
        postalCode,
        role
        
      } = req.body;
  
      // Check if user exists
      const userExists = await User.findOne({ email });
      
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
  
      // Create user
      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        firstAddress,
        secondAddress,
        city,
        country,
        postalCode,
        role: role || 'user'
      });
  
      // Generate token
      const token = generateToken(user._id, user.role);
  
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during registration',
        error: error.message
      });
    }
  };


  exports.registerAdmin = async (req, res, next) => {
    try {
        const { email } = req.body;
        
        // Check if admin exists
        const adminExists = await User.findOne({ email });
        if (adminExists) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }
        
        // Create admin with explicit role
        const admin = await User.create({
            ...req.body,
            role: 'admin'  // Force admin role
        });
        
        // Generate token
        const token = generateToken(admin._id, admin.role);
        
        res.status(201).json({
            success: true,
            token,
            user: {
                id: admin._id,
                email: admin.email,
                role: admin.role  // Include role in response
            }
        });
        
    } catch (error) {
        console.error('Admin registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: error.message
        });
    }
};


exports.registerOwner = async (req, res, next) => {
  try {
      const { email } = req.body;
      
      // Check if admin exists
      const ownerExists = await User.findOne({ email });
      if (ownerExists) {
          return res.status(400).json({
              success: false,
              message: 'Email already registered'
          });
      }
      
      // Create owner with explicit role
      const owner = await User.create({
          ...req.body,
          role: 'owner'  // Force owner role
      });
      
      // Generate token
      const token = generateToken(owner._id, owner.role);
      
      res.status(201).json({
          success: true,
          token,
          user: {
              id: owner._id,
              email: owner.email,
              role: owner.role  // Include role in response
          }
      });
      
  } catch (error) {
      console.error('Owner registration error:', error);
      res.status(500).json({
          success: false,
          message: 'Server error during registration',
          error: error.message
      });
  }
};


exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify the user is NOT an admin
        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admins must use the admin login'
            });
        }

        // Check if password matches
        const isMatch = await user.comparePassword(password);
        
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id, user.role);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role // Include role in response
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message
        });
    }
};

exports.ownerLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify the user is an owner
    if (user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Owner privileges required'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Owner login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};



  exports.checkAdmins = async (req, res) => {
    try {
      // Count the number of admin users in your database
      const adminCount = await User.countDocuments({ role: 'admin' });
      
      // Return whether any admins exist
      return res.status(200).json({
        hasAdmins: adminCount > 0
      });
    } catch (error) {
      console.error('Error checking for admins:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while checking for admins',
        error: error.message
      });
    }
  };

  // Add this to your authController.js
  exports.adminLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify admin role
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin privileges required'
            });
        }

        // Generate token with role
        const token = generateToken(user._id, user.role);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role  // Ensure role is included
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message
        });
    }
};


  exports.updateProfile = async (req, res) => {
    try {
      const userId = req.user.id; // From auth middleware
      const { 
        firstName, 
        lastName, 
        email, 
        firstAddress, 
        secondAddress, 
        city, 
        country, 
        postalCode 
      } = req.body;
  
      // Find user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Handle profile photo upload
      if (req.file) {
        // Delete old profile photo if exists
        if (user.profilePhoto) {
          const oldPhotoPath = path.join(__dirname, '../uploads', path.basename(user.profilePhoto));
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        }
  
        // Save new profile photo path
        user.profilePhoto = `/uploads/${req.file.filename}`;
      }
  
      // Update user fields
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      user.firstAddress = firstAddress;
      user.secondAddress = secondAddress;
      user.city = city;
      user.country = country;
      user.postalCode = postalCode;
  
      // Save updated user
      await user.save();
  
      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;
  
      res.status(200).json({ 
        message: 'Profile updated successfully', 
        user: userResponse 
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  




  exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                firstAddress: user.firstAddress,
                secondAddress: user.secondAddress,
                city: user.city,
                country: user.country,
                postalCode: user.postalCode,
                role: user.role,
                profilePhoto: user.profilePhoto
            }
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user data',
            error: error.message
        });
    }
};





exports.protect = async (req, res, next) => {
    try {
        let token;
        
        if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }
        
        // Verify token
        const secret = process.env.JWT_SECRET || 'defaultsecret';
        const decoded = jwt.verify(token, secret);
        
        // Find user and include role
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Attach user and role to request
        req.user = user;
        next();
        
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({
            success: false,
            message: 'Not authorized',
            error: error.message
        });
    }
};

  exports.restrictTo = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to perform this action'
        });
      }
      next();
    };
  };

  // Add this to your authController.js
exports.deleteProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find and delete the user
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete profile photo if exists
    if (user.profilePhoto) {
      const photoPath = path.join(__dirname, '../uploads', path.basename(user.profilePhoto));
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    res.status(200).json({
      success: true,
      message: 'User account deleted successfully'
    });

  } catch (error) {
    console.error('Profile deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile deletion',
      error: error.message
    });
  }
};

