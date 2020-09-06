var GlobalActiveRecord = require('../../../core/global_activerecord');
const GlobalFunction = require('../../../core/global_function');
var GlobalFile = require('../../../core/global_file');
var CONFIG = require('../../../config/config');
var Q = require('q');
var Promise = require('promise');
TenDemViet = GlobalFunction.cloneFunc(GlobalActiveRecord);
TenDemViet.prototype.tableName = function() {
    return 'ten_dem_viet';
}
TenDemViet.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
TenDemViet.prototype.LABEL = {
    "id": "Id",
    "name": "Name",
    "is_delete": "Is Delete",
    "alias": "Alias"
};
TenDemViet.prototype.RULE = {
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



TenDemViet.get_model_instance = false;
TenDemViet.get_model = function () {
    if (!TenDemViet.get_model_instance) {
        TenDemViet.get_model_instance = new TenDemViet();
    }
    return TenDemViet.get_model_instance;
}

TenDemViet.get_list_all_instance = false;
TenDemViet.get_list_all = async function () {
    if (!TenDemViet.get_list_all_instance) {
        TenDemViet.get_list_all_instance = await TenDemViet.get_model().findAll();
    }
    return TenDemViet.get_list_all_instance;
}

TenDemViet.get_list_name_instance = false;
TenDemViet.get_list_name = async function () {
    if (!TenDemViet.get_list_name_instance) {
        var list = await TenDemViet.get_list_all();
        TenDemViet.get_list_name_instance = GlobalFunction.indexArray(list, 'name');
    }
    return TenDemViet.get_list_name_instance;
}

TenDemViet.import_name = async function () {
    var model = TenDemViet.get_model();
    var content = GlobalFile.readFile(CONFIG.APPLiCATION_PATH + '/data/ten_dem_viet.txt');
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

exports = module.exports = TenDemViet;