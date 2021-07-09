/**
 *@fileoverview Controllers for all auth routes
 *@description Route controller functions using asyncHandler middleware to handle async/await try/catch blocks
 *@copyright Emiya Consulting 2021
 *@author Rob Ranf
 *@version 0.1
 *@since 6/22/2021
 */

const User = require("../models/User");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");

// @desc Register user
// @route POST /api/v1/auth/register
// @access Public
exports.register = asyncHandler(async (req, res) => {
	const { name, email, password, role } = req.body;

	const user = await User.create({
		name,
		email,
		password,
		role,
	});

	sendTokenResponse(user, 200, res);
});

// @desc Login user
// @route POST /api/v1/auth/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;

	// Validate email and password
	if (!email || !password) {
		return next(
			new ErrorResponse(
				"Please provide an email address and a password",
				400
			)
		);
	}

	// Check for user; we need to select("+password") in order to pass the pw from the db to this function, as
	// we are not passing it on responses, by default, in the model
	const user = await User.findOne({ email }).select("+password");

	if (!user) {
		return next(new ErrorResponse("Invalid credentials", 401));
	}

	/**
	 * @constant
	 * @description Check if password matches
	 * @fires matchPassword
	 * @note In MongoDB model, a method is called on an instantiation of the model (user) where a
	 * static is called on the model itself (User)
	 */
	const isMatch = await user.matchPassword(password);

	if (!isMatch) {
		return next(new ErrorResponse("Invalid credentials", 401));
	}

	sendTokenResponse(user, 200, res);
});

// @desc Get current logged in user
// @route GET /api/v1/auth/me
// @access Private
exports.getMe = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user.id);

	res.status(200).json({
		success: true,
		data: user,
	});
});

/**
 * @constant
 * @fires sendTokenResponse
 * @param {*} user
 * @param {*} statusCode
 * @param {*} res
 */
const sendTokenResponse = (user, statusCode, res) => {
	/**
	 * @constant
	 * @description Get jwt token
	 * @fires getSignedJwtToken
	 * @note In MongoDB model, a method is called on an instantiation of the model (user) where a
	 * static is called on the model itself (User)
	 */
	const token = user.getSignedJwtToken();

	// The cookie package used by cookie-parser takes in a Date() object for expiration; if nothing is passed
	// to the expiration property, it will be treated as a non-peristent cookie that expires when the browser is closed
	// The expires prop is using 30 days, expressed in milliseconds, to match the jwt expiration
	const options = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
	};

	// Add a "secure" property to the cookie options and set it to true to use https for cookies if in production
	if (process.env.NODE_ENV === "production") {
		options.secure = true;
	}

	res.status(statusCode).cookie("token", token, options).json({
		success: true,
		token,
	});
};
