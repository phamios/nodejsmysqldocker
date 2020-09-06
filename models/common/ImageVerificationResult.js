var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
ImageVerificationResult = GlobalFunction.cloneFunc(GlobalActiveRecord);
ImageVerificationResult.prototype.tableName = function() {
    return 'image_verification_result';
}
ImageVerificationResult.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
ImageVerificationResult.prototype.LABEL = {
    "id": "Id",
    "id_model": "Id Model",
    "id_compare": "Id Compare",
    "content": "Content",
    "length": "Length"
};
ImageVerificationResult.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 11,
        "require": {
            "empty": true
        }
    },
    "id_model": {
        "type": "int",
        "require": {
            "empty": true
        },
        "size": 11,
        "fk": {
            "table": "image_verification",
            "ref_id": "id"
        }
    },
    "id_compare": {
        "type": "int",
        "require": {
            "empty": true
        },
        "size": 11,
        "fk": {
            "table": "image_verification",
            "ref_id": "id"
        }
    },
    "content": {
        "type": "text",
        "require": {
            "empty": true,
            "size": 65535
        }
    },
    "fk_table_id_model": {
        "type": "any"
    },
    "fk_table_id_compare": {
        "type": "any"
    },
    "length": {
        "default": "1",
        "type": "int",
        "size": 11
    }
};

exports = module.exports = ImageVerificationResult;