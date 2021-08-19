/**
 *@fileoverview Controllers for all auth routes
 *@description Route controller functions using asyncHandler middleware to handle async/await try/catch blocks
 *@copyright Emiya Consulting 2021
 *@author Rob Ranf
 *@version 0.1
 *@since 6/22/2021
 */
const asyncHandler = require("../middleware/async");
const crypto = require("crypto");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/User");

/**
 * @description Register a user
 * @route POST /api/v1/auth/register
 * @public
 */
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

/**
 * @description Login a user
 * @route POST /api/v1/auth/login
 * @public
 */
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

/**
 * @description Log out the current user and clear user cookie after ten seconds
 * @route GET /api/v1/auth/logout
 * @private
 */
exports.logout = asyncHandler(async (req, res) => {
	res.cookie("token", "none", {
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true,
	});

	res.status(200).json({
		success: true,
		data: {},
	});
});

/**
 * @description Get current logged in user
 * @route GET /api/v1/auth/me
 * @private
 */
exports.getMe = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user.id);

	res.status(200).json({
		success: true,
		data: user,
	});
});

/**
 * @description Update the current user's details such as name, email, profile pic, bio, and social urls.
 * The active and role fields can only be updated by an admin and the password field is updated via a separate route and controller.
 * @route PATCH /api/v1/auth/updateuserprofile
 * @private
 * @todo //TODO: Need to ensure that on the front-end, when the update page loads, it needs to load the current values as this function will update
 * all of these fields and if a blank is loaded, it will blank out the field's existing data.
 */
exports.updateUserProfile = asyncHandler(async (req, res) => {
	const fieldsToUpdate = {
		name: req.body.name,
		email: req.body.email,
		profilePic: req.body.profilepic,
		bio: req.body.bio,
		twitterURL: req.body.twitterurl,
		githubURL: req.body.githuburl,
		facebookURL: req.body.facebookurl,
		instagramURL: req.body.instagramurl,
	};
	const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		data: user,
	});
});

/**
 * @description Update current logged on user's password
 * @route PUT /api/v1/auth/updateuserpassword
 * @private
 */
exports.updateUserPassword = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id).select("+password");

	// Check current password
	if (!(await user.matchPassword(req.body.currentPassword))) {
		return next(new ErrorResponse("Password is incorrect", 401));
	}

	user.password = req.body.newPassword;
	await user.save();

	sendTokenResponse(user, 200, res);
});

/**
 * @description Retrieve a forgotten password
 * @route POST /api/v1/auth/forgotpassword
 * @public
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });

	if (!user) {
		return next(
			new ErrorResponse(
				"If the user email exists in our database, the user will receive an email with reset instructions",
				202
			)
		);
	}

	/**
	 * @constant
	 * @description Gets the reset token
	 * @fires getResetPasswordToken
	 */
	const resetToken = user.getResetPasswordToken();

	await user.save({ validateBeforeSave: false });

	// Create reset url
	const resetUrl = `${req.protocol}://${req.get(
		"host"
	)}/api/v1/auth/resetpassword/${resetToken}`;

	const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\ ${resetUrl}`;

	try {
		await sendEmail({
			email: user.email,
			subject: "Devcamper password reset",
			text: message,
		});
		res.status(200).json({
			success: true,
			data: `Email sent to ${user.email}`,
		});
	} catch (err) {
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;
		await user.save({ validateBeforeSave: false });
		return next(
			new ErrorResponse("Reset email could not be sent", err),
			500
		);
	}
});

/**
 * @description Use the forgotten password token to reset a password
 * @route PUT /api/v1/auth/resetpassword/:resettoken
 * @public
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
	// Get hashed token
	const resetPasswordToken = crypto
		.createHash("sha256")
		.update(req.params.resettoken)
		.digest("hex");

	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpire: { $gt: Date.now() },
	});

	if (!user) {
		return next(new ErrorResponse("Invalid token", 400));
	}

	// Set new password
	user.password = req.body.password;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;
	await user.save();

	sendTokenResponse(user, 200, res);
});

/**
 * @function
 * @see controllers/auth.js -> register(), login(), resetPassword()
 * @description Get jwt token from model, create cookie and send response
 * @param {*} user
 * @param {*} statusCode
 * @param {*} res
 */
const sendTokenResponse = (user, statusCode, res) => {
	/**
	 * @constant
	 * @description Gets the jwt token
	 * @fires getSignedJwtToken
	 * @note In MongoDB model, a method is called on an instantiation of the model (e.g. user) where a static is called on the model itself (User)
	 */
	const token = user.getSignedJwtToken();

	// The cookie package used by cookie-parser takes in a Date() object for expiration; if nothing is passed
	// to the expiration property, it will be treated as a non-peristent cookie that expires when the browser is closed
	// The expires property is set to a value of 30 days, expressed in milliseconds, to match the jwt expiration
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
