/**
 *@fileoverview This is the Mongoose model for our Bootcamp collection
 *@description The BootcampSchema defines all fields related to the bootcamps collection in the devcamper database on Mongo Atlas
 *@copyright Emiya Consulting 2021
 *@author Rob Ranf
 *@version 0.1
 *@since 5/26/2021
 */

const mongoose = require("mongoose");
const slugify = require("slugify");
const geocoder = require("../utils/geocoder");

const BootcampSchema = new mongoose.Schema(
	{
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
		/**
		 * @todo //TODO On the front end, use a field validator to require international E.123 format (e.g. +22 507 123 4567)
		 */
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
			/**
			 * @todo //TODO When adding location fields to front end, include localization options to allow fields to be labelled province, prefecture, postal code, etc.
			 */
			formattedAddress: String,
			number: String,
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
				"Database Development",
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
	},
	{
		timestamps: true,
	}
);

/** @method */
// Create a bootcamp slug using the provided name
BootcampSchema.pre("save", function (next) {
	this.slug = slugify(this.name, { lower: true });
	next();
});

// Geocode and create location field
/**
 * @todo //TODO When deploying to prod, need to update the IP restriction on the Google Maps API
 */
BootcampSchema.pre("save", async function (next) {
	const loc = await geocoder.geocode(this.address);
	this.location = {
		type: "Point",
		coordinates: [loc[0].longitude, loc[0].latitude],
		formattedAddress: loc[0].formattedAddress,
		number: loc[0].streetNumber,
		street: loc[0].streetName,
		city: loc[0].city,
		state: loc[0].administrativeLevels.level1short,
		zipcode: loc[0].zipcode,
		country: loc[0].countryCode,
	};
	// Do not save address as inputted in DB
	this.address = undefined;
	next();
});

module.exports = mongoose.model("Bootcamp", BootcampSchema);
