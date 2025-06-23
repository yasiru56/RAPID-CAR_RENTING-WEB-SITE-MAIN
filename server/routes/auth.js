const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');


const { 
  register, 
  registerAdmin, 
  login,
  adminLogin, 
  protect, 
  restrictTo,
  checkAdmins,
  getCurrentUser,
  updateProfile,
  deleteProfile,
  registerOwner 
} = require('../controllers/authController');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `profile-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Images only!');
    }
  }
});


router.post('/register', register);
// Special route for creating the first admin (no protection)
router.post('/admin/first-register', registerAdmin);
// Keep your protected route for subsequent admin registrations
router.post('/admin/register', protect, restrictTo('admin'), registerAdmin);

router.get('/check-admins', checkAdmins);
router.post('/admin/login', adminLogin);

router.post('/login', login,restrictTo('user'));

router.get('/current-user', protect, getCurrentUser);

router.put('/update-profile', 
  protect, 
  upload.single('profilePhoto'), 
  updateProfile
);


router.delete(
  '/delete-profile',
  protect,
  async (req, res, next) => {
    // Admin can delete any user by ID, regular users can only delete themselves
    if (req.user.role === 'admin' && req.query.userId) {
      req.user.id = req.query.userId;
    }
    next();
  },
  deleteProfile
);

router.post('/owner/register', registerOwner);

router.post('/owner/login', login, restrictTo('owner'));
router.get('/owner/current-user', protect, getCurrentUser);
router.put('/owner/update-profile', 
  protect, 
  upload.single('profilePhoto'), 
  updateProfile
);
router.delete(
  '/owner/delete-profile',
  protect,
  async (req, res, next) => {
    // Admin can delete any user by ID, regular users can only delete themselves
    if (req.user.role === 'admin' && req.query.userId) {
      req.user.id = req.query.userId;
    }
    next();
  },
  deleteProfile
);




module.exports = router;