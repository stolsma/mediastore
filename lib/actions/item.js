/**
 * The MediaStore Item actions
 *
 * Copyright 2011 TTC/Sander Tolsma
 * See LICENSE file for license
 */

var	util = require('util'),
	mediastore = require('mediastore');

/**
 * Item create, read, update and delete (CRUD) routines.
 * @class Item
 */
var Item = module.exports = function() {
	if (!(this instanceof Item)) {
		return new Item();
	}
	
	// get and store database reference
	this.db = mediastore.db;
}

/**
 *
 */
Item.prototype.create = function() {
	this.db.createItem(item, function(err, item) {
		
	});
}

/**
 *
 */
Item.prototype.read = function(user, itemId) {
	var result = {users: user, item: itemId};
	
	
	return result;
}

/**
 *
 */
Item.prototype.update = function(user, itemId) {
	var result = {users: user, item: itemId};
	
	
	return result;
}

/**
 *
 */
Item.prototype.delete = function(user, itemId) {
	var result = {users: user, item: itemId};
	
	
	return result;
}