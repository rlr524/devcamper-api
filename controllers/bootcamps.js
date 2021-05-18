const Bootcamp = require("../models/Bootcamp");
const logger = require("../middleware/errorLogger");

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = async (req, res) => {
	try {
		const bootcamps = await Bootcamp.find({});
		res.status(200).json({
			success: true,
			count: bootcamps.length,
			data: bootcamps,
		});
	} catch (err) {
		res.status(400).json({
			success: false,
		});
		logger.log({
			level: "error",
			message: `error in /controllers/bootcamps.js getBootcamps(): ${err.message}`,
		});
	}
};

// @desc    Get a single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = async (req, res) => {
	try {
		const bootcamp = await Bootcamp.findById(req.params.id);
		if (!bootcamp) {
			return res.status(404).json({
				success: false,
				msg: `No resource with the id of ${req.params.id}`,
			});
		}
		return res.status(200).json({
			success: true,
			data: bootcamp,
		});
	} catch (err) {
		res.status(400).json({
			success: false,
		});
		logger.log({
			level: "error",
			message: `error in /controllers/bootcamps.js getBootcamp(): ${err.message}`,
		});
	}
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
	} catch (err) {
		res.status(400).json({
			success: false,
		});
		logger.log({
			level: "error",
			message: `error in /controllers/bootcamps.js createBootcamp(): ${err.message}`,
		});
	}
};

// @desc    Update a bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = async (req, res) => {
	try {
		const bootcamp = await Bootcamp.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true, runValidators: true }
		);
		if (!bootcamp) {
			return res.status(404).json({
				success: false,
				message: `No resource with the id of ${req.params.id}`,
			});
		}
		return res.status(200).json({
			success: true,
			data: bootcamp,
		});
	} catch (err) {
		res.status(400).json({
			success: false,
		});
		logger.log({
			level: "error",
			message: `error in /controllers/bootcamps.js updateBootcamp(): ${err.message}`,
		});
	}
};

// @desc    Delete a bootcamp by updating the deleted flag to true
// @route   PATCH /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = async (req, res) => {
	try {
		const bootcamp = await Bootcamp.findByIdAndUpdate(
			req.params.id,
			{
				deleted: true,
			},
			{
				new: true,
				runValidators: true,
			}
		);
		if (!bootcamp) {
			return res.status(404).json({
				success: false,
				message: `No resource with the id of ${req.params.id}`,
			});
		}
		return res.status(200).json({
			success: true,
			data: bootcamp,
		});
	} catch (err) {
		res.status(400).json({
			success: false,
		});
		logger.log({
			level: "error",
			message: `error in /controllers/bootcamp.js deleteBootcamp(): ${err.message}`,
		});
	}
};
