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
 * read album data
 */
Album.prototype.read = function(user, albumId, auth, cb) {
	
	function readyFn(err, result) {
		cb(result);
	};
	
	if (auth && auth.inScope('admin')) {
		// can see all albums and if user set show view of that user
		return (user) ? this.db.getAlbum(user, albumId, false, readyFn) : this.db.getAlbum(auth.user(), albumId, true, readyFn);
	}
	
	if (auth && auth.inScope('private')) {
		// can only see public and authorized albums
		return this.db.getAlbum(auth.user(), albumId, false, readyFn);
	}

	// others can only see public albums
	return this.db.getAlbum(null, albumId, false, readyFn);
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