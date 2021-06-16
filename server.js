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
const { s3, upload } = require("./middleware/imageUpload");
const uuid = require("uuid");
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
const courses = require("./routes/courses");

// Base route for uploading images
app.post("/api/v1/upload", upload, (req, res) => {
	let image = req.file.originalname.split(".");
	const imageType = image[image.length - 1];

	const params = {
		Bucket: process.env.AWS_BUCKET_NAME,
		Key: `${uuid()}.${imageType}`,
		Body: req.file.buffer,
	};

	s3.upload(params, (err, data) => {
		if (err) {
			res.status(500).send(err);
		}
		res.status(200).json({
			success: true,
			url: data.Location,
		});
	});
});

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
app.use("/api/v1/courses", courses);

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
