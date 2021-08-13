/**
 *@fileoverview Advanced results function for use with any resource
 *@description This is a middleware function that allows filtering, sorting, selecting and pagination on any resource. It is
 * imported on the routes vs in the controllers so can be used with the response object in any functions accessing request/response cycle.
 *@copyright Emiya Consulting 2021
 *@author Rob Ranf
 *@version 0.1
 *@since 6/17/2021
 */

const advancedResults = (model, populate) => async (req, res, next) => {
	let query;
	// Copy req.query
	const reqQuery = { ...req.query };
	// Fields to exclude from query param match
	const removeFields = ["select", "sort", "limit", "page"];
	// Loop over removeFields and delete them from reqQuery
	removeFields.forEach((param) => delete reqQuery[param]);
	// Create query string
	let queryStr = JSON.stringify(reqQuery);
	// Create MongoDB operators (gt, lte, etc)
	queryStr = queryStr.replace(
		/\b(gt|gte|lt|lte|in)\b/g,
		(match) => `$${match}`
	);
	// Finding resource using model and turning it back into an object
	// As well as populating courses (all fields given no options) into the bootcamp object (see virtuals in Bootcamp model)
	query = model.find(JSON.parse(queryStr));
	// Select fields
	if (req.query.select) {
		const fields = req.query.select.split(",").join(" ");
		query = query.select(fields);
	}
	// Sort results
	if (req.query.sort) {
		const sortBy = req.query.sort.split(",").join(" ");
		query = query.sort(sortBy);
	} else {
		// Default sort to createdAt field in descending order
		query = query.sort("-createdAt");
	}

	// Pagination
	const pageVal = parseInt(req.query.page, 10) || 1;
	const limitVal = parseInt(req.query.limit, 10) || 25;
	const startIndex = (pageVal - 1) * limitVal;
	const endIndex = pageVal * limitVal;
	const totalDocuments = await model.countDocuments(JSON.parse(queryStr));

	query = query.skip(startIndex).limit(limitVal);

	if (populate) {
		query = query.populate(populate);
	}

	// Executing query
	const results = await query;

	// Pagination result
	const pagination = {};
	if (endIndex < totalDocuments) {
		pagination.next = {
			page: pageVal + 1,
			limitVal,
		};
	}
	if (startIndex > 0) {
		pagination.prev = {
			page: pageVal - 1,
			limitVal,
		};
	}

	res.advancedResults = {
		success: true,
		count: results.length,
		pagination,
		data: results,
	};

	next();
};

module.exports = advancedResults;
