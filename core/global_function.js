exports = module.exports = GlobalFunction;
var Q = require('q');
var http = require('http');
var querystring = require('querystring');
//const translate = require('google-translate-api');
var GlobalGmap = require('./global_gmap');
// var GlobalActiveRecord = require('./global_activerecord');
const exec = require('child_process').exec;
const MINI_DAY = 86400000;
function GlobalFunction() { }
GlobalFunction.contains = function (s, a) {
    if (a === undefined) {
        return false;
    }
    if (typeof (s) != 'object') {
        if(typeof(a) != 'object') {
            return s == a;
        }
        for (var item of a) { if (s == item) { return true; } }
    } else {
        for (var item of s) {
            for (var item2 of a) { if (item == item2) { return true; } }
        }
    }
    return false;
}

GlobalFunction.ngay_nghi = {
    '2017-12-30': true,
    '2017-12-31': true,
    '2018-01-01': true,
    '2018-02-14': true,
    '2018-02-15': true,
    '2018-02-16': true,
    '2018-02-19': true,
    '2018-02-20': true,
    '2018-04-25': true,
    '2018-04-30': true,
    '2018-05-01': true,
    '2018-09-03': true,
};

GlobalFunction.encodeQuote = function (str) {
    return str.replace(/"/gi, '&quot;').replace(/'/gi, '&#039;');
}


GlobalFunction.getTimestamp = function () {
    return parseInt(GlobalFunction.newDate().getTime()/1000);
}

GlobalFunction.validateEmail = function (val) {
    if (val && !val.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/gi)) {
        return false;
    }
    return true;
}

GlobalFunction.validatePassword = function (val) {
    if (val && val.length < 6) {
        return false;
    }
    return true;
}

GlobalFunction.validatePhone = function (val) {
    if (val) {
        val = '' + val;
        let phone = val.replace(/ |\(|\)/gi, '');
        if (phone && (phone.length < 10 || phone.length > 13 || !phone.match(/^(0|\+84|84)[0-9]{6,11}$/gi))) {
            return false;
        }
    }
    return true;
}

GlobalFunction.validateSize = function (val, size) {
    if (val && val.length > size) {
        return false;
    }
    return true;
}

GlobalFunction.validateVat = function (val) {
    if (val && !val.match(/^[0-9]{1,25}$/gi)) {
        return false;
    }
    return true;
}

