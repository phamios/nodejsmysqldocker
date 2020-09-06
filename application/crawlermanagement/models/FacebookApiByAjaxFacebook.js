var GlobalActiveRecord = require('../../../core/global_activerecord');
const GlobalFunction = require('../../../core/global_function');
var GlobalRequest = require('../../../core/global_request');
var GlobalFile = require('../../../core/global_file');
var CONFIG = require('../../../config/config');
var Q = require('q');
var Promise = require('promise');
FacebookApiByAjaxFacebook = GlobalFunction.cloneFunc(GlobalActiveRecord);
FacebookApiByAjaxFacebook.prototype.tableName = function() {
    return 'facebook_api_by_ajax_facebook';
}
FacebookApiByAjaxFacebook.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
FacebookApiByAjaxFacebook.prototype.LABEL = {
    "id": "Id",
    "name": "Name",
    "link": "Link",
    "header": "Header",
    "input_param": "Input Param",
    "attributes_mapping_by_dom": "Attributes Mapping By Dom",
    "attributes_mapping_by_regex": "Attributes Mapping By Regex",
    "end_point": "End Point",
    "Description": "Description",
    "status": "Status",
    "is_delete": "Is Delete"
};
FacebookApiByAjaxFacebook.prototype.RULE = {
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
    "link": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 255
        },
        "size": 255
    },
    "header": {
        "type": "text",
        "require": {
            "empty": true,
            "size": 65535
        }
    },
    "input_param": {
        "type": "text",
        "require": {
            "size": 65535
        }
    },
    "attributes_mapping_by_dom": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "attributes_mapping_by_regex": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "end_point": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 255
        },
        "size": 255
    },
    "Description": {
        "type": "text",
        "require": {
            "size": 65535
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

FacebookApiByAjaxFacebook.get_group_members = async function(group_id, paging_token = false, fb_dtsg_ag, cookie) {
    if(!fb_dtsg_ag || !cookie) {
        return Promise.resolve({
            error   : {
                message     : "Hết token",
            }
        });
    }
    var params = {
        gid         : group_id,
        order       : 'date',
        limit       : 500,
        sectiontype : 'recently_joined',
        fb_dtsg_ag  : fb_dtsg_ag,
        __a         : 1
    };
    if(paging_token) {
        Object.assign(params,GlobalFunction.getQueryParams(decodeURIComponent(paging_token)));
    }
    var link = 'https://www.facebook.com/ajax/browser/list/group_confirmed_members/';
    var attr = [];
    for(var k in params) {
        attr.push(k + '=' + params[k]);
    }
    link += '?' + attr.join('&');
    var headers = {
        "cookie"        : cookie,
        "user-agent"    : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36",
        "Content-Type"  :"application/json",
    };
    var result = {data:[]};
    var rs = await GlobalRequest.get(link,{headers:headers});
    
    if(rs) {
        rs = rs.replace('for (;;);','');
        try {
            rs = JSON.parse(rs);
            rs = rs.domops[0][3].__html;
            var a = rs.match(/(id="recently_joined_([0-9]{1,15}))|(data-utime="([0-9]{1,15}))/gi);
            if(a) {
                for(var item of a) {
                    if(item.indexOf('recently_joined_')>=0) {
                        result.data.push({
                            id              : item.replace('id="recently_joined_',''),
                            created_time    : null,
                        });
                    } else {
                        var created_time = GlobalFunction.formatDateTime(new Date(parseInt(item.replace('data-utime="','')) * 1000),'y-m-d h:i:s');
                        result.data[result.data.length - 1].created_time = created_time;
                        if(result.data.length >= 2 && !result.data[result.data.length - 2].created_time) {
                            for(var i = result.data.length - 2; i >= 0;i--) {
                                if(result.data[i].created_time) {
                                    break;
                                } else {
                                    result.data[i].created_time = created_time;
                                }
                            }
                        }
                    }
                }
            }
            var paging_match = rs.match(/\/ajax\/browser\/list\/group_confirmed_members.*?(")/gi);
            if(paging_match) {
                result.paging_token = encodeURIComponent('https://www.facebook.com' + paging_match[0].replace(/&amp;/gi,'&').replace(/"$/gi,''));
            }
        } catch(e) {
            return Promise.resolve({
                error   : {
                    message     : "Lỗi không tách dom được",
                }
            });
        }
        
        
    }
    return result;
}



FacebookApiByAjaxFacebook.get_reactions = async function(object_id, paging_token = false, fb_dtsg_ag, cookie) {
    if(!fb_dtsg_ag || !cookie) {
        return Promise.resolve({
            error   : {
                message     : "Hết token",
            }
        });
    }
    var params = {
        total_count : 1,
        ft_ent_identifier: object_id,
        limit       : 500,
        reaction_type : 0,
        fb_dtsg     : fb_dtsg_ag,
        __a         : 1
    };
    if(paging_token) {
        Object.assign(params,GlobalFunction.getQueryParams(decodeURIComponent(paging_token)));
    }
    var link = 'https://www.facebook.com/ufi/reaction/profile/browser/fetch/';
    var attr = [];
    for(var k in params) {
        attr.push(k + '=' + params[k]);
    }
    link += '?' + attr.join('&');
    var headers = {
        "cookie"        : cookie,
        "user-agent"    : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36",
        "Content-Type"  :"application/json",
    };
    var result = {data:[]};
    var rs = await GlobalRequest.get(link,{headers:headers});
    
    if(rs) {
        rs = rs.replace('for (;;);','');
        try {
            rs = JSON.parse(rs);
            rs = rs.domops[0][3].__html;
            var a = rs.match(/(id="recently_joined_([0-9]{1,15}))|(data-utime="([0-9]{1,15}))/gi);
            if(a) {
                for(var item of a) {
                    if(item.indexOf('recently_joined_')>=0) {
                        result.data.push({
                            id              : item.replace('id="recently_joined_',''),
                            created_time    : null,
                        });
                    } else {
                        var created_time = GlobalFunction.formatDateTime(new Date(parseInt(item.replace('data-utime="','')) * 1000),'y-m-d h:i:s');
                        result.data[result.data.length - 1].created_time = created_time;
                        if(result.data.length >= 2 && !result.data[result.data.length - 2].created_time) {
                            for(var i = result.data.length - 2; i >= 0;i--) {
                                if(result.data[i].created_time) {
                                    break;
                                } else {
                                    result.data[i].created_time = created_time;
                                }
                            }
                        }
                    }
                }
            }
            var paging_match = rs.match(/\/ajax\/browser\/list\/group_confirmed_members.*?(")/gi);
            if(paging_match) {
                result.paging_token = encodeURIComponent('https://www.facebook.com' + paging_match[0].replace(/&amp;/gi,'&').replace(/"$/gi,''));
            }
        } catch(e) {
            return Promise.resolve({
                error   : {
                    message     : "Lỗi không tách dom được",
                }
            });
        }
        
        
    }
    return result;
}

FacebookApiByAjaxFacebook.get_cookies = async function(group_id, token) {
        var token = prompt("Token", "EAAxxx"); 
        var appid = "";
        var appurl = "https://graph.facebook.com/app?access_token=" + token;
        var cookieurl = "https://api.facebook.com/method/auth.getSessionforApp";
        var http = new XMLHttpRequest; 
        var http1 = new XMLHttpRequest;
        http.open("GET", appurl, true); 
        http.onreadystatechange = function() { 
            if (4 == http.readyState && 200 == http.status) { 
                var a = http.responseText; 
                console.log(a); 
                var obj = JSON.parse(a); 
                appid = obj.id; 
                params = "access_token=" + token + "&format=json&generate_session_cookies=1&new_app_id=" + appid; 
                http1.open("GET", cookieurl + "?" + params, true); 
                http1.send(); 
            } else if(4 == http.readyState && http.status == 400) { 
                alert("Token is invalid!"); 
            } 
        }; 
        http1.onreadystatechange = function() { 
            if (4 == http1.readyState && 200 == http1.status) { 
                var a = http1.responseText; 
                var obj = JSON.parse(a); 
                var d = new Date(); 
                d.setTime(d.getTime() + (7*24*60*60*1000)); 
                for(var i = 0; i < obj.session_cookies.length; i++) { 
                    document.cookie = obj.session_cookies[i].name + "=" + obj.session_cookies[i].value + "; domain=.facebook.com;expires=" + d.toUTCString(); 
                } 
                document.location.href="https://facebook.com/"; 
            } 
        }; 
        http.send();
                
}

exports = module.exports = FacebookApiByAjaxFacebook;