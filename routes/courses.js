/**
 *@fileoverview This is the courses route.
 *@description Includes all five course controller functions and utilizes Express router.
 *@copyright Emiya Consulting 2021
 *@author Rob Ranf
 *@version 0.1
 *@since 6/8/2021
 */

const express = require("express");

const {
	getCourses,
	getCourse,
	createCourse,
	updateCourse,
	deleteCourse,
} = require("../controllers/courses");

const Course = require("../models/Course");
const advancedResults = require("../middleware/advancedResults");
const { protect } = require("../middleware/auth");

// Need to set mergeParams to true here to allow the use of params from both the courses and bootcamps routes
const router = express.Router({ mergeParams: true });

router
	.route("/")
	.get(
		advancedResults(Course, {
			path: "bootcamp",
			select: "name description",
		}),
		getCourses
	)
	.post(protect, createCourse);
router
	.route("/:id")
	.get(getCourse)
	.put(protect, updateCourse)
	.patch(protect, deleteCourse);

module.exports = router;
