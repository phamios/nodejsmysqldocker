const Q = require('q');
const express = require('express');
var axios = require("axios");
var Promise = require('promise');
var URL = require('url');
var request = require('request');
var GlobalRequest = require('./core/global_request');
var GlobalFunction = require('./core/global_function');
var FacebookGraphApiMapping = require('./application/crawlermanagement/models/FacebookGraphApiMapping');
var FacebookToken = require('./application/crawlermanagement/models/FacebookToken');
var Customer = require('./application/crawlermanagement/models/Customer');
var Proxy = require('./application/crawlermanagement/models/Proxy');
FacebookToken.init_server();
Proxy.init_server();
Customer.init_customer();
FacebookGraphApiMapping.init_server();

async function run() {
    var url = 'https://graph.facebook.com/100000201729964/picture/?type=small';
    request.get(url, function(error, response){
        if(response) {
            console.log({ 
                image: Buffer.from(response.body).toString('base64') 
            });
        } else {
            console.log('error', error);
        }
    });
}
run();