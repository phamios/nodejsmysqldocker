var GlobalActiveRecord = require('../../../core/global_activerecord');
const GlobalFunction = require('../../../core/global_function');
var GlobalFile = require('../../../core/global_file');
var CONFIG = require('../../../config/config');
var Q = require('q');
var Promise = require('promise');
NameViet = GlobalFunction.cloneFunc(GlobalActiveRecord);
NameViet.prototype.tableName = function () {
    return 'name_viet';
}
NameViet.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
NameViet.prototype.LABEL = {
    "id": "Id",
    "name": "Name",
    "gender": "Gender",
    "is_delete": "Is Delete",
    "alias": "Alias"
};
NameViet.prototype.RULE = {
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
    "gender": {
        "type": "varchar",
        "require": {
            "size": 20
        },
        "size": 20
    },
    "is_delete": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "alias": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    }
};

NameViet.get_model_instance = false;
NameViet.get_model = function () {
    if (!NameViet.get_model_instance) {
        NameViet.get_model_instance = new NameViet();
    }
    return NameViet.get_model_instance;
}

NameViet.get_list_all_instance = false;
NameViet.get_list_all = async function () {
    if (!NameViet.get_list_all_instance) {
        NameViet.get_list_all_instance = await NameViet.get_model().findAll();
    }
    return NameViet.get_list_all_instance;
}

NameViet.get_list_name_instance = false;
NameViet.get_list_name = async function () {
    if (!NameViet.get_list_name_instance) {
        var list = await NameViet.get_list_all();
        NameViet.get_list_name_instance = GlobalFunction.indexArray(list, 'name');
    }
    return NameViet.get_list_name_instance;
}

NameViet.get_list_alias_instance = false;
NameViet.get_list_alias = async function () {
    if (!NameViet.get_list_alias_instance) {
        var list = await NameViet.get_list_all();
        NameViet.get_list_alias_instance = GlobalFunction.indexArray(list, 'alias');
    }
    return NameViet.get_list_alias_instance;
}

NameViet.import_name = async function () {
    var model = NameViet.get_model();
    var content = GlobalFile.readFile(CONFIG.APPLiCATION_PATH + '/data/name_viet.txt');
    var list = content.split('\r\n');
    var list_data = [];
    var list_obj = {};
    for (var item of list) {
        if (item && item !== undefined) {
            var list_name = item.split(' ');
            if (item.indexOf(' ') >= 0) {
                list_name.push(item);
            }
            for (var it of list_name) {
                if (it) {
                    if (!list_obj[it]) {
                        list_obj[it] = true;
                        list_data.push({
                            "name": it.toLowerCase(),
                            "gender": "male",
                            "is_delete": 0,
                            "alias": GlobalFunction.stripUnicode(it, ' ')
                        });
                    }
                }
            }
        }
    }
    var a = await model.insertMany(list_data);
    console.log('thanh cong');
}

exports = module.exports = NameViet;