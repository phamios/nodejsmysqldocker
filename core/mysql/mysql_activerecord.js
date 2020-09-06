var Adapter = function (settings) {

	var mysql = require('mysql');
	var SqlString = require('./SqlString');

	this.initializeConnectionSettings = function () {
		if (settings.server) {
			settings.host = settings.server;
		}
		if (settings.username) {
			settings.user = settings.username;
		}

		if (!settings.host) {
			throw new Error('Unable to start mysql-activerecord - no server given.');
		}
		if (!settings.port) {
			settings.port = 3306;
		}
		if (!settings.user) {
			settings.user = '';
		}
		if (!settings.password) {
			settings.password = '';
		}
		if (!settings.database) {
			throw new Error('Unable to start mysql-activerecord - no database given.');
		}

		return settings;
	};
	var that = this;

	this.list_cache_db = [];
	this.limit_cache = 1;

	this.whereClause = {};
	this.selectClause = [];
	this.orderByClause = '';
	this.groupByClause = '';
	this.havingClause = '';
	this.limitClause = -1;
	this.offsetClause = -1;
	this.joinClause = [];
	this.lastQuery = '';
    this.db2 = null;

	this.init_db = function() {
		var item = new mysql.createConnection(this.initializeConnectionSettings());
		if (settings.charset) {
			item.query('SET NAMES ' + settings.charset);
		}
		item.time_start = new Date().getTime();
		item.connect_count = 0;
		item.flag_connection = true;
		this.auto_close_db(item);
		return item;
	}

    this.auto_close_db =  function(db) {
        var that = this;
        setTimeout(function(){
            if(db) {
                if(!db.flag_connection) {
					if(db.state != 'disconnected') {
						try{
							db.end();
						}catch(e){}
					}
					db.flag_restart = true;
                } else {
					if(db.state != 'disconnected') {
						that.auto_close_db(db);
					}
                }
            }
		},2 * 60 * 1000);
	}

    this.get_db_trust = function(db) {
        if(!db) {
            db = this.init_db();
        } else if((new Date().getTime() - db.time_start > (60 * 1000)) || (db.connect_count > 100)) {
			if(db.state != 'disconnected') {
				try{
					db.end();
				}catch(e){}
			}
            db = this.init_db();
        }
        return db;
    }

	this.get_db = function () {
		var db = false;
		for (var i = 0; i < this.list_cache_db.length;i++) {
			if(!this.list_cache_db[i]) {
				this.list_cache_db[i] = this.init_db();
			} else {
				if (!this.list_cache_db[i].flag_connection) {
					if(this.list_cache_db[i].flag_restart) {
						this.list_cache_db[i] = this.init_db();
					} else {
						this.list_cache_db[i] = this.get_db_trust(this.list_cache_db[i]);
					}
				}
			}
			db = this.list_cache_db[i];
		}
		if (this.list_cache_db.length < this.limit_cache) {
			db = this.init_db();
			this.list_cache_db.push(db);
		}
        if(!db) {
            if(this.db2) {
				if(this.db2.flag_restart) {
					db = this.db2 = this.init_db();
				} else {
					db = this.db2 = this.get_db_trust(this.db2);
				}
                
            } else {
                db = this.db2 = this.init_db();
            }
		}
        if(db) {
            db.flag_connection = true;
            db.connect_count++;
        }
		return db;
	}
	
	this.after_query = function(db, err) {
		db.flag_connection = false;
		if (err) {
			that.handleDisconnect(db, err);
		}
	}

	this.resetQuery = function (newLastQuery) {
		this.whereClause = {};
		this.selectClause = [];
		this.orderByClause = '';
		this.groupByClause = '';
		this.havingClause = '',
		this.limitClause = -1;
		this.offsetClause = -1;
		this.joinClause = [];
		this.lastQuery = (typeof newLastQuery === 'string' ? newLastQuery : '');
		this.rawWhereClause = {};
		this.rawWhereString = {};
	};

	this.reset_query_string = function (newLastQuery) {
		this.resetQuery(newLastQuery);
	}

	this.rawWhereClause = {};
	this.rawWhereString = {};

	this.escapeFieldName = function (str) {
		return (typeof this.rawWhereString[str] === 'undefined' && typeof this.rawWhereClause[str] === 'undefined' ? '`' + str.replace('.', '`.`') + '`' : str);
	};

	this.buildDataString = function (dataSet, separator, clause) {
		if (!clause) {
			clause = 'WHERE';
		}
		var queryString = '', y = 1;
		if (!separator) {
			separator = ', ';
		}
		var useSeparator = true;

		var datasetSize = this.getObjectSize(dataSet);

		for (var key in dataSet) {
			useSeparator = true;

			if (dataSet.hasOwnProperty(key)) {
				if (clause == 'WHERE' && this.rawWhereString[key] == true) {
					queryString += key;
				}
				else if (dataSet[key] === null) {
					queryString += this.escapeFieldName(key) + (clause == 'WHERE' ? " is NULL" : "=NULL");
				}
				else if (typeof dataSet[key] !== 'object') {
					queryString += this.escapeFieldName(key) + "=" + this.escape(dataSet[key]);
				}
				else if (typeof dataSet[key] === 'object' && Object.prototype.toString.call(dataSet[key]) === '[object Array]' && dataSet[key].length > 0) {
					if(typeof(dataSet[key][0]) == 'number') {
						queryString += this.escapeFieldName(key) + ' in (' + dataSet[key].join(',') + ')';
					} else {
						queryString += this.escapeFieldName(key) + ' in ("' + dataSet[key].join('", "') + '")';
					}
					
				}
				else {
					useSeparator = false;
					datasetSize = datasetSize - 1;
				}

				if (y < datasetSize && useSeparator) {
					queryString += separator;
					y++;
				}
			}
		}
		if (this.getObjectSize(dataSet) > 0) {
			queryString = ' ' + clause + ' ' + queryString;
		}
		return queryString;
	};

	this.buildJoinString = function () {
		var joinString = '';

		for (var i = 0; i < this.joinClause.length; i++) {
			joinString += (this.joinClause[i].direction !== '' ? ' ' + this.joinClause[i].direction : '') + ' JOIN ' + this.escapeFieldName(this.joinClause[i].table) + ' ON ' + this.joinClause[i].relation;
		}

		return joinString;
	};

	this.mergeObjects = function () {
		for (var i = 1; i < arguments.length; i++) {
			for (var key in arguments[i]) {
				if (arguments[i].hasOwnProperty(key)) {
					arguments[0][key] = arguments[i][key];
				}
			}
		}
		return arguments[0];
	};

	this.getObjectSize = function (object) {
		var size = 0;
		for (var key in object) {
			if (object.hasOwnProperty(key)) {
				size++;
			}
		}
		return size;
	};

	this.trim = function (s) {
		var l = 0, r = s.length - 1;
		while (l < s.length && s[l] == ' ') {
			l++;
		}
		while (r > l && s[r] == ' ') {
			r -= 1;
		}
		return s.substring(l, r + 1);
	};


	this.where = function (whereSet, whereValue, isRaw) {
		if (typeof whereSet === 'object' && typeof whereValue === 'undefined') {
			this.whereClause = this.mergeObjects(this.whereClause, whereSet);
		}
		else if ((typeof whereSet === 'string' || typeof whereSet === 'number') && typeof whereValue != 'undefined') {
			if (isRaw) {
				this.rawWhereClause[whereSet] = true;
			}
			this.whereClause[whereSet] = whereValue;
		}
		else if ((typeof whereSet === 'string' || typeof whereSet === 'number') && typeof whereValue === 'object' && Object.prototype.toString.call(whereValue) === '[object Array]' && whereValue.length > 0) {
			this.whereClause[whereSet] = whereValue;
		}
		else if (typeof whereSet === 'string' && typeof whereValue === 'undefined') {
			this.rawWhereString[whereSet] = true;
			this.whereClause[whereSet] = whereValue;
		}
		return that;
	};

	this.count = function (tableName, responseCallback) {
		var that = this;
		if (typeof tableName === 'string') {
			var combinedQueryString = 'SELECT COUNT(*) as count FROM ' + this.escapeFieldName(tableName)
				+ this.buildJoinString()
				+ this.buildDataString(this.whereClause, ' AND ', 'WHERE');
			var connection = this.get_db();
			
			connection.query(combinedQueryString, function (err, res) {
				that.after_query(connection);
				if (err) {
					responseCallback(err, null);
				} else {
					responseCallback(null, res[0]['count']);
				}
			});
			this.resetQuery(combinedQueryString);
		}

		return that;
	};

	this.join = function (tableName, relation, direction) {
		this.joinClause.push({
			table: tableName,
			relation: relation,
			direction: (typeof direction === 'string' ? this.trim(direction.toUpperCase()) : '')
		});
		return that;
	};

	this.select = function (selectSet) {
		if (Object.prototype.toString.call(selectSet) === '[object Array]') {
			for (var i = 0; i < selectSet.length; i++) {
				this.selectClause.push(selectSet[i]);
			}
		}
		else {
			if (typeof selectSet === 'string') {
				var selectSetItems = selectSet.split(',');
				for (var i = 0; i < selectSetItems.length; i++) {
					this.selectClause.push(this.trim(selectSetItems[i]));
				}
			}
		}
		return that;
	};

	this.comma_separated_arguments = function (set) {
		var clause = '';
		if (Object.prototype.toString.call(set) === '[object Array]') {
			clause = set.join(', ');
		}
		else if (typeof set === 'string') {
			clause = set;
		}
		return clause;
	};

	this.group_by = function (set) {
		this.groupByClause = this.comma_separated_arguments(set);
		return that;
	};

	this.having = function (set) {
		this.havingClause = this.comma_separated_arguments(set);
		return that;
	};

	this.order_by = function (set) {
		this.orderByClause = this.comma_separated_arguments(set);
		return that;
	};

	this.limit = function (newLimit, newOffset) {
		if (typeof newLimit === 'number') {
			this.limitClause = newLimit;
		}
		if (typeof newOffset === 'number') {
			this.offsetClause = newOffset;
		}
		return that;
	};

	this.ping = function () {
		this.list_cache_db[0].ping();
		return that;
	};

	this.insert_core = function (tableName, dataSet, responseCallback, verb, querySuffix) {
		if (typeof verb === 'undefined') {
			var verb = 'INSERT';
		}
		if (Object.prototype.toString.call(dataSet) !== '[object Array]') {
			if (typeof querySuffix === 'undefined') {
				var querySuffix = '';
			}
			else if (typeof querySuffix !== 'string') {
				var querySuffix = '';
			}

			if (typeof tableName === 'string') {
				var combinedQueryString = verb + ' into ' + this.escapeFieldName(tableName)
					+ this.buildDataString(dataSet, ', ', 'SET');

				if (querySuffix != '') {
					combinedQueryString = combinedQueryString + ' ' + querySuffix;
				}

				var connection = this.get_db();
				
				connection.query(combinedQueryString, function (err, rows) {
					that.after_query(connection,err);
					responseCallback(err, rows);

				});
				this.resetQuery(combinedQueryString);
			}
		}
		else {
			this.doBatchInsert(verb, tableName, dataSet, responseCallback);
		}
		return that;
	};

	this.insert_ignore = function (tableName, dataSet, responseCallback, querySuffix) {
		return this.insert_core(tableName, dataSet, responseCallback, 'INSERT IGNORE', querySuffix);
	};

	this.doBatchInsert = function (verb, tableName, dataSet, responseCallback) {
		if (Object.prototype.toString.call(dataSet) !== '[object Array]') {
			throw new Error('Array of objects must be provided for batch insert!');
		}

		if (dataSet.length === 0) return false;

		var map = [];
		var columns = [];
		var escColumns = [];

		for (var aSet in dataSet) {
			for (var key in dataSet[aSet]) {
				if (columns.indexOf(key) == -1) {
					columns.push(key);
					escColumns.push(this.escapeFieldName(key));
				}
			}
		}

		for (var i = 0; i < dataSet.length; i++) {
			(function (i) {
				var row = [];

				for (var key in columns) {
					if (dataSet[i].hasOwnProperty(columns[key])) {
						row.push(that.escape(dataSet[i][columns[key]]));
					} else {
						row.push('NULL');
					}
				}

				if (row.length != columns.length) {
					throw new Error('Cannot use batch insert into ' + tableName + ' - fields must match on all rows (' + row.join(',') + ' vs ' + columns.join(',') + ').');
				}
				map.push('(' + row.join(',') + ')');
			})(i);
		}

		that.query(verb + ' INTO ' + this.escapeFieldName(tableName) + ' (' + escColumns.join(', ') + ') VALUES' + map.join(','), responseCallback);
		return that;
	};

	this.get_query = function (tableName) {
		var combinedQueryString;
		if (typeof tableName === 'string') {
			combinedQueryString = 'SELECT ' + (this.selectClause.length === 0 ? '*' : this.selectClause.join(','))
				+ ' FROM ' + this.escapeFieldName(tableName)
				+ this.buildJoinString()
				+ this.buildDataString(this.whereClause, ' AND ', 'WHERE')
				+ (this.groupByClause !== '' ? ' GROUP BY ' + this.groupByClause : '')
				+ (this.havingClause !== '' ? ' HAVING ' + this.havingClause : '')
				+ (this.orderByClause !== '' ? ' ORDER BY ' + this.orderByClause : '')
				+ (this.limitClause !== -1 ? ' LIMIT ' + this.limitClause : '')
				+ (this.offsetClause !== -1 ? ' OFFSET ' + this.offsetClause : '');
		}
		return combinedQueryString;
	}

	this.get_core = function (tableName, responseCallback) {
		var combinedQueryString = this.get_query(tableName);
		if (combinedQueryString) {
			var connection = this.get_db();
			connection.query(combinedQueryString, function (err, rows) {
				that.after_query(connection);
				responseCallback(err, rows);
			});
		}
		this.resetQuery(combinedQueryString);

		return that;
	};

	this.update_core = function (tableName, newData, responseCallback) {
		if (typeof tableName === 'string') {
			var combinedQueryString = 'UPDATE ' + this.escapeFieldName(tableName)
				+ this.buildDataString(newData, ', ', 'SET')
				+ this.buildDataString(this.whereClause, ' AND ', 'WHERE')
				+ (this.limitClause !== -1 ? ' LIMIT ' + this.limitClause : '');

			var connection = this.get_db();
			
			connection.query(combinedQueryString, function (err, rows) {
				that.after_query(connection);
				responseCallback(err, rows);
			});
			this.resetQuery(combinedQueryString);
		}

		return that;
	};

	this.escape = function (str) {
		return SqlString.escape(str);
	};

	this.delete_core = function (tableName, responseCallback) {
		if (typeof tableName === 'string') {
			var combinedQueryString = 'DELETE FROM ' + this.escapeFieldName(tableName)
				+ this.buildDataString(this.whereClause, ' AND ', 'WHERE')
				+ (this.limitClause !== -1 ? ' LIMIT ' + this.limitClause : '');

			var connection = this.get_db();
			
			connection.query(combinedQueryString, function (err, rows) {
				that.after_query(connection);
				responseCallback(err, rows);
			});
			this.resetQuery(combinedQueryString);
		}

		return that;
	};

	this._last_query = function () {
		return this.lastQuery;
	};

	this.query_core = function (sqlQueryString, responseCallback) {
		var connection = this.get_db();
		
		connection.query(sqlQueryString, function (err, rows) {
			that.after_query(connection);
			responseCallback(err, rows);
		});
		this.resetQuery(sqlQueryString);
		return that;
	};

	that.handleDisconnect = function(connection, err) {
		if (['PROTOCOL_PACKETS_OUT_OF_ORDER','PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR','PROTOCOL_ENQUEUE_AFTER_QUIT','ECONNREFUSED','PROTOCOL_CONNECTION_LOST','ENETUNREACH','ECONNRESET','EHOSTUNREACH'].includes(err.code)) {
			if(connection.state != 'disconnected') {
				connection.end();
			}
			connection.flag_restart = true;;
		}
	}

	return this;
};

exports.Adapter = Adapter;
