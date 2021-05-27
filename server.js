/**
 *@fileoverview This is the main entry point of the Devcamper web service
 *@description Implements required middleware for http res/req (express.js and cors), db connectivity, and routing as well as morgan for route access logging; also spins up a server.
 *@copyright Emiya Consulting 2021
 *@author Rob Ranf
 *@version 0.1
 *@since 5/26/2021
 */

require("dotenv").config({ path: "./config/.env" });
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const logger = require("./middleware/errorLogger");
const errorHandler = require("./middleware/error");
const morgan = require("morgan");
const connectDB = require("./config/db");
require("colors");

const app = express();
// Built-in body parser middleware for Express
app.use(express.json());
// Cors package
app.use(cors());

// Connect to database
connectDB();

// Route imports
const bootcamps = require("./routes/bootcamps");

// Log stream for http requests with Morgan dev logging middleware
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

// Custom error handler middleware
app.use(errorHandler);

// Instantiate server
const server = app.listen(process.env.PORT || 3000, () => {
	let port = process.env.PORT || 3000;
	console.log(
		`Server running in ${process.env.NODE_ENV} mode on ${port}`.magenta.bold
	);
});

// Handle unhandled promise rejections such as failure to connect to the db by crashing the app
process.on("unhandledRejection", (err) => {
	console.log(`Error: ${err.message}`.red.underline.bold);
	logger.log({
		level: "error",
		message: `error in server.js - unhandled rejection: ${err.message}`,
	});
	// Close server and exit process
	server.close(() => {
		process.exit(1);
	});
});
