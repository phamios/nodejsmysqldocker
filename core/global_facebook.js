var Promise = require('promise');
exports = module.exports = GlobalFacebook;
var Q = require('q');
var config = require('../config/config');
var GlobalFunction = require('../core/global_function');
var md5 = require('md5');
var request = require('request');
function GlobalFacebook(type) {
    this.setType = function (type) {
        this.type = type;
        if (this.type == 'dung') {
            this.API_FUNC = 'getDungApi';
            this.PARAM_FUNC = 'DUNG_API';
        } else {
            this.API_FUNC = 'getCuongApi';
            this.PARAM_FUNC = 'CUONG_API';
        }
    }
    this.setType(type);
}

GlobalFacebook.prototype.getDungApi = async function (link, facebook_id, flag = false) {
    var defer = Q.defer();
    var token = config.ACCESS_TOKEN;
    var link_old = link;
    link = link.replace('{id}', facebook_id).replace('{access_token}', token);
    if (link_old.match(/\{access_token\}/gi)) {
        if (config.LIST_ACCESS_TOKEN.length > 1) {
            config.ACCESS_TOKEN_INDEX++;
            if (config.ACCESS_TOKEN_INDEX >= config.LIST_ACCESS_TOKEN.length) {
                config.ACCESS_TOKEN_INDEX = 0;
            }
            config.ACCESS_TOKEN = config.LIST_ACCESS_TOKEN[config.ACCESS_TOKEN_INDEX];
        }
    }
    request.get(link, {
        json: {},
        timeout: 60000,
    }, async function (c_req, c_res) {
        let params = false;
        if (c_res && c_res.body) {
            params = c_res.body;
        }
        if (typeof (params) == 'string') {
            params = false;

        }
        var r = params;
        if (r && r['error'] && r['error']['message'] && r['error']['message'].indexOf(facebook_id) == -1) {
            if (link_old.match(/\{access_token\}/gi)) {
                var list_new = [];
                for (var item of config.LIST_ACCESS_TOKEN) {
                    if (item != token) {
                        list_new.push(item);
                    }
                }
                config.LIST_ACCESS_TOKEN = list_new;
                if (config.ACCESS_TOKEN_INDEX >= config.LIST_ACCESS_TOKEN.length) {
                    config.ACCESS_TOKEN_INDEX = 0;
                }
                console.log('loi roi', facebook_id, config.LIST_ACCESS_TOKEN.length, config.ACCESS_TOKEN_INDEX);
                config.ACCESS_TOKEN = config.LIST_ACCESS_TOKEN[config.ACCESS_TOKEN_INDEX];
            }
        }
        if (params['error'] && params['error']['message'].match(/ limit | validating access token | user changed their password /gi)) {
            if (!flag) {
                params = await that.getDungApi(link, facebook_id, true);
            }
            defer.resolve(params);
        } else {
            defer.resolve(params);
        }
    });
    return defer.promise;
}

GlobalFacebook.prototype.getCuongApi = function (link, facebook_id) {
    var defer = Q.defer();
    var sti = setTimeout(function () {
        defer.resolve(false);
    }, 10000);
    var attributes = { user_id: facebook_id };
    if (link.match(/\/members/gi)) {
        attributes[limit] = 10000;
    }
    var that = this;
    request.post(link, { json: attributes, timeout: 30000, headers: { 'X-Authorized': 'Five9Dung198574' } }, async function (c_req, c_res) {
        let params = false;
        clearTimeout(sti);
        if (c_res && c_res.body) {
            params = c_res.body;
            if (params['error'] && params['error']['message'].match(/ limit | validating access token | user changed their password /gi)) {
                params = await that.getCuongApi(link, facebook_id);
                defer.resolve(params);
            } else {
                defer.resolve(params);
            }
        } else {
            defer.resolve(params);
        }

    });
    return defer.promise;
}

GlobalFacebook.prototype.getApiCommon = async function (type, facebook_id) {
    return this[this.API_FUNC](config[this.PARAM_FUNC][type], facebook_id);
}

GlobalFacebook.prototype.getProfile = async function (facebook_id) {
    return this.getApiCommon('PROFILE', facebook_id).then(r => {
        if (r && r['error'] && r['error']['message'] && r['error']['message'].indexOf(facebook_id) >= 0) {
            r['id'] = facebook_id;
        }
        return Promise.resolve(r);
    });
}

GlobalFacebook.prototype.getFriends = async function (facebook_id) {
    return this.getApiCommon('FRIENDS', facebook_id).then(r => {
        var regex = new RegExp(facebook_id, 'gi');
        if (r && r['error'] && r['error']['message'] && r['error']['message'].match(regex)) {
            r['data'] = [];
        }
        return Promise.resolve(r ? r['data'] : false);
    });
}

GlobalFacebook.prototype.getFamily = async function (facebook_id) {
    return this.getApiCommon('FAMILY', facebook_id).then(r => {
        var regex = new RegExp(facebook_id, 'gi');
        if (r && r['error'] && r['error']['message'] && r['error']['message'].match(regex)) {
            r['data'] = [];
        }
        return Promise.resolve(r ? r['data'] : false);
    });
}

