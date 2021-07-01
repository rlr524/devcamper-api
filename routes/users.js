/**
 *@fileoverview These are the users routes.
 *@description Includes all *** user controller functions and utilizes Express router.
 *@copyright Emiya Consulting 2021
 *@author Rob Ranf
 *@version 0.1
 *@since 7/1/2021
 */

const express = require("express");

const router = express.Router();

const { getUsers } = require("../controllers/users");

const User = require("../models/User");
const advancedResults = require("../middleware/advancedResults");

router.route("/").get(advancedResults(User, getUsers));

module.exports = router;
