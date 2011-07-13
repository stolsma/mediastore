/**
 * The MediaStore Album actions
 *
 * Copyright 2011 TTC/Sander Tolsma
 * See LICENSE file for license
 */

var	util = require('util'),
	mediastore = require('mediastore');

/**
 * Album create, retrieve, update and delete (CRUD) routines.
 * @class Album
 */
var Album = module.exports = function() {
	if (!(this instanceof Album)) {
		return new Album();
	}
	
	//
	this.db = mediastore.db;
	
	// Check if database exists and is of correct version
//	this.db.startup(function(err) {
//		if (err) {
//			console.log('Error creating database: ' + util.inspect(err));
//		}
//	});
}

Album.prototype.get = function(user, albumId) {
	var result = {};
	
	
	return result;
}