/**
 *@fileoverview This is the Mongoose model for the users collection.
 *@description The UserSchema defines all fields related to the users collection in the devcamper database on Mongo Atlas.
 *@copyright Emiya Consulting 2021
 *@author Rob Ranf
 *@version 0.1
 *@since 6/22/2021
 */

const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
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
		// The admin role needs to be added directly in the DB, this would normally only be someone with DBA rights
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
		active: {
			type: Boolean,
			default: true,
		},
		/**
		 * @todo // TODO Add functionality to use pfp from Gravatar
		 */
		profilePic: {
			type: String,
			default: "Your profile picture",
		},
		bio: {
			type: String,
			default: "Your bio",
		},
		twitterURL: {
			type: String,
			default: "https://www.twitter.com/twitter",
		},
		githubURL: {
			type: String,
			default: "https://wwww.github.com/github",
		},
		facebookURL: {
			type: String,
			default: "https://www.facebook.com/facebook",
		},
		instagramURL: {
			type: String,
			default: "https://www.instagram.com/instagram",
		},
		resetPasswordToken: String,
		resetPasswordExpire: String,
	},
	{
		timestamps: true,
	}
);

/**
 * @method
 * @description Encrypt user's password using bcrypt
 * @property password @returns hashed and salted password
 */
UserSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		next();
	}
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

/**
 * @method
 * @description Sign and return a json web token that expires in 30 days
 * @returns json web token with user id as the payload
 */
UserSchema.methods.getSignedJwtToken = function () {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE,
	});
};

/**
 * @method
 * @description Match user entered password to hashed password in the db
 * @returns a boolean of true or false upon comparison of the entered password to the db hashed pw
 */
UserSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * @method
 * @description Generate and hash the password token
 * @returns the original token as a hex string
 */
UserSchema.methods.getResetPasswordToken = function () {
	// Generate the token
	const resetToken = crypto.randomBytes(20).toString("hex");

	// Hash the token and set to resetPasswordToken field
	this.resetPasswordToken = crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex");

	// Set the expiry of 10 minutes and set to the resetPasswordExpire field
	this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

	return resetToken;
};

module.exports = mongoose.model("User", UserSchema);
