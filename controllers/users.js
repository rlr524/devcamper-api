/**
 *@fileoverview Controllers for all user routes
 *@description Route controller functions using asyncHandler middleware to handle async/await try/catch blocks
 *@copyright Emiya Consulting 2021
 *@author Rob Ranf
 *@version 0.1
 *@since 7/1/2021
 */

//  const User = require("../models/User");
const asyncHandler = require("../middleware/async");

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private
exports.getUsers = asyncHandler(async (req, res) => {
	res.status(200).json(res.advancedResults);
});
