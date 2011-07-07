/**
 * mediastore: Apiary MediaStore service to store media objects like movies and pictures
 *
 * Copyright 2011 TTC/Sander Tolsma
 * See LICENSE file for license
 */

var util = require('util'),
    events = require('events');

// make this module 'globally' available
require.paths.unshift(__dirname);

// mediastore emits events!!
var mediastore = module.exports = new events.EventEmitter();

// available modules from this module exports
var connect = require('connect'),
	cors = require('./middleware/cors'),
	upload = require('./upload/upload');

var TEST_PORT = 8000,
	TEST_TMP = 'tmp';

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
	.use(upload())
	.listen(TEST_PORT);

console.log('listening on http://localhost:'+TEST_PORT+'/');
