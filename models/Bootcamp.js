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
				/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,14}$)/,
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
			default: "",
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
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
	{
		timestamps: true,
	}
);

/**
 * @method
 * @description Create a bootcamp slug using the provided name
 * @returns @property slug
 */
BootcampSchema.pre("save", function (next) {
	this.slug = slugify(this.name, { lower: true });
	next();
});

/**
 * @todo //TODO When deploying to prod, need to update the IP restriction on the Google Maps API
 * @method
 * @description Geocode and create location field
 * @returns @property location
 */
// Geocode and create location field
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

// Defining a virtual here because we want to display all courses that are part of a bootcamp
// however we don't have an actual "courses" document in our Bootcamp schema and don't want one
// (we only link a bootcamp to a course in the Courses model). Think of a virtual as a virtual
// sort of a join or, in Mongo terms, an virtual embed in which we can join two schemas (collections)
// without actually persisting any new data to either. Note this will return a local field named "id"
// that maps to _id.
// We need to state that our model uses virtuals using the toJSON and toObject properties.
// Note we could use embedded documents directly in Mongo if we needed to persist the courses within
// our Bootcamps in a 1 to many relationship.
BootcampSchema.virtual("courses", {
	ref: "Course",
	localField: "_id",
	foreignField: "bootcamp",
	justOne: false,
});

module.exports = mongoose.model("Bootcamp", BootcampSchema);
