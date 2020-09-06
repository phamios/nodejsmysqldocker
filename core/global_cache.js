exports = module.exports = GlobalCache;
var Q = require('q');
var http = require('http');

function GlobalCache() { }

GlobalCache.list_obj_cache = {};

GlobalCache.set_cache_by_table_name_and_id = function(table_name, id, obj) {
       return false;
    if(table_name && id && obj) {
        if(!GlobalCache.list_obj_cache[table_name]) {
            GlobalCache.list_obj_cache[table_name] = {};
        }
        GlobalCache.list_obj_cache[table_name][id] = obj;
    }
}

GlobalCache.get_cache_by_table_name_and_id = function(table_name, id) {
       return false;
    if(table_name && id && GlobalCache.list_obj_cache[table_name] && GlobalCache.list_obj_cache[table_name][id]) {
        return GlobalCache.list_obj_cache[table_name][id];
    }
    return false;
}

GlobalCache.set_cache_by_model = function(model, key_cache = false) {
   return false;
    var key = key_cache ? key_cache : model.id;
    if(key && model) {
        GlobalCache.set_cache_by_table_name_and_id(model.tableName(), key, model.getAttributes());
    }
}

GlobalCache.set_key_cache_fk = function(table_name_child, table_name_parent, attr) {
   return false;
    if(!GlobalCache.list_obj_cache[table_name_child]) {
        GlobalCache.list_obj_cache[table_name_child] = {};
    }
    if(!GlobalCache.list_obj_cache[table_name_child]['fk']) {
        GlobalCache.list_obj_cache[table_name_child]['fk'] = {};
    }
    if(!GlobalCache.list_obj_cache[table_name_child]['fk'][table_name_parent]) {
        GlobalCache.list_obj_cache[table_name_child]['fk'][table_name_parent] = {};
    }
    if(!GlobalCache.list_obj_cache[table_name_child]['fk'][table_name_parent][attr]) {
        GlobalCache.list_obj_cache[table_name_child]['fk'][table_name_parent][attr] = {};
    }
}

GlobalCache.set_cache_fk_by_model = function(model_child, model_parent, attr, where, obj) {
   return false;
    if(model_child && model_parent && attr && where) {
        var table_name_child = model_child.tableName();
        var table_name_parent = model_parent.tableName();
        where = where ? where : 'notwhere';
        GlobalCache.set_key_cache_fk(table_name_child, table_name_parent, attr, where);
        GlobalCache.list_obj_cache[table_name_child]['fk'][table_name_parent][attr][where] = obj;
    }
}

GlobalCache.get_cache_fk_by_model = function(model_child, model_parent, attr, where) {
     return false;
    if(model_child && model_parent && attr && where) {
        var table_name_child = model_child.tableName();
        var table_name_parent = model_parent.tableName();
        where = where ? where : 'notwhere';
        GlobalCache.set_key_cache_fk(table_name_child, table_name_parent, attr, where);
        return GlobalCache.list_obj_cache[table_name_child]['fk'][table_name_parent][attr][where] || false;
    }
    return false;
}

GlobalCache.remove_cache_fk_by_model = function(model) {
   return false;
    if(model) {
        GlobalCache.remove_cache_fk_by_table_name(model.tableName());
    }
}

GlobalCache.remove_cache_fk_by_table_name = function(table_name) {
   return false;
    if(table_name && GlobalCache.list_obj_cache[table_name] && GlobalCache.list_obj_cache[table_name]['fk']) {
        delete GlobalCache.list_obj_cache[table_name]['fk'];
    }
}

GlobalCache.remove_cache_table_name_and_id_by_model = function(model) {
    return false;
    if(model && model.tableName() && model.id) {
        GlobalCache.remove_cache_table_name_and_id(model.tableName(), model.id);
    }
}

GlobalCache.remove_cache_table_name_and_id = function(table_name, id) {
    return false;
    if(table_name && id && GlobalCache.list_obj_cache[table_name] && GlobalCache.list_obj_cache[table_name][id]) {
        delete GlobalCache.list_obj_cache[table_name][id];
    }
}

GlobalCache.remove_cache_table_name_by_model = function(model) {
    return false;
    if(model) {
        GlobalCache.remove_cache_table_name(model.tableName());
    }
}

GlobalCache.remove_cache_table_name = function(table_name) {
    return false;
    if(table_name) {
        delete GlobalCache.list_obj_cache[table_name];
    }
}









GlobalCache.set_key_cache_mul = function(table_name, attr) {
        return false;
        if(!GlobalCache.list_obj_cache[table_name]) {
            GlobalCache.list_obj_cache[table_name] = {};
        }
        if(!GlobalCache.list_obj_cache[table_name]['mul']) {
            GlobalCache.list_obj_cache[table_name]['mul'] = {};
        }
        if(!GlobalCache.list_obj_cache[table_name]['mul'][attr]) {
            GlobalCache.list_obj_cache[table_name]['mul'][attr] = {};
        }
    }

    GlobalCache.set_cache_mul_by_model = function(model, attr, obj) {
            return false;
        if(model && attr && obj) {
            var table_name= model.tableName();
            GlobalCache.set_key_cache_mul(table_name, model.id);
            GlobalCache.list_obj_cache[table_name]['mul'][model.id][attr] = obj;
        }
    }

    GlobalCache.set_cache_mul_by_table_name_attr_id = function(table_name, id, attr, obj) {
            return false;
        GlobalCache.set_key_cache_mul(table_name, id);
        GlobalCache.list_obj_cache[table_name]['mul'][id][attr] = obj;

    }

    GlobalCache.get_cache_mul_by_model = function(model, attr) {
            return false;
        if(model && attr) {
            var table_name= model.tableName();
            GlobalCache.set_key_cache_mul(table_name, model.id);
            return GlobalCache.list_obj_cache[table_name]['mul'][model.id][attr] || false;
        }
        return false;
    }

    GlobalCache.remove_cache_mul_by_model = function(model) {
            return false;
        if(model) {
            GlobalCache.remove_cache_mul_by_table_name_and_id(model.tableName(), model.id);
        }
    }

    GlobalCache.remove_cache_mul_by_table_name_and_id = function(table_name, id) {
            return false;
        if(table_name && id && GlobalCache.list_obj_cache[table_name] && GlobalCache.list_obj_cache[table_name]['mul'] && GlobalCache.list_obj_cache[table_name]['mul'][id]) {
            delete GlobalCache.list_obj_cache[table_name]['mul'][id];
        }
    }

    GlobalCache.remove_cache_mul_by_table_name = function(table_name) {
            return false;
        if(table_name && GlobalCache.list_obj_cache[table_name] && GlobalCache.list_obj_cache[table_name]['mul']) {
            delete GlobalCache.list_obj_cache[table_name]['mul'];
        }
    }
