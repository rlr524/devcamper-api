/**
 *@fileoverview Main entry point of the Devcamper web service
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
const Bootcamp = require("./models/Bootcamp");
const ErrorResponse = require("./utils/errorResponse");
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
const auth = require("./routes/auth");
const users = require("./routes/users");

/**
 * @description Uses the imageUpload middleware for AWS S3 and Multer configuration
 * @todo // TODO Refactor this to use a function in the bootcamp controller vs a direct POST request in the server file
 */

// @desc	Upload a photo for a bootcamp
// @route	POST /api/v1/bootcamps/:id/upload
// @access	Private
app.post("/api/v1/bootcamps/:id/upload", upload, async (req, res, next) => {
	let id = req.params.id;
	const bootcamp = await Bootcamp.findById(id);
	let image = req.file.originalname.split(".");
	let imageSize = req.file.size;
	let fileType = req.file.mimetype;
	let imageSizeMB = Math.ceil(process.env.FILE_SIZE_LIMIT / 1048576);
	const imageType = image[image.length - 1];

	if (!bootcamp) {
		return next(
			new ErrorResponse(`No bootcamp found with the id of ${id}`, 404)
		);
	}

	if (!req.file) {
		return next(new ErrorResponse(`Please upload an image file`, 400));
	}

	if (!fileType.startsWith("image")) {
		return next(new ErrorResponse(`File must be an image`), 400);
	}

	if (imageSize > process.env.FILE_SIZE_LIMIT) {
		return next(
			new ErrorResponse(
				`Please limit the image size to less than ${imageSizeMB}MB`,
				400
			)
		);
	}

	const params = {
		Bucket: process.env.AWS_BUCKET_NAME,
		Key: `${uuid()}.${imageType}`,
		Body: req.file.buffer,
	};

	s3.upload(params, async (err, data, next) => {
		if (err) {
			return next(
				new ErrorResponse(
					`There was an error while uploading the file. Please contact the system administrator`,
					500
				)
			);
		}

		await Bootcamp.findByIdAndUpdate(id, {
			photo: data.Location,
		});

		res.status(200).json({
			success: true,
			url: data.Location,
			type: imageType,
			mimeType: fileType,
			data,
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

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Mount routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);

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
