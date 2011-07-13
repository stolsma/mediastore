/**
 * Copyright(c) 2010 Ciaran Jessup <ciaranj@gmail.com>
 * Based *HEAVILY* on the work of  Christian Amor Kvalheim <christkv@gmail.com>
 * 
 * MIT Licensed
 */
var authutils = require('connect-auth/lib/auth.strategies/_authutils');

/**
 * All methods must be implemented for the system to work
 * This is an example, not even close to production ready in-memory example
 * of what one would need to provide in order to support an OAuth backend
 */
var OAuthDataProvider = exports.OAuthDataProvider = function(options) {
	if (!options) options = {};
	this.oauth_applications = options['applications'] || [];
	this.oauth_users_request_tokens = [];
	this.oauth_previous_users_request_tokens = [];
	this.users = options['users'] || [];
} 

function generateRandomString() {
	return authutils.getNonce(32);
}

/**
 * Locating methods used for looking up authentication information
 */
OAuthDataProvider.prototype.previousRequestToken = function(token, callback) {
	for (var key in this.oauth_previous_users_request_tokens) {
		if (this.oauth_previous_users_request_tokens[key] && this.oauth_previous_users_request_tokens[key].token == token) {
			callback(new Error("Previously used token"));
			return;
		}
	}  
	callback(null, token);
}

OAuthDataProvider.prototype.tokenByConsumer = function(consumerKey, callback) {
	for (var key in this.oauth_users_request_tokens) {
		if (this.oauth_users_request_tokens[key] && this.oauth_users_request_tokens[key].consumer_key == consumerKey) {
			callback(null, this.oauth_users_request_tokens[key]);
			return;
		}
	}
	callback(new Error("No such user with consumer key: " + consumerKey));
}

OAuthDataProvider.prototype.applicationByConsumerKey = function(consumerKey, callback) {
	for (var key in this.oauth_applications) {
		if (this.oauth_applications[key] && this.oauth_applications[key].consumer_key == consumerKey) {
			callback(null, this.oauth_applications[key]);
			return;
		}
	}
	callback(new Error("No such user with consumer key: "+ consumerKey));
}

OAuthDataProvider.prototype.fetchAuthorizationInformation = function(username, token, callback) {
	var request_token;
	for (var key in this.oauth_users_request_tokens) {
		if (this.oauth_users_request_tokens[key] && this.oauth_users_request_tokens[key].token == token) {
			request_token = this.oauth_users_request_tokens[key];
			break;
		}
	}

	var application;
	for (var key in this.oauth_applications) {
		if (this.oauth_applications && this.oauth_applications[key].consumer_key == request_token.consumer_key) {
			application = this.oauth_applications[key];
			break;
		}
	}
	
	callback(null, application, request_token);  
}

/**
 * Validation methods used to check if the tokens and user are valid
 */
OAuthDataProvider.prototype.validToken = function(accessToken, callback) {
	for (var key in this.oauth_users_request_tokens) {
		if (this.oauth_users_request_tokens[key] && this.oauth_users_request_tokens[key].access_token == accessToken) {
			callback(null, this.oauth_users_request_tokens[key]);
			return;
		}
	}
	callback(new Error("No such token"));
}

/**
 * Fetch a token by token and verifier (can be used to verify if a token exists)
 */
OAuthDataProvider.prototype.tokenByTokenAndVerifier = function(token, verifier, callback) {
	for (var key in this.oauth_users_request_tokens) {
		if (this.oauth_users_request_tokens[key] && this.oauth_users_request_tokens[key].token == token && this.oauth_users_request_tokens[key].verifier == verifier) {
			callback(null, this.oauth_users_request_tokens[key]);
			return;
		}
	}
	callback(new Error("No token containing token: " + token + " and verifier: " + verifier));
}

OAuthDataProvider.prototype.validateNotReplay = function(accessToken, timestamp, nonce, callback) {
	callback(null, true);
}

/**
 * Fetch user id based on token (used to identify user in oauth calls later)
 */
OAuthDataProvider.prototype.userIdByToken = function(token, callback) {
	for (var key in this.oauth_users_request_tokens) {
		if (this.oauth_users_request_tokens[key] && this.oauth_users_request_tokens[key].access_token == token) {
			callback(null, {
				id: this.oauth_users_request_tokens[key].username
			});
			return;
		}
	}
}

OAuthDataProvider.prototype.authenticateUser = function(username, password, oauthToken, callback) {
	for (var key in this.users) {
		if (this.users[key] && this.users[key].username == username && this.users[key].password == password) {
	  		// Update the oauthToken document to signal that key is authenticated
	  		for (var otherKey in this.oauth_users_request_tokens) {
				if (this.oauth_users_request_tokens[otherKey] && this.oauth_users_request_tokens[otherKey].token == oauthToken) {
					this.oauth_users_request_tokens[otherKey].authenticated = true;
					callback(null, this.oauth_users_request_tokens[otherKey]);
					return;
				}
			}
		}
	}  
	callback(new Error("Authentication of user/password failed"), null);
}

/**
 * Associate an application token request with a system user after the user has authenticated, allows for authorization later
 */
OAuthDataProvider.prototype.associateTokenToUser = function(username, token, callback) {
	for (var key in this.users) {
		if (this.users[key] && this.users[key].username == username) {
			for (var otherKey in this.oauth_users_request_tokens) {
				if (this.oauth_users_request_tokens[otherKey] && this.oauth_users_request_tokens[otherKey].token == token) {
					this.oauth_users_request_tokens[otherKey].username = username;
					callback(null, this.oauth_users_request_tokens[otherKey])
					return;
				}
			}
		}
	}
}

/**
 * Generation methods used to create new tokens for the oauth interface
 */  
OAuthDataProvider.prototype.generateRequestToken = function(oauthConsumerKey, oauthCallback, callback) {
	var requestToken= {};
	requestToken['consumer_key'] = oauthConsumerKey;
	requestToken['token'] = generateRandomString();
	requestToken['token_secret'] = generateRandomString();
	requestToken['callback'] = oauthCallback;
	requestToken['verifier'] = generateRandomString();
	this.oauth_users_request_tokens[this.oauth_users_request_tokens.length++] = requestToken;
	callback(null, requestToken);
}

OAuthDataProvider.prototype.generateAccessToken = function(oauthToken, callback) {
	for (var key in this.oauth_users_request_tokens) {
		if (this.oauth_users_request_tokens[key] && this.oauth_users_request_tokens[key].token == oauthToken) {
			this.oauth_users_request_tokens[key]['access_token'] = generateRandomString();
			this.oauth_previous_users_request_tokens[this.oauth_previous_users_request_tokens.length] = this.oauth_users_request_tokens[key];
			callback(null, this.oauth_users_request_tokens[key]);
			return;
		}
	}  
}

/**
 * Ensures that we avoid multiple entries for tokens
 */
OAuthDataProvider.prototype.cleanRequestTokens = function(consumerKey, callback) {
	for (var key in this.oauth_users_request_tokens) {
		if (this.oauth_users_request_tokens[key] && this.oauth_users_request_tokens[key].consumer_key == consumerKey) {
			delete this.oauth_users_request_tokens[key];
		}
	}
	callback(null, null);
}