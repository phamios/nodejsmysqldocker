var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
const GlobalFile = require('../../core/global_file');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
const exec = require('child_process').exec;
SettingsImages = GlobalFunction.cloneFunc(GlobalActiveRecord);
SettingsImages.prototype.tableName = function () {
    return 'settings_images';
}
SettingsImages.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
SettingsImages.prototype.LABEL = {
    "id": "Id",
    "name": "Name",
    "link": "Link",
    "baseurl": "Baseurl",
    "did": "Did",
    "image_thumb": "Image Thumb",
    "table_name": "Table Name"
};
SettingsImages.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 8
    },
    "name": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "link": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "baseurl": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "did": {
        "type": "int",
        "size": 11
    },
    "image_thumb": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "table_name": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    }
};

SettingsImages.prototype.uploadImage = function (body) {
    this.table_name = body.table;
    this.did = body.id && body.id !== undefined ? body.id : 0;
    var a = body.name.split('.');
    if (GlobalFunction.checkImageExtension(a[1])) {
        var link = CONFIG.LINK_IMAGE + this.table_name  + '/';
        this.name = GlobalFile.getFileNameEmptyIfNameExists(body.name, link);
        this.baseurl = CONFIG.LINK_IMAGE_URL + this.table_name + '/';
        this.link = this.baseurl + this.name;
        body.content = body.content.substr(body.content.indexOf(','));
        var buf = Buffer.from(body.content, 'base64'); // Ta-da
        GlobalFile.writeFile(link + this.name, buf);
        if (CONFIG.argv.env == 'prod') {
            exec('chown -R nginx.nginx ' + link + this.name);
            exec('chmod -R 775 ' + link + this.name);
        }
        return this.save(false).then(r => {
            return Promise.resolve({
                code: 200,
                attributes: {
                    name: this.name,
                    baseurl: this.baseurl,
                    link: this.link,
                    id: this.id,
                }
            });
        });
    } else {
        return Promise.resolve({
            code: 400,
            error: 'File không đúng định dạng'
        });
    }
}

exports = module.exports = SettingsImages;