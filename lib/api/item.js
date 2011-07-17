/**
 * The MediaStore Item REST API definition
 *
 * Copyright 2011 TTC/Sander Tolsma
 * See LICENSE file for license
 */

var	util = require('util'),
	express = require('express'),
	itemCRUD = require('../actions/item');

module.exports = function(app) {
	// create a CRUD interface to the database for the Item actions
	var item = itemCRUD();
	
	/**
	 * To get a listing of all of the items accessible to public or authenticated users
	 *
	 * If :itemId is not given then all items of the authenticated or requested user's root will be given.
	 * The string `@me` can be replaced by a real userID, in which case the server returns the item view
	 * of the given userID.
	 */
	app.get('/data/:current/item/:itemId', function(req, res, params) {
		//do the actions
		res.send(item.read(
			(req.params.current == "@me") ? null : req.params.current,
			(req.params.itemId) ? req.params.itemId : null 
		));
	});
	
	/**
	 * You can create an item in a parent item identified by :parentAlbumId, by sending an `admin` scope 
	 * authenticated POST request with an appropriately formed entry.
	 *
	 * If :parentAlbumID is not given then the item will be created in the root item.
	 */
	app.post('/data/:current/item/:itemId', express.bodyParser(), function(req, res, params) {
		console.log('POST item: ' + util.inspect(req.params));
		console.log('POST item ' + util.inspect(req.body));
		res.end('POST item: \n' + util.inspect(req.params) + '\n\n' + util.inspect(req.body));			
	});
	
	/**
	 * After retrieving an item entry (identified by :itemID), you can modify it by sending an `admin` scope 
	 * authenticated PUT request, containing the new item data.
	 */
	app.put('/data/:current/item/:itemId', express.bodyParser(), function(req, res, params) {
		console.log('PUT item: ' + util.inspect(req.params));
		console.log('PUT item ' + util.inspect(req.body));
		res.end('PUT item: \n' + util.inspect(req.params) + '\n\n' + util.inspect(req.body));			
	});

	/**
	 * You can delete an item (identified by :itemId) or item authorization by sending an `admin` scope 
	 * authenticated HTTP DELETE request.
	 */
	app.delete('/data/:current/item/:itemId', express.bodyParser(), function(req, res, params) {
		console.log('DELETE item: ' + util.inspect(req.params));
		console.log('DELETE item ' + util.inspect(req.body));
		res.end('DELETE item: \n' + util.inspect(req.params) + '\n\n' + util.inspect(req.body));			
	});
}