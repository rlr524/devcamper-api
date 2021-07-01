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
// const ErrorResponse = require("../utils/errorResponse");

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

	/**
	 * @constant
	 * @fires getSignedJwtToken
	 * @note In MongoDB model, a method is called on an instantiation of the model (user) where a static is called on the model itself (User)
	 */
	const token = user.getSignedJwtToken();

	res.status(200).json({
		success: true,
		token,
		data: user,
	});
});
