Ext.application({
	name: 'MediaStore',
	launch: function() {
		Ext.create('Ext.container.Viewport', {
			layout: 'fit',
			items: [{
				title: 'MediaStore Client Application',
				html : 'Hello! Welcome to the MediaStore client application.'
			}]
		});
		
		var albumroot = Ext.ModelMgr.getModel('Albumroot');
		
		albumroot.load(0, {
			success: function(root) {
				console.log("Root data: ", root);
			}
		});
		
		albumroot.load('shdfgda73483hjfHHH', {
			success: function(root) {
				console.log("Root data: ", root);
			}
		});

	}
});

Ext.define('Albumroot', {
	extend: 'Ext.data.Model',
	fields: [
		{ name: 'id', type: 'int' },
		{ name: 'children', type: 'array' }
	],
	proxy: {
		type: 'rest',
		url: 'data/@me/album',
		noCache: false,
		appendId: true,
		headers: {
			authorization: 'OAUTH2 ' + 'dFcTn_2d8_Tt9u0V0gXC'
		},
		reader: {
			type: 'json',
		}
	}
});