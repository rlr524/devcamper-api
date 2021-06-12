const mongoose = require("mongoose");

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

module.exports = mongoose.model("Course", CourseSchema);