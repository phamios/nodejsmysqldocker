var GlobalActiveRecord = require('../../../core/global_activerecord');
const GlobalFunction = require('../../../core/global_function');
const GlobalRequest = require('../../../core/global_request');
var CONFIG = require('../../../config/config');
var Q = require('q');
var Promise = require('promise');
var os = require('os');
Gapo = GlobalFunction.cloneFunc(GlobalActiveRecord);
Gapo.prototype.tableName = function () {
    return 'gabo';
}
Gapo.prototype.db_key = CONFIG.SERVER['mongo_facebook_10672'];
Gapo.prototype.LABEL = {
    "id": "Id",
    "facebook_id": "Facebook Id",
    "token": "Token",
    "name": "Name",
    "status": "Status",
    "is_delete": "Is Delete",
    "group_name": "Group Name",
    "error_message": "Error message"
};
Gapo.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 11
    },
    "facebook_id": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 20
        },
        "size": 20
    },
    "token": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 500
        },
        "size": 500
    },
    "name": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 255
        },
        "size": 255
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
    },
    "group_name": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "error_message": { 
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    }
};

Gapo.crawler = async function() {
    var model = new Gapo();
    return GlobalFunction.runMultiRequest(new Array(20000), async function(data,index){
        var rs = await GlobalRequest.get('https://api.gapo.vn/main/v1.0/user/view?id=' + index);
        console.log(rs,typeof(rs));
        if(typeof(rs) == 'string' && rs.match(/^\{/gi)) {
            rs = JSON.parse(rs);
        }
        if(rs.id) {
            rs._id = rs.id;
            console.log('index',index,rs._id);
            return model.insertMany([rs]);
        } else {
            return Promise.resolve(true);
        }
        
    },1);
}

exports = module.exports = Gapo;