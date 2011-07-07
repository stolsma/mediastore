/**
 * Cors: Cross Origin Resource Sharing Connect middleware module
 * 
 * Original code from Antono Vasiljev 
 * Copyright(c) 2010 Antono Vasiljev; MIT Licensed
 * Copyright 2011 TTC/Sander Tolsma
 * See LICENSE file for license
 */

var url = require('url'),
	maxAge = 30*60; //30 minutes

/**
 * Setups access for CORS requests.
 * http://www.w3.org/TR/cors/
 *
 * The resource sharing policy described by w3c specification is bound to a particular resource.
 * Each resource is bound to the following:
 *
 * - A list of origins consisting of zero or more origins that are allowed access to the resource.
 * - A list of methods consisting of zero or more methods that are supported by the resource.
 * - A list of headers consisting of zero or more header field names that are supported by the resource.
 * - A supports credentials flag that indicates whether the resource supports user credentials
 *   in the request. It is true when the resource does and false otherwise.
 *
 * corsOptions = {
 *     '/resource': {
 *         origins: ['http://w3.org', ...],
 *         methods: ['GET', 'POST', 'PUT', ...],
 *         headers: ['X-Header-For', ...],
 *         credentails: true,
 *     },
 *     '/resource2': { ... }
 * }
 * 
 * If all paths need to be accepted put:
 *
 * corsOptions = {
 * 		all: {
 *			methods: ['GET', 'POST', 'PUT', 'DELETE' ...],
 *			headers: [...],
 *			credentials: true/false
 *		}
 * }
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */
module.exports = function corsSetup(options) {
	options = options || {}; 
	return function corsHandle(req, res, next) {
		// none cross origin request
		if (!req.headers.origin) return next();
		
		var origin = req.headers.origin,
			resourceConfig = options.all ? options.all : options[url.parse(req.url).pathname],
			writeHead = res.writeHead,
			requestHeaders;
			
		// if request conforms to specific resource or all request are allowed
		if (resourceConfig) {
			// wrap writeHead
			res.writeHead = function (status, headers) {
				headers = headers || {};
				if (!(resourceConfig.origins) || (resourceConfig.origins.indexOf(origin) !== -1)) {
					headers['Access-Control-Allow-Origin'] = resourceConfig.origins ? origin : '*';
					if (resourceConfig.credentails) {
						headers['Access-Control-Allow-Credentials'] = true;
					}
					
					// preflight
					if (req.method === 'OPTIONS') {
						headers['Access-Control-Max-Age'] = resourceConfig.maxAge ? resourceConfig.maxAge : maxAge;
				
						if (req.headers['access-control-request-method'] && resourceConfig.methods && resourceConfig.methods.indexOf(req.headers['access-control-request-method'].toUpperCase()) !== -1) {
							headers['Access-Control-Allow-Methods'] = req.headers['access-control-request-method'];
						}
				
						if (req.headers['access-control-request-headers']) {
							headers['Access-Control-Allow-Headers'] = '';
							req.headers['access-control-request-headers'].split(', ').forEach(function(header) {
								if (resourceConfig.headers.indexOf(header.toLowerCase()) !== -1) {
									headers['Access-Control-Allow-Headers'] += header + ', ';
								}
							});
							headers['Access-Control-Allow-Headers'] = headers['Access-Control-Allow-Headers'].substr(0, headers['Access-Control-Allow-Headers'].length - 2);
						}
					}
				}
				res.writeHead = writeHead;
				return res.writeHead(status, headers);
			};
			next();
		} else {
			next();
		}
	};
};
