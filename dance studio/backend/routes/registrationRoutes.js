const express = require('express');
const router = express.Router();
const { 
  registerStudent, 
  getAllRegistrations 
} = require('../controllers/registrationController');

// Define routes
router.post('/register', registerStudent);
router.get('/registrations', getAllRegistrations);

module.exports = router;
