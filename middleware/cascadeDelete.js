const Course = require("../models/Course");

const cascadeDelete = async () => {
	console.log(`Courses being flagged as deleted from bootcamp ${this._id}`);
	await Course.updateMany(
		{ bootcamp: this._id },
		{
			deleted: true,
			title: `CASCADE DELETED WHEN BOOTCAMP WITH ID OF ${this._id} WAS DELETED`,
		}
	);
};

module.exports = cascadeDelete;
