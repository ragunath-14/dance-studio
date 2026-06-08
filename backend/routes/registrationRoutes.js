const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');

// Admin: Get all registrations (filterable by status)
router.get('/', registrationController.getAllRegistrations);

// Admin: Get only pending registrations
router.get('/pending', registrationController.getPendingRegistrations);

// Log clearing / soft-hiding routes
router.post('/hide-all-logs', registrationController.hideAllRegistrationLogs);
router.put('/:id/hide-log', registrationController.hideRegistrationLog);

// Admin: Approval flow
router.post('/:id/approve', registrationController.approveRegistration);
router.post('/:id/reject', registrationController.rejectRegistration);
router.delete('/:id', registrationController.deleteRegistration);

module.exports = router;
