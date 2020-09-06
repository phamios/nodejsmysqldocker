exports = module.exports = GlobalValidate;
const GlobalFunction = require('./global_function');
const Q = require('q');
var Promise = require('promise');


function GlobalValidate(_model, _attribute) {
    var that = this;
    this.model = _model;
    var attribute = _attribute;
    this.set_rule_label();
}

GlobalValidate.prototype.set_rule_label = function () {
    this.rule = this.model.rule;
    this.attributeLabels = this.model.labelAttributes;
}

GlobalValidate.prototype.getAttribute = function (attribute) {
    return attribute ? attribute : this.attribute;
}

GlobalValidate.prototype.checkShow = function (attribute) {
    attribute = this.getAttribute(attribute);
    return !(!this.rule[attribute] || !this.rule[attribute].display || this.evalCondition(this.rule[attribute].display));
}

GlobalValidate.prototype.validateAttribute = function (attribute, type, options) {
    attribute = this.getAttribute(attribute);
    if (typeof (options) != 'object' || !options.require_by || this.evalCondition(options.require_by)) {
        return this['validate' + GlobalFunction.capitalizeFirstLetter(type)](attribute, options);
    }
    return '';
}

GlobalValidate.prototype.evalCondition = function (str) {
    return eval(str.replace(/this\./gi, 'this.model.'));
}

GlobalValidate.prototype.getErrorMsg = function (attribute, msg, options) {
    attribute = this.getAttribute(attribute);
    switch (typeof (options)) {
        case 'string':
            msg = options;
            break;
        case 'object':
            if (!options.on ||
                (typeof (options.on) == 'object' && options.on.filter(e => { return e == this.model.scenario }).length) ||
                (typeof (options.on) == 'string' && options.on == this.model.scenario)) {
                msg = options.message ? options.message : msg;
            } else {
                msg = '';
            }
            break;
    }
    return msg.replace('{attribute}', this.attributeLabels[attribute]);
}

GlobalValidate.prototype.error_value = function (attribute) {
    attribute = this.getAttribute(attribute);
    let require = this.rule[attribute] ? this.rule[attribute].require : false;
    let rs = '';
    let def = false;
    let LIMIT = 0, COUNT_LIMIT = 0, rs_msg = [];
    if (require) {
        if (typeof (require) == 'object') {
            for (let k in require) {
                let v = require[k];
                rs = this.validateAttribute(attribute, k, v);
                if (typeof (rs) == 'object') {
                    if (!def) { def = Q.defer(); }
                    LIMIT++;
                    rs.then(r => {
                        COUNT_LIMIT++;
                        if (r) { rs_msg.push(r); }
                        if (LIMIT == COUNT_LIMIT) { def.resolve(rs_msg.join("\n")); }
                    });
                } else {
                    rs_msg.push(rs);
                    break;
                }
            }
        } else {
            rs = this.validateAttribute(attribute, 'empty', require);
            if (rs) { rs_msg.push(rs); }
        }
    }
    if (def) {
        return def.promise;
    } else {
        return rs_msg.join("\n");
    }
}

GlobalValidate.prototype.getErrors = function (attributes = false) {
    let rs = {};
    var def = false, LIMIT = 0, COUNT_LIMIT = 0;
    function get_msg(i, rs_item) {
        if (typeof (rs_item) == 'object') {
            if (!def) { def = Q.defer(); }
            LIMIT++;
            rs_item.then(r => {
                COUNT_LIMIT++;
                if (r) { rs[i] = r; }
                if (LIMIT == COUNT_LIMIT) { def.resolve(rs); }
            });
        } else if (rs_item) {
            rs[i] = rs_item;
        }
    }
    var rs_attributes = !attributes || attributes === undefined ? this.rule : attributes;
    for (let i in rs_attributes) {
        let rs_item = this.error_value(i);
        get_msg(i, rs_item);
    }
    if (def) {
        return def.promise;
    } else {
        return Promise.resolve(rs);
    }
}

