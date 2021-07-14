/**
 *@fileoverview Middleware for use in authorizing users to access certain routes
 *@description This is a middleware function that allows access to protected routes based on user token and role
 *@copyright Emiya Consulting 2021
 *@author Rob Ranf
 *@version 0.1
 *@since 7/8/2021
 */

const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	}

	// else if (req.cookies.token) {
	//     token = req.cookies.token
	// }

	// Make sure the token exists
	if (!token) {
		return next(
			new ErrorResponse("Not authorized to access this resource", 401)
		);
	}

	// If the token does exist, verify it
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		console.log(decoded);
		req.user = await User.findById(decoded.id);
		next();
	} catch (err) {
		return next(
			new ErrorResponse("Not authorized to access this resource", 401)
		);
	}
});

// Grant access to routes based on user role
// Note the return of 403 vs 401 status...a 401 is "unauthorized" in that the client hasn't authenticated and must authenticate
// where 403 is "forbidden" in that the client has authenticated but based on role, the client doesn't have access
exports.authorize = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new ErrorResponse(
					`User role [${req.user.role}] is not authorized to access this resource`,
					403
				)
			);
		}
		next();
	};
};
