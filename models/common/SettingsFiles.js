var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
const GlobalFile = require('../../core/global_file');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
SettingsFiles = GlobalFunction.cloneFunc(GlobalActiveRecord);
const exec = require('child_process').exec;

SettingsFiles.prototype.tableName = function () {
    return 'settings_files';
}
SettingsFiles.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
SettingsFiles.prototype.LABEL = {
    "id": "Id",
    "name": "Name",
    "link": "Link",
    "baseurl": "Baseurl",
    "did": "Did",
    "table_name": "Table Name"
};
SettingsFiles.prototype.RULE = {
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
    "table_name": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    }
};

SettingsFiles.prototype.uploadFile = function (body) {
    this.table_name = body.table;
    this.did = body.id && body.id !== undefined ? body.id : 0;
    var a = body.name.split('.');
    if (GlobalFunction.checkFileExtension(a[a.length - 1].toLowerCase()) || GlobalFunction.checkImageExtension(a[a.length - 1].toLowerCase())) {
        var link = CONFIG.LINK_IMAGE;
        this.name = GlobalFile.getFileNameEmptyIfNameExists(body.name, link);
        this.baseurl = CONFIG.LINK_IMAGE_URL;
        this.link = this.baseurl + this.name;
        body.content = body.content.substr(body.content.indexOf(','));
        var buf = Buffer.from(body.content, 'base64'); // Ta-da

        GlobalFile.writeFile(link + this.name, buf);
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
            error: body.name + ' Hệ thống chỉ hỗ trợ định dạng tập tin txt,pdf,doc,xls,xlsx,docx,rtf,rar,zip'
        });
    }
}

exports = module.exports = SettingsFiles;