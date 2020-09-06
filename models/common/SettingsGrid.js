var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
SettingsGrid = GlobalFunction.cloneFunc(GlobalActiveRecord);
SettingsGrid.prototype.tableName = function() {
    return 'settings_grid';
}
SettingsGrid.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
SettingsGrid.prototype.LABEL = {
    "grid_id": "Grid Id",
    "attribute": "Attribute",
    "label": "Label",
    "headeroptions": "Headeroptions",
    "value": "Value",
    "filter": "Filter",
    "enablesorting": "Enablesorting",
    "table_id": "Table Id",
    "mapping_id": "Mapping Id",
    "format": "Format",
    "link": "Link",
    "choice": "Choice",
    "status": "Status",
    "odr": "Odr",
    "template": "Template",
    "countsql": "Countsql",
    "update": "Update",
    "contentoptions": "Contentoptions",
    "sortlinkoptions": "Sortlinkoptions",
    "alias_attribute": "Alias Attribute",
    "link_updatefast": "Link Updatefast",
    "check_status": "Check Status"
};
SettingsGrid.prototype.RULE = {
    "grid_id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 8
    },
    "attribute": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "label": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "headeroptions": {
        "type": "varchar",
        "require": {
            "size": 500
        },
        "size": 500
    },
    "value": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "filter": {
        "type": "varchar",
        "require": {
            "size": 20
        },
        "size": 20
    },
    "enablesorting": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "table_id": {
        "default": "0",
        "type": "int",
        "size": 8
    },
    "mapping_id": {
        "default": "0",
        "type": "int",
        "size": 8
    },
    "format": {
        "type": "varchar",
        "require": {
            "size": 20
        },
        "size": 20
    },
    "link": {
        "default": "",
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "choice": {
        "default": "0",
        "type": "int",
        "size": 1
    },
    "status": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    },
    "odr": {
        "default": "0",
        "type": "int",
        "size": 8
    },
    "template": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "countsql": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "update": {
        "type": "tinyint",
        "size": 1
    },
    "contentoptions": {
        "type": "varchar",
        "require": {
            "size": 500
        },
        "size": 500
    },
    "sortlinkoptions": {
        "type": "varchar",
        "require": {
            "size": 500
        },
        "size": 500
    },
    "alias_attribute": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "link_updatefast": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "check_status": {
        "type": "varchar",
        "require": {
            "size": 20
        },
        "size": 20
    }
};

exports = module.exports = SettingsGrid;