GlobalFunction.validateDate = function (val) {
    if (val && val !== undefined && val != '0000-00-00') {
        if (typeof (val) == 'string') {
            val = val.replace(/T.*/gi, '');
            var date = GlobalFunction.newDate(val);
            if (date) {
                var d = GlobalFunction.formatDateTime(date, 'y-m-d');
                return d != val ? false : true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }
    return true;
}

GlobalFunction.getDateNow = function (d = false) {
    d = !d ? GlobalFunction.newDate() : GlobalFunction.newDate(d);
    return d.getFullYear() + '-' + (d.getMonth() + 1 < 10 ? ('0' + (d.getMonth() + 1)) : (d.getMonth() + 1)) + '-' + (d.getDate() < 10 ? ('0' + d.getDate()) : d.getDate());
}

GlobalFunction.validateDatePast = function (val) {
    if (val && GlobalFunction.newDate(val).getTime() > GlobalFunction.newDate(GlobalFunction.getDateNow()).getTime() + MINI_DAY) {
        return false;
    }
    return true;
}

GlobalFunction.validatePositiveNumber = function (val) {
    if (val <= 0) {
        return false;
    }
    return true;
}

GlobalFunction.getQueryParams = function(qs) {
    qs = qs.replace(/http.*?(\?)/gi,'');
    qs = qs.split('+').join(' ');

    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
}

GlobalFunction.validateFacebookid = function (val) {
    if (val && val !== undefined) {
        if (typeof (val) == 'number') { val = '' + val; }
        else { val = val.toString(); }
    } else {
        return false;
    }
    val = val.trim();
    if (!val) {
        return false;
    }
    if(val && val.length == 15 && val[0] != '1')  {
        return false;
    }
    return val.match(/^[1-9][0-9]{5,14}$/gi) && val[0] != '0';
}

GlobalFunction.validateNameFacebook = function (val) {
    if (val.length == 16 && val.match(/^[1-9][0-9]+$/gi)) {
        return null;
    } else {
        return val.match(/^[a-zA-Z0-9\._-]+$/gi);
    }
}

GlobalFunction.pretty_str = function (str) {
    if (!str || str === undefined) {
        return str;
    }
    var list_obj_keyword = {
        'a': { 803: 'ạ', 771: 'ã', 769: 'á', 777: 'ả', 768: 'à' },
        'ă': { 803: 'ặ', 771: 'ẵ', 769: 'ắ', 777: 'ẳ', 768: 'ằ' },
        'â': { 803: 'ậ', 771: 'ẫ', 769: 'ấ', 777: 'ẩ', 768: 'ầ' },
        'A': { 768: 'À', 769: 'Á', 771: 'Ã', 777: 'Ả', 803: 'Ạ', },
        'Ă': { 768: 'Ằ', 769: 'Ắ', 771: 'Ẵ', 777: 'Ẳ', 803: 'Ặ', },
        'Â': { 768: 'Ầ', 769: 'Ấ', 771: 'Ẫ', 777: 'Ẩ', 803: 'Ậ', },

        'e': { 803: 'ẹ', 771: 'ẽ', 769: 'é', 777: 'ẻ', 768: 'è' },
        'ê': { 803: 'ệ', 771: 'ễ', 769: 'ế', 777: 'ể', 768: 'ề' },
        'E': { 768: 'È', 769: 'É', 771: 'Ẽ', 777: 'Ẻ', 803: 'Ẹ', },
        'Ê': { 768: 'Ề', 769: 'Ế', 771: 'Ễ', 777: 'Ể', 803: 'Ệ', },

        'i': { 803: 'ị', 771: 'ĩ', 769: 'í', 777: 'ỉ', 768: 'ì' },
        'I': { 768: 'Ì', 769: 'Í', 771: 'Ĩ', 777: 'Ỉ', 803: 'Ị', },

        'o': { 803: 'ọ', 771: 'õ', 769: 'ó', 777: 'ỏ', 768: 'ò' },
        'ơ': { 803: 'ợ', 771: 'ỡ', 769: 'ớ', 777: 'ở', 768: 'ờ' },
        'ô': { 803: 'ộ', 771: 'ỗ', 769: 'ố', 777: 'ổ', 768: 'ồ' },
        'O': { 768: 'Ò', 769: 'Ó', 771: 'Õ', 777: 'Ỏ', 803: 'Ọ', },
        'Ơ': { 768: 'Ờ', 769: 'Ớ', 771: 'Ỡ', 777: 'Ở', 803: 'Ợ', },
        'Ô': { 768: 'Ồ', 769: 'Ố', 771: 'Ỗ', 777: 'Ổ', 803: 'Ộ', },

        'u': { 803: 'ụ', 771: 'ũ', 769: 'ú', 777: 'ủ', 768: 'ù' },
        'ư': { 803: 'ự', 771: 'ữ', 769: 'ứ', 777: 'ử', 768: 'ừ' },
        'U': { 768: 'Ù', 769: 'Ú', 771: 'Ũ', 777: 'Ủ', 803: 'Ụ', },
        'Ư': { 768: 'Ừ', 769: 'Ứ', 771: 'Ữ', 777: 'Ử', 803: 'Ự', },

        'y': { 803: 'ỵ', 771: 'ỹ', 769: 'ý', 777: 'ỷ', 768: 'ỳ' },
        'Y': { 768: 'Ỳ', 769: 'Ý', 771: 'Ỹ', 777: 'Ỷ', 803: 'Ỵ', }

    };
    var list_oprator = { '768': 768, '769': 769, '771': 771, '777': 777, '803': 803 };
    var length = str.length;
    var rs = "";
    var i = 0;
    var keyword_indexof = "0123456789abcdefghijklmnopqrstuvwxyzàáạảãâầấậẩẫăằắặẳẵầàèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởùúụủũưừứựửữỳýỵỷỹđABCDEFGHIJKLMNOPQRSTUVWXYZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴẦÀÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ ";
    if (length > 1) {
        for (i = 0; i < length - 1; i++) {
            var char_code = str.charCodeAt(i + 1);
            if (list_oprator[char_code]) {
                if (list_obj_keyword[str[i]] && list_obj_keyword[str[i]][char_code]) {
                    rs += list_obj_keyword[str[i]][char_code];
                    i++;
                } else {
                    if (keyword_indexof.indexOf(str[i]) >= 0) {
                        rs += str[i];
                    } else {
                        rs += " ";
                    }

                }
            } else {
                if (keyword_indexof.indexOf(str[i]) >= 0) {
                    rs += str[i];
                } else {
                    rs += " ";
                }
            }
        }
        if (i == length - 1) {
            if (keyword_indexof.indexOf(str[i]) >= 0) {
                rs += str[i];
            } else {
                rs += " ";
            }
        }
    } else {
        rs = str;
    }

    return rs.replace(/[ ]+/gi, ' ').toLowerCase().trim();
}

GlobalFunction.pretty_str_new = function (str,flag = true) {
    if (!str || str === undefined) {
        return str;
    }
    var list_obj_keyword = {
        'a': { 803: 'ạ', 771: 'ã', 769: 'á', 777: 'ả', 768: 'à' },
        'ă': { 803: 'ặ', 771: 'ẵ', 769: 'ắ', 777: 'ẳ', 768: 'ằ' },
        'â': { 803: 'ậ', 771: 'ẫ', 769: 'ấ', 777: 'ẩ', 768: 'ầ' },
        'A': { 768: 'À', 769: 'Á', 771: 'Ã', 777: 'Ả', 803: 'Ạ', },
        'Ă': { 768: 'Ằ', 769: 'Ắ', 771: 'Ẵ', 777: 'Ẳ', 803: 'Ặ', },
        'Â': { 768: 'Ầ', 769: 'Ấ', 771: 'Ẫ', 777: 'Ẩ', 803: 'Ậ', },

        'e': { 803: 'ẹ', 771: 'ẽ', 769: 'é', 777: 'ẻ', 768: 'è' },
        'ê': { 803: 'ệ', 771: 'ễ', 769: 'ế', 777: 'ể', 768: 'ề' },
        'E': { 768: 'È', 769: 'É', 771: 'Ẽ', 777: 'Ẻ', 803: 'Ẹ', },
        'Ê': { 768: 'Ề', 769: 'Ế', 771: 'Ễ', 777: 'Ể', 803: 'Ệ', },

        'i': { 803: 'ị', 771: 'ĩ', 769: 'í', 777: 'ỉ', 768: 'ì' },
        'I': { 768: 'Ì', 769: 'Í', 771: 'Ĩ', 777: 'Ỉ', 803: 'Ị', },

        'o': { 803: 'ọ', 771: 'õ', 769: 'ó', 777: 'ỏ', 768: 'ò' },
        'ơ': { 803: 'ợ', 771: 'ỡ', 769: 'ớ', 777: 'ở', 768: 'ờ' },
        'ô': { 803: 'ộ', 771: 'ỗ', 769: 'ố', 777: 'ổ', 768: 'ồ' },
        'O': { 768: 'Ò', 769: 'Ó', 771: 'Õ', 777: 'Ỏ', 803: 'Ọ', },
        'Ơ': { 768: 'Ờ', 769: 'Ớ', 771: 'Ỡ', 777: 'Ở', 803: 'Ợ', },
        'Ô': { 768: 'Ồ', 769: 'Ố', 771: 'Ỗ', 777: 'Ổ', 803: 'Ộ', },

        'u': { 803: 'ụ', 771: 'ũ', 769: 'ú', 777: 'ủ', 768: 'ù' },
        'ư': { 803: 'ự', 771: 'ữ', 769: 'ứ', 777: 'ử', 768: 'ừ' },
        'U': { 768: 'Ù', 769: 'Ú', 771: 'Ũ', 777: 'Ủ', 803: 'Ụ', },
        'Ư': { 768: 'Ừ', 769: 'Ứ', 771: 'Ữ', 777: 'Ử', 803: 'Ự', },

        'y': { 803: 'ỵ', 771: 'ỹ', 769: 'ý', 777: 'ỷ', 768: 'ỳ' },
        'Y': { 768: 'Ỳ', 769: 'Ý', 771: 'Ỹ', 777: 'Ỷ', 803: 'Ỵ', }

    };
    var list_oprator = { '768': 768, '769': 769, '771': 771, '777': 777, '803': 803 };
    var length = str.length;
    var rs = "";
    var i = 0;
    if (length > 1) {
        for (i = 0; i < length - 1; i++) {
            var char_code = str.charCodeAt(i + 1);
            if (list_oprator[char_code]) {
                if (list_obj_keyword[str[i]] && list_obj_keyword[str[i]][char_code]) {
                    rs += list_obj_keyword[str[i]][char_code];
                    i++;
                } else {
                    rs += str[i];
                }
            } else {
                rs += str[i];
            }
        }
        if (i == length - 1) {
            rs += str[i];
        }
    } else {
        rs = str;
    }
    rs = rs.replace(/[ ]+/gi, ' ').trim();
    return flag ? rs.toLowerCase() : rs;
}

var str = " 0123456789abcdefghijklmnopqrstuvwxyzàáạảãâầấậẩẫăằắặẳẵầàèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởùúụủũưừứựửữỳýỵỷỹđABCDEFGHIJKLMNOPQRSTUVWXYZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴẦÀÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ~`!@#$%^&*()_-=+[{]}\\|;:'\",<.>/?";
var list_obj_special  = {};
for(var v of str) {
    list_obj_special[v] = 1;
}
GlobalFunction.removeSpecialCharacter = function(str) {
    var str_new = "";
    for(var v of str) {
        if(list_obj_special[v]) {
            str_new += v;
        }
    }
    return str_new;
}

GlobalFunction.stripUnicode = function (str, doi = ' ') {
    if (str === undefined || str === null) {
        return '';
    } else if (typeof (str) != 'string') {
        str = str.toString();
    }
    str = str.toLowerCase().trim();
    var str_new = "";
    var list_oprator = { '768': 768, '769': 769, '771': 771, '777': 777, '803': 803 };
    for (var i in str) {
        if (!list_oprator[str.charCodeAt(i)]) {
            str_new += str[i];
        }
    }
    str = str_new;
    if (doi === undefined) { doi = '_'; }


    var arrayPregReplace = {
        'à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ|ầ|à|å|å': 'a',
        'è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ|ë': 'e',
        'ì|í|ị|ỉ|ĩ|ï': 'i',
        'ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ỡ|ơ|ờ|ớ|ợ|ở|ò|Ö|ö|ø|ö|ö|ő|œ|ô': 'o',
        'ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ|ü|ü|ů|ū|û|µ': 'u',
        'ỳ|ý|ỵ|ỷ|ỹ|Ÿ': 'y',
        'đ': 'd',
        'Ç': 'c',
        'ñ': 'n',
        '[\~\!\@\#\$\%\^\&\*\(\)\_\+\=\-\{\}\[\]\\\|\"\'\:\;\?\/\.\>\,\<]+': ' ',
        '[^a-zA-Z0-9 ]+': '',
        '[ ]+': ' ',
    };
    for (var key in arrayPregReplace) {
        var re = new RegExp(key, 'gi');
        str = str.replace(re, arrayPregReplace[key]);
    }
    str = str.trim();
    str = str.replace(/ /gi, doi);
    return str;
}


GlobalFunction.stripUnicodeNoSplit = function (str, doi) {
    if (str === undefined || str === null) {
        return '';
    } else if (typeof (str) != 'string') {
        str = str.toString();
    }
    str = str.toLowerCase().trim();
    var str_new = "";
    var list_oprator = { '768': 768, '769': 769, '771': 771, '777': 777, '803': 803 };
    for (var i in str) {
        if (!list_oprator[str.charCodeAt(i)]) {
            str_new += str[i];
        }
    }
    str = str_new;
    if (doi === undefined) { doi = '_'; }


    var arrayPregReplace = {
        'à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ|ầ|à|å|å': 'a',
        'è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ|ë': 'e',
        'ì|í|ị|ỉ|ĩ|ï': 'i',
        'ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ỡ|ơ|ờ|ớ|ợ|ở|ò|Ö|ö|ø|ö|ö|ő|œ|ô': 'o',
        'ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ|ü|ü|ů|ū|û|µ': 'u',
        'ỳ|ý|ỵ|ỷ|ỹ|Ÿ': 'y',
        'đ': 'd',
        'Ç': 'c',
        'ñ': 'n',
        '[ ]+': ' ',
    };
    for (var key in arrayPregReplace) {
        var re = new RegExp(key, 'gi');
        str = str.replace(re, arrayPregReplace[key]);
    }
    str = str.trim();
    str = str.replace(/ /gi, doi);
    return str;
}

GlobalFunction.renderNameInCard = function (nameCMND) {
    var name = this.stripUnicode(nameCMND, ' ').toUpperCase();
    if (name.length > 19) {
        var a = name.split(' ');
        if (a.length >= 3) {
            var rs = [a[0]];
            var i = 0;
            do {
                i++;
                a[i] = a[i][0];
                name = a.join(' ');
            } while (name.length > 19 && i < a.length - 2);
        }
    }
    name = name.substr(0, 19);
    return name;
}

/*
* @returns that
*/
GlobalFunction.cloneFunc = function (that/*:GlobalActiveRecord*/) {
    var temp = function temporary() { return that.apply(this, arguments); };
    temp.prototype = Object.assign({}, that.prototype);
    return temp;
};

GlobalFunction.cloneObjClass = function (that) {
    var model = Object.assign({}, that);
    if (that['__proto__']) {
        model['__proto__'] = Object.assign({}, that['__proto__']);
        if (that['__proto__']['__proto__']) {
            model['__proto__']['__proto__'] = Object.assign({}, that['__proto__']['__proto__']);
        }
    }
    return model;
}

GlobalFunction.capitalizeFirstLetter = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

GlobalFunction.stripUnicodeOther = function (str) {
    if (str && typeof (str) == 'string') {

        str = str.trim();
        str = str.toLowerCase();
        var str_old = str;
        str = str.replace(/[^àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđabcdefghijklmnopqrstuvxyz0-9]/gi, ' ');
        str = str.replace(/[ ]+/gi, ' ');
        str = str.trim();
    } else {
        str = '';
    }
    return str;
}

GlobalFunction.formatDateTime = function (date, format_date = 'd-m-y H:i') {
    function prettyDateMonth(m_d) {
        if (m_d < 10) { m_d = '0' + m_d };
        return m_d;
    }
    if (date === undefined) {
        date = GlobalFunction.newDate();
    }
    if (!date) {
        return '';
    }

    if (typeof (date) == 'number') {
        if (('' + date).length == 10) {
            date = date * 1000;
        }
    }
    switch (typeof (date)) {
        case 'string': date = GlobalFunction.newDate(date); break;
        case 'number': date = GlobalFunction.newDate(date); break;
    }
    var rs = format_date.toLowerCase();
    var attr = {
        'd': prettyDateMonth(date.getDate()),
        'm': prettyDateMonth(date.getMonth() + 1),
        'y': date.getFullYear(),
        'h': prettyDateMonth(date.getHours()),
        'i': prettyDateMonth(date.getMinutes()),
        's': prettyDateMonth(date.getSeconds()),
    };
    for (var i in attr) {
        rs = rs.replace(i, attr[i]);
    }
    return rs;
}

GlobalFunction.getRangeList = function (rs, limit) {
    if (!limit) { limit = 10000; }
    var list = [];
    var list_child = [];
    for (var i in rs) {
        if (i % limit == 0 && i != 0) {
            list.push(list_child);
            list_child = [];
        }
        list_child.push(rs[i]);
    }
    if (list_child.length) {
        list.push(list_child);
    }
    return list;
}

GlobalFunction.flattenUniq = function (list) {
    var rs = {};
    for (var i in list) {
        rs[list[i]] = list[i];
    }
    return Object.keys(rs);
}

GlobalFunction.index = function (rs, key) {
    var list = {};
    if (rs) {
        for (var i in rs) {
            if(typeof rs[i]._id === 'string' || rs[i]._id instanceof String)
            {
                rs[i]._id = rs[i]._id.toLowerCase();
            }
            list[rs[i][key]] = rs[i];
        }
    }
    return list;
}

GlobalFunction.get_unique_array = function (a) {
    return a.filter(function (item, pos) {
        return a.indexOf(item) == pos;
    });
}

GlobalFunction.indexArray = function (rs, key) {
    var list = [];
    if (rs) {
        for (var i in rs) {
            list.push(rs[i][key]);
        }
    }
    return list;
}

GlobalFunction.indexArrayNotNull = function (rs, key) {
    var list = [];
    if (rs) {
        for (var i in rs) {
            if (rs[i][key] !== null) {
                list.push(rs[i][key]);
            }
        }
    }
    return list;
}

GlobalFunction.indexObj = function (rs, key, value) {
    var list = {};
    if (rs) {
        for (var i in rs) {
            list[rs[i][key]] = rs[i][value];
        }
    }
    return list;
}

GlobalFunction.runMultiRequest = async function (data, func_callback, LIMIT = 20) {
    var defer = Q.defer();
    var length = data.length;
    if(length == 0) {
        return Promise.resolve(true);
    }
    if (!LIMIT) { LIMIT = 100; }
    if (LIMIT > length) {
        LIMIT = length;
    }
    var index = LIMIT;
    var rs = [];
    var index = 0;
    var index_now = 0;
    function call_f(i) {
        if(typeof(func_callback) == 'function') {
            func_callback(data, i).then(res => {
                rs[i] = res && res.data ? res.data : true;
                index++;
                if (index == length) {
                    defer.resolve(rs);
                } else if (index_now < length) {
                    call_f(index_now);
                    index_now++;
                }
            });
        } else {
            rs[i] = true;
            index++;
            if (index == length) {
                defer.resolve(rs);
            } else if (index_now < length) {
                call_f(index_now);
                index_now++;
            }
        }
    }
    for (var i = 0; i < LIMIT; i++) {
        call_f(i);
        index_now++;
    }
    if (!length) {
        defer.resolve(rs);
    }
    return defer.promise;
}


GlobalFunction.getDate = function (d) {
    var datetime = GlobalFunction.newDate(d);
    // datetime.setTime(datetime.getTime() + datetime.getTimezoneOffset() * 60000);
    datetime.setTime(datetime.getTime() + 420 * 60000);
    return datetime;
}
GlobalFunction.getDateFull = function (d) {
    var datetime = d ? (GlobalFunction.newDate(d)) : (GlobalFunction.newDate());
    return datetime;
}

GlobalFunction.generateBatch = function (list, limit = 10, func = false) {
    var count = list.length;
    var process = Math.ceil(count / limit);
    var list_data = [[]];
    var i_index = 0;
    for (var i = 0; i < count; i++) {
        if (func && typeof (func) == 'function') {
            func(list[i]);
        }
        list_data[i_index].push(list[i]);
        if ((i + 1) % process == 0 && i + 1 != count) {
            i_index++;
            list_data.push([]);
        }
    }
    return list_data;
}

GlobalFunction.getDifferentValueFromTwoArray = function (array1, array2) {
    if (array2 && array2.length) {
        for (var item of array2) {

        }
    } else {
        return array1;
    }
    return array2 && array2.length ? array1.filter(function (obj) { return array2.indexOf(obj) == -1; }) : array1;
}

GlobalFunction.getSameValueFromTwoArray = function (array1, array2) {
    return array2 && array2.length ? array1.filter(function (obj) { return array2.indexOf(obj) >= 0; }) : array1;
}

GlobalFunction.rand = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

GlobalFunction.randomTempArray = function (array) {
    return array.length ? array[GlobalFunction.rand(0, array.length - 1)] : undefined;
}

GlobalFunction.getRandomArrayTempFromArray = function (array, count) {
    var length = array.length;
    if (length > count) {
        var array_index = [];
        var index = 0;
        while (array_index.length < count) {
            do {
                index = GlobalFunction.rand(0, length - 1);
            } while (GlobalFunction.contains(index, array_index));
            array_index.push(index);
        }
        var rs = [];
        for (var i in array_index) {
            rs.push(array[array_index[i]]);
        }
        return rs;
    } else {
        return array;
    }
}

GlobalFunction.replaceContentByObject = function (content, obj, comma = ['{', '}']) {
    for (var i in obj) {
        content = content.split(comma[0] + i + comma[1]).join(obj[i]);
    }
    return content;
}

GlobalFunction.count = function (obj) {
    if (GlobalFunction.is_array(obj)) {
        return obj.length;
    } else {
        return Object.keys(obj).length;
    }
}

GlobalFunction.replaceTemplate = function (content, array_replace, comma = ['{', '}'], flag = true) {
    let comma1 = comma[0];
    let comma2 = comma[1];
    if (typeof (array_replace) == 'object' && GlobalFunction.count(array_replace)) {
        let arrayReplaceArray = {};
        let arrayReplace = {};
        for (var key in array_replace) {
            let value = array_replace[key];
            if (typeof (value) == 'object') {
                if (GlobalFunction.is_array(value)) {
                    arrayReplaceArray[key] = value;
                } else {
                    content = GlobalFunction.replaceArray(value, content, '', comma);
                }
            } else {
                arrayReplace[key] = value;
            }
        }
        if (GlobalFunction.count(array_replace)) {
            content = GlobalFunction.replaceContentByObject(content, arrayReplace);
        }
        if (GlobalFunction.count(arrayReplaceArray)) {
            content = GlobalFunction.replaceArrayTemplate(content, arrayReplaceArray);
        }
    }
    if (flag) {
        let block_start_delim = '\\<\\!--';
        let block_end_delim = '--\\>';
        let block_start_word = 'BEGIN\\:';
        let block_end_word = 'END\\:';
        var re = new RegExp(block_start_delim + block_start_word + '[a-zA-Z0-9_\.]+' + block_end_delim, 'gi');
        var a = GlobalFunction.preg_match_all(re, content);
        for (var i in a) {
            for (var j in a[i]) {
                var tag = a[i][j].replace(new RegExp(block_start_delim, 'gi'), '').replace(new RegExp(block_end_delim, 'gi'), '').replace('BEGIN:', '').replace(/\./gi, '\\.');
                var re = new RegExp(block_start_delim + block_start_word + tag + block_end_delim + '([^Æ]+?(' + block_start_delim + block_end_word + tag + block_end_delim + ')+)', 'gi');
                content = content.replace(re, '');
            }
        }
    }
    return content;


    return GlobalFunction.replaceContentByObject(content, obj, conma);
}

GlobalFunction.is_array = function (a) {
    if (a instanceof Array) {
        return true;
    } else {
        return false;
    }
}

GlobalFunction.replaceArray = function (array, str, conmaArray = ['{', '{']) {
    var obj_replace = {};
    var conma1 = conmaArray[0];
    var conma2 = conmaArray[1];
    for (var key in array) {
        var value = array[key];
        if (typeof (value) == 'object') {
            if (GlobalFunction.is_array(value)) {
                var str = GlobalFunction.replaceArrayTemplate(value, str, key, conmaArray);
            } else {
                var str = GlobalFunction.replaceArray(value, str, key, conmaArray);
            }
        } else {
            var k = conma1 + key + conma2;
            obj_replace[k] = value;
        }
    }
    return GlobalFunction.replaceContentByObject(str, obj_replace);
}

GlobalFunction.replaceArraymany = function (arrayReplace, template, comma = ['{', '}']) {
    if (GlobalFunction.is_array(arrayReplace) && arrayReplace.length > 0) {
        let str = '';
        let flag = false;
        if (typeof (arrayReplace) == 'object') {
            var obj_replace = {};
            for (var key in arrayReplace) {
                let array = arrayReplace[key];
                if (typeof (array) == 'object') {
                    let item = '';
                    if (GlobalFunction.is_array(array)) {
                        item = GlobalFunction.replaceArray(array, template, comma);
                    } else {
                        item = GlobalFunction.replaceContentByObject(template, array);
                        item = GlobalFunction.replaceTemplate(item, array, comma, false);
                    }
                    str += item;
                } else {
                    obj_replace[comma[0] + key + comma[1]] = array;
                }
            }
            if (!str) {
                str = template;
            }
            if (GlobalFunction.count(obj_replace)) {
                str = GlobalFunction.replaceContentByObject(str, obj_replace);
            }
            return str;
        } else {
            return GlobalFunction.replaceArray(arrayReplace, template, comma);
        }
    } else {
        return template;
    }
}

GlobalFunction.replaceContentX = function (arrayReplace, content, tagBlock, comma = ['{', '}']) {
    let block_start_delim = '\\<\\!--';
    let block_end_delim = '--\\>';
    let block_start_word = 'BEGIN\\:';
    let block_end_word = 'END\\:';
    var reg = new RegExp(block_start_delim + block_start_word + tagBlock.replace(/\./gi, '\\.') + block_end_delim + '([^Æ]+?(' + block_start_delim + block_end_word + tagBlock.replace(/\./gi, '\\.') + block_end_delim + ')+)', 'gi');
    var a = GlobalFunction.preg_match_all(reg, content);
    if (a.length && a[0].length) {
        let html = a[0][0];
        var rs = GlobalFunction.addAliasIntoKeyOfArray(arrayReplace, tagBlock);
        let html2 = GlobalFunction.replaceArraymany(rs, html, comma);

        html2 = html2.split('<!--BEGIN:' + tagBlock + '-->').join('');
        html2 = html2.split('<!--END:' + tagBlock + '-->').join('');
        return content.split(html).join(html2);
    }
    return content;
}

GlobalFunction.addAliasIntoKeyOfArray = function (array, alias) {
    var rs = false;

    if (GlobalFunction.is_array(array)) {
        rs = [];
    } else {
        rs = {};
    }
    for (var i in array) {
        var value = array[i];
        if (typeof (value) == 'object') {
            if (GlobalFunction.is_array(value)) {
                if (GlobalFunction.is_array(array)) {
                    rs.push(value);
                } else {
                    rs[alias + '.' + i] = value;
                }
            } else {
                if (GlobalFunction.is_array(array)) {
                    rs.push(GlobalFunction.addAliasIntoKeyOfArray(value, alias));
                } else {
                    rs[alias + '.' + i] = GlobalFunction.addAliasIntoKeyOfArray(value, alias + '.' + i);
                }
            }
        } else {
            if (GlobalFunction.is_array(array)) {
                var t = {};
                t[alias + '.i'] = value;
                rs.push(t);
            } else {
                rs[alias + '.' + i] = value;
            }
        }
    }
    return rs;
}

GlobalFunction.replaceArrayTemplate = function (content, arrayReplaceArray) {
    for (var key in arrayReplaceArray) {
        var value = arrayReplaceArray[key];
        content = GlobalFunction.replaceContentX(value, content, key);
    }
    return content;
}

GlobalFunction.preg_match_all = function (reg, content) {
    var matches = [];
    var match = null;
    while ((match = reg.exec(content)) != null) {
        var matchArray = [];
        for (var i in match) {
            if (parseInt(i) == i) {
                matchArray.push(match[i]);
            }
        }
        matches.push(matchArray);
    }
    return matches;
}

GlobalFunction.stringify = function (obj) {
    var content = JSON.stringify(obj, undefined, 4);
    return content;
}

GlobalFunction.escapeString = function (val) {
    val = val.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function (s) {
        switch (s) {
            case "\0": return "\\0";
            case "\n": return "\\n";
            case "\r": return "\\r";
            case "\b": return "\\b";
            case "\t": return "\\t";
            case "\x1a": return "\\Z";
            default: return "\\" + s;
        }
    });
    return val;
}

GlobalFunction.getModelByTableName = function (table_name) {
    var array_table_name = table_name ? table_name.split('_') : [];
    var model = '';
    for (var i in array_table_name) {
        model += GlobalFunction.capitalizeFirstLetter(array_table_name[i]);
    }
    return model;
}

GlobalFunction.escapeFieldName = function (table_name, field) {
    return '`' + table_name + '`.`' + field + '`';
}

GlobalFunction.prettyPhone = function (value) {
    if (value) { value = '' + value; }
    if (value && value.trim()) {
        value = value.trim();
        if (value[0] != '0') {
            if (value[0] == '8' && value[1] == '4') {
                value = '0' + value.substr(2);
            } else if (value[0] == '+' && value[1] == '8' && value[2] == '4') {
                value = '0' + value.substr(3);
            } else {
                value = '0' + value;
            }
        }
    }
    return value;
}

GlobalFunction.extendFull = function (obj1, obj2) {
    var rs = Object.assign({}, obj1);
    for (var i in obj2) {
        if (!rs.hasOwnProperty(i)) {
            rs[i] = obj2[i];
        } else {
            if (typeof (obj2[i]) == 'object' && !obj2[i].length) {
                rs[i] = GlobalFunction.extendFull(rs[i], obj2[i]);
            } else {
                rs[i] = obj2[i];
            }
        }
    }
    return rs;
}

GlobalFunction.getType = function (value) {
    if (GlobalFunction.contains(value, ['tinyint', 'smallint', 'mediumint', 'int', 'bigint'])) {
        value = 'number';
    } else if (GlobalFunction.contains(value, ['float', 'double'])) {
        value = 'number';
    } else if (GlobalFunction.contains(value, ['varchar', 'text', 'longtext'])) {
        value = 'string';
    } else if (GlobalFunction.contains(value, ['date', 'datetime'])) {
        value = 'Date';
    } else if (GlobalFunction.contains(value, ['bit'])) {
        value = 'boolean';
    }
    return value;
}

GlobalFunction.getValueSearch = function (key, value) {
    if (value && value != 'null' && GlobalFunction.contains(key, ['created_time', 'modified_time']) && value.match(/[0-9]{4}/gi)) {
        var value = parseInt(GlobalFunction.getDateFull(value).getTime() / 1000);
    }
    if (value && value !== undefined && typeof (value) == 'string' && value.match(/,/gi)) {
        value = value.split(',');
    }
    return value;
}

GlobalFunction.newDate = function (date) {
    var d = undefined;
    if (typeof (date) == 'string') {
        date = date.replace('thg ', '');
        d = new Date(date);
    } else if (typeof (date) == 'number') {
        if (('' + date).length == 10) {
            d = new Date(date * 1000);
        } else {
            d = new Date(date);
        }

    } else if (date === undefined || !date || date === null) {
        var d = new Date();
        var year = d.getUTCFullYear();
        var month = d.getUTCMonth() + 1 < 10 ? ('0' + (d.getUTCMonth() + 1)) : d.getUTCMonth() + 1;
        var date = d.getUTCDate() < 10 ? ('0' + d.getUTCDate()) : d.getUTCDate();
        var hour = d.getUTCHours() < 10 ? ('0' + d.getUTCHours()) : d.getUTCHours();
        var minutes = d.getUTCMinutes() < 10 ? ('0' + d.getUTCMinutes()) : d.getUTCMinutes();
        var second = d.getUTCSeconds() < 10 ? ('0' + d.getUTCSeconds()) : d.getUTCSeconds();
        d = new Date(year + '-' + month + '-' + date + ' ' + hour + ':' + minutes + ':' + second);
        d.setHours(d.getHours() + 7);
    }
    if (d !== undefined) {
        return d;
    } else {
        return new Date(date.getTime());
    }
}

GlobalFunction.getDateExpected = function (date_expected) {
    var date = GlobalFunction.newDate(date_expected);
    var count = 0;
    for (var i = 1; i < 14; i++) {
        if (date.getDay() == 0 || date.getDay() == 6 || GlobalFunction.ngay_nghi[GlobalFunction.formatDateTime(date, 'y-m-d')]) {
            date.setDate(date.getDate() + 1);
            if (i == 0) {
                date.setHours(7);
                date.setMinutes(59);
                date.setSeconds(0);
            }
            continue;
        }
        count++;
        if ((date.getHours() >= 8 && count == 3) || (date.getHours() < 8 && count == 2)) {
            break;
        }
        date.setDate(date.getDate() + 1);
    }
    if (date.getHours() >= 17 || date.getHours() < 8) {
        date.setHours(17);
        date.setMinutes(0);
        date.setSeconds(0);
    }
    return GlobalFunction.formatDateTime(date, 'y-m-d h:i:s');
}



GlobalFunction.validateMin = function (val, min) {
    if (val && val.length < min) {
        return false;
    }
    return true;
}

GlobalFunction.validateRegex = function (vl, regex) {
    if (vl) {
        var r = new RegExp(regex, 'gi');
        if (!vl.match(r)) {
            return false;
        }
    }
    return true;
}



GlobalFunction.get_date_process_time = function (value) {
    var date_value = GlobalFunction.newDate(value);
    if (date_value.toString() == 'Invalid Date') {
        return false;
    }
    if (date_value.getDay() == 0 || date_value.getDay() == 6 || GlobalFunction.ngay_nghi[GlobalFunction.formatDateTime(date_value, 'y-m-d')]) {
        date_value.setHours(17);
        date_value.setMinutes(0);
        date_value.setSeconds(0);
    }
    if (date_value.getHours() >= 17) {
        date_value.setHours(17);
        date_value.setMinutes(0);
        date_value.setSeconds(0);
    } else if (date_value.getHours() < 8) {
        date_value.setHours(8);
        date_value.setMinutes(0);
        date_value.setSeconds(0);
    } else if (date_value.getHours() == 12) {
        date_value.setHours(12);
        date_value.setMinutes(0);
        date_value.setSeconds(0);
    }
    return date_value;
}

GlobalFunction.get_process_date_now = function (date_now = undefined) {
    var date_value = GlobalFunction.newDate(date_now);
    if (date_value.toString() == 'Invalid Date') {
        return false;
    }
    if (date_value.getDay() == 0 || date_value.getDay() == 6 || GlobalFunction.ngay_nghi[GlobalFunction.formatDateTime(date_value, 'y-m-d')]) {
        date_value.setHours(8);
        date_value.setMinutes(0);
        date_value.setSeconds(0);
    }
    if (date_value.getHours() >= 17) {
        date_value.setHours(17);
        date_value.setMinutes(0);
        date_value.setSeconds(0);
    } else if (date_value.getHours() < 8) {
        date_value.setHours(8);
        date_value.setMinutes(0);
        date_value.setSeconds(0);
    } else if (date_value.getHours() == 12) {
        date_value.setHours(12);
        date_value.setMinutes(0);
        date_value.setSeconds(0);
    }
    return date_value;
}

GlobalFunction.get_process_time_total = function (value, date_now = undefined) {
    var value_date = GlobalFunction.get_date_process_time(value);
    if (value_date === false) {
        return '';
    }
    var value_date_new = GlobalFunction.newDate(GlobalFunction.formatDateTime(value, 'y-m-d'));

    var date = GlobalFunction.get_process_date_now(date_now);
    if (date === false) {
        return '';
    }
    var date_new = GlobalFunction.newDate(GlobalFunction.formatDateTime(date, 'y-m-d'));

    var count_ngay_nghi = 0;
    var count_ngay_thuong = 0;

    var timestamp_value_date_new = Math.floor(value_date_new.getTime() / 1000);
    var timestamp_date_new = Math.floor(date_new.getTime() / 1000);

    if (value_date.getTime() > date.getTime()) {
        return '';
    }
    var total = 0;
    if (timestamp_date_new == timestamp_value_date_new) {
        total = Math.floor(date.getTime() / 1000) - Math.floor(value_date.getTime() / 1000);
        if (date.getHours() >= 13 && value_date.getHours() <= 12) {
            total -= 3600;
        }
    } else {
        while (timestamp_date_new >= timestamp_value_date_new) {

            if (value_date_new.getDay() != 0 && value_date_new.getDay() != 6 && !GlobalFunction.ngay_nghi[GlobalFunction.formatDateTime(value_date_new, 'y-m-d')]) {
                if (timestamp_value_date_new == timestamp_date_new) {
                    total += Math.floor(date.getTime() / 1000) - Math.floor(value_date.getTime() / 1000);
                    if (date.getHours() >= 13 && value_date.getHours() <= 12) {
                        total -= 3600;
                    }
                } else {
                    var date_new_2 = GlobalFunction.newDate(value_date);
                    date_new_2.setHours(17);
                    date_new_2.setMinutes(0);
                    date_new_2.setSeconds(0);
                    total += Math.floor(GlobalFunction.newDate(date_new_2).getTime() / 1000) - Math.floor(value_date.getTime() / 1000);
                    if (date_new_2.getHours() >= 13 && value_date.getHours() <= 12) {
                        total -= 3600;
                    }
                }
            }
            value_date.setDate(value_date.getDate() + 1);
            value_date.setHours(8);
            value_date.setMinutes(0);
            value_date.setSeconds(0);
            value_date_new.setDate(value_date_new.getDate() + 1);
            timestamp_value_date_new = Math.floor(value_date_new.getTime() / 1000);
        }
    }

    return total;
}

GlobalFunction.get_process_time = function (value, date_now = undefined) {
    var total = GlobalFunction.get_process_time_total(value, date_now);
    if (!total) { return ''; }
    return GlobalFunction.time_minute_second(total);
}



GlobalFunction.get_sub_now_time = function (sub_time, date_now = undefined) {
    var date_new = GlobalFunction.get_process_date_now(date_now);
    if (date_new === false) {
        return '';
    }
    sub_time = sub_time * 60 * 1000;
    var count_ngay_nghi = 0;
    var count_ngay_thuong = 0;

    while (sub_time > 0) {
        if (date_new.getDay() != 0 && date_new.getDay() != 6 && !GlobalFunction.ngay_nghi[GlobalFunction.formatDateTime(date_new, 'y-m-d')]) {
            var date_calc = GlobalFunction.newDate(date_new);
            var old = GlobalFunction.formatDateTime(date_calc, 'y-m-d h:i:s');
            var day_now = date_calc.getDay();
            var hour_now = date_calc.getHours();

            date_calc.setTime(date_calc.getTime() - sub_time);

            if (hour_now >= 13 && (day_now != day_sub || hour_sub < 13)) {
                date_calc.setHours(date_calc.getHours() - 1);
            }
            var new1 = GlobalFunction.formatDateTime(date_calc, 'y-m-d h:i:s');
            var day_sub = date_calc.getDay();
            var hour_sub = date_calc.getHours();

            if (date_calc.getHours() >= 8 && day_now == day_sub) {
                date_new.setTime(date_new.getTime() - sub_time);
                if (hour_now >= 13 && (day_now != day_sub || hour_sub < 13)) {
                    date_new.setHours(date_new.getHours() - 1);
                }
                sub_time = 0;
                break;
            } else {
                var date8 = GlobalFunction.newDate(date_new);
                date8.setHours(8);
                date8.setMinutes(0);
                date8.setSeconds(0);
                sub_time -= date_new.getTime() - date8.getTime();
                if (hour_now >= 13 && (day_now != day_sub || hour_sub < 13)) {
                    sub_time += 3600000;
                }
            }
        }
        date_new.setDate(date_new.getDate() - 1);
        date_new.setHours(17);
        date_new.setMinutes(0);
        date_new.setSeconds(0);
    }
    return GlobalFunction.formatDateTime(date_new, 'y-m-d h:i:s');
}

GlobalFunction.strAddRepeatCharactar = function (str, char, count) {
    if (count > str.length) {
        return str + Array(count - str.length + 1).join(char);
    }
    return str;
}

GlobalFunction.post_pipe = function (url, data, callback) {
    var a = url.split('/');
    var hostname = a[2];
    var a_hostname = hostname.split(':');
    hostname = a_hostname[0];
    var port = a_hostname.length == 2 ? parseInt(a_hostname[1]) : 80;
    var path = '';
    for (var i = 3; i < a.length; i++) {
        path += '/' + a[i];
    }
    var attr = querystring.stringify(data);
    var req = http.request({
        hostname: hostname,
        port: port,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': attr.length
        }

    }, function (res) {
        callback(res);
    })
    req.on('error', function (e) {
        console.log('Problem with request:', e.message);
    });
    req.write(attr);
}

