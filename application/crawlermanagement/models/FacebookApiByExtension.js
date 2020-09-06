var GlobalActiveRecord = require('../../../core/global_activerecord');
const GlobalFunction = require('../../../core/global_function');
var CONFIG = require('../../../config/config');
var Q = require('q');
var Promise = require('promise');
FacebookApiByExtension = GlobalFunction.cloneFunc(GlobalActiveRecord);
FacebookApiByExtension.prototype.tableName = function() {
    return 'facebook_api_by_extension';
}
FacebookApiByExtension.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
FacebookApiByExtension.prototype.LABEL = {
    "id": "Id",
    "name": "Name",
    "link": "Link",
    "header": "Header",
    "input_param": "Input Param",
    "attributes_mapping_by_dom": "Attributes Mapping By Dom",
    "attributes_mapping_by_regex": "Attributes Mapping By Regex",
    "end_point": "End Point",
    "Description": "Description",
    "status": "Status",
    "is_delete": "Is Delete"
};
FacebookApiByExtension.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 11
    },
    "name": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 255
        },
        "size": 255
    },
    "link": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 255
        },
        "size": 255
    },
    "header": {
        "type": "text",
        "require": {
            "empty": true,
            "size": 65535
        }
    },
    "input_param": {
        "type": "text",
        "require": {
            "size": 65535
        }
    },
    "attributes_mapping_by_dom": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "attributes_mapping_by_regex": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "end_point": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 255
        },
        "size": 255
    },
    "Description": {
        "type": "text",
        "require": {
            "size": 65535
        }
    },
    "status": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    },
    "is_delete": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    }
};

exports = module.exports = FacebookApiByExtension;