GlobalFacebook.prototype.getLikes = async function (facebook_id) {
    return this.getApiCommon('LIKES', facebook_id).then(r => {
        if (r && r['error'] && r['error']['message']) {
            if (r['error']['message'].indexOf(facebook_id) >= 0) {
                r['data'] = [];
            } else {
                console.log('loi roi', facebook_id);
            }

        }
        return Promise.resolve(r ? r['data'] : false);
    });
}

GlobalFacebook.prototype.getLikesCuongNewPaging = async function (link_paging, facebook_id) {
    r = await this.getCuongApi(link_paging, facebook_id);
    if (r && r['error'] && r['error']['message']) {
        if (r['error']['message'].indexOf(facebook_id) >= 0) {
            r['data'] = [];
        } else {
            if (r['error']['message'].match(/ limit | validating access token/gi)) {
                console.log('loi token in paging');
                return this.getLikesCuongNewPaging(link_paging, facebook_id);
            }
        }
    }
    return {
        data: r && r['data'] ? r['data'] : [],
    }
}

GlobalFacebook.prototype.getLikesCuongNew = async function (facebook_id) {
    var r = await this.getApiCommon('LIKES', facebook_id);
    if (r == false || r == 'error') {
        r = await this.getApiCommon('LIKES', facebook_id);
        if (r == false || r == 'error') {
            r = await this.getApiCommon('LIKES', facebook_id);
        }
    }
    if (r && r['error'] && r['error']['message']) {
        if (r['error']['message'].indexOf(facebook_id) >= 0) {
            r['data'] = [];
        } else {
            if (r['error']['message'].match(/ limit | validating access token/gi)) {
                console.log('loi token');
                return this.getLikesCuongNew(facebook_id);
            }
        }
    }
    var rs = r ? r['data'] : false;
    while (r && r['data'] && r['data'].length == 100 && r['paging']) {
        var link_paging = config.CUONG_API.LIKES + '?paging=' + r['paging'];
        r = await this.getLikesCuongNewPaging(link_paging, facebook_id);
        if (r == false || r == 'error') {
            r = await this.getLikesCuongNewPaging(link_paging, facebook_id);
            if (r == false || r == 'error') {
                r = await this.getLikesCuongNewPaging(link_paging, facebook_id);
            }
        }
        if (r && r['data'] && r['data'].length) {
            rs = rs.concat(r['data']);
        }
    }
    return Promise.resolve(rs);
}

GlobalFacebook.prototype.getLikesNew = async function (facebook_id) {
    var r = await this.getApiCommon('LIKES', facebook_id);
    if (r && r['error'] && r['error']['message']) {
        if (r['error']['message'].indexOf(facebook_id) >= 0) {
            r['data'] = [];
        } else {
            console.log('loi roi', facebook_id);
        }
    }
    var rs = r ? r['data'] : false;
    while (r && r['data'] && r['data'].length == 100 && r['paging'] && r['paging']['next']) {
        r = await this.getDungApi(r['paging']['next']);
        if (r && r['data'] && r['data'].length) {
            rs = rs.concat(r['data']);
        }
    }
    return Promise.resolve(rs);
}

GlobalFacebook.prototype.getGroups = async function (facebook_id) {
    return this.getApiCommon('GROUPS', facebook_id);
}

GlobalFacebook.prototype.getFeed = async function (facebook_id, paging_token = false, until = false, limit = 100) {
    var link = config.DUNG_API.FEED;
    if (paging_token && paging_token !== undefined) {
        link += "&__paging_token=" + paging_token;
    }
    if (until && until !== undefined) {
        link += "&until=" + until;
    }
    link = link.replace('{limit}', limit);
    var rs = await this.getDungApi(link, facebook_id);
    var data = rs && rs.data && rs.data.length ? { data: rs.data } : { data: [] };
    if (Object.keys(data).length) {
        if (rs.paging && rs.paging.next) {
            data['paging_token'] = rs.paging.next.replace(/.*?(\&__paging_token=)/gi, '').replace(/\&.*/gi, '');
            data['until'] = rs.paging.next.replace(/.*?(\&until=)/gi, '').replace(/\&.*/gi, '');
        }
    }
    return data;
}

GlobalFacebook.prototype.getCover = async function (facebook_id) {
    return this.getApiCommon('COVER', facebook_id);
}

GlobalFacebook.prototype.getSearch = async function (facebook_id) {
    return this.getApiCommon('SEARCH', facebook_id);
}

GlobalFacebook.prototype.getSubscribers = async function (facebook_id) {
    return this.getApiCommon('SUBSCRIBERS', facebook_id);
}

GlobalFacebook.prototype.getSubscribedTo = async function (facebook_id) {
    return this.getApiCommon('SUBSCRIBEDTO', facebook_id);
}

