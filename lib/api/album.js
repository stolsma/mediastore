/**
 * The MediaStore Album REST API definition
 *
 * Copyright 2011 TTC/Sander Tolsma
 * See LICENSE file for license
 */

var	util = require('util'),
	express = require('express'),
	albumCRUD = require('../actions/album');

module.exports = function(app) {
	// create a CRUD interface to the database for the Album actions
	var album = albumCRUD();
	
	/**
	 * To get a listing of all of the albums accessible to public or authenticated users
	 *
	 * If :albumId is not given then all albums of the authenticated or requested user's root will be given.
	 * The string `@me` can be replaced by a real userID, in which case the server returns the album view
	 * of the given userID.
	 */
	app.get('/data/:current/album', get);
	app.get('/data/:current/album/:albumId', get);
	function get(req, res, params) {
		//do the actions
		console.log('album.get: ', req.params);
		album.read(
			(req.params.current == "@me") ? null : req.params.current,
			(req.params.albumId) ? req.params.albumId : "0",
			req.auth,
			function(result) {
				console.log('album.get result: ', result);
				if (result) {
//					result.success = true;
					res.send(result);
				} else
					// data not found
					res.send({
							success: false,
							text: 'Not found'
						}, 
						404
					);
			}
		);
	};
	
	/**
	 * You can create an album in a parent album identified by :parentAlbumId, by sending an `admin` scope 
	 * authenticated POST request with an appropriately formed entry.
	 *
	 * If :parentAlbumID is not given then the album will be created in the root album.
	 */
	app.post('/data/:current/album', express.bodyParser(), post);
	app.post('/data/:current/album/:parentAlbumId', express.bodyParser(), post);
	function post(req, res, params) {
		if (!req.auth.inScope('admin')) {
			res.send({
					success: false,
					text: 'UNAUTHORIZED'
				}, 
				401
			);
		} else {
			album.create(
				(req.body) ? req.body : {},
				(req.params.parentAlbumId) ? req.params.parentAlbumId : 0,
				req.auth,
				function(err, result) {
					console.log('album.post result: ', result);
					if (!err && result) {
	//					result.success = true;
						res.send(result, 201);
					} else if (err)
						// Bad request
						res.send({
								success: false,
								text: 'BAD REQUEST'
							}, 
							400
						);
				}
			);
		}
	};
	
	/**
	 * After retrieving an album entry (identified by :albumID), you can modify it by sending an `admin` scope 
	 * authenticated PUT request, containing the new album data.
	 */
	app.put('/data/@me/album', express.bodyParser(), put);
	app.put('/data/@me/album/:albumId', express.bodyParser(), put);
	function put(req, res, params) {
		if (!req.auth.inScope('admin')) {
			res.send({
					success: false,
					text: 'UNAUTHORIZED'
				}, 
				401
			);
		} else {
			album.update(
				(req.params.albumId) ? req.params.albumId : 0,
				(req.body) ? req.body : {},
				req.auth,
				function(err, result) {
					console.log('album.put result: ', result);
					if (!err && result) {
	//					result.success = true;
						res.send(result, 201);
					} else if (err)
						// Bad request
						res.send({
								success: false,
								text: 'BAD REQUEST'
							}, 
							400
						);
				}
			);
		}
	};

	/**
	 * You can delete an album (identified by :albumId) or album authorization by sending an `admin` scope 
	 * authenticated HTTP DELETE request.
	 */
	app.delete('/data/:current/album/:albumId', express.bodyParser(), function(req, res, params) {
		console.log('DELETE album: ' + util.inspect(req.params));
		console.log('DELETE album ' + util.inspect(req.body));
		res.end('DELETE album: \n' + util.inspect(req.params) + '\n\n' + util.inspect(req.body));			
	});
}