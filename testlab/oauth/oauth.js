var connect = require('connect'),  
	auth = require('connect-auth'),
	url = require('url'),
	OAuthDataProvider = require('./in_memory_oauth_data_provider').OAuthDataProvider;

/**
 * The data request call
 */
function routes(app) {
	app.get('/fetch/unicorns', function(req, res, params) {
		req.authenticate(['oauth'], function(error, authenticated) { 
			if (authenticated) {
				res.writeHead(200, {'Content-Type': 'text/plain'});
				res.end('The unicorns fly free tonight');
			} else {
				res.writeHead(401, {'Content-Type': 'text/plain'});
				res.end('Doubt you\'ll ever see this.');
			}
		});
	});
}

/**
 * Show authentication form and get login name and password
 */
var renderAuthenticationForm = function(res, token, flash) {
	res.writeHead(200, {'Content-Type':'text/html'});
	var error = '';
	if (flash) {
		error = '<h3>' + flash + '</h3>';
	}
	res.end(' \
		<html> \n\
			<body> \n\
				<h2>Login</h2> \n\
				' + error + ' \n\
				<form method="post"> \n\
					<input type="hidden" name="oauth_token" value="' + token + '"/> \n\
					<table> \n\
						<tr><td><label>User name</lable></td><td><input type="text" name="username"/></td></tr> \n\
						<tr><td><label>Password</lable></td><td><input type="password" name="password"/></td></tr> \n\
					</table> \n\
					<div> \n\
						<input type="submit" value= "Authorize"/> \n\
					</div> \n\
				</form> \n\
			</body> \n\
		</html> \
	');
};

/**
 *
 */
var authenticateProvider = function(req, res) {
	var parsedUrl = url.parse(req.url, true);
	renderAuthenticationForm(res, parsedUrl.query.oauth_token);
};

/**
 * Handle the post back from the oauth authentication session (here you can build additional leves such as
 * handling authorization for the application)
 */
var authorizeProvider = function(err, req, res, authorized, authResults, application, user) {  
	var self = this;

	if (err) {
		renderAuthenticationForm(res, authResults.token, 'No such user or wrong password');
	} else {
		res.writeHead(200, {'Content-Type':'text/html'})
		res.end(' \
			<html> \n\
				<body> \n\
					<h2>Login</h2> \n\
					<form method="post"> \n\
						<input type="hidden" name="oauth_token" value="' + authResults.token + '"/> \n\
						<input type="hidden" name="verifier" value="' + authResults.verifier + '"/> \n\
						<table> \n\
							<tr><td>Application Title</td><td>' + application.title + '</td></tr> \n\
							<tr><td>Application Description</td><td>' + application.description + '</td></tr> \n\
							<tr><td>User name</td><td>' + user.username + '</td></tr> \n\
						</table> \n\
						<div> \n\
							<input type="submit" value= "Authorize"/> \n\
						</div> \n\
					</form> \n\
				</body> \n\
			</html> \
		');
	}
};

/**
 * Handle the successful authentication and authorization
 */
var authorizationFinishedProvider = function(err, req, res, result) {
	res.writeHead(200, {'Content-Type':'text/html'});
	res.end(' \
		<html> \n\
			<body> \n\
				<h2>Authentication and Authorization Finished, Application can now access</h2> \n\
				<input type="hidden" name="oauth_token" value="' + result.token + '"/> \n\
				<input type="hidden" name="oauth_verifier" value="' + result.verifier + '"/> \n\
				<table> \n\
					<tr><td>Token</td><td>' + result.token + '</td></tr> \n\
					<tr><td>Verifier</td><td>' + result.verifier + '</td></tr> \n\
				</table> \n\
			</body> \n\
		</html> \n\
	');
}

 /**
  * 
  * Initialize Oauth options.
  *
  * Options:
  *
  *   - request_token_url                  'web path for the request token url endpoint, default: /oauth/request_token' (get/post)
  *   - authorize_url                      'web path for the authorize form, default: /oauth/authorize' (get/post)
  *   - access_token_url                   'web path for the access token url endpoint, default: /oauth/access_token' (get/post)
  *
  *   - authenticate_provider              'function to render a authentication form'
  *   - authorize_provider                 'function to handle the authorization of the user and application'
  *   - oauth_provider                     'db instance providing needed authentication mechanisms'
  *   - authorization_finished_provider    ''
  *
  *   - oauth_protocol                     'the protocol (http or https) that this oauth provider is being served from, default: http'
  *   - realm                              'realm for WWW-Authenticate header, default: realm'
  *
  */
var server = connect.createServer( 
	connect.bodyDecoder(),
	auth([
		auth.Oauth({
			oauth_provider: new OAuthDataProvider({
				applications: [{
					title: 'Test',
					description: 'Test App',
					consumer_key: "JiYmll7CX3AXDgasnnIDeg",
					secret: "mWPBRK5kG2Tkthuf5zRV1jYWOEwnjI6xs3QVRqOOg"
				}],
				users: [{
					username: 'foo',
					password: 'bar'
				}]
			}),
			authenticate_provider: authenticateProvider,
			authorize_provider: authorizeProvider,
			authorization_finished_provider: authorizationFinishedProvider
		})
	]), 
	connect.router(routes)
);
	
server.listen(3000);