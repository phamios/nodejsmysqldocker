const Q = require('q');
const express = require('express');
var bodyParser = require('body-parser');
var axios = require("axios");
var app = express();
var CONFIG = require('./config/config');
var ENUM = require('./config/enum');
var Promise = require('promise');
var request = require('request');
var GlobalRequest = require('./core/global_request');
var GlobalFunction = require('./core/global_function');
var FacebookGraphApiMapping = require('./application/crawlermanagement/models/FacebookGraphApiMapping');
var FacebookToken = require('./application/crawlermanagement/models/FacebookToken');
var Customer = require('./application/crawlermanagement/models/Customer');
var Proxy = require('./application/crawlermanagement/models/Proxy');
FacebookToken.init_server(ENUM.FACEBOOK_TOKEN.NOT_BEST);
Proxy.init_server();
Customer.init_customer();
FacebookGraphApiMapping.init_server();
// BEGIN process
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
process.on('uncaughtException', function (err) {
    console.error("Node NOT Exiting...", err);
});
// END process


// BEGIN app
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser({ limit: '50mb' }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
app.use(function (req, res, next) {
    if ((req.headers['x-authorized'] || req.headers['X-Authorized']) && !req.query.token) {
        req.query.token = req.headers['x-authorized'] || req.headers['X-Authorized'];
    }
    var token = req.query.token;
    if (token) {
        if (Customer.check_token(token)) {
            next();
            return;
        } else {
            return res.status(403).send({
                success: false,
                message: 'Token không chính xác'
            });
        }
    } else {
        return res.status(403).send({
            success: false,
            message: 'Bạn không nhập token'
        });
    }
});
// END app

function get_link_by_item(req, item, token) {
    var link = item.link.replace('{access_token}', token);
    for (var k in item.input_param) {
        if (!item.input_param[k]) {
            return false;
        }
        link = link.replace(k, req.query[item.input_param[k]]);
    }
    return link;
}

app.get('/object/avatarencode', function (req, res) {
    var url = 'https://graph.facebook.com/' + req.query.object_id + '/picture/?type=small';
    request.get(url, function(error, response){
        FacebookToken.log_by_token_99999999(error && error.response ? false : true);
        if(response) {
            res.send({ 
                image: Buffer.from(response.body).toString('base64') 
            });
        } else {
            res.send({
                error: {
                    message: 'error',
                    error: error,
                }
            });
        }
    });
})

async function load_api_by_item(item, req, res) {
    var token = FacebookToken.get_token();
    if (!token) {
        return {
            success: false,
            error: {
                message: 'Hết token',
            }
        };
    }
    var url = get_link_by_item(req, item, token);
    if (!url) {
        return {
            error: {
                message: 'Link không tìm thấy',
            }
        };
    }
    var def = Q.defer();
    var link_crawler = req.query.paging_token ? decodeURIComponent(req.query.paging_token) : url;
    var options = {json:true,timeout:60000};
    var query_params = GlobalFunction.getQueryParams(link_crawler);
    if(query_params.access_token) {
        var proxy_name = FacebookToken.get_proxy_by_token(query_params.access_token);
        if(proxy_name) {
            options.proxy = proxy_name;
        }
    }
    request.get(link_crawler, options, function (error, response) {
        if(response) {
            var err_flag = FacebookToken.delete_token_by_token(token, response.body, url);
            if (!err_flag) {
                load_api_by_item(item, req, res).then(r => {
                    def.resolve(r);
                })
            } else {
                FacebookToken.log_by_token(token, err_flag);
                Customer.log_by_token(req.query.token, err_flag);
                if (response.body.paging) {
                    if(response.body.paging.next) {
                        response.body.paging_token = encodeURIComponent(response.body.paging.next);
                        delete response.body.paging.next;
                    }
                }
                def.resolve(response.body);
            }
        } else {
            var err_flag = FacebookToken.delete_token_by_token(token, error ? error : false, url);
            if (!err_flag) {
                load_api_by_item(item, req, res).then(r => {
                    def.resolve(r);
                })
            } else {
                FacebookToken.log_by_token(token, err_flag);
                Customer.log_by_token(req.query.token, err_flag);
                if (error) {
                    def.resolve(error);
                } else {
                    def.resolve({
                        error: {
                            message: 'error',
                        }
                    });
                }
            }
        }
    });
    return def.promise;
}

function create_api_by_facebook_graph_api_mapping(item) {
    item.input_param = JSON.parse(item.input_param);
    app.get(item.end_point, async function (req, res) {
        FacebookGraphApiMapping.log_by_end_point(item.id,req);
        var r = await load_api_by_item(item, req, res);
        res.send(r);
    })
}
var list_api_obj = {};
function run() {
    FacebookGraphApiMapping.get_list_graph_api().then(list_api => {
        if (list_api && list_api.length) {
            for (var item of list_api) {
                if (!list_api_obj[item.id]) {
                    list_api_obj[item.id] = 1;
                    create_api_by_facebook_graph_api_mapping(item);
                }
            }
        }
        setTimeout(function () {
            run();
        }, 5 * 60 * 1000);
    })
}

run();

app.get('ping', function (req, res) {
    res.send({ code: 200 });
})

app.get('checktoken', function (req, res) {
    var length = Object.keys(FacebookToken.get_list_token_instance).length;
    if(length) {
        res.send({ code: 200, message: 'Còn ' + length + ' token.' });
    } else {
        res.send({ code: 400, message: 'Hết token.' });
    }
    
})

var port = CONFIG.argv.port || 4040;

var server = app.listen(port, function () {
    var host = server.address().host
    host = host ? host : 'localhost';
    var port = server.address().port
    console.log("Ung dung Node.js dang lang nghe tai dia chi: http://%s:%s", host, port)

})
server.timeout = 1000000;