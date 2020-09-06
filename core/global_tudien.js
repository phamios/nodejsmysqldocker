const GlobalFunction = require('./global_function');
const GlobalFile = require('./global_file');
fs = require('fs');

function GlobalTuDien() { }

// function global_tu_dien_get_word_anh
GlobalTuDien.global_tu_dien_get_word_anh = function () {
    global_tu_dien_word_anh_instance = false;
    if (!global_tu_dien_word_anh_instance) {
        var list = db.getCollection('tu_dien_anh').find().toArray();
        global_tu_dien_word_anh_instance = {};
        for (var item of list) {
            global_tu_dien_word_anh_instance[item._id] = item._id;
        }
    }
    return global_tu_dien_word_anh_instance;
}

// function global_tu_dien_get_word_viet
GlobalTuDien.global_tu_dien_get_word_viet = function () {
    global_tu_dien_word_viet_instance = false;
    if (!global_tu_dien_word_viet_instance) {
        var list = db.getCollection('tu_dien_viet').find().toArray();
        global_tu_dien_word_viet_instance = {};
        for (var item of list) {
            item.alias = item.alias.trim();
            global_tu_dien_word_viet_instance[item.alias] = item.alias;
        }

    }
    return global_tu_dien_word_viet_instance;
}

// function global_tu_dien_get_word_one
GlobalTuDien.global_tu_dien_get_word_one = function () {
    global_tu_dien_word_one_instance = false;
    if (!global_tu_dien_word_one_instance) {
        global_tu_dien_word_one_instance = {
            rs: {},
            rs_alias: {},
        };
        db.getCollection('tu_dien_viet').find().forEach(function (item) {
            var alias = item.alias.trim();
            if (!global_tu_dien_word_one_instance.rs[alias]) {
                global_tu_dien_word_one_instance.rs[alias] = {};
            }
            global_tu_dien_word_one_instance.rs_alias[alias] = alias;
            var a_list_str = get_list_keyword_by_word(alias);
            for (var b of a_list_str) {
                if (!global_tu_dien_word_one_instance.rs[b]) {
                    global_tu_dien_word_one_instance.rs[b] = {};
                }
                global_tu_dien_word_one_instance.rs[b][alias] = alias;
            }
        });
    }
    return global_tu_dien_word_one_instance;
}

// function global_tu_dien_get_same_word_one
GlobalTuDien.global_tu_dien_get_same_word_one = function (word) {
    if (typeof (global_tu_dien_word_viet_instance) == 'undefined' || !global_tu_dien_word_viet_instance) {
        global_tu_dien_get_word_viet();
    }
    if (!global_tu_dien_word_viet_instance[word]) {
        if (word.length >= 5) {
            var list_word = get_list_keyword_by_word(word, 3, 7);
            list_word.sort(function (item1, item2) {
                return item2.length - item1.length;
            })
            var rs = [];
            for (var item of list_word) {
                if (global_tu_dien_word_viet_instance[item]) {
                    var a_word = word.split(item);
                    var r = [item];
                    for (var it of a_word) {
                        r = r.concat(global_tu_dien_get_same_word_one(it));
                    }
                    rs.concat(r);
                }
            }
            if (rs.length) {
                return rs;
            }
        }
    }
    return [word];
}

