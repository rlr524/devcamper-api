/**
 *@fileoverview This is a set of functions that act as controllers for all course routes
 *@description Route controller functions using asyncHandler middleware to handle async/await try/catch blocks
 *@copyright Emiya Consulting 2021
 *@author Rob Ranf
 *@version 0.1
 *@since 6/10/2021
 */

const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Get all courses or all courses by a single bootcamp
// @route   GET /api/v1/courses
// @route	GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res) => {
	let query;

	if (req.params.bootcampId) {
		query = Course.find({ bootcamp: req.params.bootcampId });
	} else {
		// Use the Mongoose populate() method to
		query = Course.find().populate({
			path: "bootcamp",
			select: "name description",
		});
	}
	// // Copy req.query
	// const reqQuery = { ...req.query };
	// // Fields to exclude from query param match
	// const removeFields = ["select", "sort", "limit", "page"];
	// // Loop over removeFields and delete them from reqQuery
	// removeFields.forEach((param) => delete reqQuery[param]);
	// // Create query string
	// let queryStr = JSON.stringify(reqQuery);
	// // Create MongoDB operators (gt, lte, etc)
	// queryStr = queryStr.replace(
	// 	/\b(gt|gte|lt|lte|in)\b/g,
	// 	(match) => `$${match}`
	// );
	// // Finding resource using model and turning it back into an object
	// query = Course.find(JSON.parse(queryStr));
	// // Select fields
	// if (req.query.select) {
	// 	const fields = req.query.select.split(",").join(" ");
	// 	query = query.select(fields);
	// }
	// // Sort results
	// if (req.query.sort) {
	// 	const sortBy = req.query.sort.split(",").join(" ");
	// 	query = query.sort(sortBy);
	// } else {
	// 	// Default sort to createdAt field in descending order
	// 	query = query.sort("-createdAt");
	// }

	// // Pagination
	// const pageVal = parseInt(req.query.page, 10) || 1;
	// const limitVal = parseInt(req.query.limit, 10) || 25;
	// const startIndex = (pageVal - 1) * limitVal;
	// const endIndex = pageVal * limitVal;
	// const totalDocuments = await Course.countDocuments(JSON.parse(queryStr));

	// query = query.skip(startIndex).limit(limitVal);

	// Executing query
	const courses = await query;

	// // Pagination result
	// const pagination = {};
	// if (endIndex < totalDocuments) {
	// 	pagination.next = {
	// 		page: pageVal + 1,
	// 		limitVal,
	// 	};
	// }
	// if (startIndex > 0) {
	// 	pagination.prev = {
	// 		page: pageVal - 1,
	// 		limitVal,
	// 	};
	// }

	// Returning results
	return res.status(200).json({
		success: true,
		count: courses.length,
		// pagination,
		data: courses,
	});
});

// @desc    Get a single course
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
	const course = await Course.findById(req.params.id).populate({
		path: "bootcamp",
		select: "name description",
	});
	if (!course) {
		return next(
			new ErrorResponse(
				`No course found with the id of ${req.params.id}`,
				404
			)
		);
	}
	return res.status(200).json({
		success: true,
		data: course,
	});
});

/**
 * @todo //TODO Determine how to do a lookup within the specified bootcamp for which the course is being added and check if the course name is already used
 */
// @desc    Create a new course attached to a specific bootcamp
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  Private
exports.createCourse = asyncHandler(async (req, res, next) => {
	req.body.bootcamp = req.params.bootcampId;

	const bootcamp = Bootcamp.findById(req.params.bootcampId);

	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`No bootcamp found with the id of ${req.params.bootcampId}`,
				404
			)
		);
	}

	const course = await Course.create(req.body);

	return res.status(201).json({
		success: true,
		data: course,
	});
});

// @desc    Update a course
// @route   PUT /api/v1/courses/:id
// @access  Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
	let course = await Course.findById(req.params.id);

	if (!course) {
		return next(
			new ErrorResponse(
				`No course found with the id of ${req.params.id}`,
				404
			)
		);
	}

	course = await Course.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	return res.status(200).json({
		success: true,
		data: course,
	});
});

// @desc    Delete a course by updating the deleted flag to true
// @route   PATCH /api/v1/courses/:id
// @access  Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
	let course = await Course.findById(req.params.id);

	if (!course) {
		return next(
			new ErrorResponse(
				`No course found with the id of ${req.params.id}`,
				404
			)
		);
	}

	course = await Course.findByIdAndUpdate(
		req.params.id,
		{
			deleted: true,
			title: `${req.params.id}__DELETED`,
		},
		{
			new: true,
			runValidators: true,
		}
	);

	return res.status(200).json({
		success: true,
		data: course,
	});
});