GlobalFunction.when = function (array) {
    var def = Q.defer();
    var LENGTH = array.length;
    var COUNT = 0;
    for (var i in array) {
        array[i].then(r => {
            COUNT++; if (COUNT == LENGTH) { def.resolve(true); }
        })
    }
    return def.promise;
}

GlobalFunction.edit_function_to_str = function (obj) {
    var rs = {};
    for (var i in obj) {
        if (typeof (obj[i]) == 'function') {
            rs[i] = obj[i].toString();
        } else if (typeof (obj[i]) == 'object' && !GlobalFunction.is_array(obj[i])) {
            rs[i] = GlobalFunction.edit_function_to_str(obj[i]);
        } else {
            rs[i] = obj[i];
        }
    }
    return rs;
}

GlobalFunction.time_minute_second = function (time) {
    if (!time) {
        return '00:00';
    }
    var d = Math.floor(time / (60 * 60 * 24));
    var a = time % (60 * 60 * 24);
    var h = Math.floor(a / (60 * 60));
    h += d * 24;
    a = a % (60 * 60);
    var temp = Math.floor(a / 60);
    var m = '' + temp;
    if (temp < 10) {
        m = '0' + temp;
    }
    var temp = a % 60;
    var s = '' + temp;
    if (temp < 10) {
        s = '0' + s;
    }
    // var dd = d ? d + 'd ' : '';
    var hh = h ? (h < 10 ? '0' + h : h) + ':' : '00:';
    var ms = m;
    // ms += ":" + s + '';
    return hh + ms;
}

