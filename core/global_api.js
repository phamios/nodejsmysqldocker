exports = module.exports = GlobalApi;
var Q = require('q');
var request = require('request');

function GlobalApi() {
}

GlobalApi.post = function (link, params) {
    var defer = Q.defer();
    request.post(link, { json: params, timeout: 60000 }, function (error,c_req, body) {
        defer.resolve(error ? error : body);
    });
    return defer.promise;
}