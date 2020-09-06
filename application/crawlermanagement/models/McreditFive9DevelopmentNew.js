var GlobalActiveRecord = require('../../../core/global_activerecord');
const GlobalFunction = require('../../../core/global_function');
var GlobalExcel = require('../../../core/global_excel');
var CONFIG = require('../../../config/config');
var Q = require('q');
var Promise = require('promise');
McreditFive9DevelopmentNew = GlobalFunction.cloneFunc(GlobalActiveRecord);
McreditFive9DevelopmentNew.prototype.tableName = function() {
    return 'mcredit_five9_development_new';
}
McreditFive9DevelopmentNew.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
McreditFive9DevelopmentNew.prototype.LABEL = {
    "casenumber": "Casenumber",
    "tinh_thanh_pho_sinh_song": "Tinh Thanh Pho Sinh Song",
    "tinh_trang_hon_nhan": "Tinh Trang Hon Nhan",
    "hoc_van": "Hoc Van",
    "so_cmnd": "So Cmnd",
    "gb6": "Gb6",
    "is_delete": "Is Delete",
    "status": "Status"
};
McreditFive9DevelopmentNew.prototype.RULE = {
    "casenumber": {
        "type": "varchar",
        "primary_key": true,
        "require": {
            "empty": true,
            "size": 255
        },
        "size": 255
    },
    "tinh_thanh_pho_sinh_song": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "tinh_trang_hon_nhan": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "hoc_van": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "so_cmnd": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "gb6": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "is_delete": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "status": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    }
};

McreditFive9DevelopmentNew.insertData = async function() {
    var link = 'C:/project/db/development.xlsx';
    var model_excel = new GlobalExcel(link);
    var data = model_excel.getData();
    var model = new McreditFive9DevelopmentNew();
    var data_new = [];
    for(var item of data) {
        if(item.casenumber && item.tinh_thanh_pho_sinh_song && item.so_cmnd) {
            data_new.push(item);
        }
    }
    return GlobalFunction.runMultiRequest(GlobalFunction.generateBatchByLimit(data_new,1000), async function(data,index){
        var list = data[index];
        console.log('chay den phan ', index);
        return model.insertMany(list);
    }).then(r => {
        console.log('thanh cong');
        return Promise.resolve(true);
    })
}

exports = module.exports = McreditFive9DevelopmentNew;