GlobalValidate.prototype.validate = function (attributes = false) {
    let rs = true;
    var def = false, LIMIT = 0, COUNT_LIMIT = 0;
    this.model.rs_msg = {};
    this.model.attr_validate = {};
    var that = this;
    function proccess_validate(i, rs_item) {
        if (!def) { def = Q.defer(); }
        rs_item.then(r => {
            COUNT_LIMIT++;
            if (r) { rs = false; that.model.rs_msg[i] = r; }
            if (LIMIT == COUNT_LIMIT) { def.resolve(rs); }
        });
    }
    var rs_attributes = !attributes || attributes === undefined ? this.rule : attributes;
    for (let i in rs_attributes) {
        var rs_item = this.error_value(i);
        if (typeof (rs_item) == 'object') {
            LIMIT++;
            proccess_validate(i, rs_item);
        } else if (rs_item) {
            this.model.attr_validate[i] = true;
            this.model.rs_msg[i] = rs_item;
            rs = false;
        }
    }
    if (def) {
        return def.promise;
    } else {
        return Promise.resolve(rs);
    }

}

GlobalValidate.prototype.validateEmpty = function (attribute, options) {
    attribute = this.getAttribute(attribute);
    let msg = '';
    let vl = this.model[attribute];
    if(vl !== undefined) { 
        if(GlobalFunction.is_array(vl)) {
            vl = vl.length ? '1' : '';
        } else if(typeof(vl) == 'object' && vl != null) {
            vl = Object.keys(vl).length ? '1' : '';
        } else {
            vl += ''; 
        }
    }
    if ((vl === undefined || !vl || !vl.trim() || vl == 'null') && vl !== '0' && vl !== 0) { msg = this.getErrorMsg(attribute, '{attribute} not empty', options); }
    return msg;
}

GlobalValidate.prototype.validateEmail = function (attribute, options) {
    attribute = this.getAttribute(attribute);
    let msg = '';
    let vl = this.model[attribute];
    if (!GlobalFunction.validateEmail(vl)) { msg = this.getErrorMsg(attribute, '{attribute} not email address', options); }
    return msg;
}

GlobalValidate.prototype.validatePhone = function (attribute, options) {
    attribute = this.getAttribute(attribute);
    let msg = '';
    let vl = this.model[attribute];
    if (!GlobalFunction.validatePhone(vl)) { msg = this.getErrorMsg(attribute, '{attribute} not phone format', options); }
    return msg;
}

GlobalValidate.prototype.validateSize = function (attribute, options) {
    attribute = this.getAttribute(attribute);
    let msg = '';
    let vl = this.model[attribute];
    if (!GlobalFunction.validateSize(vl, options.value)) { msg = this.getErrorMsg(attribute, '{attribute} max size {maxsize}'.replace('{maxsize}', options.value), options); }
    return msg;
}

GlobalValidate.prototype.validateDate = function (attribute, options) {
    attribute = this.getAttribute(attribute);
    let msg = '';
    let vl = this.model[attribute];
    if (!GlobalFunction.validateDate(vl)) { msg = this.getErrorMsg(attribute, '{attribute} date', options); }
    return msg;
}

GlobalValidate.prototype.validateExists = function (attribute, options) {
    attribute = this.getAttribute(attribute);

    var def = Q.defer;
    return this.model.exists(attribute).then(rs => {
        let msg = '';
        if (!rs) {
            msg = this.getErrorMsg(attribute, '{attribute} không tồn tại', options);
        }
        return Promise.resolve(msg);
    })
}

GlobalValidate.prototype.validateUnique = function (attribute, options) {
    attribute = this.getAttribute(attribute);

    var def = Q.defer;
    return this.model.unique(attribute, options).then(rs => {
        let msg = '';
        if (!rs) {
            msg = this.getErrorMsg(attribute, '{attribute} đã tồn tại', options);
        }
        return Promise.resolve(msg);
    })
}

