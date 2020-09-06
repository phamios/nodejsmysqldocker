var GlobalActiveRecord = require('{application}core/global_activerecord');
const GlobalFunction = require('{application}core/global_function');
var CONFIG = require('{application}config/config');
var Q = require('q');
var Promise = require('promise');
{model} = GlobalFunction.cloneFunc(GlobalActiveRecord);
{model}.prototype.tableName = function() {
    return '{table_name}';
}
{model}.prototype.db_key = CONFIG.SERVER['{configdb}'];
{model}.prototype.LABEL = {
    
};
{model}.prototype.RULE = {
    
};

exports = module.exports = {model};