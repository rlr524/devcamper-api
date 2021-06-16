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
