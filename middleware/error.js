const logger = require("../middleware/errorLogger");
const ErrorResponse = require("../utils/errorResponse");

/* eslint-disable-next-line */
const errorHandler = (err, req, res, next) => {
	let error = {
		...err,
	};
	error.message = err.message;
	// Log to console for dev
	console.log(err);

	// Mongoose bad ObjectId
	if (err.name === "CastError") {
		const message = `${err.name} : ${err.message} : ${err.value} is not a valid ${err.kind} at ${err.path} : ${err.reason}`;
		error = new ErrorResponse(message, 400);
	}

	// Mongoose duplicate key
	if (err.code === 11000) {
		const message = `${err.name} : ${err.message} : "${err.keyValue.name}" already exists in the database`;
		error = new ErrorResponse(message, 400);
	}

	// Mongoose validation failure
	if (err.name === "ValidationError") {
		const subMessage = Object.values(err.errors).map((val) => val.message);
		const message = `${err.name} - ${err._message} : ${subMessage}`;
		error = new ErrorResponse(message, 400);
	}

	res.status(error.statusCode || 500).json({
		success: false,
		error: error.message || "Server Error",
	});

	logger.log({
		level: "error",
		message: `${error.message}`,
	});
};

module.exports = errorHandler;
