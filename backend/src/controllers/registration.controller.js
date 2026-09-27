'use strict';

const registrationService = require('../services/registration.service');
const paymentService = require('../services/payment.service');

async function verifyPayment(req, res) {
  res.json(await paymentService.verifyPayment(req.user.id, req.valid.params.id, req.valid.body));
}

async function cancel(req, res) {
  res.json(await registrationService.cancelRegistration(req.user.id, req.valid.params.id));
}

async function mockCheckout(req, res) {
  res.json(await paymentService.mockCheckout(req.user.id, req.valid.body.orderId));
}

module.exports = { verifyPayment, cancel, mockCheckout };
