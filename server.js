require("dotenv").config({ path: "./config/.env" });
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
require("colors");

const app = express();
app.use(cors());

// Connect to database
connectDB();

// Route imports
const bootcamps = require("./routes/bootcamps");

// Log stream
var accessLogStream = fs.createWriteStream(
	path.join(__dirname + "/logs", "access.log"),
	{
		flags: "a",
	}
);

// Dev logging middleware
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
	// Close server and exit process
	server.close(() => {
		process.exit(1);
	});
});
