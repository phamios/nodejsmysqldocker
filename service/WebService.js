exports = module.exports = WebService;
const request = require('request');
const Q = require('q');
var fs = require('fs');
var http = require('http');
var https = require('https');
const express = require('express');
var bodyParser = require('body-parser');
// var app = express();
var CONFIG = require('../config/config');
var GlobalDB = require('../core/global_db');
var GlobalFunction = require('../core/global_function');
var GlobalFile = require('../core/global_file');
var GlobalRender = require('../core/global_render');
var Promise = require('promise');
var list_require = {};


function get_class_by_req(base_url, link_not_file, req, res, configdb) {
    var table_name = req.query.table_name || req.body.table_name;
    var require_name = base_url + GlobalRender.getModelByTableName(table_name);
    if (!list_require[require_name]) {
        var link_file = require_name.replace('../', CONFIG.APPLiCATION_PATH) + '.js';
        list_require[require_name] = require(GlobalFile.isFile(link_file) ? require_name : link_not_file);
    }
    return new list_require[require_name](req, res, configdb);
}

function get_action_by_req(req) {
    var originalUrl_array = req.originalUrl.replace(/(\/$)|(\?.*)/gi, '').split('/');
    return GlobalFunction.capitalizeFirstLetter(originalUrl_array[originalUrl_array.length - 1]);
}

function get_module_by_req(req) {
    var originalUrl_array = req.originalUrl.replace(/\/$/gi, '').split('/');
    return originalUrl_array.length >= 3 ? GlobalFunction.capitalizeFirstLetter(originalUrl_array[originalUrl_array.length - 3]) : false;
}

function app_link_controller(app, configdb, path, source) {
    var link_controller_backend = CONFIG.APPLiCATION_PATH + path;
    var list_file = GlobalFile.scanDir(link_controller_backend);
    function app_link(name_file, name_controller, match) {
        var type = match[1];
        var action = match[2].toLowerCase();
        var method = match[0].trim();
        var link = '/' + configdb + '/' + name_file + '/' + action;
        var link_require_controller = link_controller_backend + name_controller;
        app[type](link, (req, res) => {
            if (!list_require[link_require_controller]) {
                list_require[link_require_controller] = require(link_require_controller);
            }
            var controller = new list_require[link_require_controller](req, res, configdb);
            return controller[method]().then(rs => {
                if (rs && rs !== undefined && rs.pipe) {
                    rs.pipe.pipe(res);
                } else {
                    // res.set({ 'Content-Length': rs.toString().length });
                    res.send(rs);
                }

            });
        });
    }
    for (var i in list_file) {
        var name_file = list_file[i].replace(/Controller|\.js/gi, '').toLowerCase();
        var link_file = link_controller_backend + list_file[i];
        var content = GlobalFile.readFile(link_file);
        var re = new RegExp('(get|post|put|delete)_action([A-Z][a-z0-9]+) ', 'gi');
        var match = null;
        while (match = re.exec(content)) {
            app_link(name_file, list_file[i], match);
        }
    }
}

function WebService(app, configdb, port) {
    app.use(function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    });

    var list_type = {
        'put': [
            'create', 'copy', 'import'
        ],
        'get': [
            'view', 'read', 'findonedata', 'findalldata', 'getfkmul'
        ],
        'post': [
            'update', 'status', 'method'
        ],
        'delete': [
            'delete'
        ],
    };
    for (var i in list_type) {
        var link_admin = '/' + configdb + '/admin/';
        var link_application = '/' + configdb + '/frontend/';
        for (var j in list_type[i]) {
            app[i](link_admin + list_type[i][j], (req, res) => {
                var controller = get_class_by_req('../backend/controller/', '../backend/controller/AdminController', req, res, configdb);
                return controller['action' + get_action_by_req(req)]().then(rs => {
                    res.send(rs);
                })
            });
            app[i](link_application + list_type[i][j], (req, res) => {
                var module = get_module_by_req(req);
                var base_url = '../application/' + module + '/controller/';
                var link_not_file = '../application/' + module + '/controller/' + GlobalRender.getModelByTableName(configdb) + 'Controller';
                var controller = get_class_by_req(base_url, link_not_file, req, res, configdb);
                return controller['action' + get_action_by_req(req)]().then(rs => {
                    res.send(rs);
                })
            });
        }
    }
    app_link_controller(app, configdb, '/backend/controller/', 'admin');
    app_link_controller(app, configdb, '/application/' + configdb + '/controller/', configdb);

    if(port == 8443) {
        var dir = __dirname.replace(/\\/gi, '/').replace('/service', '/sslcert');
        var privateKey = fs.readFileSync(dir + '/server.key', 'utf8');
        var certificate = fs.readFileSync(dir + '/server.crt', 'utf8');
        var credentials = { key: privateKey, cert: certificate };
        var httpsServer = https.createServer(credentials, app);
        httpsServer.listen(port, function () {
            var host = httpsServer.address().host
            host = host ? host : 'localhost';
            var port = httpsServer.address().port
            console.log("Ung dung Node.js dang lang nghe tai dia chi: https://%s:%s", host, port)
        })
    } else {
        var server = app.listen(port, function () {
            var host = server.address().host
            host = host ? host : 'localhost';
            var port = server.address().port
            console.log("Ung dung Node.js dang lang nghe tai dia chi: http://%s:%s", host, port)

        })
        server.timeout = 10000000;

    }


}