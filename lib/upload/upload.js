/**
 * Resource API Interface for '/upload' 
 *
 * Copyright 2011 TTC/Sander Tolsma
 * See LICENSE file for license
 */

var	util = require('util'),
	connect = require('connect'),
	form = require('connect-form'),
	mediastore = require('mediastore');

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
			form({
				uploadDir: options.uploadDir
			}),
			function(req, res, next) {
				// Form was submitted
				if (req.form) {
					var fields = [], 
						files = [];
					req.form.on('field', function(field, value) {
						console.log(field, value);
						fields.push([field, value]);
					})
					req.form.on('file', function(field, file) {
						console.log('Field: ', field, '\n File: ', file, '\n');
						files.push([field, file]);
					})
					req.form.on('error', function(err) {
						console.log('-> Error: ' + util.inspect(err));
					});
					req.form.on('end', function() {
						console.log('-> form processed');
						res.writeHead(200, {'content-type': 'text/plain'});
						res.write('received fields:\n\n ' + util.inspect(fields));
						res.write('\n\n');
						res.end('received files:\n\n ' + util.inspect(files));
					});
					req.form.parse(req);
				} else {
					// Regular request, pass to next middleware
					next();
				}
			}
		);
	});
}