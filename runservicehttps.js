const request = require('request');
const Q = require('q');
const DB = require('mysql-activerecord');
const express = require('express');
var bodyParser = require('body-parser');
var app = express();
var GlobalExcel = require('./core/global_excel');
var CONFIG = require('./config/config');
var GlobalDB = require('./core/global_db');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
process.on('uncaughtException', function (err) {
    console.error("Node NOT Exiting...", err);
});
var Promise = require('promise');
app.use(bodyParser({ limit: '50mb' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
var port = 8443;
if (!CONFIG.argv.service) {
    CONFIG.argv.service = 'crawlermanagement';
}

var auth_service = require('./service/AuthService');
auth_service(app, CONFIG.argv.service);
var web_service = require('./service/WebService');
web_service(app, CONFIG.argv.service, port);
