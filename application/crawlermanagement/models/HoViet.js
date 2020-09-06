var GlobalActiveRecord = require('../../../core/global_activerecord');
const GlobalFunction = require('../../../core/global_function');
var GlobalFile = require('../../../core/global_file');
var CONFIG = require('../../../config/config');
var Q = require('q');
var Promise = require('promise');
HoViet = GlobalFunction.cloneFunc(GlobalActiveRecord);
HoViet.prototype.tableName = function() {
    return 'ho_viet';
}
HoViet.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
HoViet.prototype.LABEL = {
    "id": "Id",
    "name": "Name",
    "is_delete": "Is Delete",
    "alias": "Alias"
};
HoViet.prototype.RULE = {
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



HoViet.get_model_instance = false;
HoViet.get_model = function () {
    if (!HoViet.get_model_instance) {
        HoViet.get_model_instance = new HoViet();
    }
    return HoViet.get_model_instance;
}

HoViet.get_list_all_instance = false;
HoViet.get_list_all = async function () {
    if (!HoViet.get_list_all_instance) {
        HoViet.get_list_all_instance = await HoViet.get_model().findAll();
    }
    return HoViet.get_list_all_instance;
}

HoViet.get_list_name_instance = false;
HoViet.get_list_name = async function () {
    if (!HoViet.get_list_name_instance) {
        var list = await HoViet.get_list_all();
        HoViet.get_list_name_instance = GlobalFunction.indexArray(list, 'name');
    }
    return HoViet.get_list_name_instance;
}

HoViet.import_name = async function () {
    var model = HoViet.get_model();
    var content = GlobalFile.readFile(CONFIG.APPLiCATION_PATH + '/data/ho_viet.txt');
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

HoViet.get_list_alias_instance = false;
HoViet.get_list_alias = async function () {
    if (!HoViet.get_list_alias_instance) {
        var list = await HoViet.get_list_all();
        HoViet.get_list_alias_instance = GlobalFunction.indexArray(list, 'alias');
    }
    return HoViet.get_list_alias_instance;
}

exports = module.exports = HoViet;