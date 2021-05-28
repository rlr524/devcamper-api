/**
 * @fileoverview This file contains formatting and the function for the custom error logger using the Winston package
 */

const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf } = format;
const path = require("path");

// Logger for errors and info using Winston package
const logFormat = printf(({ level, message, timestamp }) => {
	return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
	format: combine(timestamp(), logFormat),
	transports: [
		// - Write all logs with level "error" and below to "error.log"
		// - Write all logs with level "info" and below to "combined.log"
		new transports.File({
			filename: path.join(__dirname, "../logs/", "error.log"),
			level: "error",
		}),
		new transports.File({
			filename: path.join(__dirname, "../logs/", "combined.log"),
		}),
	],
});

module.exports = logger;
