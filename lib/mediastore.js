/**
 * mediastore: Apiary MediaStore service to store media objects like movies and pictures
 *
 * Copyright 2011 TTC/Sander Tolsma
 * See LICENSE file for license
 */

var util = require('util'),
	path = require('path'),
    events = require('events');

// make this module 'globally' available
require.paths.unshift(__dirname);

// mediastore emits events!!
var mediastore = module.exports = new events.EventEmitter();

// get new line
console.log('');

// available modules from this module exports
var express = require('express'),
	db = require('./actions/db'),
	cors = require('./middleware/cors'),
	auth = require('./authenticate/authorize'),
//	upload = require('./upload/upload'),
	api = require('./api/api');

// define configuration file
mediastore.config = {
	// app config
	address: "localhost",					// ip address or hostname to run mediastore on. (localhost is default)
	port: 8000,								// port number to run mediastore on. (8000 is default)
	owner: {
		openid: "user@example.com",			// OpenID connect Identification of the owner of this MediaStore. (required)
		name: "example user",				// Name of the owner (optional)
		description: "Test description"		// Owner descriptpion (optional)
	},
	debug: false,
	
	// db config
	dbtype: "mysql",						// Database backend type. At this moment MySQL and PostgreSQL (in development)
											// are supported. (mysql is default)
	dbhost: "localhost",					// Host of the database. (localhost is default)
	dbport: 3306,							// Port number of the database. (3306 is default)
	dbname: "mediastore",					// Name of the database to use (mediastore is default)
	dbuser: "mediastore",					// Database user name. (required)
	dbpassword: "test"						// Database user password. (required)
	
};

// define requested database and connect to it
mediastore.db = db(mediastore.config);
mediastore.db.connect(function(err) {
	if (err) {
		console.log('Error connecting to database: ' + util.inspect(err));
		process.exit(1);
	};
	// log connected
	console.log('Database connected!!');
	
	// get user and OAuth2 client data from database
	auth.getAuthData(mediastore.db, function(err) {
		if (err) {
			console.log('Error retrieving user or OAuth2 client data from database: ' + util.inspect(err));
			process.exit(1);
		};
		
		// log connected
		console.log('User and OAuth2 client data retrieved!!');
		
		// and create an Express/Connect HTTP server with middleware
		mediastore.server = express
			.createServer()
			.use(express.favicon())
			.use(express.logger())
			.use(cors({
				all: {
					methods: ['GET', 'POST', 'PUT', 'DELETE'],
					headers: [],
					credentials: true
				}
			}))
			.use(express.cookieParser())
			.use(express.session({
				secret: "DitIsEenSecret"
			}))
			.use(auth.middleware())
		//	.use(upload())
			.use(api())
			.use(express.static(path.join(__dirname, '../client')))
			.listen(mediastore.config.port);
		
		console.log('listening on http://localhost:' + mediastore.config.port + '/');
	});
});