/**
 *@fileoverview This is the user authentication route.
 *@description Includes all user authentication controller functions and utilizes Express router.
 *@copyright Emiya Consulting 2021
 *@author Rob Ranf
 *@version 0.1
 *@since 6/22/2021
 */

const express = require("express");
const { register } = require("../controllers/auth");

const router = express.Router();

router.post("/register", register);

module.exports = router;
