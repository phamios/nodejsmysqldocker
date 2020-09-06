process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const request = require('request');
const Q = require('q');
const DB = require('mysql-activerecord');
const express = require('express');
var app = express();
var GlobalExcel = require('./core/global_excel');
var CONFIG = require('./config/config');
var GlobalDB = require('./core/global_db');
var GlobalFunction = require('./core/global_function');
var GlobalFacebookRequire = require('./core/global_facebook');
var GlobalRender = require('./core/global_render');
var GlobalFacebook = new GlobalFacebookRequire('dung');
var GlobalFile = require('./core/global_file');
var Promise = require('promise');
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});


var list_table_core = {
    'path': 'models/common/',
    'configdb': 'crawlermanagement',
    'tables': CONFIG.LIST_TABLE_CORE
};
var configdb = CONFIG.argv.configdb ? CONFIG.argv.configdb : 'crawlermanagement';
var db = new DB.Adapter(CONFIG.MYSQL[CONFIG.SERVER[configdb]]);
var dbname = CONFIG.MYSQL[CONFIG.SERVER[configdb]]['database'];
list_table_core.configdb = configdb;
var list_table_application = {
    'path': 'application/' + configdb + '/models/',
    'configdb': configdb,
    'tables': []
};

function load_render_model(rows) {
    var list = [];
    for (var i in rows) {
        var table_name = typeof (rows[i]) == 'object' && rows[i]['TABLE_NAME'] ? rows[i]['TABLE_NAME'] : rows[i];
        if (!GlobalFunction.contains(table_name, list_table_core['tables'])) {
            list_table_application.tables.push(table_name);
        } else if (typeof (rows[i]) == 'string') {
            list.push(table_name);
        }
    }
    var list_render_model = [list_table_application];
    if (!CONFIG.argv.table || CONFIG.argv.table == 'all') {
        list_render_model.push(list_table_core);
    } else {
        if (list && list.length) {
            list_table_core.tables = list;
            list_render_model.push(list_table_core);
        }
    }
    for (var i in list_render_model) {
        var configdb = list_render_model[i]['configdb'];
        var path = list_render_model[i]['path'];
        var tables = list_render_model[i]['tables'];
        for (var i in tables) {
            var table_name = tables[i];
            // if(table_name == 'user') {
            GlobalRender.renderModel(table_name, configdb, path).then(r => {
                console.log(r);
            });
            // }
        }
    }
}

if (CONFIG.argv.table && CONFIG.argv.table != 'all') {
    load_render_model(CONFIG.argv.table.split(','));
} else {
    console.log('chang nhe vao day');
    db.query("SELECT TABLE_NAME  FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '" + dbname + "';", function (err, rows) {
        load_render_model(rows);
    })
}