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
// var PhoneNewRequire = require('./models/PhoneNew');
// var PhoneNew = new PhoneNewRequire();
var Promise = require('promise');
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});



// var all_defer = Q.defer();
// var config_server_length = Object.keys(CONFIG.SERVER).length;
// var i_r = 0;
// for (var i in CONFIG.SERVER) {
//     var db2 = GlobalDB.getDB(CONFIG.SERVER[i]);
//     db2.connectionDB().then(() => {
//         i_r++;
//         if (i_r == config_server_length) {
//             all_defer.resolve();
//         }
//     })
// }
var APPLiCATION_PATH = CONFIG.APPLiCATION_PATH.replace('server/','');
var list_table_core = {
    'path': APPLiCATION_PATH +  'src/app/common/services/',
    'configdb': 'crawlermanagement',
    'tables': CONFIG.LIST_TABLE_CORE
};
// all_defer.promise.then(() => {
    var configdb = CONFIG.argv.configdb ? CONFIG.argv.configdb : 'crawlermanagement';
    var db = new DB.Adapter(CONFIG.MYSQL[CONFIG.SERVER[configdb]]);
    var dbname = CONFIG.MYSQL[CONFIG.SERVER[configdb]]['database'];
    list_table_core.configdb = configdb;
    var application_name = configdb == 'crawlermanagement' ? 'admin' : configdb;
    var list_table_application = {
        'path': APPLiCATION_PATH + 'src/app/application/' + application_name + '/models/',
        'configdb': configdb,
        'tables': []
    };
    function load_model_service(rows) {
        var list = [];
        for (var i in rows) {
            var table_name = typeof(rows[i]) == 'object' && rows[i]['TABLE_NAME'] ? rows[i]['TABLE_NAME'] : rows[i];
            if (!GlobalFunction.contains(table_name, list_table_core['tables'])) {
                list_table_application.tables.push(table_name);
            } else if(typeof(rows[i]) == 'string') {
                list.push(table_name);
            }
        }
        var list_render_model = [list_table_application];
        if(!CONFIG.argv.table || CONFIG.argv.table == 'all') {
            list_render_model.push(list_table_core);
        } else {
            if(list && list.length) {
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
                    GlobalRender.renderService(table_name, configdb, path).then(r => {
                        console.log(r);
                    });
                // }
            }
        }
    }
    if(CONFIG.argv.table && CONFIG.argv.table != 'all' ) {
        load_model_service(CONFIG.argv.table.split(','));
    } else {
        console.log('vao dau');
        if(CONFIG.argv.common) {
            db.query("SELECT TABLE_NAME  FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '" + dbname + "';", function (err, rows) {
                var list_table = GlobalFunction.indexArray(rows,'TABLE_NAME');
                var content_table_service = GlobalFile.readFile(CONFIG.APPLiCATION_PATH + 'core/template/common.table.service.tpl');
                var list_obj = [''];
                var list_application_import = [];
                for(var table_name of list_table) {
                    var model = GlobalRender.getModelByTableName(table_name) + 'Service';
                    list_obj.push('CommonTableService.list_obj["' + table_name + '"] = new ' + model + '(user_service._db,user_service.http);');
                    var require_name = 'app/application/' + application_name + '/models/';
                    if(GlobalFunction.contains(table_name, CONFIG.LIST_TABLE_CORE)) {
                        require_name = 'app/common/services/';
                    }
                    require_name += table_name + '.service';
                    list_application_import.push('import { ' + GlobalRender.getModelByTableName(table_name) + 'Service } from "' + require_name + '";');
                }
                list_obj.push('');
                var content = GlobalFunction.replaceContentByObject(content_table_service, {
                    'application_import'    : list_application_import.join("\n"),
                    'attributes'            : list_obj.join("\n\t\t\t")
                })
                GlobalFile.writeFile(APPLiCATION_PATH + 'src/app/application/' + application_name + '/settings-build/common.table.service.ts', content);
                console.log('done');
            })
        } else {
            db.query("SELECT TABLE_NAME  FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '" + dbname + "';", function (err, rows) {
                load_model_service(rows);
            })
        }
    }

// });

