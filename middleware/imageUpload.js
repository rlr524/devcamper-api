/**
 *@fileoverview AWS S3 and multer configuration
 *@description These are middleware constants and functions that configure AWS S3 bucket and Multer package for upload of Bootcamp images to S3
 *@copyright Emiya Consulting 2021
 *@author Rob Ranf
 *@version 0.1
 *@since 6/17/2021
 */

require("dotenv").config({ path: "../config/.env" });
const multer = require("multer");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
	accessKeyId: process.env.AWS_ID,
	secretAccessKey: process.env.AWS_SECRET,
	region: process.env.AWS_REGION,
});

const storage = multer.memoryStorage({
	destination: function (req, file, cb) {
		cb(null, "");
	},
});

const upload = multer({ storage }).single("image");

module.exports = {
	s3,
	upload,
};
