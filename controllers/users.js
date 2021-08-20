/**
 *@fileoverview Controllers for all user routes
 *@description Route controller functions using asyncHandler middleware to handle async/await try/catch blocks
 *@copyright Emiya Consulting 2021
 *@author Rob Ranf
 *@version 0.1
 *@since 7/1/2021
 */

const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// @desc    Get all users
// @route   GET /api/v1/auth/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res) => {
	res.status(200).json(res.advancedResults);
});

// @desc    Get a single user
// @route   GET /api/v1/auth/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	if (!user) {
		return next(
			new ErrorResponse(`No user found with the id of ${user.id}`, 404)
		);
	}

	res.status(200).json({
		success: true,
		data: user,
	});
});

// @desc    Create a user
// @route   POST /api/v1/auth/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res) => {
	const user = await User.create(req.body);
	res.status(201).json({
		success: true,
		data: user,
	});
});

/**
 * @description Update a user's profile
 * @route PUT /api/v1/auth/users/:id
 * @private admin or the user that owns the profile
 * @todo //TODO: Need to update this to allow the user to update their own profile. Remember to change protection on the route.
 */
exports.updateUser = asyncHandler(async (req, res, next) => {
	const user = await User.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	if (!user) {
		return next(
			new ErrorResponse(`No user found with the id of ${user.id}`, 404)
		);
	}

	res.status(200).json({
		success: true,
		data: user,
	});
});

/**
 * @description Delete a user (perform a hard delete in compliance with most privacy standards)
 * @route DELETE /api/v1/auth/users/:id
 * @private admin or the user that owns the profile
 * @todo //TODO: Need to update this to allow the user to delete their own profile and then sign them out and clear cookie. Remember to change protection on the route.
 */
exports.deleteUser = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	if (!user) {
		return next(
			new ErrorResponse(`No user found with the id of ${req.params.id}`)
		);
	}

	await User.findByIdAndDelete(req.params.id);

	res.status(200).json({
		success: true,
		data: {},
	});
});
