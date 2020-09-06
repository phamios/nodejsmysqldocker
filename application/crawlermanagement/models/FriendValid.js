var GlobalActiveRecord = require('../../../core/global_activerecord');
const GlobalFunction = require('../../../core/global_function');
const GlobalRequest = require('../../../core/global_request');
var CONFIG = require('../../../config/config');
var Q = require('q');
var Promise = require('promise');
FriendValid = GlobalFunction.cloneFunc(GlobalActiveRecord);
FriendValid.prototype.tableName = function() {
    return 'friend_valid';
}
FriendValid.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
FriendValid.prototype.LABEL = {
    "id": "Id",
    "facebook_id": "Facebook Id",
    "friend_id": "Friend Id",
    "status": "Status",
    "is_delete": "Is Delete"
};
FriendValid.prototype.RULE = {
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
    "friend_id": {
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

FriendValid.get_model_instance = false;
FriendValid.get_model = function () {
    if (!FriendValid.get_model_instance) {
        FriendValid.get_model_instance = new FriendValid();
    }
    return FriendValid.get_model_instance;
}
FriendValid.list_friend_valid_obj = {};
FriendValid.list_friend_valid_id_obj = {};
FriendValid.get_list_friend_valid = async function () {
    var list = await FriendValid.get_model().query(`select a.facebook_id,a.friend_id,b.token from friend_valid a 
    inner join facebook_token b ON a.facebook_id = b.facebook_id
    where a.status = 1 and a.is_delete = 0 and b.status = 1 and b.is_delete = 0 and b.is_best = 1
`);
    if (list && list.length) {
        for(var item of list) {
            FriendValid.list_friend_valid_obj[item.facebook_id] = item;
        }
    }
    return list;
}

FriendValid.init_friend_valid = async function () {
    FriendValid.get_list_friend_valid();
    setInterval(function () {
        FriendValid.get_list_friend_valid();
    }, 5 * 60 * 1000);
}

FriendValid.get_token_from_friend_id = function(friend_id, list_obj = false) {
    for(var key in FriendValid.list_friend_valid_obj) {
        if(FriendValid.list_friend_valid_obj[key].friend_id && FriendValid.list_friend_valid_obj[key].friend_id.indexOf(',' + friend_id + ',') >= 0 
                && (!list_obj || list_obj.hasOwnProperty(FriendValid.list_friend_valid_obj[key].token))) {
            return FriendValid.list_friend_valid_obj[key].token;
        }
    }
    return false;
}

FriendValid.refresh = async function(type = 'all') {
    var query = false;
    switch(type) {
        case    'refresh': 
            query = `select a.facebook_id,a.token from facebook_token a
            inner join friend_valid b ON a.facebook_id = b.facebook_id
            where a.is_best = 1 and a.status = 1 and a.is_delete = 0;`;
        break;
        case    'new': 
            query = `select a.facebook_id,a.token from facebook_token a
            left join friend_valid b ON a.facebook_id = b.facebook_id
            where a.is_best = 1 and a.status = 1 and a.is_delete = 0 and b.facebook_id is null;`;
        break;
        default     : 
        query = `select a.facebook_id,a.token from facebook_token a where a.is_best = 1 and a.status = 1 and a.is_delete = 0;`;
        break;
    }
    if(query) {
        var list = await FriendValid.get_model().query(query);
        return GlobalFunction.runMultiRequest(list, async function(data,index){
            var token = data[index].token;
            var facebook_id = data[index].facebook_id;
            var model = new FriendValid();
            var r1 = await model.findOne({facebook_id: facebook_id});
            if(r1){}
            var rs = await GlobalRequest.get('https://graph.facebook.com/me/friends?limit=5000&summary=true&access_token=' + token, { json: {} });
            // console.log(data[index],rs);
            if(rs && rs.data && rs.data.length) {
                var friend_id_str = ',';
                for(var item of rs.data) {
                    friend_id_str += item.id + ',';
                }
                model.facebook_id = facebook_id;
                model.friend_id = friend_id_str;
                model.status = 1;
                console.log('friend index',index, facebook_id, rs.data.length);
                return model.save();
            } else {
                console.log('friend index',index, facebook_id, 'khong thanh cong');
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

exports = module.exports = FriendValid;