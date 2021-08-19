/**
 *@fileoverview This is the user authentication route.
 *@description Includes all user authentication controller functions and utilizes Express router.
 *@copyright Emiya Consulting 2021
 *@author Rob Ranf
 *@version 0.1
 *@since 6/22/2021
 */

const express = require("express");
const {
	register,
	login,
	logout,
	getMe,
	forgotPassword,
	resetPassword,
	updateUserProfile,
	updateUserPassword,
} = require("../controllers/auth");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgotpassword", forgotPassword);
router.get("/me", protect, getMe);
router.put("/resetpassword/:resettoken", resetPassword);
router.patch("/updateuserprofile", protect, updateUserProfile);
router.put("/updateuserpassword", protect, updateUserPassword);

module.exports = router;
