const express = require('express');

const {
    updateProfile,
    deleteResume,
    getPublicProfile,
} = require('../controllers/userController');

const { protect } = require('../middlewares/authMiddleware');
//const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();

//Protected route to update user profile
router.put('/profile', protect, updateProfile);
router.post('/resume', protect, deleteResume);

//Public route to get user profile by ID
router.get('/:id', getPublicProfile);

module.exports = router;


