const { sendEmail } = require("../helpers/sendEmail");
const UserModel = require("../model/user.model");
const apiResponse = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const { v4: uuidv4 } = require('uuid'); 


exports.signupController = asyncHandler(async (req, res) => {
  const otp = uuidv4().toString().slice(0, 6);
  let { name, email, password } = req.body;
  let user = new UserModel({
    name,
    email,
    password,
    otp
  });

  await user.save();
  sendEmail(email, otp, name);
  apiResponse(res, 201, "account created successful", user);
});
