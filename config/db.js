const mongoose = require("mongoose");

/**
 * @todo //TODO When deploying to prod, update Mongo DB access to allow access from app IP
 */

//const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rteov.mongodb.net/devcamper?retryWrites=true&w=majority`;

const connectDB = async () => {
	const conn = await mongoose.connect(uri, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	});
	console.log(
		`MongoDB connected: ${conn.connection.host}`.cyan.underline.bold
	);
};

module.exports = connectDB;
