/**
 * All authorization code for this app
 *
 * Copyright 2011 TTC/Sander Tolsma
 * See LICENSE file for license
 */

// available modules from this module exports
var connect = require('connect'),
	auth = require('connect-auth');

module.exports = function(options) {
	options = options || {};
	
	// return the real REST api
//	return auth([auth.Digest({
//		realm: 'MediaStore',
//		getSharedSecretForUser: getUserData
//	})]);

	return auth([
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
}

function getUserData(username, cb) {
	if (username == 'sander') 
		cb(null, 'test')
	else
		cb(new Error('Error authenticating!'));
}


var OAuthDataProvider= require('./in_memory_oauth_data_provider').OAuthDataProvider;
