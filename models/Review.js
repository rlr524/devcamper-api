/**
 *@fileoverview This is the Mongoose model for the reviews collection.
 *@description The ReviewSchema defines all fields related to the reviews collection in the devcamper database on Mongo Atlas.
 *@copyright Emiya Consulting 2021
 *@author Rob Ranf
 *@version 0.1
 *@since 8/13/2021
 */

const mongoose = require("mongoose");
const ErrorResponse = require("../utils/errorResponse");

const ReviewSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			trim: true,
			required: [true, "Please add a title for the review"],
			maxlength: 100,
		},
		text: {
			type: String,
			required: [true, "Please add some text"],
		},
		rating: {
			type: Number,
			min: 1,
			max: 10,
			required: [
				true,
				"Please add a course rating from 1 (Poor) to 10 (Outstanding)",
			],
		},
		bootcamp: {
			type: mongoose.Schema.ObjectId,
			ref: "Bootcamp",
			required: true,
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: "User",
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

// Prevent the user from submitting more than one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

/**
 * @static
 * @param {*} bootcampId
 * @returns averageRating
 */
// Static method to calculate average review rating for a bootcamp; on Mongoose we can use statics to create static methods which,
// as with all languages, are methods that do not need to be instantiated to call, i.e. we do not need to save our method into
// a variable and instantiate the calling object in order to use it as below
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
	const setAverageRating = await this.aggregate([
		{
			$match: { bootcamp: bootcampId },
		},
		{
			$group: {
				_id: "$bootcamp",
				averageRating: { $avg: "$rating" },
			},
		},
	]);
	try {
		await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
			averageRating: setAverageRating[0].averageRating,
		});
	} catch (err) {
		return new ErrorResponse(
			`Error calculating the average rating for this bootcamp: ${err}`,
			400
		);
	}
};

// Call getAverageRating after save; because these are being called on the model (which is basically a class), we need to use a constructor method
// in order to create and initialize any objects of the Model
ReviewSchema.post("save", function () {
	this.constructor.getAverageRating(this.bootcamp);
});

// Call getAverageCost before remove
ReviewSchema.pre("remove", function () {
	this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model("Review", ReviewSchema);
