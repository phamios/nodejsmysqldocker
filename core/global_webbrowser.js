exports = module.exports = GlobalWebbrowser;
const Q = require('q');
var CONFIG = require('../config/config');
var request = require('request');
function GlobalWebbrowser(settings) {

}


GlobalWebbrowser.get_facebook_id_by_search_query = async function(search_query) {
    var def = Q.defer();
    var link = CONFIG.OPENWEBSEARCH + search_query;
    request.get(link, {
        json: {},
    }, function (c_req, c_res) {
        def.resolve(c_res.body);
    });
    return def.promise;
}