GlobalFunction.checkImageExtension = function (extension) {
    return GlobalFunction.contains(extension.toLowerCase(), ['png', 'jpg', 'ico', 'jpeg', 'gif', 'svg']);
}

GlobalFunction.checkFileExtension = function (extension) {
    return GlobalFunction.contains(extension.toLowerCase(), ['pdf', 'txt', 'doc', 'xls', 'xlsx', 'docx', 'rtf', 'rar', 'zip']);
}

GlobalFunction.getDataFacebook = function (r) {
    var data = [];
    for (var i in r) {
        var item = r[i];

        if (item.profile && item.profile.length == 1 && item.profile[0]) {
            item.profile = item.profile[0];
        }
        if (!item.profile) {
            item.profile = item;
        }
        var education = '';
        if (item.profile && item.profile.education && item.profile.education.length) {
            education = [];
            for (var i in item.profile.education) {
                var it = item.profile.education[i];
                if (it.school && it.school.name) {
                    education.push(it.school && it.school.name ? it.school.name : '');
                }
            }
            education = education.join(",\r\n");
        }
        var work = '';
        if (item.profile && item.profile.work && item.profile.work.length) {
            work = [];
            for (var i in item.profile.work) {
                var it = item.profile.work[i];
                if (it.employer && it.employer.name) {
                    var nn = it.employer.name;
                    if (it.position && it.position.name) {
                        nn = it.position.name + " ở " + nn;
                    }
                    work.push(nn);
                }
            }
            work = work.join(",\r\n");
        }
        if (item.profile && item.profile.birthday) {
            var a = item.profile.birthday.split('/');
            if (a.length == 3) {
                item.profile.birthday = a[1] + '/' + a[0] + '/' + a[2];
            }
        }
        var explain = '';
        if (item.profile && item.profile.explain && item.profile.explain.length) {
            explain = GlobalFunction.stringify(item.profile.explain);
        }
        if (item.groups && item.groups.length) {
            if (item.groups[0].id) {
                item.groups = GlobalFunction.indexArray(item.groups, 'name');
            }
        }
        if (item.group && item.group.length) {
            if (item.group[0].id) {
                item.group = GlobalFunction.indexArray(item.group, 'name');
            }
        }
        data.push({
            facebook_id: item.facebook_id || item._id,
            group_ids: item.group_ids && item.group_ids.length ? item.group_ids.join("\n") : '',
            page_ids: item.page_ids && item.page_ids.length ? item.page_ids.join("\n") : '',
            name: item.profile && item.profile.name ? item.profile.name : '',
            birthday: item.profile && item.profile.birthday ? item.profile.birthday : '',
            age_calc: item.profile && item.profile.age_calc && item.profile.age_calc != 'null' ? item.profile.age_calc : '',
            year_calc: item.profile && item.profile.year_calc ? item.profile.year_calc : '',
            username: item.profile && item.profile.username ? item.profile.username : '',
            gender: item.profile && item.profile.gender ? item.profile.gender : '',
            score: item.profile && item.profile.score ? item.profile.score : '',
            education: education,
            work: work,
            location: item.profile && item.profile.location ? item.profile.location.name : '',
            mobile_phone: item.profile && item.profile.mobile_phone ? item.profile.mobile_phone : '',
            follower_count: item.profile && item.profile.follower_count ? item.profile.follower_count : '',
            friend_count: item.profile && item.profile.friend_count ? item.profile.friend_count : '',
            relationship_status: item.profile && item.profile.relationship_status ? item.profile.relationship_status : '',
            group: item.group && item.group.length ? item.group.join("\n") : '',
            groups: item.groups && item.groups.length ? item.groups.join("\n") : '',
            ho_ten: item.profile && item.profile.ho_ten ? item.profile.ho_ten : '',
            nhan_thu_nhap: item.profile && item.profile.nhan_thu_nhap ? item.profile.nhan_thu_nhap : '',
            explain: explain ? explain : '',
        });
    }
    return data;
}

GlobalFunction.randomPassword = function (leng) {
    if (typeof (leng) != 'number' || !parseInt(leng)) {
        leng = 8;
    }
    var alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    var str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var num = '1234567890';
    var pass = '';
    var alphaLength = alphabet.length - 1; //put the length -1 in cache
    for (var i = 0; i < leng; i++) {
        let n = Math.floor(Math.random() * (alphaLength - 0 + 1) + 0);
        pass += ('' + alphabet.charAt(n));
    }

    if (!pass.match(/(?=.*\d)(?=.*[a-zA-Z])/)) {
        pass = pass.replace(pass[0], "9");
    }
    return pass;
}

/**
 * get lat long by address
 */
