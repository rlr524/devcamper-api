/**
 *@fileoverview This is a set of functions that act as controllers for all routs
 *@description Route controller functions using asyncHandler middleware to handle async/await try/catch blocks
 *@copyright Emiya Consulting 2021
 *@author Rob Ranf
 *@version 0.1
 *@since 5/26/2021
 */

const geocoder = require("../utils/geocoder");
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

// @desc	Get bootcamps within a radius of a given location
// @route	GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access	Public
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
	const { zipcode, distance } = req.params;

	// Get latitude and longitude from geocoder
	const loc = await geocoder.geocode(zipcode);
	const lat = loc[0].latitude;
	const lon = loc[0].longitude;

	// Calculate radius using radians; divide distance by radius of the Earth
	// Earth radius = 6,378km, 3,963mi
	/**
	 * @todo //TODO UI should allow for selection of metric or imperial / US customary units
	 */
	const radius = distance / 3963;

	const bootcamps = await Bootcamp.find({
		location: { $geoWithin: { $centerSphere: [[lon, lat], radius] } },
	});

	if (bootcamps.length === 0) {
		return next(
			new ErrorResponse(
				`No bootcamps were found within the provided combination of ${req.params.zipcode} zipcode and ${req.params.distance} miles radius. Try expanding your search.`,
				404
			)
		);
	}

	res.status(200).json({
		success: true,
		count: bootcamps.length,
		data: bootcamps,
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
