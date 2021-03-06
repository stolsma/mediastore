var connect = require('connect'),
	url = require('url'),
	MemoryStore = require('connect/middleware/session/memory');

/**
 * We let the example run without npm, by setting up the require paths
 * so the node-oauth submodule inside of git is used.  You do *NOT*
 * need to bother with this line if you're using npm ...
 */
require.paths.unshift('support')
var OAuth = require('oauth').OAuth;
	oa = new OAuth(
		"http://localhost:3000/oauth/request_token",
		"http://localhost:3000/oauth/access_token", 
		"JiYmll7CX3AXDgasnnIDeg",
		"mWPBRK5kG2Tkthuf5zRV1jYWOEwnjI6xs3QVRqOOg", 
		"1.0A",
		"http://localhost:4000/oauth/callback",
		"HMAC-SHA1"
	);       

function routes(app) {
	app.get('/', function(req, res, params) {
		oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results) {
			req.session.oauth_token_secret = oauth_token_secret;
			console.log(require('sys').inspect(req.session));
      
			res.writeHead(303, { 'Location': "http://localhost:3000/oauth/authorize?oauth_token=" + oauth_token});
			res.end('');
		});
	});
	app.get('/oauth/callback', function(req, res, params) {
		var parsedUrl = url.parse(req.url, true);
		console.log(require('sys').inspect(req.session))
		oa.getOAuthAccessToken(parsedUrl.query.oauth_token, req.session.oauth_token_secret, parsedUrl.query.oauth_verifier, function(error, oauth_access_token, oauth_access_token_secret, results) {
			oa.getProtectedResource("http://localhost:3000/fetch/unicorns", "GET", oauth_access_token, oauth_access_token_secret, function(error, data) {
				res.writeHead(200, {'Content-type': 'text/html'})
				res.end(data);
			})
		})
	});
}

var server = connect.createServer( 
		connect.cookieDecoder(), 
		connect.session({key:'consumer'}),
/*		connect.session({
			store: new MemoryStore({
				reapInterval: -1
			})
		}), */
		connect.router(routes)
);

server.listen(4000);