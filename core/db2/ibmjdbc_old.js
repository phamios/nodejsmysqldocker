exports = module.exports = ibmjdbc;
var JDBC = require('jdbc');
var jinst = require('jdbc/lib/jinst');
var asyncjs = require('async');
var SqlString = require('./SqlString');
var Q = require('q');
if (!jinst.isJvmCreated()) {
    jinst.addOption("-Xrs");
    jinst.setupClasspath([__dirname.replace(/\\/gi, '/') + '/drivers/db2jcc4.jar']);
}
function escapeString(val) {
    val = val.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function (s) {
        switch (s) {
            case "\0": return "\\0";
            case "\n": return "\\n";
            case "\r": return "\\r";
            case "\b": return "\\b";
            case "\t": return "\\t";
            case "\x1a": return "\\Z";
            default: return "\\" + s;
        }
    });
    return val;
}
function ibmjdbc(settings) {
    var config = {
        url: 'jdbc:db2://' + settings.server + ':' + settings.port + '/BLUDB',
        drivername: 'com.ibm.db2.jcc.DB2Driver',
        minpoolsize: 1,
        maxpoolsize: 100,
        properties: {
            user: settings.username,
            password: settings.password
        }
    };
    var that = this;
    this.ibmi = new JDBC(config);

    this.ibmi.initialize(function (err) {
        if (err) {
            console.log(err);
        }
    });

    this.queryUpdate = async function (query, params = [], func) {
        var def = Q.defer();
        this.ibmi.reserve(function (err, connObj) {
            if (connObj) {
                var conn = connObj.conn;
                asyncjs.series([
                    function (callback) {
                        conn.setSchema(settings.database, function (err) {
                            if (err) {
                                console.log('setSchema',err);
                                func(err);
                                def.resolve(err);
                                callback(err);
                            } else {
                                callback(null);
                            }
                        });
                    }
                ], function (err, results) {
                    // Process result
                });

                return asyncjs.series([
                    function (callback) {
                        console.log('createStatement',err);
                        conn.createStatement(function (err, statement) {
                            console.log('createStatement trong',err);
                            if (err) {
                                func(err);
                                def.resolve(err);
                                callback(err);
                            } else {
                                for (var v of params) {
                                    query = query.replace('?', SqlString.escape(v));
                                }
                                // console.log(query);
                                statement.executeUpdate(query, function (err, count) {
                                    if (err) {
                                        func(err);
                                        def.resolve(err);
                                        callback(err);
                                    } else {
                                        def.resolve(count);
                                        callback(null, count);
                                    }
                                });
                            }
                        });
                    },
                ], function (err, resultset) {
                    that.ibmi.release(connObj, function (err) {
                        if (err) {
                            console.log(err.message);
                        }
                        func(err);
                        def.resolve(err);
                    });
                });
            } else {
                func(err);
                def.resolve(err);
            }
        });
        return def.promise;
    }

    this.query = async function (query, params = [], func) {
        var def = Q.defer();
        this.ibmi.reserve(function (err, connObj) {
            if (connObj) {
                var conn = connObj.conn;
                asyncjs.series([
                    function (callback) {
                        conn.setSchema(settings.database, function (err) {
                            if (err) {
                                func(err);
                                def.resolve(err);
                                callback(err);
                            } else {
                                callback(null);
                            }
                        });
                    }
                ], function (err, results) {
                    // Process result
                });

                // Query the database.
                return asyncjs.series([
                    function (callback) {
                        // Select statement example.
                        console.log('conn.createStatement very slow');
                        var start = new Date().getTime();
                        conn.createStatement(function (err, statement) {
                            console.log('conn.createStatement very slow thanh cong' , new Date().getTime() - start);
                            if (err) {
                                func(err);
                                def.resolve(err);
                                callback(err);
                            } else {
                                for (var v of params) {
                                    query = query.replace('?', typeof (v) == 'string' ? ("'" + escapeString(v) + "'") : v);
                                }
                                statement.setFetchSize(100, function (err) {
                                    if (err) {
                                        func(err);
                                        def.resolve(err);
                                        callback(err);
                                    } else {
                                        statement.executeQuery(query, function (err, resultset) {
                                            if (err) {
                                                func(err);
                                                def.resolve(err);
                                                callback(err);
                                            } else {
                                                resultset.toObjArray(function (err, results) {
                                                    func(err, results);
                                                    def.resolve(results);
                                                    callback(null, resultset);
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    },
                ], function (err, resultset) {
                    that.ibmi.release(connObj, function (err) {
                        if (err) {
                            console.log(err.message);
                        }
                        func(err);
                        def.resolve(err);
                    });
                });
            } else {
                func(err);
                def.resolve(err);

            }
        });
        return def.promise;
    }


}
