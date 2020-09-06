exports = module.exports = GlobalFile;
var Q = require('q');
var Promise = require('promise');
var fs = require('fs');
var CONFIG = require('../config/config');

function GlobalFile() { }
GlobalFile.isFile = function (path) {
    return fs.existsSync(path);
}
GlobalFile.isDir = function (path) {
    return fs.existsSync(path);
}


GlobalFile.rmkdir = function (path) {
    return GlobalFile.isDir(path) || (GlobalFile.rmkdir(GlobalFile.dirname(path)) && GlobalFile.mkdir(path));
}

GlobalFile.mkdir = function (path) {
    if(GlobalFile.isFile(path)) {
        return true;
    }
    try {
        fs.mkdirSync(path);
        return true;
    } catch (e) {
        return false;
    }
}

GlobalFile.dirname = function (path) {
    path = path.replace(/\\/gi, '/');
    path = path.replace(/\/$/gi, '');
    var a = path.split('/');
    var rs = [];
    for (var i = 0, length = a.length; i < length - 1; i++) {
        rs.push(a[i]);
    }
    return rs.join('/');
}

GlobalFile.removeFile = function(path) {
    try {
        fs.unlinkSync(path);
        return true;
    } catch(e) {
        return false;
    }
    
}

GlobalFile.removeDir = function(path) {
    try {
        fs.unlinkSync(path);
        return true;
    } catch(e) {
        return false;
    }
}

GlobalFile.writeFile = function(path, content) {
    GlobalFile.rmkdir(GlobalFile.dirname(path));
    if(path.toLowerCase().match(/\.pdf$/gi)) {
        fs.writeFileSync(path, content);
    } else {
        fs.writeFileSync(path, content,'utf8');
    }
}

GlobalFile.readFile = function(path) {
    if(path.toLowerCase().match(/\.pdf$/gi)) {
        return GlobalFile.isFile(path) ? fs.readFileSync(path) : false;
    } else {
        return GlobalFile.isFile(path) ? fs.readFileSync(path, "utf8") : false;
    }
    
}

GlobalFile.scanDir = function(path) {
    if(GlobalFile.isDir(path)) {
        return fs.readdirSync(path);
    }
    return false;
    
}

GlobalFile.getFileNameEmptyIfNameExists = function(name, link) {
    var url = link + name;
    var name_new = name;
    var a = name.split('.');
    
    var extension = a[a.length - 1];
    delete a[a.length - 1];
    var base_name = [];
    for(var i = 0; i < a.length - 1;i++) {
        base_name.push(a[i]);
    }
    base_name = base_name.join('.');
    var i = 1;
    while(GlobalFile.isFile(url)) {
        name_new = base_name + '_' + i + '.' + extension;
        url = link + name_new;
        i++;
    }
    return name_new;
}

GlobalFile.list_require_instance = {};

GlobalFile.getRequireModel = function(model_name,app_name) {
    if(!model_name.toLowerCase().match(/\.js$/gi)) {
        model_name += '.js';
    }
    if(!GlobalFile.list_require_instance[model_name]) {
        var link_dir = CONFIG.APPLiCATION_PATH + 'application/' + app_name + '/models/';
        var list_files = GlobalFile.scanDir(link_dir);

        for(var item of list_files) {
            if(item.toLowerCase() == model_name.toLowerCase()) {
                GlobalFile.list_require_instance[model_name] = require(link_dir + item);
                break;
            }
        }
    }
    if(!GlobalFile.list_require_instance[model_name]) {
        var link_dir_core = CONFIG.APPLiCATION_PATH + 'models/common/';
        list_files_core = list_files.concat(GlobalFile.scanDir(link_dir_core));
        for(var item of list_files_core) {
            if(item.toLowerCase() == model_name.toLowerCase()) {
                GlobalFile.list_require_instance[model_name] = require(link_dir_core + item);
                break;
            }
        }
    }
    return GlobalFile.list_require_instance[model_name];
}