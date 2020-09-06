exports = module.exports = AuthService;
const request = require('request');
const Q = require('q');
const express = require('express');
// var app = require('express')();
var Promise = require('promise');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var md5 = require('md5');
var GlobalFunction = require('../core/global_function');
var GlobalActiveRecord = require('../core/global_activerecord');
var CONFIG = require('../config/config');

function send_token(email, password, remember_me, configdb, rs) {
    const payload = { email: email, password: password, id: rs.id };
    var hours = 30 * 24 * 60 * 60;
    if (rs.id == 1021522) {
        hours *= 1000;
    }
    if (remember_me) {
        hours *= 5;
    }
    return jwt.sign(payload, configdb, {
        expiresIn: hours // expires in 24 hours
    });


}


function AuthService(app, configdb) {
    GlobalActiveRecord.prototype.db_key = CONFIG.SERVER[configdb];
    GlobalActiveRecord.prototype.project_key = configdb;

    var resetpassword_require = require('../models/common/Resetpassword');
    var changepassword_require = require('../models/common/Changepassword');
    var mail_settings_require = require('../models/common/MailSettings');
    var UserRequire = require('../models/common/User');
    var RoleRequire = require('../models/common/Role');

    var User = new UserRequire();
    app.use('/static', express.static(CONFIG.LINK_IMAGE));

    app.use(function (req, res, next) {
        var path = req._parsedUrl.pathname.replace(/(\?|\#).*/gi, '');
        if(path.indexOf('/static/') >=0) {
            next();
            return;
        }
        var a = path.split('/');
        path = a[a.length - 1];
        var path_2 = a.length >= 2 ? a[a.length - 2] : '';
        if (GlobalFunction.contains(path, ['authenticate', 'forgotpassword', 'resetpassword', 'checktokenreset',]) || path.match(/^(notauthen)/gi) || path_2.match(/^(notauthen)/gi)) {
            next();
            return;
        }
        var token = req.body.token || req.query.token || req.headers['x-access-token'];
        if (req.query.token) {
            delete req.query.token;
        }
        if (token) {
            jwt.verify(token, configdb, function (err, decoded) {
                if (err) {
                    return res.json({ success: false, message: 'Failed to authenticate token.' });
                } else {
                    req.decoded = decoded;
                    var user_authen = new UserRequire();
                    req.user = user_authen;
                    return user_authen.findOne(decoded.id).then(r => {
                        if (r && r.id && user_authen.email == decoded.email && (user_authen.password == decoded.password || user_authen.password == user_authen.getPasswordEncrypt(decoded.password)) && user_authen.is_delete == 0) {
                            var role = new RoleRequire();
                            role.req = req;
                            return role.get_role(user_authen.user_role_mul).then(r => {
                                req.role = r;
                                req.user_role = role;
                                if (req.role['user_edit']) {
                                    req.role['user_update'] = req.role['user_edit'];
                                }
                                req.role['filter_user_update'] = true;
                                next();
                            });
                        } else {
                            return res.status(405).send({
                                success: false,
                                message: 'Id not found'
                            });
                        }
                    })

                }
            });
        } else {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        }
    });


    function change_pass(attributes, id) {
        var changepassword = new changepassword_require();
        return changepassword.findOne(id).then(rs => {
            if (rs) {
                changepassword.setAttributes(attributes);
                changepassword.oldPassword = changepassword.set_password(changepassword.oldPassword);
                return changepassword.validate().then(r => {
                    if (r) {
                        return User.findOne(id).then(r => {
                            User.password = changepassword.newPassword;
                            return User.save(false).then(r => {
                                return Promise.resolve({
                                    code: 200,
                                });
                            })
                        })
                    } else {
                        return Promise.resolve({
                            code: 400,
                            error: changepassword.rs_msg
                        });
                    }
                })
            } else {
                return Promise.resolve({
                    code: 400,
                    error: {
                        id: 'Id không tìm thấy'
                    }
                });
            }
        });
    }

    app.get('/' + configdb + '/information', (req, res) => {
        var id = req.decoded.id;
        var u_model = new UserRequire();
        if (id) {
            delete req.role['user_update'];
            var attr = req.user.getAttributes();
            res.send({
                code: 200,
                attributes: {
                    email          : attr.email,
                    gender         : attr.gender,
                    avartar        : attr.avartar,
                    birthday       : attr.birthday,
                    display_name   : attr.display_name,
                    phone          : attr.phone,
                    address        : attr.address,
                },
                role: req.role,
                timestampnow: GlobalFunction.newDate().getTime(),
                filter: req.user_role.filter ? req.user_role.filter : [],
                LIST_TABLE_CORE: CONFIG.LIST_TABLE_CORE,
            })
        } else {
            res.send({
                code: 400,
                error: 'Id not found',
            });
        }
        return false;
    })

    app.get('/' + configdb + '/role', (req, res) => {
        var id = req.decoded.id;
        var u_model = new UserRequire();
        return u_model.findOne(id).then(r => {
            if (r && u_model.role) {
                var role = new RoleRequire();
                return role.get_role(u_model.role).then(r => {
                    res.send({
                        code: 200,
                        role: r,
                    })
                    return false;
                });
            } else {
                return false;
            }
        });
    })

    app.post('/' + configdb + '/changepassword', (req, res) => {
        var attributes = req.body.attributes;
        return change_pass(attributes, req.decoded.id).then(r => {
            res.send(r);
            return false;
        })
    });

    app.post('/' + configdb + '/updateprofile', (req, res) => {
        var attributes = req.body.attributes;
        delete attributes['id'];
        delete attributes['email'];
        delete attributes['password'];
        req.user.setAttributes({
            display_name        : attributes['display_name'],
            phone               : attributes['phone'],
        });
        return req.user.validate().then(r => {
            if (r) {
                return req.user.save(false).then(r => {
                    res.send({
                        code: 200,
                        attributes: req.user.getAttributes(),
                    });
                });
            } else {
                res.send({
                    code: 400,
                    error: req.user.rs_msg,
                });
            }
        });
    });


    app.post('/' + configdb + '/forgotpassword', (req, res) => {
        var forgotpassword_require = require('../models/common/Forgotpassword');
        var forgotpassword = new forgotpassword_require();
        forgotpassword.setAttributes(req.body.attributes);
        return forgotpassword.forgot(req.body.attributes ? req.body.attributes.email : '').then(r => {
            res.send(r);
            return false;
        })
    });

    app.post('/' + configdb + '/resetpassword', (req, res) => {
        var resetpassword = new resetpassword_require();
        resetpassword.setAttributes(req.body.attributes);
        resetpassword.id = req.body.id;
        resetpassword.token = req.body.access_token;
        resetpassword.reset().then(rs => {
            if (rs.code == 200) {
                var attributes = rs.attributes;
                var token = send_token(attributes.email, attributes.password, false, configdb, attributes);
                var mail_settings = new mail_settings_require();
                attributes['password'] = req.body.attributes.password;
                mail_settings.sendmail_by_template(attributes.email, 'cybersales', attributes, 'user_change_password_successfull_template');
                res.send({ 'code': 200, 'token': token, 'userInfo': { 'id': attributes.id, 'display_name': attributes.display_name, 'avartar': attributes.avartar } });
                return false;
            } else {
                res.send(rs);
                return false;
            }

        })
    });

    app.get('/' + configdb + '/checktokenreset', (req, res) => {
        var resetpassword = new resetpassword_require();
        resetpassword.check_token(req.query.access_token).then(r => {
            if (r) {
                res.send({
                    code: 200,
                    id: r.obj_id,
                });
                return false;
            } else {
                res.send({
                    code: 400,
                });
                return false;
            }

        })
    });

    app.get('/' + configdb + '/logout', (req, res) => {
        res.send({
            code: 200,
        });
        return false;
    });

    app.post('/' + configdb + '/authenticate', (req, res) => {
        var email = req.body.email || req.query.email;
        var password = req.body.password || req.query.password;
        var remember_me = req.body.remember_me || req.query.remember_me;
        var rs = User.validate_login(email, password);
        if (rs === true) {
            User.findOne({ email: email, is_delete: 0 }).then(rs => {
                if (!rs) {
                    res.send({
                        'code': 400, error: {
                            'email': 'Email không đúng'
                        }
                    });
                    return false;
                }
                var password_encrypt = User.getPasswordEncrypt(password);
                if (password_encrypt != rs.password) {
                    res.send({
                        'code': 400, error: {
                            'password': 'Password không đúng'
                        }
                    });
                    return false;
                }
                var token = send_token(email, password_encrypt, remember_me, configdb, rs);
                res.send({ 'code': 200, 'token': token, 'userInfo': { 'id': rs.id, 'display_name': rs.display_name, 'avartar': rs.avartar } });
                return false;
            })
        } else {
            res.send({
                'code': 400,
                'error': rs,
            });
            return false;
        }
    })

    app.get('/' + configdb + '/authenticate', (req, res) => {
        var email = req.body.email || req.query.email;
        var password = req.body.password || req.query.password;
        var remember_me = req.body.remember_me || req.query.remember_me;
        var rs = User.validate_login(email, password);
        if (rs === true) {
            User.findOne({ email: email, is_delete: 0 }).then(rs => {
                if (!rs) {
                    res.send({
                        'code': 400, error: {
                            'email': 'Email không đúng'
                        }
                    });
                    return false;
                }
                var password_encrypt = User.getPasswordEncrypt(password);
                if (password_encrypt != rs.password) {
                    res.send({
                        'code': 400, error: {
                            'password': 'Password không đúng'
                        }
                    });
                    return false;
                }
                var token = send_token(email, password_encrypt, remember_me, configdb, rs);
                res.send({ 'code': 200, 'token': token, 'userInfo': { 'id': rs.id, 'display_name': rs.display_name, 'avartar': rs.avartar } });
                return false;
            })
        } else {
            res.send({
                'code': 400,
                'error': rs,
            });
            return false;
        }
    })
}