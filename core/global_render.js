exports = module.exports = GlobalRender;
var Q = require('q');
var config = require('../config/config');
var Promise = require('promise');
var GlobalFile = require('./global_file');
var GlobalDB = require('./global_db');
var GlobalFunction = require('./global_function');

function GlobalRender() { }


GlobalRender.getModelByTableName = function (table_name) {
    var array_table_name = table_name.split('_');
    var model = '';
    for (var i in array_table_name) {
        model += GlobalFunction.capitalizeFirstLetter(array_table_name[i]);
    }
    return model;
}

GlobalRender.getLabelByColumnName = function (column_name) {
    var array_column_name = column_name.split('_');
    var label = [];
    for (var i in array_column_name) {
        label.push(GlobalFunction.capitalizeFirstLetter(array_column_name[i]));
    }
    return label.join(' ');
}

GlobalRender.getLabelFromModelContent = function (model, content) {
    reg = new RegExp(model + '\\.prototype\\.LABEL = \\{[^~]+?(\\n\};)', 'gi');
    var m = content.match(reg);
    eval(m[0].replace(model + '.prototype.LABEL', 'var MODEL_LABEL'));
    return MODEL_LABEL;
}

GlobalRender.writeLabelIntoModelContent = function (model, label, content) {
    reg = new RegExp(model + '\\.prototype\\.LABEL = \\{[^~]+?(\\n\};)', 'gi');
    content_m = GlobalFunction.stringify(label);
    content = content.replace(reg, model + ".prototype.LABEL = " + content_m + ";");
    return content;
}

GlobalRender.getRuleFromModelContent = function (model, content) {
    reg = new RegExp(model + '\\.prototype\\.(RULE|ROLE) = \\{[^~]+?(\\n\};)', 'gi');
    var m = content.match(reg);
    var r = new RegExp(model + '.prototype.(RULE|ROLE)', 'gi');
    eval(m[0].replace(r, 'var MODEL_RULE'));
    return MODEL_RULE;
}

