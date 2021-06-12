/**
 *@fileoverview This is a set of functions that act as controllers for all bootcamp routes
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
	let query;
	// Copy req.query
	const reqQuery = { ...req.query };
	// Fields to exclude from query param match
	const removeFields = ["select", "sort", "limit", "page"];
	// Loop over removeFields and delete them from reqQuery
	removeFields.forEach((param) => delete reqQuery[param]);
	// Create query string
	let queryStr = JSON.stringify(reqQuery);
	// Create MongoDB operators (gt, lte, etc)
	queryStr = queryStr.replace(
		/\b(gt|gte|lt|lte|in)\b/g,
		(match) => `$${match}`
	);
	// Finding resource using model and turning it back into an object
	// As well as populating courses (all fields given no options) into the bootcamp object (see virtuals in Bootcamp model)
	query = Bootcamp.find(JSON.parse(queryStr)).populate("courses");
	// Select fields
	if (req.query.select) {
		const fields = req.query.select.split(",").join(" ");
		query = query.select(fields);
	}
	// Sort results
	if (req.query.sort) {
		const sortBy = req.query.sort.split(",").join(" ");
		query = query.sort(sortBy);
	} else {
		// Default sort to createdAt field in descending order
		query = query.sort("-createdAt");
	}

	// Pagination
	const pageVal = parseInt(req.query.page, 10) || 1;
	const limitVal = parseInt(req.query.limit, 10) || 25;
	const startIndex = (pageVal - 1) * limitVal;
	const endIndex = pageVal * limitVal;
	const totalDocuments = await Bootcamp.countDocuments(JSON.parse(queryStr));

	query = query.skip(startIndex).limit(limitVal);

	// Executing query
	const bootcamps = await query;

	// Pagination result
	const pagination = {};
	if (endIndex < totalDocuments) {
		pagination.next = {
			page: pageVal + 1,
			limitVal,
		};
	}
	if (startIndex > 0) {
		pagination.prev = {
			page: pageVal - 1,
			limitVal,
		};
	}

	// Returning results
	return res.status(200).json({
		success: true,
		count: bootcamps.length,
		pagination,
		data: bootcamps,
	});
});

// @desc    Get a single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id).populate("courses");
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

// @desc	Get bootcamps within a radius of a given location using either imperial / US customary or metric units
// @route	GET /api/v1/bootcamps/radius/:zipcode/:distance/:units
// @access	Public
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
	const { zipcode, distance, units } = req.params;

	// Get latitude and longitude from geocoder
	const loc = await geocoder.geocode(zipcode);
	const lat = loc[0].latitude;
	const lon = loc[0].longitude;

	// Calculate radius using radians; divide distance by radius of the Earth
	// Earth radius = 6,378km, 3,963mi
	let radius = 0;

	if (units === "km") {
		radius = distance / 6378;
	} else {
		radius = distance / 3963;
	}

	const bootcamps = await Bootcamp.find({
		location: { $geoWithin: { $centerSphere: [[lon, lat], radius] } },
	});

	if (bootcamps.length === 0 && units === "mi") {
		return next(
			new ErrorResponse(
				`No bootcamps were found within the provided combination of ${req.params.zipcode} zipcode and ${req.params.distance} miles radius. Try expanding your search.`,
				404
			)
		);
	}
	if (bootcamps.length === 0 && units === "km") {
		return next(
			new ErrorResponse(
				`No bootcamps were found within the provided combination of ${req.params.zipcode} and ${req.params.distance} kilometers radius. Try expanding your search.`,
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

	// Trigger middleware in Bootcamp model to cascade flag as deleted all courses
	bootcamp.update();

	return res.status(200).json({
		success: true,
		data: bootcamp,
	});
});
