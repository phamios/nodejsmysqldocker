var GlobalActiveRecord = require('../../../core/global_activerecord');
const GlobalFunction = require('../../../core/global_function');
var GlobalFile = require('../../../core/global_file');
var GlobalRequest = require('../../../core/global_request');
var CONFIG = require('../../../config/config');
var Q = require('q');
var Promise = require('promise');
FacebookImage = GlobalFunction.cloneFunc(GlobalActiveRecord);
FacebookImage.prototype._table_name = "facebook_image";
FacebookImage.prototype.tableName = function () {
    return this._table_name;
}
FacebookImage.prototype.db_key = CONFIG.SERVER['mongo_facebook_10574_facebook'];
FacebookImage.prototype.LABEL = {
    "_id": "Id",
    "link": "Link",
};
FacebookImage.prototype.RULE = {
    "id": {
        "type": "bigint",
        "auto_increment": true,
        "primary_key": true,
        "size": 20
    },
    "link": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 1000
        },
        "size": 1000
    },
};

FacebookImage.get_model_facebook_id_instance = false;
FacebookImage.get_model_facebook_id = function() {
    if(!FacebookImage.get_model_facebook_id_instance) {
        FacebookImage.get_model_facebook_id_instance = new FacebookImage();
        FacebookImage.get_model_facebook_id_instance._table_name = 'facebook_id';
        FacebookImage.get_model_facebook_id_instance.setDb(CONFIG.SERVER['mongo_facebook_10574']);
    }
    return FacebookImage.get_model_facebook_id_instance;
}

FacebookImage.get_model_instance = false;
FacebookImage.get_model = function() {
    if(!FacebookImage.get_model_instance) {
        FacebookImage.get_model_instance = new FacebookImage();
    }
    return FacebookImage.get_model_instance;
}

FacebookImage.list_ip = [];
FacebookImage.list_ip_index = 0;
FacebookImage.get_list_proxy = async function() {
    var model = new FacebookImage();
    model._table_name = 'proxy';
    model.setDb(CONFIG.SERVER['crawler_management_api']); 
    var list = await model.query(`select concat('http://',name,':',port) ip from proxy`);
    // FacebookImage.list_ip = GlobalFunction.indexArray(list,'ip');
    FacebookImage.list_ip.push('');
    return FacebookImage.list_ip;
}

FacebookImage.getProxy = function() {
    if(FacebookImage.list_ip.length == 1) {
        return FacebookImage.list_ip[0];    
    }
    if(FacebookImage.list_ip_index >= FacebookImage.list_ip.length) {
        FacebookImage.list_ip_index = 0;
    } else {
        FacebookImage.list_ip_index++;
    }
    return FacebookImage.list_ip[FacebookImage.list_ip_index];
}

FacebookImage.crawler_image = async function(status = 10001) {
    console.log('bat dau status', status);
    var model_facebook_id = FacebookImage.get_model_facebook_id();
    var list_facebook_id = await model_facebook_id.aggregate([
        {$match:{status: status}},
        {$project:{_id:1}},
    ]);
    if(!list_facebook_id || !list_facebook_id.length) {
        return Promise.resolve(false);
    }
    GlobalFile.mkdir('C:/project/db/facebook/' + status + '/');
    var model = FacebookImage.get_model();
    var list = [];
    var a = await GlobalFunction.runMultiRequest(list_facebook_id, async function(data,index){
        var item = data[index];
        var def = Q.defer();
        var href = await GlobalRequest.download('http://graph.facebook.com/' + item._id + '/picture?type=large','C:/project/db/facebook/' + status + '/' + item._id + '.jpg',FacebookImage.getProxy());
        if(href) {
            list.push({
                _id     : item._id,
                href    : href,
                status  : status,
            })
        }
        console.log(index,item._id, href);
        def.resolve(href);
        return def.promise;
    },20);
    if(a){}
    if(list.length) {
        var b = await model.insertMany(list);
        if(b){}
    }
    return FacebookImage.crawler_image(status + 1);
}

FacebookImage.test_app_scope_id_image = async function() {
    var model_facebook_id = FacebookImage.get_model_facebook_id();
    var list_facebook_id = await model_facebook_id.aggregate([
        {$match:{status: 0}},
        {$project:{_id:1}},
    ]);
    console.log(list_facebook_id);
    
}

exports = module.exports = FacebookImage;