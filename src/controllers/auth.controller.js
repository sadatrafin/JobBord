const UserModel = require("../model/user.model");
const apiResponse = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");

exports.signupController = asyncHandler(async (req, res) => {

    let { name, email, password } = req.body;
    let user = new UserModel({
        name, email, password 
    })

    await user.save()
    apiResponse(res, 201, "account created successful", user)
})