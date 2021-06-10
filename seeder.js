/**
 *@fileoverview This is a custom seeder for populating json data into the Mongo db
 *@description The seeder functions allow avoid needing to use Postman to popular starting JSON data into the DB for dev purposes.
 *@description Use the commands npm run seed:{model name in lowercase} or delete:{model name in lowercase} to seed or delete data
 *@copyright Emiya Consulting 2021
 *@author Rob Ranf
 *@version 0.1
 *@since 5/28/2021
 */

require("dotenv").config({ path: "./config/.env" });
const fs = require("fs");
const mongoose = require("mongoose");
require("colors");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rteov.mongodb.net/devcamper?retryWrites=true&w=majority`;

// Load models
const Bootcamp = require("./models/Bootcamp");
const Course = require("./models/Course");

// Connect to DB
mongoose.connect(uri, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
	useUnifiedTopology: true,
});

// Read JSON files
const bootcamps = JSON.parse(
	fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8")
);

const courses = JSON.parse(
	fs.readFileSync(`${__dirname}/_data/courses.json`, "utf-8")
);

// Import bootcamps into DB
const importData = async () => {
	try {
		await Bootcamp.create(bootcamps);
		await Course.create(courses);
		console.log("Data imported...".green.inverse);
		process.exit();
	} catch (err) {
		console.log(err);
	}
};

// Delete bootcamps data
const deleteData = async () => {
	try {
		await Bootcamp.deleteMany();
		await Course.deleteMany();
		console.log("All data deleted...".red.inverse);
		process.exit();
	} catch (err) {
		console.log(err);
	}
};

if (process.argv[2] === "-i") {
	importData();
} else if (process.argv[2] === "-d") {
	deleteData();
}
