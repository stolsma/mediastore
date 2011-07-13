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
		
		// return login interface
		app.get('/login', function(req, res, params) { 
			req.authenticate(['digest'], function(error, authenticated) { 
				if (authenticated) {
					res.write("<html>")
					res.write("<h1>Hello user:" + JSON.stringify(req.getAuthDetails()) + ".</h1>")
					res.write('<a href="/upload">Press here for upload</a>')
					res.end("</html>")
				} else {
					res.end("<html><h1>Authentication failed :( </h1></html>")
				}
			});
		});
		
		app.get ('/logout', function(req, res, params) {
			req.logout();
			res.writeHead(303, { 'Location': "/login" });
			res.end('');
		})

		// return upload interface
		app.get('/upload', function(req, res, params) { 
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
			function(req, res, next) {
				if (req.isAuthenticated()) {
					next();
				} else {
					res.end("<html><h1>Not logged in :( </h1></html>")
				}
			},
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