GlobalFunction.getLatlonByAdress = function (address) {
    if (address) {
        return GlobalGmap.getGeocode(address).then(res => {
            if (res.length) {
                var location = res[0].geometry.location;
                return Promise.resolve({
                    address: res[0].formatted_address,
                    latitude: location.lat,
                    longitude: location.lng,
                });
            } else {
                return Promise.resolve({});
            }
        });
    } else {
        return Promise.resolve({});
    }
}

GlobalFunction.getAddresByLatlon = function (geocode) {
    if (geocode) {
        var latlng = { lat: parseFloat(geocode.lat), lng: parseFloat(geocode.lng) };
        return GlobalGmap.getAddress(latlng).then(res => {
            if (res.length) {
                return Promise.resolve({
                    address: res[0].formattedAddress,
                    latitude: res[0].latitude,
                    longitude: res[0].longitude,
                });
            } else {
                return Promise.resolve({});
            }
        });
    } else {
        return Promise.resolve({});
    }
}


GlobalFunction.values = function (rs) {
    var a = [];
    if (typeof (rs) == "object") {
        for (key in rs) {
            if (rs.hasOwnProperty(key)) {
                a.push(rs[key]);
            }
        }
    }
    return a;
}

GlobalFunction.getDistance = function (p1, p2) {
    var d = Q.defer();
    if (p1 && p2) {
        p1 = JSON.parse(p1);
        p2 = JSON.parse(p2);
        return GlobalGmap.getDistance([p2.lat + ',' + p2.lng], [p1.lat + ',' + p1.lng]).then(elements => {
            if (elements != null) {
                return Promise.resolve(elements[0].distance ? elements[0].distance.value : null);
            }
        });
    }
    return Promise.resolve(null);
}

GlobalFunction.searchString = function (str, replace = "+") {
    str = str.trim();
    if (str.length) {
        str = str.replace(/\s+/gi, replace);
    }
    return str;
}

/**
 * change phone number to submask phone number
 * @example 12345678 => xxxxxxx678
 * @param phone_number string
 * @param mask string
 * @param length length of last number phone want to show
 */
GlobalFunction.phone_mask = function (phone_number, mask = "x", length = 2) {
    let rs = "";
    if (phone_number) {
        let phone_leng = phone_number.length;
        let tail = phone_number.substring(phone_leng - length, phone_leng);
        for (let i = 0; i < phone_leng - length; i++) {
            rs += 'x';
        }
        rs += tail;
    }
    return rs;
}

GlobalFunction.isEmptyObject = function (object) {
    if (object)
        return Object.keys(object).length === 0 && object.constructor === Object;
    return true;
}


GlobalFunction.check_alias_in_obj = function (name, obj) {
    var alias = GlobalFunction.stripUnicode(name, ' ');
    var a = alias.split(' ');
    // for(var i = 0; i)
}

GlobalFunction.get_name_school = function (school_name) {
    if (school_name && school_name.indexOf(' - ') >= 0) {
        var a = school_name.split(' - ');
        a[1] = a[1].replace(a[0].trim(), '').toLowerCase();
        var b = a[0].toLowerCase().split(" ");
        for (var i in b) {
            b[i] = GlobalFunction.capitalizeFirstLetter(b[i]);
        }
        var name = b.join(' ');
        a[1] += ' ' + name;
        a[1] = GlobalFunction.capitalizeFirstLetter(a[1]);
        return GlobalFunction.titleCase(a[1]);
    } else {
        return GlobalFunction.titleCase(school_name);
    }
}

GlobalFunction.replaceNameForRegex = function (name) {
    var n = '!@#$%^&*()+={}:?.~';
    var s = '';
    for (var c of name) {
        s += n.indexOf(c) >= 0 ? ('\\' + c) : c;
    }
    s = s.toLowerCase();
    return s;
}

GlobalFunction.removeDescriptionInTree = function (item) {
    item.description = "";
    if (item.children) {
        for (var item_child of item.children) {
            GlobalFunction.removeDescriptionInTree(item_child);
        }
    }
}

GlobalFunction.findRecursive = function (item, arr) {
    if (item.children) {
        var pa_name = item.name;
        for (var item_child of item.children) {
            var countbef = arr.length;
            arr = GlobalFunction.findRecursive(item_child, arr);
            var countaft = arr.length;
            var i;
            for (i = countbef; i < countaft; i++) {
                arr[i].name = pa_name + " - " + arr[i].name;
            }
        }

    }
    else {
        if (item.count >= 5) {
            arr.push({
                "name": item.name,
                "trust_level": 5,
                "code": item.code
            });
        }
        else {
            arr.push({
                "name": item.name,
                "trust_level": item.count,
                "code": item.code
            });
        }

    }
    return arr;
}

