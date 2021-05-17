const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf } = format;
const path = require("path");

const directory = path.normalize("../logs/");

// Logger for errors and info using Winston package
const logFormat = printf(({ level, message, label, timestamp }) => {
	return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
	format: combine(label(), timestamp(), logFormat),
	transports: [
		// - Write all logs with level "error" and below to "error.log"
		// - Write all logs with level "info" and below to "combined.log"
		new transports.File({
			filename: path.resolve(directory, "error.log"),
			level: "error",
		}),
		new transports.File({
			filename: path.join(directory, "combined.log"),
		}),
	],
});

module.exports = logger;
