exports = module.exports = GlobalOracledb;
const Q = require('q');
var CONFIG = require('../config/config');
var request = require('request');
function GlobalOracledb(settings) {

}


GlobalOracledb.getFacebookIdByMobilePhone = async function(mobile_phone) {
    var def = Q.defer();
    var link = CONFIG.ORACLEDB_SERVER + 'search_facebook_id?mobile_phone=' + mobile_phone;
    request.get(link, {
        json: {},
    }, function (c_req, c_res) {
        def.resolve(c_res.body);
    });
    return def.promise;
}


GlobalOracledb.getMobilePhoneByFacebookId = async function(facebook_id) {
    var def = Q.defer();
    var link = CONFIG.ORACLEDB_SERVER + 'search_mobile_phone?facebook_id=' + facebook_id;
    request.get(link, {
        json: {},
    }, function (c_req, c_res) {
        def.resolve(c_res.body && c_res.body.mobile_phone ? c_res.body.mobile_phone : '');
    });
    return def.promise;
}
GlobalOracledb.getMobilePhoneByFacebookIds = async function(facebook_ids) {
    var def = Q.defer();
    var link = CONFIG.ORACLEDB_SERVER + 'search_list_mobile_phone?facebook_ids=' + facebook_ids;
    request.get(link, {
        json: {},
    }, function (c_req, c_res) {
        def.resolve(c_res.body);
    });
    return def.promise;
}