GlobalRender.writeRuleIntoModelContent = function (model, rule, content) {
    reg = new RegExp(model + '\\.prototype\\.(RULE|ROLE) = \\{[^~]+?(\\n\};)', 'gi');
    var rule_func_str = GlobalFunction.edit_function_to_str(rule);
    content_m = GlobalFunction.stringify(rule_func_str).replace(/"function[^~]+?(\}")/gi,function(m){
        m = m.replace(/^"|"$/gi,'');
        return m;
    });
    content_m = content_m.replace(/\\"/gi,'"');
    content_m = content_m.replace(/\\'/gi,"'");
    content_m = content_m.replace(/\\n/gi,'\n');
    content_m = content_m.replace(/\\r/gi,'\r');
    content = content.replace(reg, model + ".prototype.RULE = " + content_m + ";");
    return content;
}

GlobalRender.renderModel = function (table_name, configdb, path) {
    if (path[path.length - 1] != '/') {
        path += '/';
    }
    var dot_array = path.split('/');
    var dot = '';
    for (var i = 0, length = dot_array.length - 1; i < length; i++) {
        dot += '../';
    }
    if (!(path[0] == '/' || path[0] == 'C')) {
        path = config.APPLiCATION_PATH + path;
    }
    var model = GlobalRender.getModelByTableName(table_name);
    path += model + '.js';
    if (GlobalFile.isFile(path)) {
        return GlobalRender.getFullColumnTable(table_name, configdb).then(r => {
            var content = GlobalFile.readFile(path);
            var ROLE = r.ROLE;
            var LABEL = r.LABEL;

            ROLE = GlobalFunction.extendFull(GlobalRender.getRuleFromModelContent(model, content), ROLE);
            LABEL = GlobalFunction.extendFull(LABEL, GlobalRender.getLabelFromModelContent(model, content));
            content = GlobalRender.writeLabelIntoModelContent(model, LABEL, content);
            content = GlobalRender.writeRuleIntoModelContent(model, ROLE, content);
            GlobalFile.writeFile(path, content);
            return Promise.resolve({
                table_name: table_name,
                configdb: configdb,
                path: path
            });
        });
    } else {
        var content_template = GlobalFile.readFile(config.APPLiCATION_PATH + 'core/template/model.tpl');
        var attribute_replace = {
            'table_name': table_name,
            'model': model,
            'configdb': configdb,
            'application': dot,
        };
        var content = GlobalFunction.replaceContentByObject(content_template, attribute_replace);
        return GlobalRender.getFullColumnTable(table_name, configdb).then(r => {
            content = GlobalRender.writeLabelIntoModelContent(model, r.LABEL, content);
            content = GlobalRender.writeRuleIntoModelContent(model, r.ROLE, content);
            GlobalFile.writeFile(path, content);
            return Promise.resolve({
                table_name: table_name,
                configdb: configdb,
                path: path
            });
        });

    }
}




GlobalRender.getLabelFromServiceContent = function (model, content) {
    var reg = new RegExp('return[ ]+Object\\.assign[ ]*\\([ ]*super\\.attributeLabels\\([ ]*\\)[ ]*,[ ]*\\{[^~]+?(\\}\\);)', 'gi');
    var m = content.match(reg);
    var msg = m[0].replace(/return[ ]+Object\.assign[ ]*\([ ]*super\.attributeLabels\([ ]*\)[ ]*,[ ]*/gi, 'var MODEL_RULE = ').replace('});', '}');
    eval(msg);
    return MODEL_RULE;
}

GlobalRender.writeLabelIntoServiceContent = function (model, label, content) {
    var reg = new RegExp('return[ ]+Object\\.assign[ ]*\\([ ]*super\\.attributeLabels\\([ ]*\\)[ ]*,[ ]*\\{[^~]+?(\\}\\);)', 'gi');
    content_m = GlobalFunction.stringify(label).replace(/\n/gi, "\n        ");
    content = content.replace(reg, "return Object.assign(super.attributeLabels(), " + content_m + ");");
    return content;
}

GlobalRender.getRuleFromServiceContent = function (model, content) {
    var reg = new RegExp('return[ ]+Object\\.assign[ ]*\\([ ]*super\\.rule\\([ ]*\\)[ ]*,[ ]*\\{[^~]+?(\\}\\);)', 'gi');
    var m = content.match(reg);
    var msg = m[0].replace(/return[ ]+Object\.assign[ ]*\([ ]*super\.rule\([ ]*\)[ ]*,[ ]*/gi, 'var MODEL_RULE = ').replace('});', '}');
    eval(msg);
    return MODEL_RULE;
}

GlobalRender.writeRuleIntoServiceContent = function (model, rule, content) {
    var reg = new RegExp('return[ ]+Object\\.assign[ ]*\\([ ]*super\\.rule\\([ ]*\\)[ ]*,[ ]*\\{[^~]+?(\\}\\);)', 'gi');
    content_m = GlobalFunction.stringify(rule).replace(/\n/gi, "\n        ");
    content = content.replace(reg, "return Object.assign(super.rule(), " + content_m + ");");
    return content;
}


GlobalRender.getAttributeServiceFromContent = function (content) {
    var reg = new RegExp('extends[ ]*ServiceGlobal[ ]*\\{[^~]+?([a-zA-Z0-9]+[ ]*\\()', 'gi');
    var m = content.match(reg);
    var value = m[0].replace(/(extends[ ]*ServiceGlobal[ ]*\{)|([a-zA-Z0-9]+[ ]*\()/gi, '').trim();
    var a = value.split("\n");
    var rs = {};
    for (var i in a) {
        var value = a[i].trim();
        if (value) {
            var b = value.split(':');
            if (b.length == 2 && value.indexOf(';') > -1) {
                rs[b[0]] = b[1].replace(';', '');
            }
        }
    }
    return rs;
}

GlobalRender.getAttributeService = function (rule) {
    var rs = {};
    for (var i in rule) {
        rs[i] = rule[i]['type'] == 'array' ? 'any' : rule[i]['type'];
    }
    return rs;
}

GlobalRender.writeAttributeIntoServiceContent = function (attributes, content) {
    var m = content.match(/extends[ ]*ServiceGlobal[ ]*{[^~]+?([a-zA-Z0-9_]+[ ]*\()/gi);
    var search = m[0];
    var replace = search;
    var add = [];
    for (var i in attributes) {
        if (i != 'id') {
            var regex = new RegExp(i + '[ ]*\\:[ ]*[a-zA-Z]+[^;]*;', 'gi');
            if (replace.match(regex)) {
                var regex2 = new RegExp(i + '[ ]*\\:[ ]*[a-zA-Z]+[ ]*=[ ]*[^;]+;', 'gi');
                if (!replace.match(regex2)) {
                    replace = replace.replace(regex, i + ':' + GlobalFunction.getType(attributes[i]) + ';');
                }
            } else {
                add.push(i + ": " + GlobalFunction.getType(attributes[i]) + ';');
            }
        }
    }
    if (add.length) {
        var attributes_label = "\n    " + add.join("\n    ") + "\n    ";
        replace = replace.replace(/[\n]*[\t]*[a-zA-Z0-9_]+[ ]*\(/gi, function (m) {
            return attributes_label + m;
        });
    }
    replace = replace.replace('{attributes}', '');
    replace = replace.replace(/\n\t\n|\n\n/gi, "\n");
    return content.replace(search, replace);
}

GlobalRender.prettyAttributeServer = function (obj) {
    var rs = {};
    for (var i in obj) {
        var k = i;
        if (GlobalFunction.contains(i, ['delete', 'update'])) {
            k = 'field_' + k;
        }
        rs[k] = obj[i];
    }
    return rs;
}

GlobalRender.renderService = function (table_name, configdb, path) {
    var dot_array = path.split('/');
    var dot = path.match(/common\/service/gi) ? './' : '../../../common/services/';
    var model = GlobalRender.getModelByTableName(table_name) + 'Service';
    path += table_name + '.service.ts';
    if (GlobalFile.isFile(path)) {
        return GlobalRender.getFullColumnTable(table_name, configdb, 1).then(r => {
            var content = GlobalFile.readFile(path);
            var ROLE = GlobalRender.prettyAttributeServer(r.ROLE);
            var LABEL = GlobalRender.prettyAttributeServer(r.LABEL);
            ROLE = GlobalFunction.extendFull(GlobalRender.getRuleFromServiceContent(model, content), ROLE);
            LABEL = GlobalFunction.extendFull(LABEL, GlobalRender.getLabelFromServiceContent(model, content));
            content = GlobalRender.writeLabelIntoServiceContent(model, LABEL, content);
            content = GlobalRender.writeRuleIntoServiceContent(model, ROLE, content);
            var attributes = GlobalFunction.extendFull(GlobalRender.getAttributeServiceFromContent(content), GlobalRender.getAttributeService(ROLE));
            content = GlobalRender.writeAttributeIntoServiceContent(attributes, content);
            content = content.replace(/import[ ]*{[ ]*ServiceGlobal[ ]*}[ ]*from[ ]*\'[^~]+?(service\/service\.global)/gi, "import { ServiceGlobal } from '" + dot + "service/service.global");
            GlobalFile.writeFile(path, content);
            return Promise.resolve({
                table_name: table_name,
                configdb: configdb,
                path: path
            });
        });
    } else {
        var content_template = GlobalFile.readFile(config.APPLiCATION_PATH + 'core/template/service.tpl');
        var attribute_replace = {
            'table_name': table_name,
            'model': model,
            'configdb': configdb,
            'application': dot,
        };
        var content = GlobalFunction.replaceContentByObject(content_template, attribute_replace);
        return GlobalRender.getFullColumnTable(table_name, configdb, 1).then(r => {
            r.ROLE = GlobalRender.prettyAttributeServer(r.ROLE);
            r.LABEL = GlobalRender.prettyAttributeServer(r.LABEL);
            content = GlobalRender.writeLabelIntoServiceContent(model, r.LABEL, content);
            content = GlobalRender.writeRuleIntoServiceContent(model, r.ROLE, content);
            content = GlobalRender.writeAttributeIntoServiceContent(GlobalRender.getAttributeService(r.ROLE), content);
            GlobalFile.writeFile(path, content);
            return Promise.resolve({
                table_name: table_name,
                configdb: configdb,
                path: path
            });
        });

    }
}

GlobalRender.getFullColumnTable = function (table_name, configdb, service = 0) {
    var defer = Q.defer();
    var db = GlobalDB.getDB(config.SERVER[configdb]);
    var db_name = config.MYSQL[config.SERVER[configdb]]['database'];
    var rs_role_fk = {};
    var rs_role = {};
    var rs_label = {};
    var rs_label_fk = {};
    var LIMIT = 3, COUNT_LIMIT = 0;
    db.query("select COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME from INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = '" + db_name + "' AND TABLE_NAME = '" + table_name + "' AND CONSTRAINT_NAME != 'PRIMARY';", function (err, rows) {
        var rs = {};
        var rs_column = {};
        for (var i in rows) {
            if (rows[i]['REFERENCED_TABLE_NAME'] && rows[i]['REFERENCED_COLUMN_NAME']) {
                var fk_id = 'fk_table_' + rows[i]['COLUMN_NAME'];
                rs_role_fk[rows[i]['COLUMN_NAME']] = {
                    fk: { 'table': rows[i]['REFERENCED_TABLE_NAME'], 'ref_id': rows[i]['REFERENCED_COLUMN_NAME'] }
                };
                rs_role_fk[fk_id] = {
                    type: 'any',
                };
                rs_label_fk[fk_id] = fk_id;
            } else if(!service) {
                rs_role_fk[rows[i]['COLUMN_NAME']] = {require : {unique: true}};
            }
        }
        COUNT_LIMIT++;
        if (LIMIT == COUNT_LIMIT) { defer.resolve({}); }
    })
    db.query("select TABLE_NAME from INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = '" + db_name + "' AND TABLE_NAME REGEXP '_mul$' AND TABLE_NAME REGEXP '^" + table_name + "_|_" + table_name + "_mul$';", function (err, rows) {
        var rs = {};
        var rs_column = {};
        if(rows && rows.length) {
            for (var i in rows) {
                rs_column[rows[i]['TABLE_NAME']] = rows[i]['TABLE_NAME'];
            }
            rs_label = Object.assign(rs_label,rs_column);
            db.query("SELECT TABLE_NAME, GROUP_CONCAT(concat(REFERENCED_TABLE_NAME,'|',COLUMN_NAME)) as 'REFERENCED_TABLE_NAME'  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE     TABLE_SCHEMA = 'dev_north_star' and TABLE_NAME IN ('" + Object.keys(rs_column).join("','") + "') and CONSTRAINT_NAME != 'PRIMARY' group by TABLE_NAME;", function(err, rows){
                if(rows && rows.length) {
                    for (var i in rows) {
                        var a = rows[i]['REFERENCED_TABLE_NAME'].split(',');
                        var b = a[0].split('|');
                        var c = a[1].split('|');
                        var mul_id = b[1];
                        var mul_id_fk = c[1];
                        var table_fk = c[0];
                        if(c[0] == table_name) {
                            mul_id = c[1];
                            mul_id_fk = b[1];
                            table_fk = b[0];
                        }
                        rs[rows[i]['TABLE_NAME']] = {
                            "type": "array",
                            "size": 11,
                            "mul_id": mul_id,
                            "mul_id_fk": mul_id_fk,
                            "fk": {
                                "table": table_fk,
                                "ref_id": "id",
                            }
                        };
                    }
                    rs_role = Object.assign(rs_role,rs);
                }
                COUNT_LIMIT++;
                if (LIMIT == COUNT_LIMIT) { defer.resolve({}); }
            })
        } else {
            COUNT_LIMIT++;
            if (LIMIT == COUNT_LIMIT) { defer.resolve({}); }
        }
    })
    db.query("SELECT COLUMN_NAME, COLUMN_DEFAULT, CHARACTER_MAXIMUM_LENGTH , DATA_TYPE, COLUMN_TYPE, COLUMN_KEY, EXTRA, IS_NULLABLE  FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '" + db_name + "' AND TABLE_NAME = '" + table_name + "';", function (err, rows) {
        var rs = {};
        var rs_column = {};
        for (var i in rows) {
            var r = {};
            var row = rows[i];
            if (GlobalFunction.contains(row['COLUMN_NAME'], ['modified_time', 'modified_by', 'created_time', 'created_by'])) {
                continue;
            }
            rs_column[row['COLUMN_NAME']] = GlobalRender.getLabelByColumnName(row['COLUMN_NAME']);
            if (row['COLUMN_DEFAULT'] !== null) {
                r['default'] = row['COLUMN_DEFAULT'];
            }
            r['type'] = row['DATA_TYPE'];
            if (row['EXTRA'] && row['EXTRA'] == 'auto_increment') {
                r['auto_increment'] = true;
            }
            if (row['COLUMN_KEY'] == 'PRI') {
                r['primary_key'] = true;
            }
            if (row['COLUMN_KEY'] == 'PRI' || row['IS_NULLABLE'] == 'NO' || row['CHARACTER_MAXIMUM_LENGTH']) {
                if (!row['EXTRA'] && row['EXTRA'] != 'auto_increment') {
                    r['require'] = {};
                    if (row['IS_NULLABLE'] == 'NO') {
                        r['require']['empty'] = true;
                    }
                    if (row['CHARACTER_MAXIMUM_LENGTH']) {
                        r['require']['size'] = row['CHARACTER_MAXIMUM_LENGTH'];
                    }
                }
            }
            if (row['COLUMN_TYPE'].match(/\([0-9]+\)/gi)) {
                var m = row['COLUMN_TYPE'].match(/[0-9]+/gi);
                r['size'] = parseInt(m[0]);
            }
            if(row['COLUMN_NAME'].match(/email/gi)) {
                r['require']['email'] = true;
            }
            if(row['COLUMN_NAME'].match(/phone/gi)) {
                r['require']['phone'] = true;
            }
            if(row['COLUMN_NAME'].match(/password/gi)) {
                r['require']['password'] = true;
            }
            rs[row['COLUMN_NAME']] = r;
        }
        rs_role = Object.assign(rs_role,rs);
        rs_label = Object.assign(rs_label,rs_column);
        COUNT_LIMIT++;
        if (LIMIT == COUNT_LIMIT) { defer.resolve({}); }
    });

    return defer.promise.then(r => {
        return Promise.resolve({
            'LABEL': service ? GlobalFunction.extendFull(rs_label, rs_label_fk) : rs_label,
            'ROLE': GlobalFunction.extendFull(rs_role, rs_role_fk),
        });
    });
}