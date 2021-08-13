/**
 *@fileoverview This is the Mongoose model for the reviews collection.
 *@description The ReviewSchema defines all fields related to the reviews collection in the devcamper database on Mongo Atlas.
 *@copyright Emiya Consulting 2021
 *@author Rob Ranf
 *@version 0.1
 *@since 8/13/2021
 */

const mongoose = require("mongoose");

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

module.exports = mongoose.model("Review", ReviewSchema);
