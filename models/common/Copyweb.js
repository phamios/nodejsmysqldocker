var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
Copyweb = GlobalFunction.cloneFunc(GlobalActiveRecord);
Copyweb.prototype.tableName = function() {
    return 'copyweb';
}
Copyweb.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
Copyweb.prototype.LABEL = {
    "id": "Id",
    "linkweb": "Linkweb",
    "content_html": "Content Html",
    "arraycss": "Arraycss",
    "arrayjs": "Arrayjs",
    "arraylink": "Arraylink",
    "status": "Status",
    "directory": "Directory",
    "filename": "Filename",
    "arrayfont": "Arrayfont",
    "arrayimage": "Arrayimage",
    "arrayimg": "Arrayimg",
    "content_html_final": "Content Html Final"
};
Copyweb.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 11
    },
    "linkweb": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "content_html": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "arraycss": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "arrayjs": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "arraylink": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "status": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    },
    "directory": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "filename": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "arrayfont": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "arrayimage": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "arrayimg": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "content_html_final": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    }
};

exports = module.exports = Copyweb;