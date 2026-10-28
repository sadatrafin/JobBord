const { sendEmail } = require("../helpers/sendEmail");
const UserModel = require("../model/user.model");
const apiResponse = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//Register a new user

exports.signupController = asyncHandler(async (req, res) => {
  let { name, email, password } = req.body;

  bcrypt.hash(password, 10, async (err, hash) => {
    if (err) {
      return apiResponse(res, 500, err || "Internal server error");
    } else {
      const otp = uuidv4().toString().slice(0, 6);
      let user = new UserModel({
        name,
        email,
        password: hash,
        otp,
        otpExpired: Date.now() + 5 * 60 * 1000,
      });
      await user.save();

      setTimeout(
        async () => {
          user.otp = null;
          user.otpExpired = null;
          await user.save();
        },
        5 * 60 * 1000,
      );

      sendEmail(email, otp, name);
      apiResponse(res, 201, "account created successful", user);
    }
  });
});

//Login a user

exports.signinController = asyncHandler(async (req, res) => {
  let { email, password } = req.body;
  let existingUser = await UserModel.findOne({ email }).select("+password");
  if (!existingUser) {
    return apiResponse(res, 404, "Internal server error");
  } else {
    bcrypt.compare(password, existingUser.password, function (err, result) {
      if (err) {
        return apiResponse(res, 500, "Internal server error");
      } else if (result) {
        let user = {
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
          isActive: existingUser.isActive,
          isVerified: existingUser.isVerified,
        };

        jwt.sign(
          { email: existingUser.email, id: existingUser._id },
          process.env.privateKey,
          { expiresIn: "5m" },
          function (err, token) {
            apiResponse(res, 200, "Login successful", { ...user, token });
          },
        );
      } else {
        return apiResponse(res, 401, "Invalid credentials");
      }
    });
  }
});

///otp verify controller

exports.otpVerifyController = asyncHandler(async (req, res) => {
  let { email, otp } = req.body;
  let existingUser = await UserModel.findOne({ email });

  if (!existingUser) {
    return apiResponse(res, 404, "User not found");
  }

  if (existingUser.otp == otp) {
    if (existingUser.otpExpired > new Date()) {
      existingUser.otp = null;
      existingUser.otpExpired = null;
      existingUser.isVerified = true;
      await existingUser.save();
      apiResponse(res, 200, "OTP verified successfully", existingUser);
    } else {
      return apiResponse(res, 400, "OTP expired");
    }
  } else {
    return apiResponse(res, 400, "Invalid OTP");
  }
});

//resend otp controller

exports.resendOtpController = asyncHandler(async (req, res) => {
  let { email } = req.body;
  let existingUser = await UserModel.findOne({ email });

  if (!existingUser) {
    return apiResponse(res, 404, "User not found");
  }

  if (existingUser.isVerified) {
    return apiResponse(res, 400, "User is already verified");
  }

  const otp = uuidv4().toString().slice(0, 6);

  existingUser.otp = otp;
  existingUser.otpExpired = Date.now() + 5 * 60 * 1000;
  await existingUser.save();

  await sendEmail(email, otp, existingUser.name);

  apiResponse(res, 200, "New OTP sent successfully");
});
