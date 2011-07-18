Ext.define('tolsma.net.panel.AlbumTree', {
	extend: 'Ext.tree.Panel',
	alias : 'widget.albumtree',
	
	title: 'Albums',
	animate: true,
	rootVisible: false,
	
	displayField: 'name',
	
	initComponent: function() {
		this.tbar = [{
			text: 'New Album',
			iconCls: 'album-btn',
			scope: this,
			handler: this.addAlbum
		}];
		
		this.store = Ext.create('Ext.data.TreeStore', {
			model: 'tolsma.net.model.TreeAlbum'
		});
		
		this.callParent();
	},
	
	/**
	 * Adds a new album node to the root
	 */
	addAlbum: function() {
		selected = this.getSelectionModel().getLastSelected();
		
		if (selected) {
			
			var albumForm = Ext.create('Ext.form.Panel', {
				title: 'New Album',
				height: 150,
				width: 280,
				bodyPadding: 10,
				defaultType: 'textfield',
				items: [{
					fieldLabel: 'Album Name',
					name: 'name'
				},{
					fieldLabel: 'Album Description',
					name: 'description'
				}],
				buttons: [{
					text: 'Submit',
					handler: function() {
						// get the basic form, get the underlying model instance
						var form = this.up('form').getForm(),
							record = form.getRecord();
							
						// make sure the form contains valid data before submitting	
						if (form.isValid()) { 
							// update the record with the form data
							form.updateRecord(record);
							// save the record to the server
							record.save({
								success: function(user) {
									Ext.Msg.alert('Success', 'Album saved successfully.')
								},
								failure: function(user) {
									Ext.Msg.alert('Failure', 'Failed to save new album.')
								}
							});
						} else { // display error alert if the data is invalid
							Ext.Msg.alert('Invalid Data', 'Please correct form errors.')
						}
					}
				}]
			});
			
			var album = Ext.create('tolsma.net.model.Album', {
				parent: selected.data.id || "0",
				name: 'Test Album',
				description: 'This is a test album',
				scope: 'private'
			});
			
			// load the data into the form
			albumForm.loadRecord(album); 
			
			// create and show the album window
			win = Ext.widget('window', {
				title: 'Contact Us',
				closeAction: 'hide',
				width: 400,
				height: 400,
				minHeight: 400,
				layout: 'fit',
				resizable: true,
				modal: true,
				items: albumForm
			});
			win.show();
		}
	}
});
