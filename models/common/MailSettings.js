var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
var GlobalEmail = require('../../core/global_email');
MailSettings = GlobalFunction.cloneFunc(GlobalActiveRecord);
MailSettings.prototype.tableName = function() {
    return 'mail_settings';
}
MailSettings.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
MailSettings.prototype.LABEL = {
    "id": "Id",
    "mail_key": "Mail Key",
    "mail_title": "Mail Title",
    "mail_subject": "Mail Subject",
    "mail_msg": "Mail Msg",
    "mail_attribute": "Mail Attribute"
};
MailSettings.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 11
    },
    "mail_key": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 255,
            "unique": true
        },
        "size": 255
    },
    "mail_title": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "mail_subject": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 255
        },
        "size": 255
    },
    "mail_msg": {
        "type": "longtext",
        "require": {
            "empty": true,
            "size": 4294967295
        }
    },
    "mail_attribute": {
        "type": "text",
        "require": {
            "size": 65535
        }
    }
};

MailSettings.prototype.sendmail_by_template = function(to, from, attributes, mail_key = false) {
    var that = this;
    function process_sendmail() {
        var def = Q.defer();
        if(that.id) {
            attributes['link_admin'] = CONFIG.LINK_ADMIN;
            attributes['link_public'] = CONFIG.LINK_PUBLIC;
            var html = GlobalFunction.replaceTemplate(that.mail_msg, attributes);
            var subject = GlobalFunction.replaceTemplate(that.mail_subject, attributes);
            var from = 'info@cybersale.vn';
            GlobalEmail.sendmail({
                from        : from,
                to          : to,
                subject     : subject,
                html        : html,
            }).then(r => {
                def.resolve(true);
            });
        } else {
            def.resolve(false);
        }
        return def.promise;
    }
    if(mail_key) {
        return this.findOne({mail_key: mail_key}, true).then(r => {
            return process_sendmail();
        });
    } else {
        return process_sendmail();
    }
}



exports = module.exports = MailSettings;