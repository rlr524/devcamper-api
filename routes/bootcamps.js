const express = require("express");
const {
	getBootcamps,
	getBootcamp,
	createBootcamp,
	updateBootcamp,
	deleteBootcamp,
	getBootcampsInRadius,
} = require("../controllers/bootcamps");
const router = express.Router();

router.route("/radius/:zipcode/:distance/:units").get(getBootcampsInRadius);
router.route("/").get(getBootcamps).post(createBootcamp);
router.route("/:id").get(getBootcamp).put(updateBootcamp).patch(deleteBootcamp);

module.exports = router;
