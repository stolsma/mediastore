/**
 * The MediaStore Album actions
 *
 * Copyright 2011 TTC/Sander Tolsma
 * See LICENSE file for license
 */

var	util = require('util'),
	mediastore = require('mediastore');

/**
 * Album create, read, update and delete (CRUD) routines.
 * @class Album
 */
var Album = module.exports = function() {
	if (!(this instanceof Album)) {
		return new Album();
	}
	
	// get and store database reference
	this.db = mediastore.db;
}

/**
 *
 */
Album.prototype.create = function() {
	this.db.createAlbum(album, function(err, album) {
		
	});
}

/**
 *
 */
Album.prototype.read = function(user, albumId) {
	var result = {users: user, album: albumId};
	
	
	return result;
}

/**
 *
 */
Album.prototype.update = function(user, albumId) {
	var result = {users: user, album: albumId};
	
	
	return result;
}

/**
 *
 */
Album.prototype.delete = function(user, albumId) {
	var result = {users: user, album: albumId};
	
	
	return result;
}