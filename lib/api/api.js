/**
 * The MediaStore REST API definition
 *
 * Copyright 2011 TTC/Sander Tolsma
 * See LICENSE file for license
 */

var	util = require('util'),
	express = require('express'),
	albumAPI = require('./album'),
	itemAPI = require('./item');
	
module.exports = function() {
	// return the real REST api
	return express.router(function(app) {
		albumAPI(app);
		itemAPI(app);
	});
}