exports = module.exports = GlobalRequest;
var Q = require('q');
const http = require("http");
const https = require("https");
const fs = require("fs");
var request = require('request');

function GlobalRequest() { }

GlobalRequest.get = async function (link, options) {
    var def = Q.defer();
    request.get(link, options, function (c_req, c_res) {
        console.log(c_req);
        if (c_res && c_res.body) {
            def.resolve(c_res.body);
        } else {
            def.resolve(false);
        }
    })
    return def.promise;
}

GlobalRequest.post = async function (link, options) {
    var def = Q.defer();
    var fl = true;
    setTimeout(function () {
        if (fl) {
            def.resolve(false);
        }
    }, 200000);
    request.post(link, options, function (c_req, c_res) {
        fl = false;
        if (c_res && c_res.body) {
            def.resolve(c_res.body);
        } else {
            def.resolve(false);
        }
    })

    return def.promise;
}

GlobalRequest.file = async function (link, file_name) {
    var def = Q.defer();
    var file = false;
    if(file_name && file_name !== undefined) {
        file = fs.createWriteStream(file_name);
    }

    http.get(link).on('response', function (response) {
        if (file_name && file_name !== undefined) {
            var stream = response.pipe(file);
            stream.on("finish", function () {
                def.resolve(true);
            });
        } else {
            var body = '';
            var i = 0;
            response.on('data', function (chunk) {
                i++;
                body += chunk;
            });
            response.on('end', function () {
                def.resolve(body);
            });
        }
    });
    return def.promise;
}

