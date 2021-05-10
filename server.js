require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());

app.get("/api/v1/bootcamps", (req, res) => {
	res.status(200).json({ success: true, msg: "Show all bootcamps" });
});

app.get("/api/v1/bootcamps/:id", (req, res) => {
	res.status(200).json({
		success: true,
		msg: `Show a single bootcamp with the id of ${req.params.id}`,
	});
});

app.post("/api/v1/bootcamps", (req, res) => {
	res.status(200).json({ success: true, msg: "Create a new bootcamp" });
});

app.put("/api/v1/bootcamps/:id", (req, res) => {
	res.status(200).json({
		success: true,
		msg: `Update bootcamp with the id of ${req.params.id}`,
	});
});

app.delete("/api/v1/bootcamps/:id", (req, res) => {
	res.status(200).json({
		success: true,
		msg: `Delete the bootcamp with the id of ${req.params.id}`,
	});
});

app.listen(process.env.PORT || 3000, () => {
	let port = process.env.PORT || 3000;
	console.log(`Server running in ${process.env.NODE_ENV} mode on ${port}`);
});
