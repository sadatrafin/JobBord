const express = require("express");
const {
  signupController,
  signinController,
  otpVerifyController,
  resendOtpController,
  forgetPasswordController,
  resetPasswordController
} = require("../../controllers/auth.controller");

const router = express.Router();

router.post("/signup", signupController);
router.post("/signin", signinController);
router.post("/otp-verify", otpVerifyController);
router.post("/resend-otp", resendOtpController);
router.post("/forget-password", forgetPasswordController);
router.post("/reset-password", resetPasswordController);

module.exports = router;
