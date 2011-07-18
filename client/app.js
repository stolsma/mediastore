Ext.Loader.setConfig({enabled: true});
Ext.Loader.setPath('tolsma.net', './app');

Ext.require([
    'tolsma.net.model.Album',
    'tolsma.net.model.TreeAlbum',
    'tolsma.net.panel.Test',
    'tolsma.net.panel.AlbumTree'
]);

Ext.onReady(function() {
    Ext.create('tolsma.net.panel.Test', {
       renderTo: Ext.getBody(),
        height: 490,
        width : 700
    });
	
/*	var albumroot = Ext.ModelMgr.getModel('tolsma.net.model.Album');
	
	// test get, response must be 404 not found
	albumroot.load('shdfgda73483hjfHHH', {
		success: function(root) {
			console.log("Root data: ", root);
		}
	});

	// test get of root album, response with list of albums in root
	albumroot.load(0, {
		success: function(root) {
			console.log("Root data: ", root);
			
			// and then save it again. PUT, response must be 400 bad request
			root.save();
		}
	});
	
	// test POST and create, response must be 201, created
//	var user = Ext.create('tolsma.net.model.Album', {parent: 0, name: 'Test Album', description: 'This is a test album', scope: 'private'});
//	user.save(); //POST /users

*/
});
