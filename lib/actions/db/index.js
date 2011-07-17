/**
 * The MediaStore Database actions layer
 *
 * MySQL and PostgreSQL (in development) are currently supported as db types
 *
 * Copyright 2011 TTC/Sander Tolsma
 * See LICENSE file for license
 */

var dbVersion = "0.0.1";

var	util = require('util'),
	EventEmitter = require('events').EventEmitter,
	mysqlClient = require('mysql').Client;

/**
 * Generic database class that supports connections to MySQL and PostgreSQL
 * @class Db
 * @param options {Object} Options for the database setup
 */
var Db = module.exports = function(options) {
	if (!(this instanceof Db)) {
		return new Db(options);
	}
	
	// Database is not ready to use yet!!
	this.dbReady = false;
	
	// save db type and name
	this.dbType = options.dbtype || 'mysql';
	this.dbName = options.dbname || 'mediastore',

	// normalize database options
	this.dbOptions = {
		host: options.dbhost || 'localhost',
		port: options.dbport || '3306',
		user: options.dbuser,
		password: options.dbpassword,
		debug : options.debug || false
	}
	
	// owner of the database
	this.owner = options.owner;
}
util.inherits(Db, EventEmitter);

/**
 * Connect to the selected database
 * @param cb {Function} Callback function when ready, err will be parameter if something went wrong
 */
Db.prototype.connect = function(cb) {
	if (this.dbType == "mysql") {
		this.startMySQL(cb);
	} else if (this.dbType == "postgresql") {
		this.startPostgreSQL(cb);
	} else
		cb(new Error('Database type not known'));
};

/**
 * Startup with a MySQL connection
 * @param cb {Function} Callback function when ready, err will be parameter if something went wrong
 */
Db.prototype.startMySQL = function(cb) {
	// create database client instance
	var self = this,
		db = this.db = mysqlClient(this.dbOptions);
	
	// catch all errors with the db client	
	db.on('error', this.errorMySQL.bind(this));
	
	db.connect(function(err){
		if (err) {
			if (err.code && err.code.match(/ECONNREFUSED/))
				return cb(new Error('Connection refused'));
			
			if (err.code && err.code.match(/ENOTFOUND/))
				return cb(new Error('Database not found'));
				
			// else unknown error..
			cb(err);
		} else
			// connected without error so open database
			db.useDatabase(self.dbName, function(err) {
				if (err) {
					if (err.number && err.number == mysqlClient.ERROR_BAD_DB_ERROR)
						// it doesn't so create database plus standard tables
						return self.createDb(cb);
					// unknown error..
					return cb(err);
				}
				// opened database so check version..
		 		self.checkVersion(cb, dbVersion);
			});
	})
};

/**
 * Startup with a PostgreSQL connection
 * @param cb {Function} Callback function when ready, err will be parameter if something went wrong
 */
Db.prototype.startPostgreSQL = function(cb) {
	cb(new Error('Database type not known yet... (under development!!)'))
};

/**
 * If database doesn't exist create it!!
 * @param cb {Function} Callback function when ready, err will be parameter if something went wrong
 */
Db.prototype.createDb = function(cb) {
	var self = this;
	
	console.log('Creating Database: ' + this.dbName);
	this.db.query('CREATE DATABASE ' + this.dbName, [], function(err, result) {
		console.log('Created Database..');
		if (err && (err.number != mysqlClient.ERROR_DB_CREATE_EXISTS))
			cb(err);
		else {
			self.createTables();
			self.setVersion(dbVersion);
			cb(null);
		}
	});
};

/**
 * Create all the tables
 * @param cb {Function} Callback function when ready, err will be parameter if something went wrong
 * @param database {String} Database name to create new tables in. Overrides this.dbName!!
 */
