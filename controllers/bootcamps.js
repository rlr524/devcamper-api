const Bootcamp = require("../models/Bootcamp");
const logger = require("../middleware/errorLogger");

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = (req, res) => {
	res.status(200).json({
		success: true,
		msg: "Show all bootcamps",
	});
};

// @desc    Get a single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = (req, res) => {
	res.status(200).json({
		success: true,
		msg: `Show a single bootcamp with the id of ${req.params.id}`,
	});
};

// @desc    Create a new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = async (req, res) => {
	try {
		const bootcamp = await Bootcamp.create(req.body);
		res.status(201).json({
			success: true,
			data: bootcamp,
		});
		console.log(bootcamp);
	} catch (error) {
		res.status(400).json({
			success: false,
		});
		logger.log({
			level: "error",
			label: "bootcamps.js",
			message: `error - unhandled rejection`,
		});
	}
};

// @desc    Update a bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = (req, res) => {
	res.status(200).json({
		success: true,
		msg: `Update bootcamp with the id of ${req.params.id}`,
	});
};

// @desc    Delete a bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = (req, res) => {
	res.status(200).json({
		success: true,
		msg: `Delete the bootcamp with the id of ${req.params.id}`,
	});
};
