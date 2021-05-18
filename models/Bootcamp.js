const mongoose = require("mongoose");

const BootcampSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please enter a name"],
		unique: true,
		trim: true,
		maxlength: [70, "Name is limited to 70 characters"],
	},
	// The slug is a url-friendly version is the name and is created by our Slugify package
	slug: String,
	description: {
		type: String,
		required: [true, "Please enter a description"],
		maxlength: [500, "Description is limited to 500 characters"],
	},
	website: {
		type: String,
		match: [
			/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)/,
			"Please enter a valid URL with HTTP or HTTPS",
		],
	},
	// TODO: On the front end, use a field validator to require international E.123 format (e.g. +22 507 123 4567)
	phone: {
		type: String,
		maxlength: [20, "Phone number cannot be longer than 20 characters"],
	},
	email: {
		type: String,
		match: [
			/^\w+([\\.-]?\w+)*@\w+([\\.-]?\w+)*(\.\w{2,3})+$/,
			"Please enter a valid email",
		],
	},
	address: {
		type: String,
		required: [true, "Please add an address"],
	},
	location: {
		// GeoJSON point - see Mongoose documentation
		// The Mongoose schema allows for enums to identify a list of available values to which entry is restricted
		type: {
			type: String,
			enum: ["Point"],
			required: false,
		},
		coordinates: {
			type: [Number],
			required: false,
			index: "2dsphere",
		},
		// TODO: When adding location fields to front end, include localization options to allow fields to be labelled province, prefecture, postal code, etc.
		formattedAddress: String,
		street: String,
		city: String,
		state: String,
		zipcode: String,
		country: String,
	},
	careers: {
		// Array of strings
		type: [String],
		required: true,
		enum: [
			"Web Development",
			"Mobile Development",
			"UI/UX",
			"Database Devlopment",
			"Information Security",
			"Systems and Networking",
			"Data Science",
			"Business",
			"Marketing",
			"Other",
		],
	},
	averageRating: {
		type: Number,
		min: [1, "Rating must be at least 1"],
		max: [10, "Rating cannot be more than 10"],
	},
	averageCost: Number,
	photo: {
		type: String,
		default: "no-photo.jpg",
	},
	housing: {
		type: Boolean,
		default: false,
	},
	jobAssistance: {
		type: Boolean,
		default: false,
	},
	jobGuarantee: {
		type: Boolean,
		default: false,
	},
	acceptGi: {
		type: Boolean,
		default: false,
	},
	deleted: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
});

BootcampSchema.pre("save", function (next) {
	var now = new Date();
	this.updatedAt = now;
	if (this.createdAt) {
		this.createdAt = now;
	}
	next();
});

module.exports = mongoose.model("Bootcamp", BootcampSchema);
