exports = module.exports = GlobalController;
var GLOBAL_DB = require('./global_db');
var GlobalFunction = require('./global_function');
var GLOBAL_VALIDATE = require('./global_validate');
var GLOBAL_FILE = require('./global_file');
var CONFIG = require('../config/config');
const Q = require('q');
var list_require_by_table = {};
function GlobalController(req, res, configdb) {
    this.req = req;
    this.res = res;
    this.configdb = configdb;
    this.list_require_by_table = list_require_by_table;
    if(this.req && (this.req.query.table_name || this.req.body.table_name)) {
        this.set_table_name(this.req.query.table_name || this.req.body.table_name, this.configdb);
    }
    this.init();
}

GlobalController.prototype.init = function() {

}

GlobalController.prototype.getParam = function(key) {
    return this.req.query['key'] || this.req.body['key'];
}

GlobalController.prototype.get_class_require_by_table_name = function(table_name, configdb) {
    if(!list_require_by_table[table_name]) {
        var link_admin = CONFIG.APPLiCATION_PATH + 'models/common/' + GlobalFunction.getModelByTableName(table_name) + '.js';
        if(GLOBAL_FILE.isFile(link_admin)) {
            list_require_by_table[table_name] = require(CONFIG.APPLiCATION_PATH + 'models/common/' + GlobalFunction.getModelByTableName(table_name));
        } else {
            list_require_by_table[table_name] = require( CONFIG.APPLiCATION_PATH + 'application/' + configdb + '/models/' + GlobalFunction.getModelByTableName(table_name));
        }
    }
    return list_require_by_table[table_name];
}

GlobalController.prototype.set_table_name = function(table_name, configdb) {
    var model_require = this.get_class_require_by_table_name(table_name, configdb);
    this.model = new model_require();
    this.model.req = this.req;
    // this.configdb = configdb;
    // this.model.setDb(CONFIG.SERVER[this.configdb]);
}

exports = module.exports = GlobalController;