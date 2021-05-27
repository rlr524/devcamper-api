/**
 *@fileoverview This is a set of functions that act as controllers for all routs
 *@description Route controller functions using asyncHandler middleware to handle async/await try/catch blocks
 *@copyright Emiya Consulting 2021
 *@author Rob Ranf
 *@version 0.1
 *@since 5/26/2021
 */

const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res) => {
	const bootcamps = await Bootcamp.find({});
	return res.status(200).json({
		success: true,
		count: bootcamps.length,
		data: bootcamps,
	});
});

// @desc    Get a single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);
	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`No resource found with the id of ${req.params.id}`,
				404
			)
		);
	}
	return res.status(200).json({
		success: true,
		data: bootcamp,
	});
});

// @desc    Create a new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res) => {
	const bootcamp = await Bootcamp.create(req.body);
	return res.status(201).json({
		success: true,
		data: bootcamp,
	});
});

// @desc    Update a bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});
	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`No resource found with the id of ${req.params.id}`,
				404
			)
		);
	}
	return res.status(200).json({
		success: true,
		data: bootcamp,
	});
});

// @desc    Delete a bootcamp by updating the deleted flag to true
// @route   PATCH /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndUpdate(
		req.params.id,
		{
			name: `${req.params.id}__DELETED`,
			deleted: true,
		},
		{
			new: true,
			runValidators: true,
		}
	);
	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`No resource found with the id of ${req.params.id}`,
				404
			)
		);
	}
	return res.status(200).json({
		success: true,
		data: bootcamp,
	});
});
