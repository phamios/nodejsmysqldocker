var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
Sendmail = GlobalFunction.cloneFunc(GlobalActiveRecord);
Sendmail.prototype.tableName = function() {
    return 'sendmail';
}
Sendmail.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
Sendmail.prototype.LABEL = {};
Sendmail.prototype.RULE = {};

exports = module.exports = Sendmail;