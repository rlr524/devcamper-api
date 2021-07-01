/**
 *@fileoverview This is the Mongoose model for the courses collection.
 *@description The CourseSchema defines all fields related to the courses collection in the devcamper database on Mongo Atlas.
 *@copyright Emiya Consulting 2021
 *@author Rob Ranf
 *@version 0.1
 *@since 5/26/2021
 */

const mongoose = require("mongoose");
const ErrorResponse = require("../utils/errorResponse");

const CourseSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			trim: true,
			required: [true, "Please add a course title"],
		},
		description: {
			type: String,
			required: [true, "Please add a description"],
		},
		weeks: {
			type: String,
			required: [true, "Please add a course length in number of weeks"],
		},
		tuition: {
			type: Number,
			required: [true, "Please add a tuition cost in US dollars"],
		},
		minimumSkill: {
			type: String,
			required: [true, "Please select a minimum skill"],
			enum: ["beginner", "intermediate", "advanced"],
		},
		scholarshipAvailabe: {
			type: Boolean,
			default: false,
		},
		bootcamp: {
			type: mongoose.Schema.ObjectId,
			ref: "Bootcamp",
			required: true,
		},
		deleted: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

/**
 * @static
 * @param {*} bootcampId
 * @returns averageCost
 */
// Static method to calculate average of course tuitions; on Mongoose we can use statics to create static methods which,
// as with all languages, are methods that do not need to be instantiated to call, i.e. we do not need to save our method into
// a variable and instantiate the calling object in order to use it as below
CourseSchema.statics.getAverageCost = async function (bootcampId) {
	const setAverageCost = await this.aggregate([
		{
			$match: { bootcamp: bootcampId },
		},
		{
			$group: {
				_id: "$bootcamp",
				averageCost: { $avg: "$tuition" },
			},
		},
	]);
	try {
		await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
			averageCost: Math.ceil(setAverageCost[0].averageCost / 10) * 10,
		});
	} catch (err) {
		return new ErrorResponse(
			`Error calculating the average cost of tuition for this bootcamp: ${err}`,
			400
		);
	}
};

// Call getAverageCost after save; because these are being called on the model (which is basically a class), we need to use a constructor method
// in order to create and initialize any objects of the Model
CourseSchema.post("save", function () {
	this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverageCost before remove
CourseSchema.pre("remove", function () {
	this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model("Course", CourseSchema);
