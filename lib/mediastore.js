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

// available modules from this module exports
var connect = require('connect'),
	cors = require('./middleware/cors'),
//	auth = require('./authenticate/authorize'),
	db = require('./actions/db'),
	api = require('./api/api'),
	upload = require('./upload/upload');

// define configuration file
mediastore.config = {
	// app config
	address: "localhost",					// ip address or hostname to run mediastore on. (localhost is default)
	port: 8000,								// port number to run mediastore on. (8000 is default)
	owner: "user@example.com",				// OpenID connect Identification of the owner of this MediaStore. (required)
	debug: false,
	
	// db config
	dbtype: "mysql",						// Database backend type. At this moment MySQL and PostgreSQL (in development)
											// are supported. (mysql is default)
	dbhost: "localhost",					// Host of the database. (localhost is default)
	dbport: 3306,							// Port number of the database. (3306 is default)
	dbdatabase: "mediastore",				// Name of the database to use (mediastore is default)
	dbuser: "mediastore",					// Database user name. (required)
	dbpassword: "test"					// Database user password. (required)
	
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
});
	
// and create a Connect HTTP server with middleware
mediastore.server = connect()
	.use(connect.favicon())
	.use(connect.logger())
	.use(cors({
		all: {
			methods: ['GET', 'POST', 'PUT', 'DELETE'],
			headers: [],
			credentials: true
		}
	}))
	.use(connect.cookieParser())
	.use(connect.session({ secret: "DitIsEenSecret" }))
//	.use(auth())
//	.use(upload())
	.use(api())
	.use(connect.static(path.join(__dirname, '../client')))
	.listen(mediastore.config.port);

console.log('listening on http://localhost:'+mediastore.config.port+'/');