GlobalFacebook.prototype.getTokenFacebook = function () {
    var defer = Q.defer();
    request.post(config.CRAWLERTOKEN.LINK, {
        headers: {
            'Content-Type': 'application/json;'
        },
        json: {
            username: config.CRAWLERTOKEN.username,
            password: config.CRAWLERTOKEN.password,
        }
    }, function (err, res) {
        let body = {};
        try { body = res.body; } catch (e) { }
        if (body && body.access_token) {
            config.ACCESS_TOKEN = body.access_token.replace(/"/gi, '');
            defer.resolve(body);
        } else {
            defer.resolve(false);
        }
    });
    return defer.promise;
}

GlobalFacebook.prototype.getMemberGroup = async function (group_id) {
    var rs = [];
    var data = [];
    var link = config.DUNG_API.MEMBERS;
    do {
        var data = await this.getDungApi(link, group_id);
        if (data && data.data && data.data.length) {
            rs = rs.concat(data.data);
        }
        link = (data && typeof (data) == 'object' && data.paging !== undefined && typeof (data.paging) == 'object' && data.paging.next) ? data.paging.next : '';
        console.log('group_id', group_id, rs.length);
    } while (link);
    return rs;
}

GlobalFacebook.prototype.getSubscribersAll = async function (facebook_id) {
    var rs = [];
    var data = [];
    var link = config.DUNG_API.SUBSCRIBERS;
    do {
        var data = await this.getDungApi(link, facebook_id);
        if (data === false) {
            return Promise.resolve(false);
        }
        if (data && data.data && data.data.length) {
            rs = rs.concat(data.data);
        }
        link = (data && typeof (data) == 'object' && data.paging !== undefined && typeof (data.paging) == 'object' && data.paging.next) ? data.paging.next : '';
        console.log('facebook_id', facebook_id, rs.length);
    } while (link);
    return rs;
}

GlobalFacebook.prototype.getLinkImage = async function (facebook_id) {
    if (!GlobalFunction.validateFacebookid(facebook_id)) {
        return false;
    }
    var def = Q.defer();
    var link = config.AVATAR.replace('{id}', facebook_id);
    request.get(link, function (c_req, c_res) {
        def.resolve(c_res.request.href);
    });
    return def.promise;
}

GlobalFacebook.prototype.test_api = function (token, facebook_id) {
    var defer = Q.defer();
    link = "https://graph.facebook.com/v1.0/{id}?access_token={access_token}".replace('{id}', facebook_id).replace('{access_token}', token);
    request.get(link, {
        json: {},
    }, function (c_req, c_res) {
        let params = false;
        if (c_res && c_res.body) {
            params = c_res.body;
        }
        if (typeof (params) == 'string') {
            params = false;

        }
        var r = params;
        if (r && r['error'] && r['error']['message'] && r['error']['message'].indexOf(facebook_id) == -1) {

        } else {
            console.log(token);
        }
        defer.resolve(params);
    });
    return defer.promise;
}


GlobalFacebook.get_link_refresh_token = function (email, password) {
    var API_SECRET = '62f8ce9f74b12f84c123cc23437a4a32';
    var BASE_URL = 'https://api.facebook.com/restserver.php';
    var BODY = {
        "api_key": "882a8490361da98702bf97a021ddc14d",
        "email": email,
        "format": "JSON",
        "locale": "vi_VN",
        "method": "auth.login",
        "password": password,
        // "credentials_type": "password",
        // "generate_machine_id": "1",
        // "generate_session_cookies": "1",
        "return_ssl_resources": "0",
        "v": "1.0",
    };

    var sig = '';
    var list_query = [];
    for (var k in BODY) {
        sig += k + '=' + BODY[k];
        list_query.push(k + '=' + BODY[k]);
    }
    BODY['sig'] = md5(sig + API_SECRET);
    list_query.push('sig=' + md5(sig + API_SECRET));
    return BASE_URL + '?' + list_query.join('&');
}

GlobalFacebook.refresh_token = async function (email, password, cookie = false) {
    var HEADERS = {
        "Origin": "https://facebook.com",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36",
        "authority": "www.facebook.com",
        "accept": "*/*",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
        "content-type": "application/x-www-form-urlencoded",
        "origin": "https://www.facebook.com",
    };
    if(cookie) {
        HEADERS['cookie'] = cookie;
    }
    var def = Q.defer();
    var link = GlobalFacebook.get_link_refresh_token(email, password);
    request.get(link, HEADERS, async function (c_req, c_res) {
        def.resolve(typeof(c_res.body) == 'string' ? JSON.parse(c_res.body) : c_res.body);
    }, async function (r1, r2) {
        console.log(r1, r2);
    });
    return def.promise;
}

GlobalFacebook.refresh_token_new = async function (email, password, app_object) {
    var HEADERS = {
        "Origin": "https://facebook.com",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36",
        "authority": "www.facebook.com",
        "accept": "*/*",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
        "content-type": "application/x-www-form-urlencoded",
        "origin": "https://www.facebook.com",
    };
    var def = Q.defer();
    var link = "https://b-graph.facebook.com/auth/login?email=" + email + "&password=" + password+ "&access_token=" + app_object.app_id + "|" + app_object.app_secret + "&method=post";
    request.get(link, HEADERS, async function (c_req, c_res) {
        def.resolve(typeof(c_res.body) == 'string' ? JSON.parse(c_res.body) : c_res.body);
    }, async function (r1, r2) {
        console.log(r1, r2);
    });
    return def.promise;
}