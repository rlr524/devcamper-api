/**
 *@fileoverview This is the Mongoose model for the users collection.
 *@description The UserSchema defines all fields related to the users collection in the devcamper database on Mongo Atlas.
 *@copyright Emiya Consulting 2021
 *@author Rob Ranf
 *@version 0.1
 *@since 6/22/2021
 */

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Please enter a name"],
		},
		email: {
			type: String,
			required: [true, "Please enter an email"],
			unique: true,
			match: [
				/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,14}$)/,
				"Please enter a valid email",
			],
		},
		role: {
			type: String,
			enum: ["user", "publisher"],
			default: "user",
		},
		// Password needs to have a lowercase, an uppercase, and a digit or special char and at least 8 chars
		// Use the "select" prop of false to ensure the encrypted pw will never be returned by the service
		password: {
			type: String,
			required: ["true", "Please add a password"],
			match: [
				/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])|(?=.*[^A-Za-z0-9])(?=.{8,})/,
				"Please enter a password that meets the password requirements",
			],
			select: false,
		},
		profilePic: {
			type: String,
			default: "",
		},
		bio: String,
		twitter: String,
		github: String,
		facebook: String,
		instagram: String,
		resetPasswordToken: String,
		resetPasswordExpire: String,
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("User", UserSchema);
