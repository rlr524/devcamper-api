require("dotenv").config({ path: "./config/.env" });
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf } = format;
const connectDB = require("./config/db");
require("colors");

const app = express();
app.use(cors());

// Connect to database
connectDB();

// Route imports
const bootcamps = require("./routes/bootcamps");

// Logger for errors and info
const logFormat = printf(({ level, message, label, timestamp }) => {
	return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
	format: combine(label({ label: "server.js" }), timestamp(), logFormat),
	transports: [
		// - Write all logs with level "error" and below to "error.log"
		// - Write all logs with level "info" and below to "combined.log"
		new transports.File({
			filename: path.join(__dirname + "/logs", "error.log"),
			level: "error",
		}),
		new transports.File({
			filename: path.join(__dirname + "/logs", "combined.log"),
		}),
	],
});

if (process.env.NODE_ENV !== "production") {
	logger.add(
		new transports.Console({
			format: format.simple(),
		})
	);
}

// Log stream for http requests with dev logging middleware
var accessLogStream = fs.createWriteStream(
	path.join(__dirname + "/logs", "access.log"),
	{
		flags: "a",
	}
);

if (process.env.NODE_ENV === "development") {
	app.use(morgan("combined", { stream: accessLogStream }));
}

// Mount routers
app.use("/api/v1/bootcamps", bootcamps);

const server = app.listen(process.env.PORT || 3000, () => {
	let port = process.env.PORT || 3000;
	console.log(
		`Server running in ${process.env.NODE_ENV} mode on ${port}`.magenta.bold
	);
});

// Handle unhandled promise rejections by crashing the app
process.on("unhandledRejection", (err) => {
	console.log(`Error: ${err.message}`.red.underline.bold);
	logger.log({
		level: "error",
		message: `error - unhandled rejection: ${err.message}`,
	});
	// Close server and exit process
	server.close(() => {
		process.exit(1);
	});
});