Db.prototype.createTables = function(cb, database) {
	var db = this.db,
		user, client;
	
	// want to use this database for all queries
	db.useDatabase(database || this.dbName);

	// create version table with data
	db.query(
		'CREATE TABLE version ' +
		'(id INT(11) AUTO_INCREMENT, ' +
		'version VARCHAR(255), ' +
		'created DATETIME, ' +
		'PRIMARY KEY (id))'
	);
	
	// create albums table + albumuser table
	db.query(
		'CREATE TABLE albums ' +
		'(id VARCHAR(20), ' +
		'parent VARCHAR(20), ' +
		'name VARCHAR(255), ' +
		'description VARCHAR(1000), ' +
		'createdate DATETIME, ' +
		'scope INT(11), ' +
		'PRIMARY KEY (id))'
	);
	db.query(
		'CREATE TABLE albumuser ' +
		'(albumId VARCHAR(20), ' +
		'userId VARCHAR(20), ' +
		'PRIMARY KEY (albumId, userId))'
	);
	
	// create users table + add owner of this database
	db.query(
		'CREATE TABLE users ' +
		'(id VARCHAR(20), ' +
		'openId VARCHAR(255), ' +
		'name VARCHAR(255), ' +
		'description VARCHAR(1000), ' +
		'createdate DATETIME, ' +
		'scope VARCHAR(255), ' +
		'PRIMARY KEY (id))'
	);
	user = this.createUser({
		openid: this.owner.openid,
		name: this.owner.name || '',
		description: this.owner.description || '',
		scope: 'public,comment,private,write,admin,superuser'
	}, function(){});
	
	// create OAuth2 client table + testclient data
	db.query(
		'CREATE TABLE oauthclients ' +
		'(id VARCHAR(20), ' +
		'user VARCHAR(20), ' +
		'name VARCHAR(255), ' +
		'description VARCHAR(1000), ' +
		'createdate DATETIME, ' +
		'scope VARCHAR(255), ' +
		'accesskey VARCHAR(20), ' +
		'PRIMARY KEY (id))'
	);
	client = this.createClient({
		user: user.id,
		name: 'OAuth2 TestClient',
		description: 'OAuth2 TestClient data',
		scope: 'public,comment,private,write,admin,superuser'
	}, function(err, result) {
		debugger;
		console.log('Created default testclient, accesskey = ' + client.accesskey);
	});
	
};

/**
 * Add this version to the database
 * @param version {String} Database structure version
 * @param cb {Function} Callback to call when ready (err, result)
 * @param database {String} [optional] Database name to add the version record to. If not given this.dbName will be used.
 */
Db.prototype.setVersion = function(version, cb, database) {
	var db = this.db;
	
	// want to use this database for all queries
	db.useDatabase(database || this.dbName);
	db.query(
		'INSERT INTO version ' +
		'SET version = ?, created = ?',
		[version, new Date().toJSON()]
	);
}

/**
 * Check the version of the database
 * @param cb {Function} Callback function when ready, err will be parameter if something went wrong
 */
Db.prototype.checkVersion = function(cb, version) {
	console.log('Checking Database version (v' + version + ')');
	this.db.query('SELECT * FROM version', function(err, results, fields) {
		if (err)
			return cb(err);
		
		if (results[0].version != version)
			return cb(new Error('Database version is not correct!! Needs to be version ' + version + ' but is version ' + results[0].version + ' !!'));
		
		console.log('Database version ok!');
		cb(null);
	});
};

/**
 * Create an album record in the album table
 * @param album {Object}
 * @param cb {Function} Callback function when ready, err will be parameter if something went wrong, album is the created record
 * @return {String} Used key for this new album record
 */
Db.prototype.createAlbum = function(album, cb) {
	// normalize record
	album.id = this.createKey();
	album.createdate = new Date().toJSON();
	
	// execute query
	this.db.query(
		'INSERT INTO albums ' +	this.querySet(album),
		function(err, result) {
			if (err) return cb(err, album);
			// return the new ID
			console.log('createAlbum result: ' + util.inspect(result))
			cb(null, album);
		}
	);
	
	// to make queing of records possible
	return album;
}

/**
 * Retrieve an album record in the album table
 * @param albumId {String}
 * @param cb {Function} Callback function when ready, err will be parameter if something went wrong, album is the retrieved record
 */
Db.prototype.getAlbum = function(user, albumId, admin, cb) {
	var db = this.db;

	console.log('db.getAlbum', user, albumId, admin);

	// sanatize callback
	cb = (cb) ? cb : function(){};
		
	function getChildren(err, result) {
		if (err) return cb(err, result);
		// get children of this album
		db.query(
			'SELECT * FROM albums ' +
			'WHERE parent = ?',
			[albumId],
			function(err, data, fields) {
				if (err) return cb(err, result);
				// add data to result object
				result.children = data;
				cb(null, result);
			}
		)
	}
	
	function getInfo(next) {
		db.query(
			'SELECT * FROM albums ' +
			'WHERE albumId = ?',
			[albumId],
			function(err, data, fields) {
				if (err) return next(err, data);
				next(null, data);
			}
		)
	}
	
	
	if (albumId == 0) {
		//root album!!!
		getChildren(null, {
			id: 0
		});
	} else {
		getInfo(getChildren);
	}
}

