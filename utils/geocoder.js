/**
 *@fileoverview This is the geocoder utility used in the Bootcamp model for conversion of address data to map coordinates
 *@description The geocoder utility uses the node-geocoder package to allow the use of the Google Maps Geocode API
 *@todo //TODO The front end should implement the Google Maps Static Maps API to allow for an area map to be presented using the provided coordinates
 *@copyright Emiya Consulting 2021
 *@author Rob Ranf
 *@version 0.1
 *@since 5/27/2021
 */

const NodeGeocoder = require("node-geocoder");

const options = {
	provider: process.env.GEOCODER_PROVIDER,
	httpAdaper: "https",
	apiKey: process.env.GEOCODER_API_KEY,
	formatter: null,
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
