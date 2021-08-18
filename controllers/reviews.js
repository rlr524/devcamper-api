const asyncHandler = require("../middleware/async");
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const Review = require("../models/Review");

// @desc    Get all reviews or all reviews by a single bootcamp
// @route   GET /api/v1/reviews
// @route	GET /api/v1/bootcamps/:bootcampId/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res) => {
	if (req.params.bootcampId) {
		const reviews = await Review.find({ bootcamp: req.params.bootcampId });

		return res.status(200).json({
			success: true,
			count: reviews.length,
			data: reviews,
		});
	} else {
		res.status(200).json(res.advancedResults);
	}
});

// @desc    Get a single review
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = asyncHandler(async (req, res, next) => {
	const review = await Review.findById(req.params.id).populate({
		path: "bootcamp",
		select: "name description",
	});
	if (!review) {
		return next(
			new ErrorResponse(
				`No review found with the id of ${req.params.id}`,
				404
			)
		);
	}
	return res.status(200).json({
		success: true,
		data: review,
	});
});

// @desc    Create a new review attached to a specific bootcamp and connected to a specific user
// @route   POST /api/v1/bootcamps/:bootcampId/reviews
// @access  Private
exports.createReview = asyncHandler(async (req, res, next) => {
	req.body.bootcamp = req.params.bootcampId;
	req.body.user = req.user.id;

	const bootcamp = await Bootcamp.findById(req.params.bootcampId);

	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`No bootcamp found with the id of ${req.params.bootcampId}`,
				404
			)
		);
	}

	const review = await Review.create(req.body);

	return res.status(201).json({
		success: true,
		data: review,
	});
});

// @desc    Update a review
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {
	let review = await Review.findById(req.params.id);

	if (!review) {
		return next(
			new ErrorResponse(
				`No review found with the id of ${req.params.id}`,
				404
			)
		);
	}

	// Make sure user is the one who wrote the review or an admin
	if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
		return next(
			new ErrorResponse(
				`The user with the id of ${req.user.id} is not able to update or delete this review: ${review.title}`,
				400
			)
		);
	}

	review = await Review.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	return res.status(200).json({
		success: true,
		data: review,
	});
});

// @desc    Delete a review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
	let review = await Review.findById(req.params.id);

	if (!review) {
		return next(
			new ErrorResponse(
				`No review found with the id of ${req.params.id}`,
				404
			)
		);
	}

	// Make sure user is the one who wrote the review or an admin
	if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
		return next(
			new ErrorResponse(
				`The user with the id of ${req.user.id} is not able to update or delete this review: ${review.title}`,
				400
			)
		);
	}

	review = await Review.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	await review.save();

	return res.status(200).json({
		success: true,
		data: {},
	});
});
