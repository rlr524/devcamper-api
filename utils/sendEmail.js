/**
 *@fileoverview Function for sending forgotten password email
 *@description Uses the Nodemailer package and Mailtrap service to send test emails for forgotten user passwords
 *@copyright Emiya Consulting 2021
 *@author Rob Ranf
 *@version 0.1
 *@since 8/12/2021
 */

const nodemailer = require("nodemailer");

/**
 * @function
 * @description Uses the Nodemailer package and Mailtrap service to send test emails for password resets
 * @param {*} options
 */
const sendEmail = async (options) => {
	// Create a transport object for Nodemailer
	const transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: process.env.SMTP_PORT,
		secure: false, // true for 465, false for other ports
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASSWORD,
		},
	});

	// Form a message to be sent
	const message = {
		from: `${process.env.SMTP_FROM_EMAIL} ${process.env.SMTP_FROM_NAME}`,
		to: options.email,
		subject: options.subject,
		text: options.text,
	};

	const info = await transporter.sendMail(message);

	console.log("Message sent: %s", info.messageId);
};

module.exports = sendEmail;
