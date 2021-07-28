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
	if (req.params.bootcampId) {
		const courses = await Course.find({ bootcamp: req.params.bootcampId });

		return res.status(200).json({
			success: true,
			count: courses.length,
			data: courses,
		});
	} else {
		res.status(200).json(res.advancedResults);
	}
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
	req.body.user = req.user.id;

	const bootcamp = await Bootcamp.findById(req.params.bootcampId);

	console.log(bootcamp.user);

	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`No bootcamp found with the id of ${req.params.bootcampId}`,
				404
			)
		);
	}

	// Make sure user is an owner of the bootcamp
	if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
		return next(
			new ErrorResponse(
				`The user with the id of ${req.user.id} is not able to add a course to this bootcamp: ${bootcamp.name}`,
				400
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

	// Make sure user is an owner of the course
	if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
		return next(
			new ErrorResponse(
				`The user with the id of ${req.user.id} is not able to update or delete this course: ${course.title}`,
				400
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

	// Make sure user is an owner of the course
	if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
		return next(
			new ErrorResponse(
				`The user with the id of ${req.user.id} is not able to update or delete this course: ${course.title}`,
				400
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
