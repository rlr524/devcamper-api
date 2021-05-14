// @desc    Logs requests to console

const logger = (req, res, next) => {
	console.log(
		`${req.method} ${req.query} ${req.protocol}://${req.get("host")}${
			req.originalUrl
		} ${req.ip}`
	);
	next();
};

module.exports = logger;