GlobalValidate.prototype.validateDatePast = function (attribute, options) {
    attribute = this.getAttribute(attribute);
    let msg = '';
    let vl = this.model[attribute];
    if (!GlobalFunction.validateDatePast(vl)) { msg = this.getErrorMsg(attribute, '{attribute} <= ngày hiện tại', options); }
    return msg;
}

GlobalValidate.prototype.validatePositiveNumber = function (attribute, options) {
    attribute = this.getAttribute(attribute);
    let msg = '';
    let vl = this.model[attribute];
    if (!GlobalFunction.validatePositiveNumber(vl)) { msg = this.getErrorMsg(attribute, '{attribute} >= 0', options); }
    return msg;
}

GlobalValidate.prototype.validateSame = function (attribute = '', options) {
    if (!attribute) {
        attribute = this.attribute;
    }
    let msg = '';
    let vl = this.model[attribute];
    let attribute_2 = typeof (options) == 'object' ? options.attribute : options;
    if (vl && vl != this.model[attribute_2]) {
        let msg_base = '{attribute} không trùng với ' + this.attributeLabels[attribute_2].toLowerCase();
        msg = this.getErrorMsg(attribute, msg_base, options);
    }
    return msg;
}

GlobalValidate.prototype.validateNotsame = function (attribute = '', options) {
    if (!attribute) {
        attribute = this.attribute;
    }
    let msg = '';
    let vl = this.model[attribute];
    let attribute_2 = typeof (options) == 'object' ? options.attribute : options;
    if (vl && vl == this.model[attribute_2]) {
        let msg_base = '{attribute} không được trùng với ' + this.attributeLabels[attribute_2].toLowerCase();
        msg = this.getErrorMsg(attribute, msg_base, options);
    }
    return msg;
}

GlobalValidate.prototype.validatePassword = function (attribute = '', options) {
    if (!attribute) {
        attribute = this.attribute;
    }
    let msg = '';
    let vl = this.model[attribute];
    if (!GlobalFunction.validateMin(vl, 6)) {
        msg = this.getErrorMsg(attribute, '{attribute} phải >= 6 kí tự', options);
    }
    if (!msg && !GlobalFunction.validateRegex(vl, '(?=.*[a-zA-Z])(?=.*[0-9])')) {
        msg = this.getErrorMsg(attribute, '{attribute} phải bao gồm chữ và số', options);
    }
    return msg;
}



GlobalValidate.prototype.validateMin = function (attribute = '', options) {
    if (!attribute) {
        attribute = this.attribute;
    }
    let msg = '';
    let vl = this.model[attribute];
    var min = typeof (options) == 'object' ? options.value : options;
    if (!GlobalFunction.validateMin(vl, min)) {
        msg = this.getErrorMsg(attribute, '{attribute} phải >= {min} kí tự', options).replace('{min}', min);
    }
    return msg;
}
GlobalValidate.prototype.validateRegex = function (attribute = '', options) {
    if (!attribute) {
        attribute = this.attribute;
    }
    let msg = '';
    let vl = this.model[attribute];
    var regex = typeof (options) == 'object' ? options.value : options;
    if (!GlobalFunction.validateRegex(vl, regex)) {
        msg = this.getErrorMsg(attribute, '{attribute} không đúng định dạng {regex}', options).replace('{regex}', regex);
    }
    return msg;
}

GlobalValidate.prototype.validateFunc = function (attribute = '', options) {
    if (!attribute) {
        attribute = this.attribute;
    }
    
    let vl = this.model[attribute];
    var func = typeof(options) == 'function' ? options : options.func;
    var rs = func.apply(this.model);
    if(typeof(rs) == 'object') {
        return rs.then(msg => {
            return this.getErrorMsg(attribute, msg, msg);
        })
    } else {
        return this.getErrorMsg(attribute, rs, rs);
    }
    
}