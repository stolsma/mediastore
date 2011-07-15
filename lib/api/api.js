/**
 * The MediaStore REST API definition
 *
 * Copyright 2011 TTC/Sander Tolsma
 * See LICENSE file for license
 */

var	util = require('util'),
	express = require('express'),
	mediastore = require('mediastore'),
//	form = require('../middleware/form'),
	albumAPI = require('../actions/album');

module.exports = function(options) {
	// create a CRUD interface to the database for the Album actions
	var album = albumAPI();
	
	// return the real REST api
	return express.router(function(app) {
		
	/**
	 * Album API
	 */
	
		/**
		 * To get a listing of all of the albums accessible to public or authenticated users
		 *
		 * If :albumId is not given then all albums of the authenticated or requested user's root will be given.
		 * The string `@me` can be replaced by a real userID, in which case the server returns the album view
		 * of the given userID.
		 */
		app.get('/data/:current/album/:albumId', function(req, res, params) {
			//do the actions
			res.send(album.get(
				(req.params.current == "@me") ? null : req.params.current,
				(req.params.albumId) ? req.params.albumId : null 
			));
		});
		
		/**
		 * You can create an album in a parent album identified by :parentAlbumId, by sending an `admin` scope 
		 * authenticated POST request with an appropriately formed entry.
		 *
		 * If :parentAlbumID is not given then the album will be created in the root album.
		 */
		app.post('/data/:current/album/:parentAlbumId', express.bodyParser(), function(req, res, params) {
			console.log('POST album: ' + util.inspect(req.params));
			console.log('POST album ' + util.inspect(req.body));
			res.end('POST album: \n' + util.inspect(req.params) + '\n\n' + util.inspect(req.body));			
		});
		
		/**
		 * After retrieving an album entry (identified by :albumID), you can modify it by sending an `admin` scope 
		 * authenticated PUT request, containing the new album data.
		 */
		app.put('/data/:current/album/:albumId', express.bodyParser(), function(req, res, params) {
			console.log('PUT album: ' + util.inspect(req.params));
			console.log('PUT album ' + util.inspect(req.body));
			res.end('PUT album: \n' + util.inspect(req.params) + '\n\n' + util.inspect(req.body));			
		});

		/**
		 * You can delete an album (identified by :albumId) or album authorization by sending an `admin` scope 
		 * authenticated HTTP DELETE request.
		 */
		app.delete('/data/:current/album/:albumId', express.bodyParser(), function(req, res, params) {
			console.log('DELETE album: ' + util.inspect(req.params));
			console.log('DELETE album ' + util.inspect(req.body));
			res.end('DELETE album: \n' + util.inspect(req.params) + '\n\n' + util.inspect(req.body));			
		});

	/**
	 * Media Items API
	 */


		
	});
}