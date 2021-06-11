const express = require("express");

const {
	getCourses,
	getCourse,
	createCourse,
	updateCourse,
	deleteCourse,
} = require("../controllers/courses");

// Need to set mergeParams to true here to allow the use of params from both the courses and bootcamps routes
const router = express.Router({ mergeParams: true });

router.route("/").get(getCourses).post(createCourse);
router.route("/:id").get(getCourse).put(updateCourse).patch(deleteCourse);

module.exports = router;