/**
 * Update an album record in the album table
 * @param album {Object}
 * @param cb {Function} Callback function when ready, err will be parameter if something went wrong, album is the created record
 * @return {String} Used key for this new album record
 */
Db.prototype.updateAlbum = function(album, cb) {
	var id = this.createKey();
	
	// TODO Get current data!!
	
	// Insert the new data
	this.db.query(
		'INSERT INTO albums ' +
		'SET id = ?, parent = ?, name = ?, description = ?, createdate = ?, scope = ?',
		[version, '2010-08-16 10:00:23'],
		function(err, result) {
			if (err) return cb(err);
			// return the new ID
			console.log('updateAlbum result: ' + util.inspect(result));
			cb(null, result);
		}
	);
	
	// to make queing of records possible
	return id;
}

/**
 * Get all users from database
 * @param cb {Function} Callback function when ready, err will be parameter if something went wrong, users is an Array with all user records
 */
Db.prototype.getUsers = function(cb) {
	this.db.query(
		'SELECT * FROM users ',
		function(err, data, fields) {
			if (err) return cb(err, data);
			cb(null, data);
		}
	)
}

/**
 *
 */
Db.prototype.createUser = function(user, cb) {
	// normalize record
	user.id = this.createKey();
	user.createdate = new Date().toJSON();
	
	// execute query
	this.db.query(
		'INSERT INTO users ' + this.querySet(user),
		function(err, result) {
			if (err) return cb(err, result);
			// return the new ID
			cb(null, result);
		}
	);
	
	// to make queing of records possible
	return user;
}

/**
 * Get all clients from database
 * @param cb {Function} Callback function when ready, err will be parameter if something went wrong, oauthclients is an Array with all oauthclient records
 */
Db.prototype.getClients = function(cb) {
	this.db.query(
		'SELECT * FROM oauthclients ',
		function(err, data, fields) {
			if (err) return cb(err, data);
			cb(null, data);
		}
	)
}

/**
 *
 */
Db.prototype.createClient = function(client, cb) {
	// normalize record
	client.id = this.createKey();
	client.createdate = new Date().toJSON();
	client.accesskey = this.createKey();
	
	// execute query
	this.db.query(
		'INSERT INTO oauthclients ' + this.querySet(client),
		function(err, result) {
			if (err) return cb(err, result);
			// return the new ID
			cb(null, result);
		}
	);
	
	// to make queing of records possible
	return client;
}

/**
 * Convert object with attributes to INSER query SET string
 * @param data {Object} Object with attributes to SET
 * @return {String} Set string
 */
Db.prototype.querySet = function(data) {
	var result = 'SET ';
	
	for (prop in data) {
		result += prop + ' = ' + this.db.escape(data[prop]) + ',';
	}
	
	// return the string min the last ','
	return result.slice(0, -1);
}

/**
 * Temporary function for debugging query calls...
 */
Db.prototype.showInfo = function(err, info) {
	console.log('Query: \n');
	console.log('Err  : \n ' + util.inspect(err) + '\n');
	console.log('Info : \n ' + util.inspect(info) + '\n');
}

/**
 * General MySQL error function. Just logs error strings to console
 * @param err {Error} Error construct to be processed
 */
Db.prototype.errorMySQL = function(err) {
	console.log('Error with database communication: ' + util.inspect(err));
}

/**
 * Return a random base64 encoded key of 20 chars
 * @return {String} A random base64 encoded string of 20 chars.
 */
Db.prototype.createKey = function() {
	return this.randomString(120);
}

/**
 * randomString returns a pseude-random ASCII string which contains at least the specified number of bits of entropy
 * the return value is a string of length bits/6 of characters from the base64 alphabet
 * @param bits {Integer} The number of bits for the random base64 string returned to contain
 * @return {String} Random base64 string of bits/6 characters
 * @copyright Copied from Haibu: https://github.com/nodejitsu/haibu
 */
Db.prototype.randomString = function(bits) {
	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-',
		rand,
		i,
		ret = '';
	
	// in v8, Math.random() yields 32 pseudo-random bits (in spidermonkey it gives 53)
	while (bits > 0) {
		// 32-bit integer
		rand = Math.floor(Math.random() * 0x100000000); 
		// base 64 means 6 bits per character, so we use the top 30 bits from rand to give 30/6=5 characters.
		for (i = 26; i > 0 && bits > 0; i -= 6, bits -= 6) {
			ret += chars[0x3F & rand >>> i];
		}
	}
	
	return ret;
}