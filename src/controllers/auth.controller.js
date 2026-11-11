const { sendEmail } = require("../helpers/sendEmail");
const UserModel = require("../model/user.model");
const apiResponse = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { randomInt } = require("crypto");

const generateOtp = () => randomInt(1000, 10000).toString();

//Register controller

exports.signupController = asyncHandler(async (req, res) => {
  let { name, email, password, role } = req.body;

  if (email) {
    let existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return apiResponse(res, 400, "User already exists");
    } else {
      bcrypt.hash(password, 10, async (err, hash) => {
        if (err) {
          return apiResponse(res, 500, err || "Internal server error");
        } else {
          const otp = generateOtp();
          let user = new UserModel({
            name,
            email,
            role: role,
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

          sendEmail({ email, otp, name, type: "register" });
          apiResponse(res, 201, "account created successful", user);
        }
      });
    }
  } else {
    return apiResponse(res, 400, "Email is required");
  }
});

//Login controller

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
  email = typeof email === "string" ? email.trim().toLowerCase() : "";
  otp = typeof otp === "string" ? otp.trim() : "";

  if (!email || !otp) {
    return apiResponse(res, 400, "Email and OTP are required");
  }

  let existingUser = await UserModel.findOne({ email });

  if (!existingUser) {
    return apiResponse(res, 404, "User not found");
  }

  if (existingUser.otp === otp) {
    if (
      existingUser.otpExpired &&
      existingUser.otpExpired.getTime() > Date.now()
    ) {
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
  email = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!email) {
    return apiResponse(res, 400, "Email is required");
  }

  let existingUser = await UserModel.findOne({ email });

  if (!existingUser) {
    return apiResponse(res, 404, "User not found");
  }

  if (existingUser.isVerified) {
    return apiResponse(res, 400, "User is already verified");
  }

  const otp = generateOtp();

  existingUser.otp = otp;
  existingUser.otpExpired = Date.now() + 5 * 60 * 1000;
  await existingUser.save();

  sendEmail({ email, otp, name: existingUser.name, type: "resend_otp" });

  apiResponse(res, 200, "New OTP sent successfully");
});

// Forget password controller

exports.forgetPasswordController = asyncHandler(async (req, res) => {
  let { email } = req.body;

  let user = await UserModel.findOne({ email });

  if (user) {
    const otp = generateOtp();
    user.otp = otp;
    user.otpExpired = Date.now() + 5 * 60 * 1000;
    await user.save();

    sendEmail({ email, otp, name: user.name, type: "forgot_password" });
    apiResponse(res, 200, "OTP sent successfully");
  } else {
    apiResponse(res, 404, "User not found");
  }
});

// Reset password controller

exports.resetPasswordController = asyncHandler(async (req, res) => {
  let { email, otp, newPassword } = req.body;
  let user = await UserModel.findOne({ email });

  if (user) {
    if (user.otp === otp) {
      if (user.otpExpired > Date.now()) {
        let hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.otp = null;
        user.otpExpired = null;
        await user.save();
        apiResponse(res, 200, "Password reset successful");
      } else {
        apiResponse(res, 400, "OTP has expired");
      }
    } else {
      apiResponse(res, 400, "Invalid OTP");
    }
  } else {
    apiResponse(res, 404, "User not found");
  }
});
