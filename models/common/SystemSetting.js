var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
SystemSetting = GlobalFunction.cloneFunc(GlobalActiveRecord);

const DB = require('mysql-activerecord');
var db = new DB.Adapter(CONFIG.MYSQL[CONFIG.SERVER['crawlermanagement']]);

SystemSetting.prototype.tableName = function() {
    return 'system_setting';
}
SystemSetting.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
SystemSetting.prototype.LABEL = {
    "id": "Id",
    "option_key": "Option Key",
    "option_value": "Option Value",
    "lang": "Lang",
    "type": "Type"
};
SystemSetting.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 11
    },
    "option_key": {
        "type": "varchar",
        "require": {
            "size": 255,
            "unique": true,
            "empty": true
        },
        "size": 255
    },
    "option_value": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "lang": {
        "default": "en",
        "type": "varchar",
        "require": {
            "size": 20
        },
        "size": 20
    },
    "type": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    }
};

SystemSetting.prototype.getValue = function(key) {
    return this.findOne({'option_key' : key},  true).then(r => {
        var value = null;
        if(r) {
            value = this.option_value;
        }
        return Promise.resolve(value);
    });
}

SystemSetting.prototype.setValue = function(key, value) {
    var query = "update system_setting set option_value = '" + value + "' where option_key = '" + key + "'";
    return this.query(query);
}

SystemSetting.prototype.getValues = function(key) {
    return this.findAll({},  true).then(r => {
        var value = null;
        if(r) {
            value = r;
        }
        return Promise.resolve(value);
    });
}

SystemSetting.setInformationEmail = function() {
    var system_setting = new SystemSetting();
    return system_setting.findAll({'option_key':['mail_server_host','mail_server_port','mail_server_mailer','mail_server_smtp_secure','mail_server_email','mail_server_password']}).then(r => {
        var rs = GlobalFunction.indexObj(r,'option_key','option_value');
        return Promise.resolve({
            host: rs.mail_server_host,
            port: rs.mail_server_port,
            secure: false,
            requireTLS: true,
            from: rs.mail_server_email,
            auth: {
                user: rs.mail_server_email,
                pass: rs.mail_server_password
            }
        });
    });
}

exports = module.exports = SystemSetting;