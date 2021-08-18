/**
 *@fileoverview These are the reviews routes.
 *@description Includes all route controller functions and utilizes Express router.
 *@copyright Emiya Consulting 2021
 *@author Rob Ranf
 *@version 0.1
 *@since 8/17/2021
 */

const express = require("express");

const {
	getReviews,
	getReview,
	createReview,
	updateReview,
	deleteReview,
} = require("../controllers/reviews");

const Review = require("../models/Review");
const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");

// Need to set mergeParams to true here to allow the use of params from both the reviews and bootcamps routes
const router = express.Router({ mergeParams: true });

router
	.route("/")
	.get(
		advancedResults(Review, {
			path: "bootcamp",
			select: "name description",
		}),
		getReviews
	)
	.post(protect, authorize("user", "admin"), createReview);
router
	.route("/:id")
	.get(getReview)
	.put(protect, authorize("user", "admin"), updateReview)
	.delete(protect, authorize("user", "admin"), deleteReview);

module.exports = router;
