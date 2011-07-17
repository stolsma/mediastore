/**
 * All authorization code for this service
 *
 * Copyright 2011 TTC/Sander Tolsma
 * See LICENSE file for license
 */

var auth = require('connect-auth'),
	authorize = module.exports = {} 

/**
 *
 * @param db {Db} Database functions
 * @param cb {Function} Callback function to call when ready loading all users
 */
authorize.getAuthData = function(db, cb) {
	var self = this;
	
	db.getUsers(function(err, users) {
		// save users
		authorize.users = {
			id: createIndex(users, 'id'),
			data: users
		};
		// get OAuth2 clients
		db.getClients(function(err, clients) {
			// save clients
			authorize.clients = {
				accesskey: createIndex(clients, 'accesskey'),
				id: createIndex(clients, 'id'),
				data: clients
			}
			
			// print default client access key
			console.log('Default testclient accesskey = ' + clients[0].accesskey);
			// call callback without error
			cb(null);
		})
	});
}

function createIndex(data, key){
	var i, result = {};
	
	for (i=0; i != data.length; i++) {
		result[data[i][key]] = data[i];
	}
	
	return result;
}

/**
 * Middleware function for Express/Connect
 */
authorize.middleware = function() {
	// return a temporary positive authentication for owner
	return function(req, res, next) {
		var authorization = req.headers.authorization;
		// if authorization header then parse it and get authorization
		if (authorization) {
			var	parts = authorization.split(' ');
			// OAuth2 and key ?
			if (parts[0] == 'OAUTH2' && parts.length == 2) {
				if (authorize.clients.accesskey[parts[1]])
					req.auth = new Auth(authorize.clients.accesskey[parts[1]]);
				else
					console.log('Unauthorized access request! accesskey=' + parts[1]);
			}
		}
		// next middleware in queue
		next();
	};
}

/**
 * Authentication and Authorization class
 * @param client {Object}
 * @constructor
 */
function Auth(client) {
	this.client = client;
}

/**
 * Is the given scope authorized for this Auth object 
 * @param scope {String} The scope to check for
 * @return {Boolean} True if scope in authorization scope, false if not
 */
Auth.prototype.inScope = function(scope) {
	return this.client.scope.indexOf(scope);
}

Auth.prototype.user = function() {
	return this.client.user;
}


/*
function getUserData(username, cb) {
	if (username == 'sander') 
		cb(null, 'test')
	else
		cb(new Error('Error authenticating!'));
}

// return the real REST api
//	return auth([auth.Digest({
//		realm: 'MediaStore',
//		getSharedSecretForUser: getUserData
//	})]);

/*	return auth([
		auth.Oauth({
			oauth_provider: new OAuthDataProvider({
				applications: [{
					title:'Test',
					description:'Test App',
					consumer_key:"JiYmll7CX3AXDgasnnIDeg",
					secret:"mWPBRK5kG2Tkthuf5zRV1jYWOEwnjI6xs3QVRqOOg"
				}],
				users: [{
					username:'foo',
					password:'bar'
				}]
			}),
			authenticate_provider: authenticateProvider,
			authorize_provider: authorizeProvider,
			authorization_finished_provider: authorizationFinishedProvider
		})
	])
*/


//var OAuthDataProvider= require('./in_memory_oauth_data_provider').OAuthDataProvider;
