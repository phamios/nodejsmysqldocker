var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
const GlobalApi = require('../../core/global_api');
const GlobalFile = require('../../core/global_file');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
const exec = require('child_process').exec;
const ImageVerificationResultRequire = require('./ImageVerificationResult');

ImageVerification = GlobalFunction.cloneFunc(GlobalActiveRecord);
ImageVerification.prototype.tableName = function() {
    return 'image_verification';
}
ImageVerification.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
ImageVerification.prototype.LABEL = {
    "id": "Id",
    "name": "Name",
    "subject_id": "Subject Id",
    "link": "Link",
    "type": "Type",
    "content": "Content",
};
ImageVerification.prototype.RULE = {
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
    "subject_id": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "link": {
        "type": "text",
        "require": {
            "empty": true,
            "size": 65535
        }
    },
    "type": {
        "default": "0",
        "type": "int",
        "size": 11
    },
    "content": {
        "type": "text",
        "require": {
            "size": 65535
        }
    },
};

ImageVerification.prototype.uploadImage = function (body) {
    var a = body.name.split('.');
    var that = this;
    if (GlobalFunction.checkImageExtension(a[1])) {
        var def = Q.defer();
        var link = CONFIG.LINK_IMAGE + this.tableName() + '/main/';
        this.name = GlobalFile.getFileNameEmptyIfNameExists(body.name, link);
        var baseurl = CONFIG.LINK_IMAGE_URL + this.tableName() + '/main/';
        this.link = baseurl + this.name;
        body.content = body.content.substr(body.content.indexOf(','));
        var buf = Buffer.from(body.content, 'base64'); // Ta-da
        GlobalFile.writeFile(link + this.name, buf);
        if (CONFIG.argv.env == 'prod') {
            exec('chown -R nginx.nginx ' + link + this.name);
            exec('chmod -R 775 ' + link + this.name);
        }
        this.subject_id = body.subject_id;
        this.type = body.type;
        if(this.type == 0) {
            GlobalApi.kairos_image_up(this.link, this.subject_id).then(rs => {
                that.content = JSON.stringify(rs);
                if(rs.status == 200) {
                    if(!rs.body['Errors'] && rs.body.face_id) {
                        if(body.id_compare) {
                            var model_compare = new ImageVerification();
                            model_compare.findOne(body.id_compare).then(rs_compare => {
                                GlobalApi.kairos_image_verify(model_compare.link, model_compare.subject_id).then(rs_verify => {
                                    model_compare.content = JSON.stringify(rs_verify);
                                    that.model_compare = model_compare.getAttributes();
                                    model_compare.save(false).then(rs_save => {
                                        def.resolve(true);
                                    })
                                });
                            })
                        } else {
                            def.resolve(true);
                        }
                    } else {
                        def.resolve(rs.body['Errors']);
                    }
                } else {
                    def.resolve(rs.body['Errors']);
                }
                
            });
        } else {
            GlobalApi.kairos_image_verify(this.link, this.subject_id).then(rs => {
                that.content = JSON.stringify(rs);
                if(rs.status == 200) {
                    if(!rs.body['Errors']) {
                        def.resolve(true);
                    } else {
                        def.resolve(rs.body['Errors']);
                    }
                } else {
                    def.resolve(rs.body['Errors']);
                }
                
            });
        }
        return def.promise.then(rs => {
            if(rs === true) {
                return that.save(false).then(r => {
                    var attributes = {
                        name: that.name,
                        baseurl: baseurl,
                        link: that.link,
                        id: that.id,
                        model: that.getAttributes(),
                    };
                    if(that.model_compare) {
                        attributes['model_compare'] = that.model_compare;
                    }
                    return Promise.resolve({
                        code: 200,
                        attributes: attributes
                    });
                });
            } else {
                GlobalFile.removeFile(link + this.name);
                return Promise.resolve({
                    code: 400,
                    error: rs.length ? rs[0]['Message'] : '',
                });
            }
        });
    } else {
        return Promise.resolve({
            code: 400,
            error: 'File không đúng định dạng'
        });
    }
}

ImageVerification.prototype.verify_two_image = function (id_model, id_compare) {
    var that = this;
    return that.findAll({id: [id_model,id_compare]}).then(rs => {
        var obj = GlobalFunction.index(rs,'id');
        GlobalApi.kairos_image_verify(obj[id_model].link, obj[id_compare].subject_id).then(rs => {
            var image_verrification_compare = new ImageVerification();
            return image_verrification_compare.findOne({id: id_compare}).then(r => {
                image_verrification_compare.content = JSON.stringify(rs);
                return image_verrification_compare.save(false).then(rs => {
                    return {
                        code        : 200,
                        attributes  : image_verrification_compare.getAttributes(),
                    };
                })
            })
            
        })
    });
}

exports = module.exports = ImageVerification;