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
	}
});