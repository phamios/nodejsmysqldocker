var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var md5 = require('md5');
var Q = require('q');
var Promise = require('promise');
var settings_token_require = require('./SettingsToken');
var user_require = require('./User');
Resetpassword = GlobalFunction.cloneFunc(GlobalActiveRecord);
Resetpassword.prototype.tableName = function () {
    return 'user';
}
Resetpassword.prototype.token = false;
Resetpassword.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
Resetpassword.prototype.LABEL = {
    "password": "Password",
    "confirm_password": "Confirm password",
    "access_token": "access_token",
};
Resetpassword.prototype.RULE = {
    'id': {
        type: 'int',
        primary_key: true,
    },
    "password": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 255,
            "password": true
        },
        "size": 255
    },
    "confirm_password": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 255,
            "password": true,
            "same": {
                "attribute": "password"
            }
        },
        "size": 255
    },
};

Resetpassword.prototype.reset = function () {
    var that = this;
    return this.validate().then(r => {
        if (r === true) {
            var user = new user_require();
            return user.findOne(this.id, true).then(r => {
                if (r) {
                    r['password'] = this.password;
                    user.password = user.set_password(this.password);
                    var settings_token = new settings_token_require();
                    return settings_token.deleteAll({token: this.token}).then(r => {
                        return user.save(false).then(r1 => {
                            return Promise.resolve({
                                'code': 200,
                                'attributes': user.getAttributes(),
                            });
                        })
                    })
                } else {
                    return Promise.resolve({
                        'code': 400,
                        error: {id: 'Id Not found'},
                    });
                }
            })

        } else {
            return Promise.resolve({
                'code': 400,
                error: this.rs_msg,
            });
        }
    })
}

Resetpassword.prototype.check_token = function (token) {
    var settings_token = new settings_token_require();
    return settings_token.findOne({ token: token }, true);
}

exports = module.exports = Resetpassword;