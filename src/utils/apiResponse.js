const apiResponse = (res, statusCode, message, data) => {
    return res.status(statusCode).json({ message, data, success: statusCode < 400 ? true : false })
}

module.exports = apiResponse;




