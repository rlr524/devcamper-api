const express = require("express");

const {
	getBootcamps,
	getBootcamp,
	createBootcamp,
	updateBootcamp,
	deleteBootcamp,
	getBootcampsInRadius,
} = require("../controllers/bootcamps");

const Bootcamp = require("../models/Bootcamp");
const advancedResults = require("../middleware/advancedResults");

// Include other resource routers
const courseRouter = require("./courses");

const router = express.Router();

// Re-route into other resource routers
router.use("/:bootcampId/courses", courseRouter);

router.route("/radius/:zipcode/:distance/:units").get(getBootcampsInRadius);
router
	.route("/")
	.get(advancedResults(Bootcamp, "courses"), getBootcamps)
	.post(createBootcamp);
router.route("/:id").get(getBootcamp).put(updateBootcamp).patch(deleteBootcamp);

module.exports = router;
