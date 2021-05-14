require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
app.use(cors());

// Route imports
const bootcamps = require("./routes/bootcamps");

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

// Mount routers
app.use("/api/v1/bootcamps", bootcamps);

app.listen(process.env.PORT || 3000, () => {
	let port = process.env.PORT || 3000;
	console.log(`Server running in ${process.env.NODE_ENV} mode on ${port}`);
});
