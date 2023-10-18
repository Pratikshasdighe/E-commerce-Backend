const express = require("express");
const {
  processPayment,
  sendStripeApiKey,
} = require("../controller/paymentController");

const router = express.Router();
const { isAuthenticationUser, authorizeRoles } = require("../middleware/auth");
router.route("/payment/process").post(isAuthenticationUser, processPayment);
router.route("/stripeapikey").get(isAuthenticationUser, sendStripeApiKey);
module.exports = router;
