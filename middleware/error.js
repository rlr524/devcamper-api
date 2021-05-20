const logger = require("../middleware/errorLogger");

/* eslint-disable-next-line */
const errorHandler = (err, req, res, next) => {
	// Log to console for dev
	console.log(err.stack.red);

	res.status(err.statusCode || 500).json({
		success: false,
		error: err.message || "Server Error",
	});

	logger.log({
		level: "error",
		message: `${err.message}`,
	});
};

module.exports = errorHandler;
