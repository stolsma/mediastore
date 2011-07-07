/**
 * Form processing Connect middleware 
 *
 * Original code by TJ Holowaychuk <tj@vision-media.ca>
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca> MIT License
 * Copyright 2011 TTC/Sander Tolsma
 * See LICENSE file for license
 */

var formidable = require('formidable');

/**
 * Setup form with the given formidable `options`.
 *
 * Options:
 *   - `encoding`        Encoding used for incoming forms. Defaults to utf8
 *   - `uploadDir`       Directory to save uploads. Defaults to "/tmp"
 *   - `keepExtensions`  Include original extensions. Defaults to `false`
 *
 * @param {Object} options Options for formidable
 * @param {Function} cb Callback function to call when form is processed. cb call params are: err, req, res, fields, files
 * @return {Function}
 * @api public
 */
module.exports = function(options, cb){
	options = options || {};
	return function(req, res, next){
		if (formRequest(req)) {
			var fields = [], 
				files = [],
				form = req.form = new formidable.IncomingForm;
			// put formidable options
			merge(form, options);
			form.on('field', function(field, value) {
				fields.push([field, value]);
			});
			form.on('file', function(field, file) {
				files.push([field, file]);
			});
			form.on('error', function(err) {
				cb(err)
			});
			form.on('end', function() {
				cb(null, req, res, fields, files);
			});
			// execute parsing of the req form body
			form.parse(req);
		} else 
			// not a form so go to next middleware
			next();
  	};
};

/**
 * Check if `req` is a valid form request.
 * @param {IncomingMessage} req
 * @return {Boolean}
 * @api private
 */
function formRequest(req) {
	var contentType = req.headers['content-type'];
	if (!contentType) return;
	return req.body === undefined
		&& (req.method === 'POST' || req.method === 'PUT')
		&& (~contentType.indexOf('multipart/form-data')	|| ~contentType.indexOf('urlencoded'));
}

/**
 * Merge object `b` with object `a`.
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */
function merge(a, b) {
	var keys = Object.keys(b);
	for (var i = 0, len = keys.length; i < len; ++i) {
		a[keys[i]] = b[keys[i]];
	}
	return a;
}