Ext.define('tolsma.net.model.TreeAlbum', {
	extend: 'Ext.data.Model',
	fields: [
		'id',
		'parent',
		'name',
		'description',
		{ name: 'createdate', type: 'date'},
		'scope',
		'children'
	],
	proxy: {
		type: 'rest',
		url: 'data/@me/album',
		noCache: false,
		appendId: true,
		headers: {
//			authorization: 'OAUTH2 ' + 'dFcTn_2d8_Tt9u0V0gXC'
			authorization: 'OAUTH2 ' + 'geencode'
		},
		reader: {
			type: 'json',
		},
		buildUrl: function(request) {
			var url = this.getUrl(request),
				id = (request.params && request.params.node != 'root') ? request.params.node : '';
		
			if (!url.match(/\/$/)) {
				url += '/';
			}
			request.url = url + id;
			
			// added to remove id param from GET url
			delete request.params.node;
			
			return this.superclass.buildUrl.apply(this, arguments);
		}
	}
});