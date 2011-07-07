/**
 * Resource API Interface for '/upload' 
 *
 * Copyright 2011 TTC/Sander Tolsma
 * See LICENSE file for license
 */

var	util = require('util'),
	connect = require('connect'),
	mediastore = require('mediastore');
	form = require('../middleware/form'),

module.exports = function(options) {
	options = options || { uploadDir: './tmp' };
	
	// return the real REST api
	return connect.router(function(app) {
		// return upload interface
		app.get('/', function(req, res, params) { 
			res.writeHead(200, {'content-type': 'text/html'});
			res.end(
				'<form action="/upload" enctype="multipart/form-data" method="post">'+
				'<input type="text" name="title"><br>'+
				'<input type="file" name="upload" multiple="multiple"><br>'+
				'<input type="submit" value="Upload">'+
				'</form>'
			);
		});
		
		// react on form upload
		app.post('/upload',
			form(
				{ uploadDir: options.uploadDir },
				function(err, req, res, fields, files) {
					res.writeHead(200, {'content-type': 'text/plain'});
					res.write('received fields:\n\n ' + util.inspect(fields));
					res.write('\n\n');
					res.end('received files:\n\n ' + util.inspect(files));
				}
			)
		);
	});
}