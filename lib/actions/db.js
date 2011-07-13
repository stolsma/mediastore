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
	this.dbName = options.dbdatabase || 'mediastore',

	// normalize database options
	this.dbOptions = {
		host: options.dbhost || 'localhost',
		port: options.dbport || '3306',
		user: options.dbuser,
		password: options.dbpassword,
		debug : options.debug || false
	}
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
		 		self.checkVersion(cb);
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
	this.db.query('CREATE DATABASE ' + this.dbName, [], function(err) {
		console.log('Created Database..');
		if (err && (err.number != mysqlClient.ERROR_DB_CREATE_EXISTS))
			cb(err);
		else
			self.createTables(cb);
	});
};

/**
 * Create all the tables
 * @param cb {Function} Callback function when ready, err will be parameter if something went wrong
 */
Db.prototype.createTables = function(cb) {
	var db = this.db;
	
	// want to use this database for all queries
	db.useDatabase(this.dbName);
	// create version table with data
	db.query(
		'CREATE TABLE version ' +
		'(id INT(11) AUTO_INCREMENT, ' +
		'version VARCHAR(255), ' +
		'created DATETIME, ' +
		'PRIMARY KEY (id))'
	);
	db.query(
	  'INSERT INTO version ' +
	  'SET version = ?, created = ?',
	  [dbVersion, '2010-08-16 10:00:23']
	);
};

/**
 * Check the version of the database
 * @param cb {Function} Callback function when ready, err will be parameter if something went wrong
 */
Db.prototype.checkVersion = function(cb) {
	console.log('Checking if Database version is: ' + dbVersion);
	this.db.query('SELECT * FROM version', function(err, results, fields) {
		if (err) {
			return cb(err);
		}
		
		if (results[0].version != dbVersion)
			return cb(new Error('Database version is not correct!! Needs to be version ' + dbVersion + ' but is version ' + results[0].version + ' !!'));
		
		console.log('Database version is ' + dbVersion);
		cb(null);
	});
};




Db.prototype.errorMySQL = function(err) {
	console.log('Error with database communication: ' + util.inspect(err));
};