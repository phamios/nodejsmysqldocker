var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var md5 = require('md5');
var Q = require('q');
var Promise = require('promise');
var settings_token_require = require('./SettingsToken');
var Enum = require('../../config/enum');
var user_require = require('./User');
var MailSettingsRequire = require('./MailSettings');
var MailSettings = new MailSettingsRequire();
Forgotpassword = GlobalFunction.cloneFunc(GlobalActiveRecord);
Forgotpassword.prototype.tableName = function () {
    return 'user';
}
Forgotpassword.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
Forgotpassword.prototype.LABEL = {
    "email": "Email",
};
Forgotpassword.prototype.RULE = {
    'id': {
        type: 'int',
        primary_key: true,
    },
    "email": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 255,
            "email": true,
            "exists": true,
        },
        "size": 255
    },
};

Forgotpassword.prototype.forgot = function (email) {
    var user = new user_require();
    return user.findOne({ email: email || this.email }, true).then(r => {
        if (r && Object.keys(r).length) {
            var settings_token = new settings_token_require();
            return settings_token.create_token('forgot', r.id, 'user').then(r => {
                let attributes = Object.assign({ token: settings_token.token }, user.showAttributes());
                attributes['link'] = CONFIG.LINK_ADMIN + 'authenticate/resetpassword;access_token=' + settings_token.token;
                MailSettings.sendmail_by_template(email, 'Cybersale', attributes, Enum.MAIL_SETTINGS.forgot);
                return Promise.resolve({
                    'code': 200,
                });
            })
        } else {
            return Promise.resolve({
                'code': 400,
                error: { email: 'Email không tồn tại' }
            });
        }
    })
}


exports = module.exports = Forgotpassword;