// function global_tu_dien_get_same_word
GlobalTuDien.global_tu_dien_get_same_word = function (word) {

    if (typeof (global_tu_dien_word_one_instance) == 'undefined' || !global_tu_dien_word_one_instance) {
        global_tu_dien_get_word_one();
    }

    if (typeof (global_tu_dien_word_anh_instance) == 'undefined' || !global_tu_dien_word_anh_instance) {
        global_tu_dien_get_word_anh();
    }
    if (!global_tu_dien_word_one_instance.rs_alias[word] && word.length > 2) {
        if (word.match(/^[0-9]+$/gi)) {
            return word;
        }
        var list_word = get_list_keyword_by_word(word);
        list_word.sort(function (item1, item2) {
            return item2.length - item1.length;
        })
        var rs = {};
        var length = 0;
        for (var it of list_word) {
            if (global_tu_dien_word_one_instance.rs[it] && it.length == word.length - 1) {

                for (var k_2 in global_tu_dien_word_one_instance.rs[it]) {
                    var v = global_tu_dien_word_one_instance.rs[it][k_2];
                    rs[v] = {
                        length: it.length,
                        array_str: [v],
                    };
                    if (length < it.length) {
                        length = it.length;
                    }
                }
            } else if (global_tu_dien_word_one_instance.rs[it] && it.length == word.length - 2 && it.length > 1) {
                var a_word = word.split(it);
                for (var k_2 in global_tu_dien_word_one_instance.rs[it]) {
                    var v = global_tu_dien_word_one_instance.rs[it][k_2];
                    var a_it = v.split(it);
                    if (a_word[0] && a_it[0].indexOf(a_word[0]) >= 0) {
                        if (!rs[v] || it.length + a_word[0].length > rs[v].length) {
                            rs[v] = {
                                length: it.length + a_word[0].length,
                                array_str: [it, a_word[0]],
                            };
                        }
                    } else if (a_word[1] && a_it.length >= 2 && a_it[1].indexOf(a_word[1]) >= 0) {
                        if (!rs[v] || it.length + a_word[1].length > rs[v].length) {
                            rs[v] = {
                                length: it.length + a_word[1].length,
                                array_str: [it, a_word[1]],
                            };
                        }
                    } else {
                        if (!rs[v] || it.length > rs[v].length) {
                            rs[v] = {
                                length: it.length,
                                array_str: [it],
                            };
                        }
                    }
                    if (length < rs[v].length) {
                        length = rs[v].length;
                    }
                }
            }
        }
        it = '';
        i = 0;
        var fl = false;
        do {
            it += word[i];
            i++;
        }
        while (global_tu_dien_word_one_instance.rs[it]);
        i--;
        if (i) {
            it = word.substr(0, i);
            list_it = [];
            var a = "";
            for (var i = 0; i < it.length; i++) {
                a += it[i];
                list_it.push(a);
            }
            for (var it of list_it) {
                var i = it.length;
                var word_once = word.substr(i, word.length);
                var a_word_once = get_list_keyword_by_word(word_once);

                if (word.indexOf('j') > 0) {
                    data_2 = [];
                    for (var it_a of a_word_once) {
                        if (it_a.indexOf('j') >= 0) {
                            data_2.push(it_a.replace(/j/gi, 'i'));
                        }
                    }
                    if (data_2.length) {
                        a_word_once = a_word_once.concat(data_2);
                    }
                }
                if (word.indexOf('k') == word.length - 1) {
                    data_2 = [];
                    for (var it_a of a_word_once) {
                        if (it_a.indexOf('k') >= 0) {
                            data_2.push(it_a.replace(/k/gi, 'h'));
                        }
                    }
                    if (data_2.length) {
                        a_word_once = a_word_once.concat(data_2);
                    }
                }
                a_word_once.sort(function (it1, it2) {
                    return it2.length - it1.length;
                })
                for (var k_child in global_tu_dien_word_one_instance.rs[it]) {
                    if (k_child.indexOf(it) == 0) {
                        var k_child_2 = k_child.substr(it.length, k_child.length);
                        rs[k_child] = {
                            length: it.length,
                            array_str: [it],
                        };
                        if (length < it.length) {
                            length = it.length;
                        }
                        if (k_child_2) {
                            for (var it_word_once of a_word_once) {
                                if (k_child_2.indexOf(it_word_once) >= 0) {
                                    var l = it.length + it_word_once.length;
                                    rs[k_child] = {
                                        length: l,
                                        array_str: [it, it_word_once],
                                    };
                                    if (length < l) {
                                        length = l;
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
        var data = [];
        var data_2 = [];
        var length2 = 0;
        for (var k_rs in rs) {
            var v_rs = rs[k_rs];
            if (v_rs.length == length) {
                if (k_rs.length <= word.length + 2) {
                    if (word.indexOf(v_rs.array_str[0]) == 0) {
                        if (length2 < v_rs.array_str[0].length) {
                            length2 = v_rs.array_str[0].length;
                            data_2 = [];
                        }
                        if (length2 == v_rs.array_str[0].length) {
                            data_2.push({
                                name: k_rs,
                                array_str: v_rs.array_str,
                            });
                        }
                    } else {
                        data.push({
                            name: k_rs,
                            array_str: v_rs.array_str,
                        });
                    }
                }
            }
        }
        if (data_2.length) {
            data = data_2;
        }
        if (data.length > 1) {
            var data_new = [];
            for (var it of data) {
                if (it.name.length <= word.length) {
                    data_new.push(it);
                }
            }
            if (data_new.length) {
                data = data_new;
            }
            if (data.length > 1) {
                var data_new = [];
                for (var it of data) {
                    if (it.name.length <= word.length + 1) {
                        data_new.push(it);
                    }
                }
                if (data_new.length) {
                    data = data_new;
                }
            }
            var list_word_key = word.split('');
            if (word.indexOf('j') >= 0) {
                list_word_key.push('i');
            }
            if (word.indexOf('k') == word.length - 1) {
                list_word_key.push('h');
            }
        }
        if (data.length) {
            data = indexArray(data, 'name');
        }
        if (data.length == 1) {
            if (global_tu_dien_word_anh_instance[word]) {
                return [data[0], word];
            }
            if (data[0].length <= word.length + 1 && data[0].length >= word.length - 1) {
                if (data[0].match(/^[0-9]+$/gi)) {
                    return word;
                } else {
                    return data[0];
                }
            }
            return [data[0], word];
        } else {
            data.push(word);
            return data;
        }
    }
    return word;
}

// function global_tu_dien_get_word_two
GlobalTuDien.global_tu_dien_get_word_two = function () {
    global_tu_dien_word_two_instance = false;
    if (!global_tu_dien_word_two_instance) {
        global_tu_dien_word_two_instance = {};
        db.getCollection('tu_dien_viet_two').find().forEach(function (item) {
            if (!global_tu_dien_word_two_instance[item.alias]) {
                global_tu_dien_word_two_instance[item.alias] = {};
            }
            global_tu_dien_word_two_instance[item.alias][item._id] = item._id;
        });
    }
    return global_tu_dien_word_two_instance;
}

// function global_tu_dien_get_word_five
GlobalTuDien.global_tu_dien_get_word_five = function () {
    global_tu_dien_word_five_instance = false;
    if (!global_tu_dien_word_five_instance) {
        global_tu_dien_word_five_instance = {};
        db.getCollection('tu_dien_viet_five').find().forEach(function (item) {
            if (!global_tu_dien_word_five_instance[item.alias]) {
                global_tu_dien_word_five_instance[item.alias] = {};
            }
            global_tu_dien_word_five_instance[item.alias][item._id] = item._id;
        });
    }
    return global_tu_dien_word_five_instance;
}

// function global_tu_dien_get_word_four
GlobalTuDien.global_tu_dien_get_word_four = function () {
    global_tu_dien_word_four_instance = false;
    if (!global_tu_dien_word_four_instance) {
        global_tu_dien_word_four_instance = {};
        db.getCollection('tu_dien_viet_four').find().forEach(function (item) {
            if (!global_tu_dien_word_four_instance[item.alias]) {
                global_tu_dien_word_four_instance[item.alias] = {};
            }
            global_tu_dien_word_four_instance[item.alias][item._id] = item._id;
        });
    }
    return global_tu_dien_word_four_instance;
}

GlobalTuDien.global_tu_dien_get_word_three = function () {
    global_tu_dien_word_three_instance = false;
    if (!global_tu_dien_word_three_instance) {
        global_tu_dien_word_three_instance = {};
        db.getCollection('tu_dien_viet_three').find().forEach(function (item) {
            if (!global_tu_dien_word_three_instance[item.alias]) {
                global_tu_dien_word_three_instance[item.alias] = {};
            }
            global_tu_dien_word_three_instance[item.alias][item._id] = item._id;
        });
    }
    return global_tu_dien_word_three_instance;
}

// function global_tu_dien_get_same_word_two
GlobalTuDien.global_tu_dien_get_same_word_two = function (item1, item2) {
    if (typeof (global_tu_dien_word_two_instance) == 'undefined' || !global_tu_dien_word_two_instance) {
        global_tu_dien_get_word_two();
    }
    if (typeof (item1) != 'object') {
        item1 = [item1];
    }
    if (typeof (item2) != 'object') {
        item2 = [item2];
    }
    var rs = [];
    for (var it1 of item1) {
        for (var it2 of item2) {
            var sten = it1 + ' ' + it2;
            if (global_tu_dien_word_two_instance[sten]) {
                rs.push(sten);
            }
        }
    }
    return rs.length == 1 ? rs[0] : false;
}

// function global_tu_dien_get_same_word_three
GlobalTuDien.global_tu_dien_get_same_word_three = function (item1, item2, item3) {
    if (typeof (global_tu_dien_word_three_instance) == 'undefined' || !global_tu_dien_word_three_instance) {
        global_tu_dien_get_word_three();
    }
    if (typeof (item1) != 'object') {
        item1 = [item1];
    }
    if (typeof (item2) != 'object') {
        item2 = [item2];
    }
    if (typeof (item3) != 'object') {
        item3 = [item3];
    }
    var rs = [];
    for (var it1 of item1) {
        for (var it2 of item2) {
            for (var it3 of item3) {
                var sten = it1 + ' ' + it2 + ' ' + it3;
                if (global_tu_dien_word_three_instance[sten]) {
                    rs.push(sten);
                }
            }
        }
    }
    return rs.length == 1 ? rs[0] : false;
}

// function global_tu_dien_get_same_word_four
GlobalTuDien.global_tu_dien_get_same_word_four = function (item1, item2, item3, item4) {
    if (typeof (global_tu_dien_word_four_instance) == 'undefined' || !global_tu_dien_word_four_instance) {
        global_tu_dien_get_word_four();
    }
    if (typeof (item1) != 'object') {
        item1 = [item1];
    }
    if (typeof (item2) != 'object') {
        item2 = [item2];
    }
    if (typeof (item3) != 'object') {
        item3 = [item3];
    }
    if (typeof (item4) != 'object') {
        item4 = [item4];
    }
    var rs = [];
    for (var it1 of item1) {
        for (var it2 of item2) {
            for (var it3 of item3) {
                for (var it4 of item4) {
                    var sten = it1 + ' ' + it2 + ' ' + it3 + ' ' + it4;
                    if (global_tu_dien_word_four_instance[sten]) {
                        rs.push(sten);
                    }
                }
            }
        }
    }
    return rs.length == 1 ? rs[0] : false;
}

// function global_tu_dien_get_same_word_five
GlobalTuDien.global_tu_dien_get_same_word_five = function (item1, item2, item3, item4, item5) {
    if (typeof (global_tu_dien_word_five_instance) == 'undefined' || !global_tu_dien_word_five_instance) {
        global_tu_dien_get_word_four();
    }
    if (typeof (item1) != 'object') {
        item1 = [item1];
    }
    if (typeof (item2) != 'object') {
        item2 = [item2];
    }
    if (typeof (item3) != 'object') {
        item3 = [item3];
    }
    if (typeof (item4) != 'object') {
        item4 = [item4];
    }
    if (typeof (item5) != 'object') {
        item5 = [item5];
    }
    var rs = [];
    for (var it1 of item1) {
        for (var it2 of item2) {
            for (var it3 of item3) {
                for (var it4 of item4) {
                    for (var it5 of item5) {
                        var sten = it1 + ' ' + it2 + ' ' + it3 + ' ' + it4 + ' ' + it5;
                        if (global_tu_dien_word_five_instance[sten]) {
                            rs.push(sten);
                        }
                    }
                }
            }
        }
    }
    return rs.length == 1 ? rs[0] : false;
}



// function global_tu_dien_get_list_array_sentence
GlobalTuDien.global_tu_dien_get_list_array_sentence = function (sentence_alias) {
    if (typeof (global_tu_dien_word_three_instance) == 'undefined') {
        build_tu_dien_by_collection_name();
    }
    sentence_alias = sentence_alias.trim();
    if (!sentence_alias) {
        return "";
    }
    var list_word = sentence_alias.split(' ');
    var rs = [];
    var i = 0;
    for (var word of list_word) {
        var word_trust = global_tu_dien_get_same_word(word);
        rs.push(word_trust);
    }
    var length = rs.length;
    if (length == 1) {
        if (typeof (rs[0]) == 'object') {
            return rs[0].length == 1 ? rs[0][0] : sentence_alias;
        } else {
            return rs[0];
        }
    }
    var rs_new = [];
    var i = 0;
    while (rs.length) {
        var item = rs[0];
        if (length >= 5) {
            var it = global_tu_dien_get_same_word_five(item, rs[1], rs[2], rs[3], rs[4]);
            if (it) {
                rs_new.push(it);
                rs.splice(0, 5);
                i += 5;
                continue;
            } rs.length
        }
        if (rs.length >= 4) {
            var it = global_tu_dien_get_same_word_four(item, rs[1], rs[2], rs[3]);
            if (it) {
                rs_new.push(it);
                rs.splice(0, 4);
                i += 4;
                continue;
            }
        }
        if (rs.length >= 3) {
            var it = global_tu_dien_get_same_word_three(item, rs[1], rs[2]);
            if (it) {
                rs_new.push(it);
                rs.splice(0, 3);
                i += 3;
                continue;
            }
        }
        if (rs.length >= 2) {
            var it = global_tu_dien_get_same_word_two(item, rs[1]);
            if (it) {
                rs_new.push(it);
                rs.splice(0, 2);
                i += 2;
                continue;
            }
        }
        if (typeof (item) == 'object') {
            item = list_word[i];
        }
        rs_new.push(item);
        rs.splice(0, 1);
        i += 1;
    }
    return rs_new;
}



// function global_tu_dien_get_trust_sentence_alias
GlobalTuDien.global_tu_dien_get_trust_sentence_alias = function (sentence_alias) {
    return (global_tu_dien_get_list_array_sentence(sentence_alias)).join(' ');
}

// function get_tu_dien_from_collection_name
GlobalTuDien.get_tu_dien_from_collection_name = function (collection_name) {
    var obj_add_tu_dien = {
        word_five_instance: {},
        word_four_instance: {},
        word_three_instance: {},
        word_two_instance: {},
        word_one_instance: {},
    };
    db.getCollection(collection_name).find().forEach(function (item) {
        for (var alias of item.list_keyword) {
            var a = alias.split(' ');
            var length = a.length;
            var k = '';
            switch (length) {
                case 1: k = 'word_one_instance'; break;
                case 2: k = 'word_two_instance'; break;
                case 3: k = 'word_three_instance'; break;
                case 4: k = 'word_four_instance'; break;
                case 5: k = 'word_five_instance'; break;
            }
            if (k) {
                if (!obj_add_tu_dien[k][alias]) {
                    obj_add_tu_dien[k][alias] = {};
                }
                obj_add_tu_dien[k][alias][item.name] = item.name;
                if (k == 'word_one_instance') {
                    for (var i_a of a) {
                        if (!obj_add_tu_dien['word_one_instance'][i_a]) {
                            obj_add_tu_dien['word_one_instance'][i_a] = {};
                        }
                        obj_add_tu_dien['word_one_instance'][i_a][i_a] = i_a;
                    }
                }
            }
        }
    });
    return obj_add_tu_dien;
}

// function build_tu_dien_by_collection_name
GlobalTuDien.build_tu_dien_by_collection_name = function (list_collection_name = false, array_keyword = []) {
    global_tu_dien_get_word_five();
    global_tu_dien_get_word_four();
    global_tu_dien_get_word_three();
    global_tu_dien_get_word_two();
    global_tu_dien_get_word_one();

    if (list_collection_name) {
        if (typeof (list_collection_name) == 'string') {
            list_collection_name = [list_collection_name];
        }
        for (var collection_name of list_collection_name) {
            var obj_add_tu_dien = get_tu_dien_from_collection_name(collection_name);
            if (obj_add_tu_dien['word_five_instance']) {
                for (var it in obj_add_tu_dien['word_five_instance']) {
                    global_tu_dien_word_five_instance[it] = obj_add_tu_dien['word_five_instance'][it];
                }
            }
            if (obj_add_tu_dien['word_four_instance']) {
                for (var it in obj_add_tu_dien['word_four_instance']) {
                    global_tu_dien_word_four_instance[it] = obj_add_tu_dien['word_four_instance'][it];
                }
            }
            if (obj_add_tu_dien['word_three_instance']) {
                for (var it in obj_add_tu_dien['word_three_instance']) {
                    global_tu_dien_word_three_instance[it] = obj_add_tu_dien['word_three_instance'][it];
                }
            }
            if (obj_add_tu_dien['word_two_instance']) {
                for (var it in obj_add_tu_dien['word_two_instance']) {
                    global_tu_dien_word_two_instance[it] = obj_add_tu_dien['word_two_instance'][it];
                }
            }
            if (obj_add_tu_dien['word_one_instance']) {
                for (var item in obj_add_tu_dien['word_one_instance']) {
                    var obj = obj_add_tu_dien['word_one_instance'][item];
                    if (!global_tu_dien_word_one_instance.rs[item]) {
                        global_tu_dien_word_one_instance.rs[item] = {};
                    }
                    for (var it in obj) {
                        global_tu_dien_word_one_instance.rs[item][it] = obj[it];
                    }
                    global_tu_dien_word_one_instance.rs_alias[item] = item;
                }
            }
        }
    }
    var tu_dien_word_instance = false;
    for (var item of array_keyword) {
        var a = item.split(' ');
        tu_dien_word_instance = false;
        switch (a.length) {
            case 5: tu_dien_word_instance = global_tu_dien_word_five_instance; break;
            case 4: tu_dien_word_instance = global_tu_dien_word_four_instance; break;
            case 3: tu_dien_word_instance = global_tu_dien_word_three_instance; break;
            case 2: tu_dien_word_instance = global_tu_dien_word_two_instance; break;
            case 1:
                if (!global_tu_dien_word_one_instance.rs[item]) {
                    global_tu_dien_word_one_instance.rs[item] = {};
                }
                global_tu_dien_word_one_instance.rs[item][item] = item;
                global_tu_dien_word_one_instance.rs_alias[item] = item;
                break;
        }
        if (tu_dien_word_instance) {
            if (!tu_dien_word_instance[item]) {
                tu_dien_word_instance[item] = {};
            }
            tu_dien_word_instance[item][item] = item;
            for (var i_a of a) {
                if (!global_tu_dien_word_one_instance.rs[i_a]) {
                    global_tu_dien_word_one_instance.rs[i_a] = {};
                }
                global_tu_dien_word_one_instance.rs[i_a][i_a] = i_a;
                global_tu_dien_word_one_instance.rs_alias[i_a] = i_a;
            }
        }
    }
}

// function get_data_from_collection_name
GlobalTuDien.get_data_from_collection_name = function (collection_name, array_replace) {
    var list_obj_1 = {};
    var list_obj_2 = {};
    var list_obj_3 = {};
    var list_obj_4 = {};
    var list_obj_5 = {};
    var list_obj_6 = {};
    var re = new RegExp('(^(' + array_replace.join('|') + ') )|( - )', 'gi');
    db.getCollection(collection_name).find({}).forEach(function (item) {
        var name = item.name.toLowerCase().replace(re, '');
        name = name.replace(/[ ]+/gi, ' ');
        var length = name.split(' ').length;
        var l = false;
        switch (length) {
            case 1: l = list_obj_1; break;
            case 2: l = list_obj_2; break;
            case 3: l = list_obj_3; break;
            case 4: l = list_obj_4; break;
            case 5: l = list_obj_5; break;
            case 6: l = list_obj_6; break;
        }
        if (l) {
            l[name] = {
                _id: name,
                alias: stripUnicode(name),
                length: name.length,
            };
        }
    })
    if (Object.keys(list_obj_1).length) {
        insert_data_ignore_not_update(get_value_object(list_obj_1), 'tu_dien_viet');
    }
    if (Object.keys(list_obj_2).length) {
        insert_data_ignore_not_update(get_value_object(list_obj_2), 'tu_dien_viet_two');
    }
    if (Object.keys(list_obj_3).length) {
        insert_data_ignore_not_update(get_value_object(list_obj_3), 'tu_dien_viet_three');
    }
    if (Object.keys(list_obj_4).length) {
        insert_data_ignore_not_update(get_value_object(list_obj_4), 'tu_dien_viet_four');
    }
    if (Object.keys(list_obj_5).length) {
        insert_data_ignore_not_update(get_value_object(list_obj_5), 'tu_dien_viet_five');
    }
    if (Object.keys(list_obj_6).length) {
        insert_data_ignore_not_update(get_value_object(list_obj_6), 'tu_dien_viet_six');
    }
}




// function global_tu_dien_insert_data_by_array
GlobalTuDien.global_tu_dien_insert_data_by_array = function (array_value) {
    var list_obj_1 = {};
    var list_obj_2 = {};
    var list_obj_3 = {};
    var list_obj_4 = {};
    var list_obj_5 = {};
    var list_obj_6 = {};
    for (var name of array_value) {
        name = name.toLowerCase().replace(/[ ]+/gi, ' ');
        var length = name.split(' ').length;
        var l = false;
        switch (length) {
            case 1: l = list_obj_1; break;
            case 2: l = list_obj_2; break;
            case 3: l = list_obj_3; break;
            case 4: l = list_obj_4; break;
            case 5: l = list_obj_5; break;
            case 6: l = list_obj_6; break;
        }
        if (l) {
            l[name] = {
                _id: name,
                alias: stripUnicode(name),
                length: name.length,
            };
        }
    }
    if (Object.keys(list_obj_1).length) {
        insert_data_ignore_not_update(get_value_object(list_obj_1), 'tu_dien_viet');
    }
    if (Object.keys(list_obj_2).length) {
        insert_data_ignore_not_update(get_value_object(list_obj_2), 'tu_dien_viet_two');
    }
    if (Object.keys(list_obj_3).length) {
        insert_data_ignore_not_update(get_value_object(list_obj_3), 'tu_dien_viet_three');
    }
    if (Object.keys(list_obj_4).length) {
        insert_data_ignore_not_update(get_value_object(list_obj_4), 'tu_dien_viet_four');
    }
    if (Object.keys(list_obj_5).length) {
        insert_data_ignore_not_update(get_value_object(list_obj_5), 'tu_dien_viet_five');
    }
    if (Object.keys(list_obj_6).length) {
        insert_data_ignore_not_update(get_value_object(list_obj_6), 'tu_dien_viet_six');
    }
}

// function get_data_from_collection_ref_city_county
GlobalTuDien.get_data_from_collection_ref_city_county = function () {
    get_data_from_collection_name('ref_city_county', [
        'huyện',
        'quận',
        'thị xã',
        'xã',
        'thành phố',
        'phường',
        'thị trấn',
        'p\\.',
        'tp\\.',
        'tt\\.',
        'tt'
    ]);

}

// function get_data_from_collection_ref_school_1
GlobalTuDien.get_data_from_collection_ref_school_1 = function () {
    get_data_from_collection_name('ref_school_1', [
        'huyện',
        'quận',
        'thị xã',
        'xã',
        'thành phố',
        'phường',
        'thị trấn',
        'p\\.',
        'tp\\.',
        'tt\\.',
        'tt'
    ]);

}