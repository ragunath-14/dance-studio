const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/', paymentController.getAllPayments);
router.post('/', paymentController.createPayment);
router.delete('/:id', paymentController.deletePayment);

module.exports = router;