GlobalFunction.removePrintInTree = function (item) {
    delete item.free;
    delete item.description;
    delete item.count;
    if (item.children) {
        for (var item_child of item.children) {
            GlobalFunction.removePrintInTree(item_child);
        }
    }
    return item;
}
GlobalFunction.printTree = function (item) {
    GlobalFunction.removePrintInTree(item);
    var rs = GlobalFunction.stringify(item);
    rs = rs.replace(/\n.*?("children"\: \[)/gi, '');
    rs = rs.replace(/"name"\: /gi, '');
    rs = rs.replace(/("|\{|\}|,|\])/gi, '');
    rs = rs.replace(/\n[\t ]+?(\n)/gi, '\n');
    rs = rs.replace(/\n[\t ]+?(\n)/gi, '\n');
    rs = rs.replace(/\n[\t ]+?(\n)/gi, '\n');
    rs = rs.replace(/\n[\t ]+?(\n)/gi, '\n');
    rs = rs.replace(/\n[\t ]+?(\n)/gi, '\n');
    rs = rs.replace(/\n[\t ]+?(\n)/gi, '\n');
    rs = rs.replace(/\n[\t ]+?(\n)/gi, '\n');
    rs = rs.replace(/\n[\t ]+?(\n)/gi, '\n');
    rs = rs.replace(/\n[\t ]+?(\n)/gi, '\n');
    rs = rs.replace(/\n[\t ]+?(\n)/gi, '\n');
    rs = rs.replace(/\n[\t ]+?(\n)/gi, '\n');
    rs = rs.replace(/\n[\t ]+?(\n)/gi, '\n');
    rs = rs.replace(/\n[\t ]+?(\n)/gi, '\n');
    rs = rs.replace(/\n[\t ]+?(\n)/gi, '\n');
    rs = rs.replace(/\n\n/gi, '\n');
    rs = rs.replace(/\n\n/gi, '\n');
    rs = rs.replace(/\n\n/gi, '\n');
    rs = rs.replace(/\n\n/gi, '\n');
    rs = rs.replace(/\n\n/gi, '\n');
    rs = rs.replace(/\n\n/gi, '\n');
    rs = rs.replace(/\n\n/gi, '\n');
    rs = rs.replace(/\n\n/gi, '\n');
    rs = rs.replace(/\n\n/gi, '\n');
    rs = rs.replace(/\n\n/gi, '\n');
    rs = rs.replace(/\n\n/gi, '\n');
    rs = rs.replace(/\n\n/gi, '\n');
    rs = rs.replace(/\n\n/gi, '\n');
    rs = rs.replace(/\n\n/gi, '\n');
    rs = rs.replace(/\n\n/gi, '\n');
    rs = rs.replace(/\n\n/gi, '\n');
    rs = rs.replace(/\n\n/gi, '\n');
    rs = rs.replace(/\n\n/gi, '\n');
    return rs;

}

GlobalFunction.flatTree = function (item) {
    delete item.free;
    delete item.description;
    var rs = {};
    if (item.children) {
        for (var item_child of item.children) {
            rs[item_child.name] = item_child.count || 0;
            if (item_child.children) {
                var r = GlobalFunction.flatTree(item_child);
                for (var it in r) {
                    rs[item_child.name] += r[it];
                }
                Object.assign(rs, r);
            }
        }
    }
    return rs;
}
var l = "dân tộc Tày,dân tộc Thái,dân tộc Mường,dân tộc Khơ Me,dân tộc H'Mông,dân tộc Nùng,dân tộc Hoa,dân tộc Dao,dân tộc Gia Rai,dân tộc Ê Đê,dân tộc Ba Na,dân tộc Xơ Đăng,dân tộc Sán Chay,dân tộc Cơ Ho,dân tộc Chăm,dân tộc Sán Dìu,dân tộc Hrê,dân tộc Ra Glai,dân tộc M'Nông,dân tộc X’Tiêng,dân tộc Bru-Vân Kiều,dân tộc Thổ,dân tộc Khơ Mú,dân tộc Cơ Tu,dân tộc Giáy,dân tộc Giẻ Triêng,dân tộc Tà Ôi,dân tộc Mạ,dân tộc Co,dân tộc Chơ Ro,dân tộc Xinh Mun,dân tộc Hà Nhì,dân tộc Chu Ru,dân tộc Lào,dân tộc Kháng,dân tộc La Chí,dân tộc Phù Lá,dân tộc La Hủ,dân tộc La Ha,dân tộc Pà Thẻn,dân tộc Chứt,dân tộc Lự,dân tộc Lô Lô,dân tộc Mảng,dân tộc Cờ Lao,dân tộc Bố Y,dân tộc Cống,dân tộc Ngái,dân tộc Si La,dân tộc Pu Péo,dân tộc Rơ măm,dân tộc Brâu,dân tộc Ơ Đu";
GlobalFunction.array_dantoc_re = new RegExp(l.toLowerCase().replace(/[ ]+/gi, ' ').trim().replace(/,/gi, ' | '), 'gi');
GlobalFunction.checkDantoc = function (item) {
    var a = item.match(GlobalFunction.array_dantoc_re);
    return a ? a[0] : false;
}

GlobalFunction.checkNganhNgheInList = function (item, list) {
    for (var k in list) {
        var element = list[k];
        if (element.keyword_search) {
            var a = (' ' + item + ' ').toLowerCase().match(new RegExp(element.keyword_search.toLowerCase().replace(/[ ]+/gi, ' ').trim().replace(/,/gi, ' | '), 'gi'));
            if (a) {
                return element.name;
            }
        }
    }
    return "";
}

GlobalFunction.checkDantocInList = function (item, list) {
    for (var k in list) {
        var element = list[k];
        var a = (' ' + item + ' ').toLowerCase().match(element.regex);
        if (a) {
            return element.info.name;
        }
    }
    return "";
}

GlobalFunction.ngonngu_obj = {
    "Tiếng Anh": "tiếng Anh, tieng Anh, Anh ngữ, Ielts,toefl,toeic, tienganh, English, Expat, expats, TOEIC, TOEFL,Acet,Language Link,Apollo VietNam,British Council,tiếng Anh Aroma,EQuest ,CleverLearn ,Oxford English,Aten English,WoW English,Jaxtina,iSpeaking,Langmaster,IIG VietNam,Wall Street English,Ila VietNam,Vus ,ngoại ngữ NewSky,Seameo Retrac,Today Education,KTDC,Yaffle English,Yola,Cefalt,Oxbridge Academy,Topica native,Ucan English,IELTS,ESOL,TESOL,CEFR,GMAT",
    "Tiếng Trung": "tiếng Trung, tieng trung, tiengtrung, Hán ngữ",
    "Tiếng Pháp": "tiếng Pháp, Pháp ngữ, tiengphap",
    "Tiếng Đức": "tiếng đức",
    "Tiếng nga": "tiếng Nga, CCCP",
    "Tiếng Tây Ban Nha": "tiếng Tây Ban Nha",
    "Tiếng Bồ Đào Nha": "tiếng Bồ Đào Nha",
    "Tiếng Nhật": "tiếng Nhật, Nhật ngữ",
    "Tiếng Hàn": "tiếng Hàn, Hàn ngữ",
    "Tiếng Ý": "tiếng Ý, tiếng Italia",
    "Tiếng Indonesia": "Tiếng Indonesia, tiếng Indo",
    "Tiếng Thái": "tiếng Thái, tiếng Thái Lan",
    "Tiếng Mã Lai": "tiếng Mã Lai, tiếng Malaysia",
};

GlobalFunction.ngonngu_fb_tv = {
    "English": "Tiếng Anh",
    "Vietnamese": "Tiếng Việt"
}

GlobalFunction.mapTvLanguage = function (rs) {
    Object.keys(GlobalFunction.ngonngu_fb_tv).forEach(function (key) {
        if (rs[key] == key) {
            delete rs[key];
            rs[GlobalFunction.ngonngu_fb_tv[key]] = GlobalFunction.ngonngu_fb_tv[key];
        }
    });
    return rs;
}

GlobalFunction.checkLanguageInList = function (item, list) {
    var rs = {};
    for (var k in list) {
        var element = list[k];
        var a = (' ' + item + ' ').match(element.regex);
        if (a) {
            rs[element.info.name] = element.info.name;
        }
    }
    return rs;
}

GlobalFunction.checkLanguageInMySql = function (item, list) {
    var lang_ids = []
    var _item = item.split(",");
    for (var re in list) {
        for (var l in _item) {
            var a = (' ' + _item[l] + ' ').match(list[re].regex);
            if (a) {
                lang_ids.push(list[re].info._id);
            }
        }
    }
    return lang_ids;
}


GlobalFunction.checkRef = function (item, list) {
    var lang_ids = []
    var _item = item.split(",");
    for (var re in list) {
        for (var l in _item) {
            var a = (' ' + _item[l] + ' ').match(list[re].regex);
            if (a) {
                lang_ids.push(list[re].info._id);
            }
        }
    }
    return lang_ids;
}
/*
GlobalFunction.detectLanguage = async function (text) {
    var type;
    await translate(text).then(res => {
        type = res.from.language.iso;
    }).catch(err => {
        console.error(err);
    });
    return type;
}
*/

GlobalFunction.ngonngu_obj_re = {};
for (var k in GlobalFunction.ngonngu_obj) {
    GlobalFunction.ngonngu_obj_re[k] = new RegExp(GlobalFunction.ngonngu_obj[k].toLowerCase().replace(/[ ]+/gi, ' ').trim().replace(/,/gi, ' | '), 'gi');
}

GlobalFunction.checkLanguage = function (item) {
    var rs = {};
    for (var k in GlobalFunction.ngonngu_obj_re) {
        var a = (' ' + item + ' ').match(GlobalFunction.ngonngu_obj_re[k]);
        if (a) {
            rs[k] = k;
        }
    }
    return rs;
}
GlobalFunction.tongiao_obj = {
    "Đạo Phật": "Đạo Phật, Phật pháp, Phật tử, Phật giáo, niệm Phật, nam mô a di đà Phật, kinh Phật, tụng kinh, Phật dạy, đức Phật, tu Phật, Phật học, Phật tại tâm, Phật trong tâm, nhà Phật, thiền tông, tu học Phật, Quan thế Âm, Quan Âm, Phật Tổ",
    "Công giáo": "Công giáo, Thiên Chúa, giáo hạt, giáo xứ, Chúa Jesus, Đức Mẹ Maria",
    "Cao đài": "Cao đài",
    "Tin lành": "Tin lành, Báp-tít Việt Nam, Cơ đốc, Ki Tô",
    "Hồi giáo": "hồi giáo",
    "Bà-La-Mô": "Bà-La-Môn, BàLaMôn",
    "Hòa Hảo": "Phật giáo Hòa Hảo",
    "Đạo Tứ Ân Hiếu Nghĩa": "Tứ Ân Hiếu Nghĩa",
    "Bahai'i": "Bahai'i",
    "Đạo Bửu Sơn Kỳ Hương": "Bửu Sơn Kỳ Hương",
    "Minh Sư Đạo": "Minh Sư Đạo",
    "Minh Lý Đạo": "Minh Lý Đạo"
}
GlobalFunction.tongiao_obj_re = {};
for (var k in GlobalFunction.tongiao_obj) {
    GlobalFunction.tongiao_obj_re[k] = new RegExp(GlobalFunction.tongiao_obj[k].toLowerCase().replace(/[ ]+/gi, ' ').trim().replace(/,/gi, ' | '), 'gi');
}

GlobalFunction.checkTongiao = function (item) {
    for (var k in GlobalFunction.tongiao_obj_re) {
        var a = (' ' + item + ' ').match(GlobalFunction.tongiao_obj_re[k]);
        if (a) {
            return k;
        }
    }
    return "";
}

GlobalFunction.checkTongiaoInList = function (item, list) {
    for (var k in list) {
        var element = list[k];
        if(item && item !== undefined) {
            var a = item.toLowerCase().match(element.regex);
            if (a) {
                return element.info.name;
            }
        }
    }
    return "";
}

GlobalFunction.get_data_insert = async function (data, model_user_hometown, rs = false) {
    var list_id_user_hometown = GlobalFunction.indexArray(data, '_id');
    if (!rs) {
        rs = await model_user_hometown.findAll({ _id: { $in: list_id_user_hometown } });
    }
    var rs_objs = GlobalFunction.index(rs, '_id');
    var data_insert = [];
    for (var item_child of data) {
        if (!rs_objs[item_child._id]) {
            data_insert.push(item_child);
        }
    }
    return Promise.resolve(data_insert);
}

GlobalFunction.get_ids_insert = async function (ids, model_user_hometown, rs = false) {
    if (!rs) {
        rs = await model_user_hometown.aggregate([
            { $match: { _id: { $in: ids } } },
            { $project: { _id: 1 } }
        ]);
    }
    var rs_objs = GlobalFunction.index(rs, '_id');
    var data_insert = [];
    for (var item_child of ids) {
        if (!rs_objs[item_child]) {
            data_insert.push(item_child);
        }
    }
    return Promise.resolve(data_insert);
}

GlobalFunction.get_data_insert_and_rs = async function (data, model_user_hometown, rs = false) {
    var list_id_user_hometown = GlobalFunction.indexArray(data, '_id');
    if (!rs) {
        rs = await model_user_hometown.findAll({ _id: { $in: list_id_user_hometown } });
    }
    var rs_objs = GlobalFunction.index(rs, '_id');
    var data_insert = [];
    for (var item_child of data) {
        if (!rs_objs[item_child._id]) {
            data_insert.push(item_child);
        }
    }
    return Promise.resolve({
        data_insert: data_insert,
        rs: rs,
    });
}

GlobalFunction.get_list_keyword_by_word = function (alias, min = 0, max = 100) {
    var a = alias.trim();
    var list = [];
    var length = a.length;
    if (length == 1) {
        list.push(alias);
    } else if (length > 1) {
        for (var i = 0; i < length - 1; i++) {
            list.push(a[i]);
            for (var j = i + 1; j < length; j++) {
                var b = list[list.length - 1] + '' + a[j];
                var count = b.split(' ').length;
                if (count <= max && count >= min) {
                    list.push(b);
                }
            }
            if (i == length - 2) {
                list.push(a[length - 1]);
            }
        }
    }
    return list;
}

GlobalFunction.get_list_keyword_by_sentence_all = function (alias, min = 0, max = 100) {
    var m = alias.match(/\(.*?(\))/gi);
    var list = [];
    if (m) {
        var n = alias;
        for (var it of m) {
            list.push(n.substr(0, n.indexOf(it)).trim());
            list.push(it.trim());
            n = n.substr(n.indexOf(it) + it.length, alias.length);
        }
        list.push(n.trim());
    } else {
        list = [alias];
    }
    var l = {};
    for (var it of list) {
        it = it.replace(/^\(|\)$/gi, '').replace(/[,\.\?\!\:\(\)]/gi, ',');
        var a = it.split(',');
        for (var b of a) {
            b = b.trim();
            if (b.trim()) {
                l[b] = 1;
            }
        }
    }
    var list = Object.keys(l);
    if (list && list.length) {
        var rs = {};
        for (var it of list) {
            var c = GlobalFunction.get_list_keyword_by_sentence(it, min, max);
            for (var c2 of c) {
                rs[c2.trim()] = 1;
            }
        }
        return Object.keys(rs);
    }
    return [];
}

GlobalFunction.get_list_keyword_by_sentence = function (alias, min = 0, max = 100) {
    var list = [];
    if (alias.trim()) {
        var a = alias.trim().split(' ');
        var length = a.length;
        if (length == 1) {
            list.push(alias);
        } else if (length > 1) {
            for (var i = 0; i < length - 1; i++) {
                list.push(a[i]);
                for (var j = i + 1; j < length; j++) {
                    var b = list[list.length - 1] + ' ' + a[j];
                    var count = b.split(' ').length;
                    if (count <= max && count >= min) {
                        list.push(b);
                    }
                }
                if (i == length - 2) {
                    list.push(a[length - 1]);
                }
            }
        }
    }
    return list;
}

GlobalFunction.get_tags_by_list_tags = function (alias, list_tags) {
    var a = alias.trim().split(' ');
    var list = [];
    var length = a.length;
    var rs = [];
    if (length == 1) {
        if (list_tags[alias.trim()]) {
            rs.push(alias.trim());
        }
    } else {
        for (var i = 0; i < length; i++) {
            list.push(a[i]);
            if (list_tags[list[list.length - 1]]) {
                rs.push(list[list.length - 1]);
            }
            for (var j = i + 1; j < length; j++) {
                list.push(list[list.length - 1] + ' ' + a[j]);
                if (list_tags[list[list.length - 1]]) {
                    rs.push(list[list.length - 1]);
                }
            }
        }
    }
    return rs;
}

GlobalFunction.get_tags_by_list_tags_and_remove_tag = function (alias, list_tags) {
    var a = alias.trim().split(' ');
    var list = [];
    var length = a.length;
    var a_str = [];
    var i = 0;
    var str = '';
    var str_1 = '';
    while (i < length) {
        str_1 = '';
        if (!str) {
            str = a[i];
        } else {
            str += ' ' + a[i];
        }
        var j = i;
        var m = 0;
        while (j < length) {
            if (list_tags[str]) {
                str_1 = str;
                m = j;
            }
            if (j == length) {
                break;
            }
            j++;
            str += ' ' + a[j];
        }
        if (str_1) {
            list.push(str_1);
        }

        str = '';
        if (i < m) {
            i = m + 1;
            str = '';
        } else {
            i++;
        }
    }
    return list;
}

GlobalFunction.replace_content_cap_3 = function (name) {
    return GlobalFunction.replaceContentByObject(name, {
        'pho thong trung học': 'thpt',
        'trung hoc thuc hanh': 'thpt thực hành',
        'trung hoc pho thong': 'thpt',
        'pho thong chuyen': 'thpt chuyên',
        'pho thong dan lap': 'thpt dân lập',
        'gdnn gdtx': 'gdtx',
        'ptdt noi tru thpt': 'thpt dtnt',
        'dan toc noi tru thpt': 'thpt dtnt',
        'ptdt noi tru': 'ptth dtnt',
        'dan toc noi tru': 'thpt dtnt',
        'dtnt tinh': 'thpt dtnt',
        'dtnt huyen': 'thpt dtnt',
        'pho thong cap 2': 'thpt',
        'pho thong cs': 'thpt',
        'pho thong tu thuc': 'thpt tư thục',
        'phan hieu cap 3': 'thpt',
        'trung hoc dan lap': 'thpt',
        'ptth': 'thpt',
        'thpt dl': 'thpt dan lap',
        'ptdtnt': 'thpt dtnt',
        'ptdt nt': 'thpt dtnt',
        'th thpt thpt': 'thpt',
        'thpt thpt': 'thpt',
        'thpt cs': 'thpt',
        'cn cap 3': 'thpt',
        'cap 3': 'thpt',
        'cap iii': 'thpt',
    }, ['', '']);
}

GlobalFunction.replace_content_cap_2 = function (name) {
    return GlobalFunction.replaceContentByObject(name, {
        'pho thong trung học': 'thpt',
        'trung hoc thuc hanh': 'thpt thực hành',
        'trung hoc pho thong': 'thpt',
        'pho thong chuyen': 'thpt chuyên',
        'pho thong dan lap': 'thpt dân lập',
        'gdnn gdtx': 'gdtx',
        'ptdt noi tru thpt': 'thpt dtnt',
        'dan toc noi tru thpt': 'thpt dtnt',
        'ptdt noi tru': 'ptth dtnt',
        'dan toc noi tru': 'thpt dtnt',
        'dtnt tinh': 'thpt dtnt',
        'dtnt huyen': 'thpt dtnt',
        'pho thong cap 2': 'thpt',
        'pho thong cs': 'thpt',
        'pho thong tu thuc': 'thpt tư thục',
        'phan hieu cap 3': 'thpt',
        'trung hoc dan lap': 'thpt',
        'ptth': 'thpt',
        'thpt dl': 'thpt dan lap',
        'ptdtnt': 'thpt dtnt',
        'ptdt nt': 'thpt dtnt',
        'th thpt thpt': 'thpt',
        'thpt thpt': 'thpt',
        'thpt cs': 'thpt',
        'cn cap 3': 'thpt',
        'cap 3': 'thpt',
        'cap iii': 'thpt',
    }, ['', '']);
}

GlobalFunction.replace_content_cap_1 = function (name) {
    return GlobalFunction.replaceContentByObject(name, {
        'pho thong trung học': 'thpt',
        'trung hoc thuc hanh': 'thpt thực hành',
        'trung hoc pho thong': 'thpt',
        'pho thong chuyen': 'thpt chuyên',
        'pho thong dan lap': 'thpt dân lập',
        'gdnn gdtx': 'gdtx',
        'ptdt noi tru thpt': 'thpt dtnt',
        'dan toc noi tru thpt': 'thpt dtnt',
        'ptdt noi tru': 'ptth dtnt',
        'dan toc noi tru': 'thpt dtnt',
        'dtnt tinh': 'thpt dtnt',
        'dtnt huyen': 'thpt dtnt',
        'pho thong cap 2': 'thpt',
        'pho thong cs': 'thpt',
        'pho thong tu thuc': 'thpt tư thục',
        'phan hieu cap 3': 'thpt',
        'trung hoc dan lap': 'thpt',
        'ptth': 'thpt',
        'thpt dl': 'thpt dan lap',
        'ptdtnt': 'thpt dtnt',
        'ptdt nt': 'thpt dtnt',
        'th thpt thpt': 'thpt',
        'thpt thpt': 'thpt',
        'thpt cs': 'thpt',
        'cn cap 2': 'thpt',
        'cap 2': 'thpt',
        'cap ii': 'th',
    }, ['', '']);
}

GlobalFunction.parent_regex = [
    {
        regex: "^((?=.*\\bphu huynh|ph hoc sinh|phhs|hoi cha me|hoi bo me|hoi bim sua|hoi chame|hoi bome|bimsua|phuhuynh\\b)(?=.*\\bthpt|cap 3|cap iii\\b)(?=.*\\b2018|2019|2020\\b))|((?=.*\\brong vang|rong con\\b)(?=.*\\b2000\\b))|((?=.*\\bran vang|ran con\\b)(?=.*\\b2001\\b))|((?=.*\\bngua vang|ngua con\\b)(?=.*\\b2002\b)).*$",
        text: "Bố/mẹ học sinh cấp III"
    },
    {
        regex: "^((?=.*\\bphu huynh|ph hoc sinh|phhs|hoi cha me|hoi bo me|hoi bim sua|hoi chame|hoi bome|bimsua|phuhuynh\\b)(?=.*\\bthcs|cap 2|cap ii\\b)(?=.*\\b2018|2019|2021|2022\\b))|((?=.*\\bde vang|de con\\b)(?=.*\\b2003\\b))|((?=.*\\bkhi vang|khi con\\b)(?=.*\\b2004\b))|((?=.*\\bga vang|ga con\\b)(?=.*\\b2005\\b))|((?=.*\\bcun vang|cun con\\b)(?=.*\\b2006\\b)).*$",
        text: "Bố/mẹ học sinh cấp II"
    },
    {
        regex: "^((?=.*\\bphu huynh|ph hoc sinh|phhs|hoi cha me|hoi bo me|hoi bim sua|hoi chame|hoi bome|bimsua|phuhuynh\\b)(?=.*\\bptcs|cap 1|cap i\\b)(?=.*\\b2018|2019|2021|2022|2023\\b))|((?=.*\\blon vang|lon con\\b)(?=.*\\b2007\\b))|((?=.*\\btrau vang|trau con\\b)(?=.*\\b2009\\b))|((?=.*\\bho vang|ho con\\b)(?=.*\\b2010\\b))|((?=.*\\bmeo con|meo tu quy\\b)(?=.*\\b2011\\b))|((?=.*\\brong vang|rong con\\b)(?=.*\\b2012\\b)).*$",
        text: "Bố/mẹ học sinh cấp I"
    },
    {
        regex: "^((?=.*\\bphu huynh|ph hoc sinh|phhs|hoi cha me|hoi bo me|hoi bim sua|hoi chame|hoi bome|bimsua|phuhuynh\\b)(?=.*\\bnha tre|mam non\\b)(?=.*\\b2018|2019|2021|2022|2023\\b))|((?=.*\\bran vang|ran con\\b)(?=.*\\b2013\\b))|((?=.*\\bngua vang|ngua con\\b)(?=.*\\b2014\\b))|((?=.*\\bde vang|de con\\b)(?=.*\\b2015\\b))|((?=.*\\bkhi vang|khi con\\b)(?=.*\\b20016\\b)).*$",
        text: "Bố/mẹ trẻ tuổi mẫu giáo, nhà trẻ"
    },
    {
        regex: "^(?=.*\\bga vang|ga con\\b)(?=.*\\b2017\\b).*$",
        text: "Bố/mẹ trẻ tuổi tập đi"
    },
    {
        regex: "^(?=.*\\bcun con\\b)(?=.*\\b2018\\b).*$",
        text: "Bố/mẹ trẻ mới sinh/sắp sinh"
    }];

GlobalFunction.viet_tat = function (name) {
    var a = name.split(' ');
    var str = "";
    for (var i of a) {
        str += i[0];
    }
    return str;
}

GlobalFunction.build_search_and_in_mongo = function (field, search) {
    var list_search = [];
    if (search.indexOf('+') >= 0) {
        var a_search = search.split('+');
        list_search = a_search;
    } else {
        list_search.push(search);
    }
    var condition = { $and: [] };
    for (var item of list_search) {
        var cond = {};
        item = item.replace(/'"/gi, "");
        if (item.indexOf(',') >= 0) {
            item = GlobalFunction.stripUnicode(item, ' ');
            cond[field] = { $in: [] };
            var a_item = item.split(',');
            for (var it of a_item) {
                it = it.trim();
                cond[field]['$in'].push(it);
            }
        } else {
            item = GlobalFunction.stripUnicode(item, ' ');
            cond[field] = item;
        }
        condition['$and'].push(cond);
    }
    return condition;
}

GlobalFunction.build_search_common_in_mongo = function (params) {
    var condition_mongo = {};
    for (var param of params) {
        if (!GlobalFunction.contains(param.key, ['admin_common_controller', 'admin_filter_user_id'])) {
            if (param.value && param.value !== undefined) {
                if (!condition_mongo['$and']) {
                    condition_mongo['$and'] = [];
                }
                var k = param.key == 'name' ? 'list_keyword' : param.key;
                var v = param.value;
                var s = {};

                if (GlobalFunction.is_array(param.value)) {
                    s[k] = { $in: typeof(param.value) == 'string' ? param.value.toLowerCase() : param.value };
                }
                else {
                    s[k] = typeof(param.value) == 'string' ? param.value.toLowerCase() : param.value;
                }
                condition_mongo['$and'].push(s);
            }
        }
    }
    return condition_mongo;
}

GlobalFunction.build_field_list_name = function (name, list_obj, item = false) {
    var list_name = GlobalFunction.get_tags_by_list_tags_and_remove_tag(name, list_obj);
    var list_name_alias = [];
    for (var i_a of list_name) {
        if (i_a != 'thành phố') {
            list_name_alias.push(GlobalFunction.stripUnicode(i_a, ' '));
        }
    }
    return list_name_alias;
}

var list_sharding_keyword = {
    'cao dang nghe': ['cao dang'],
    'ho chi minh': ['sai gon'],
}

GlobalFunction.build_field_list_search = function (list_name) {
    var rs = [];
    for (var name of list_name) {
        var a = name.split(' ');
        var item_obj = {};
        item_obj[name] = 1;
        if (a.length > 1) {
            item_obj[name.replace(/ /gi, '')] = 1;
            item_obj[GlobalFunction.viet_tat(name)] = 1;
        }
        if (list_sharding_keyword[name]) {
            for (var i_name of list_sharding_keyword[name]) {
                item_obj[i_name] = 1;
            }
        }
        rs.push(Object.keys(item_obj));
    }
    return rs;
}

GlobalFunction.build_field_list_search_one_keyword = function (list_name, item = false) {
    var rs = [];
    var alias = list_name.join(' ');
    var list_all = [alias];
    for (var name of list_name) {
        if (list_sharding_keyword[name]) {
            var name_rs = [];
            for (var i_name of list_sharding_keyword[name]) {
                for (var it of list_all) {
                    var v = it.replace(name, i_name);
                    name_rs.push(v);
                }
            }
            list_all = list_all.concat(name_rs);
        }
    }
    for (var alias_2 of list_all) {
        rs.push(alias_2);
        rs.push(GlobalFunction.viet_tat(alias_2));
        rs.push(alias_2.replace(/ /gi, ''));
    }
    if (item) {
        if (item.code) {
            rs.push(item.code);
        }
        if (item.name && item.name.match(/ và /gi)) {
            var alias_full = GlobalFunction.stripUnicode(item.name, ' ').replace(/^truong /gi, '');
            var a = alias_full.split(' va ');
            if (a.length == 2) {
                rs.push(GlobalFunction.viet_tat(a[0]) + ' ' + GlobalFunction.viet_tat(a[1]));
            }
        }
    }
    return rs;
}
GlobalFunction.build_add_list_name = function (list_name_1, list_name_2, conma = '') {
    var r = [];
    for (var v of list_name_1) {
        for (var v1 of list_name_2) {
            r.push(v + conma + v1);
        }
    }
    return r;
}
GlobalFunction.build_list_name = function (list_name, min, max) {
    rs = list_name[min];
    for (var i = min + 1; i <= max; i++) {
        rs = GlobalFunction.build_add_list_name(rs, list_name[i]);
    }
    return rs;
}

GlobalFunction.add_list_two_array = function (a1, a2) {
    var rs = [];
    for (var item2 of a2) {
        rs.push(a1.concat(item2))
    }
    return rs;
}
GlobalFunction.number_two = {};
GlobalFunction.build_all_add_by_number_two = function (number) {
    if (GlobalFunction.number_two[number]) {
        return GlobalFunction.number_two[number];
    }
    var rs = [[number]];
    for (var i = 1; i < number; i++) {
        var r = GlobalFunction.add_list_two_array([i], GlobalFunction.build_all_add_by_number_two(number - i));
        for (var item1 of r) {
            rs.push(item1);
        }
    }
    GlobalFunction.number_two[number] = rs;
    return rs;

}

GlobalFunction.build_all_add_by_number = function (number) {
    var rs = GlobalFunction.build_all_add_by_number_two(number);
    var data = [];
    for (var item of rs) {
        if (item.length != 1 && item.length != number) {
            data.push(item);
        }
    }
    return data;
}
GlobalFunction.build_field_list_search_once = function (list_name) {
    var rs = [];
    var length = list_name.length;
    if (length > 2) {
        var list_name_all = [];
        for (var item of list_name) {
            var a = [item, item.replace(/ /gi, '')];
            if (item.split(' ').length > 1) {
                a.push(GlobalFunction.viet_tat(item));
            }
            list_name_all.push(a);
        }
        var r = GlobalFunction.build_all_add_by_number(length);
        for (var item_r of r) {
            var rs_1 = [];
            var start = 0;
            for (var i = 0; i < item_r.length; i++) {
                rs_1.push(GlobalFunction.build_list_name(list_name_all, start, start + item_r[i] - 1));
                start += item_r[i];
            }
            rs.push(rs_1);
        }

    }
    return rs;
}

GlobalFunction.remove_dublicate_element_in_array = function (a) {
    var r = {};
    for (var item of a) {
        r[item] = 1;
    }
    return Object.keys(r);
}

GlobalFunction.get_same_value_from_two_object = function (obj1, obj2) {
    var rs = {};
    for (var i in obj1) {
        if (obj2[i]) {
            rs[i] = obj1[i];
        }
    }
    return rs;
}

GlobalFunction.titleCase = function (str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        if (splitStr[i].toLowerCase() == "thpt" || splitStr[i].toLowerCase() == "ptth") {
            splitStr[i] = splitStr[i].toUpperCase()
        }
        else {
            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
        }
    }
    // Directly return the joined string
    return splitStr.join(' ');
}

GlobalFunction.get_list_keyword_by_name = function (name, flag = false) {
    var alias = GlobalFunction.stripUnicode(name, ' ');
    if (alias) {
        var name = GlobalFunction.removeSpecialCharacter(GlobalFunction.pretty_str_new(name));
        var l1 = GlobalFunction.get_list_keyword_by_sentence(alias.trim(), 0, 6);
        var l2 = GlobalFunction.get_list_keyword_by_sentence_all(name.trim(), 0, 6);
        if (flag) { l1.push(name); }
        var r_list_keyword = {};
        for (var it1 of l1) { r_list_keyword[it1] = 1; }
        for (var it1 of l2) { r_list_keyword[it1] = 1; }
        var list_keyword = Object.keys(r_list_keyword);
        if (!list_keyword) {
            list_keyword = [];
        }
        return list_keyword;
    } else {
        return [];
    }
}


GlobalFunction.convert_11_to_10_phone_number = function (mobile_phone) {
    var rule = [
        { "new": "0123", "rpl": /^(0|84)83/g },
        { "new": "0124", "rpl": /^(0|84)84/g },
        { "new": "0125", "rpl": /^(0|84)85/g },
        { "new": "0127", "rpl": /^(0|84)81/g },
        { "new": "0129", "rpl": /^(0|84)82/g },
        { "new": "0162", "rpl": /^(0|84)32/g },
        { "new": "0163", "rpl": /^(0|84)33/g },
        { "new": "0164", "rpl": /^(0|84)34/g },
        { "new": "0165", "rpl": /^(0|84)35/g },
        { "new": "0166", "rpl": /^(0|84)36/g },
        { "new": "0167", "rpl": /^(0|84)37/g },
        { "new": "0168", "rpl": /^(0|84)38/g },
        { "new": "0169", "rpl": /^(0|84)39/g },
        { "new": "0120", "rpl": /^(0|84)70/g },
        { "new": "0121", "rpl": /^(0|84)79/g },
        { "new": "0122", "rpl": /^(0|84)77/g },
        { "new": "0126", "rpl": /^(0|84)76/g },
        { "new": "0128", "rpl": /^(0|84)78/g },
        { "new": "0186", "rpl": /^(0|84)56/g },
        { "new": "0188", "rpl": /^(0|84)58/g },
        { "new": "0199", "rpl": /^(0|84)59/g },
    ];
    for (var r of rule) {
        var rs = mobile_phone.match(r.rpl);
        if (rs) {
            return mobile_phone.replace(rs, r.new);
        }
    }
    return mobile_phone;
}

GlobalFunction.convert_10_to_11_phone_number = function (mobile_phone) {
    var rule = [
        { "rpl": /^(0|84)123/g, "new": "083" },
        { "rpl": /^(0|84)124/g, "new": "084" },
        { "rpl": /^(0|84)125/g, "new": "085" },
        { "rpl": /^(0|84)127/g, "new": "081" },
        { "rpl": /^(0|84)129/g, "new": "082" },
        { "rpl": /^(0|84)162/g, "new": "032" },
        { "rpl": /^(0|84)163/g, "new": "033" },
        { "rpl": /^(0|84)164/g, "new": "034" },
        { "rpl": /^(0|84)165/g, "new": "035" },
        { "rpl": /^(0|84)166/g, "new": "036" },
        { "rpl": /^(0|84)167/g, "new": "037" },
        { "rpl": /^(0|84)168/g, "new": "038" },
        { "rpl": /^(0|84)169/g, "new": "039" },
        { "rpl": /^(0|84)120/g, "new": "070" },
        { "rpl": /^(0|84)121/g, "new": "079" },
        { "rpl": /^(0|84)122/g, "new": "077" },
        { "rpl": /^(0|84)126/g, "new": "076" },
        { "rpl": /^(0|84)128/g, "new": "078" },
        { "rpl": /^(0|84)186/g, "new": "056" },
        { "rpl": /^(0|84)188/g, "new": "058" },
        { "rpl": /^(0|84)199/g, "new": "059" },
    ];
    for (var r of rule) {
        var rs = mobile_phone.match(r.rpl);
        if (rs) {
            return mobile_phone.replace(rs, r.new);
        }
    }
    return mobile_phone;
}

GlobalFunction.ExcelDateToJSDate = function (serial) {
    var utc_days = Math.floor(serial - 25569);
    var utc_value = utc_days * 86400;
    var date_info = new Date(utc_value * 1000);

    var fractional_day = serial - Math.floor(serial) + 0.0000001;

    var total_seconds = Math.floor(86400 * fractional_day);

    var seconds = total_seconds % 60;

    total_seconds -= seconds;

    var hours = Math.floor(total_seconds / (60 * 60));
    var minutes = Math.floor(total_seconds / 60) % 60;

    var date = date_info.getDate() < 10 ? ('0' + date_info.getDate()) : date_info.getDate();
    var month = date_info.getMonth() + 1;
    month = month < 10 ? ('0' + month) : month;
    return date_info.getFullYear() + '-' + month + '-' + date;
}

GlobalFunction.unicodeAccent = function (str) {
    var charset_str = 'àáạảãâầấậẩẫăằắặẳẵầàèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴẦÀÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ';
    var charset = charset_str.split('');

    for (var i = 0; i < charset.length; i++) {
        var code = ("00000000" + (charset[i].charCodeAt(0).toString(16))).slice(-4);
        var unicodeStr = "\\u" + code;

        var re = new RegExp(charset[i], "gm");
        str = str.replace(re, unicodeStr);

    }

    return str;

}

GlobalFunction.exec = async function (command) {
    var def = Q.defer();
    exec(command, function (errors, stdout, stderr) {
        def.resolve({
            errors: errors, stdout: stdout, stderr: stderr
        });
    })
    return def.promise;
}

GlobalFunction.groupBy = function (arr, chart_name, filter_id, total) {
    var name = [], y = [], prev;
    arr.sort();
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] !== prev) {
            name.push(arr[i]);
            y.push(1);
        } else {
            y[y.length - 1]++;
        }
        prev = arr[i];
    }
    var groupByArr = [];
    for (var i = 0; i < name.length; i++) {
        groupByArr.push({
            y: y[i],
            name: name[i],
            label: name[i]
        });
    }
    var other = 0;
    var sum = 0;
    for (var yi of y) {
        sum += yi;
    }
    if (sum < total) {
        other = total - sum;
        groupByArr.push({
            y: other,
            name: "Chưa xác định",
            label: "Chưa xác định"
        });
    }
    var result = {
        id: filter_id,
        text: chart_name,
        data: groupByArr
    }
    return result;
}



