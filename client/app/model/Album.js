Ext.define('tolsma.net.model.Album', {
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
			var me    = this,
			operation = request.operation,
			records   = operation.records || [],
			record    = records[0],
			format    = me.format,
			url       = me.getUrl(request),
			id        = (record && record.data.id != undefined) ? record.data.id : operation.id,
			parent    = (record && record.data.parent) ? record.data.parent : '';
		
			if (operation.action != 'create') {
				if (!url.match(/\/$/)) {
					url += '/';
				}
				
				if (id != 0) url += id;
			} else {
				if (!url.match(/\/$/)) {
					url += '/';
				}
				
				url += parent;
			}
			
			request.url = url;
			
			// added to remove id param from GET url
			delete request.params.id;
			
			return me.superclass.buildUrl.apply(this, arguments);
	
		}
	}
});