var GlobalActiveRecord = require('../../../core/global_activerecord');
var GlobalFunction = require('../../../core/global_function');
var GlobalRequest = require('../../../core/global_request');
var CONFIG = require('../../../config/config');
var Q = require('q');
var Promise = require('promise');
GroupValid = GlobalFunction.cloneFunc(GlobalActiveRecord);
GroupValid.prototype._table_name = 'group_valid';
GroupValid.prototype.tableName = function() {
    return this._table_name;
}
GroupValid.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
GroupValid.prototype.LABEL = {
    "id": "Id",
    "facebook_id": "Facebook Id",
    "group_id": "Group Id",
    "status": "Status",
    "is_delete": "Is Delete"
};
GroupValid.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 11
    },
    "facebook_id": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 50
        },
        "size": 50
    },
    "group_id": {
        "type": "longtext",
        "require": {
            "empty": true,
            "size": 4294967295
        }
    },
    "status": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    },
    "is_delete": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    }
};

GroupValid.get_model_instance = false;
GroupValid.get_model = function () {
    if (!GroupValid.get_model_instance) {
        GroupValid.get_model_instance = new GroupValid();
    }
    return GroupValid.get_model_instance;
}

GroupValid.get_model_id_instance = false;
GroupValid.get_model_id = function () {
    if (!GroupValid.get_model_id_instance) {
        GroupValid.get_model_id_instance = new GroupValid();
        GroupValid.get_model_id_instance._table_name = 'group_valid_id';
    }
    return GroupValid.get_model_id_instance;
}
GroupValid.list_group_valid_obj = {};
GroupValid.list_group_valid_id_obj = {};
GroupValid.get_list_group_valid = async function () {
    var list = await GroupValid.get_model().query(`select a.facebook_id,a.group_id,b.token from group_valid a 
                                        inner join facebook_token b ON a.facebook_id = b.facebook_id
                                        where a.status = 1 and a.is_delete = 0 and b.status = 1 and b.is_delete = 0 and b.is_best = 1
    `);
    if (list && list.length) {
        for(var item of list) {
            GroupValid.list_group_valid_obj[item.facebook_id] = item;
        }
    }
    return list;
}

GroupValid.init_group_valid = async function () {
    GroupValid.get_list_group_valid();
    setInterval(function () {
        GroupValid.get_list_group_valid();
    }, 5 * 60 * 1000);
}

GroupValid.get_token_from_group_id = function(group_id, list_obj = false) {
    for(var key in GroupValid.list_group_valid_obj) {
        if(GroupValid.list_group_valid_obj[key].group_id && GroupValid.list_group_valid_obj[key].group_id.indexOf(',' + group_id + ',') >= 0
        && (!list_obj || list_obj.hasOwnProperty(GroupValid.list_group_valid_obj[key].token))) {
            return GroupValid.list_group_valid_obj[key].token;
        }
    }
    return false;
}

GroupValid.refresh = async function(type = 'all') {
    var query = false;
    switch(type) {
        case    'refresh': 
            query = `select a.facebook_id,a.token from facebook_token a
            inner join group_valid b ON a.facebook_id = b.facebook_id
            where a.is_best = 1 and a.status = 1 and a.is_delete = 0;`;
        break;
        case    'new': 
            query = `select a.facebook_id,a.token from facebook_token a
            left join group_valid b ON a.facebook_id = b.facebook_id
            where a.is_best = 1 and a.status = 1 and a.is_delete = 0 and b.facebook_id is null;`;
        break;
        default     : 
        query = `select a.facebook_id,a.token from facebook_token a where a.is_best = 1 and a.status = 1 and a.is_delete = 0;`;
        break;
    }
    if(query) {
        var list = await GroupValid.get_model().query(query);
        return GlobalFunction.runMultiRequest(list, async function(data,index){
            var token = data[index].token;
            var facebook_id = data[index].facebook_id;
            var model = new GroupValid();
            var r1 = await model.findOne({facebook_id: facebook_id});
            if(r1){}
            var rs = await GlobalRequest.get('https://graph.facebook.com/me/groups?limit=5000&summary=true&access_token=' + token, { json: {} });
            // console.log(data[index],rs);
            if(rs && rs.data && rs.data.length) {
                var group_id_str = ',';
                var list_data = [];
                for(var item of rs.data) {
                    if(!GlobalFunction.contains(item.id,["210935063083342","237038073023955","194225417443541","1253545111476515",
                        "102367346503476","2044636388965191","361631353915149","231358864308286","363709570473041","154066078775353",
                        "193949531216297","1673731732638217","1635843066702600","588993931191687","551944708160055","865611813570092",
                        "1736624959987379","136681739809626","758675050910509",
                        "402107966616269",
                        "1425625281032647",
                        "224757950926840",
                        "612771575454435",
                        "643993018964807",
                        "392726714120374",
                        "583537935044362",
                        "153926574812759"
                    ])) {
                        group_id_str += item.id + ',';
                        list_data.push({facebook_id: facebook_id, group_id: item.id});
                    }
                    
                }
                model.facebook_id = facebook_id;
                model.group_id = group_id_str;
                model.status = 1;
                console.log('group index',index, facebook_id, rs.data.length);
                var r1 = await model.query(`delete from group_valid_id where facebook_id = '` + facebook_id + `';`);
                if(r1){}
                var r2 = await GroupValid.get_model_id().insertMany(list_data);
                if(r2){}
                return model.save();
            } else {
                console.log('group index',index, facebook_id, 'khong thanh cong');
                return Promise.resolve(true);
            }
        },1).then(r => {
            console.log('thanh cong');
            return Promise.resolve(true);
        });
    } else {
        console.log('type ',type,' sai');
        return Promise.resolve(false);
    }
}

exports = module.exports = GroupValid;