GlobalFunction.number_format = function (so1) {
    if (typeof (so1) != 'string' && so1) {
        so1 = '' + so1;
    }
    so1 = so1.trim();
    var so = (so1 != '0' && so1 != '') ? String(so1.replace(/([^0-9.])+|^(0)+/gi, '')) : so1;
    var sotp = so.split('.');
    so = sotp[0];
    var xau2 = '';
    if (sotp.length > 1) {
        sotp[0] = '';
        xau2 = sotp.join('');
    }
    var mangso = so.split("");
    var count = mangso.length;
    var xau = "";
    var j = 1;
    for (var i = count - 1; i >= 0; i--) {
        xau = String(mangso[i]) + xau;
        if (j % 3 == 0 && j != count)
            xau = "," + xau;
        j++;

    }
    if (sotp.length > 1) {
        xau += '.' + xau2;
    }
    return xau;
}


GlobalFunction.calcToHop_x = function (item, list, start, limit) {
    var length = list.length;
    var r = [];
    if (limit < 4) {
        for (var i = start; i < length; i++) {
            var v = item + '_' + list[i];
            r.push(v);
            r = r.concat(x(v, list, i + 1, limit + 1));
        }
    }
    return r;
}

GlobalFunction.calcToHop = function (list) {
    var length = list.length;
    var rs = [];
    for (var i = 0; i < length; i++) {
        var item = list[i];
        rs.push(item);
        rs = rs.concat(GlobalFunction.calcToHop_x(item, list, i + 1, 2));
    }
    return rs;
}

GlobalFunction.dexwwwfurlenc = function (urljson) {
    var dstjson = {};
    var ret;
    var reg = /(?:^|&)(\w+)=(\w+)/g;
    while((ret = reg.exec(urljson)) !== null){
        dstjson[ret[1]] = ret[2];
    }
    return dstjson;
}
   

GlobalFunction.setcolormass = function (item,color_,colorcat, index){
    item["color"] = color_;
    if(item.children)
    {
        index++;
        var color = GlobalFunction.materialColor(colorcat, index);
        for(var i of item.children)
        {
            i = GlobalFunction.setcolormass(i,color,colorcat,index);
        }
    }
    return item;
}


GlobalFunction.countsum = function (jsonparent){
    jsonparent['sum'] = jsonparent.y;
    if(jsonparent.children)
    {
        for(var jsonchild of jsonparent.children)
        {
            jsonparent['sum'] += GlobalFunction.countsum(jsonchild);
        }
    }
    return jsonparent['sum'];
}

GlobalFunction.countTree = function (item, sum){
    sum += item.count;
    if(item.children)
    {
        for(var i of item.children)
        {
            sum+= GlobalFunction.countTree(i, 0);
        }
    }
    return sum;
}

GlobalFunction.pickRandomProperty = function (obj) {
    var result;
    var count = 0;
    for (var prop in obj)
        if (Math.random() < 1 / ++count)
        result = prop;
    return result;
}

GlobalFunction.randomListColor = function (i)
{
    var textArray = [
        'blueGrey',
        'red',
        'pink',
        'purple',
        'indigo',
        'blue',
        'cyan',
        'teal',
        'green',
        'lightGreen',
        'cyan',
        'lime',
        'yellow',
        'orange',
        'deepOrange',
    ];
    var randomNumber = textArray[i];
    //var randomNumber = Math.floor(Math.random()*textArray.length);
    
    return randomNumber;
}

GlobalFunction.materialColor = function (category,index) {
    var colors = {
        "red": [
          "#ffebee",
          "#ffcdd2",
          "#e57373",
          "#f44336",
          "#d32f2f",
          "#b71c1c",
        ],
        "pink": [
          "#fce4ec",
          "#f8bbd0",
          "#f06292",
          "#e91e63",
          "#c2185b",
          "#880e4f",
        ],
        "purple": [
          "#f3e5f5",
          "#e1bee7",
          "#ba68c8",
          "#9c27b0",
          "#7b1fa2",
          "#4a148c",
        ],
        "deepPurple": [
          "#ede7f6",
          "#d1c4e9",
          "#9575cd",
          "#673ab7",
          "#512da8",
          "#311b92",
        ],
        "indigo": [
          "#e8eaf6",
          "#c5cae9",
          "#7986cb",
          "#3f51b5",
          "#303f9f",
          "#1a237e",
        ],
        "blue": [
          "#e3f2fd",
          "#bbdefb",
          "#64b5f6",
          "#2196f3",
          "#1976d2",
          "#0d47a1",
        ],
        "lightBlue": [
          "#e1f5fe",
          "#b3e5fc",
          "#4fc3f7",
          "#03a9f4",
          "#0288d1",
          "#01579b",
        ],
        "cyan": [
          "#e0f7fa",
          "#b2ebf2",
          "#4dd0e1",
          "#00bcd4",
          "#0097a7",
          "#006064",
        ],
        "teal": [
          "#e0f2f1",
          "#b2dfdb",
          "#4db6ac",
          "#009688",
          "#00796b",
          "#004d40",
        ],
        "green": [
          "#e8f5e9",
          "#c8e6c9",
          "#81c784",
          "#4caf50",
          "#388e3c",
          "#1b5e20",
        ],
        "lightGreen": [
          "#f1f8e9",
          "#dcedc8",
          "#aed581",
          "#8bc34a",
          "#689f38",
          "#33691e",
        ],
        "lime": [
          "#f9fbe7",
          "#f0f4c3",
          "#dce775",
          "#cddc39",
          "#afb42b",
          "#827717",
        ],
        "yellow": [
          "#fffde7",
          "#fff9c4",
          "#fff176",
          "#ffeb3b",
          "#fbc02d",
          "#f57f17",
        ],
        "amber": [
          "#fff8e1",
          "#ffecb3",
          "#ffd54f",
          "#ffc107",
          "#ffa000",
          "#ff6f00",
        ],
        "orange": [
          "#fff3e0",
          "#ffe0b2",
          "#ffb74d",
          "#ff9800",
          "#f57c00",
          "#e65100",
        ],
        "deepOrange": [
          "#fbe9e7",
          "#ffccbc",
          "#ff8a65",
          "#ff5722",
          "#e64a19",
          "#bf360c",
        ],
        "brown": [
          "#efebe9",
          "#d7ccc8",
          "#a1887f",
          "#795548",
          "#5d4037",
          "#3e2723"
        ],
        "grey": [
          "#fafafa",
          "#eeeeee",
          "#bdbdbd",
          "#757575",
          "#424242",
          "#9e9e9e"
        ],
        "blueGrey": [
          "#eceff1",
          "#cfd8dc",
          "#90a4ae",
          "#607d8b",
          "#455a64",
          "#263238"
        ]
      }
    var colorList = colors[category];
    var newColor = colorList[colorList.length-1-index];
    return newColor;
  }

  GlobalFunction.generateBatchByLimit = function(list_pr, limit) {
    var list_all = [], list_item = [];
    var length = list_pr.length;
    for(var i = 0; i < length;i++) {
        list_item.push(list_pr[i]);
        if(i && i % limit == 0) {
            list_all.push(list_item);
            list_item = [];
        }
    }
    if(list_item.length) {
        list_all.push(list_item);
    }
    return list_all;
  }

  
  GlobalFunction.isIterable = function(obj) {
    if (obj == null) {
      return false;
    }
    return typeof obj[Symbol.iterator] === 'function';
  }