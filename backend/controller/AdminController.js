var GlobalController = require('../../core/global_controller');
const GlobalFunction = require('../../core/global_function');
const GlobalFile = require('../../core/global_file');
var GlobalExcel = require('../../core/global_excel');
var CONFIG = require('../../config/config');
var path = require('path');
var mime = require('mime');
var fs = require('fs');
const Q = require('q');
var Promise = require('promise');
var settings_images_require = require('../../models/common/SettingsImages');
var settings_files_require = require('../../models/common/SettingsFiles');
var GlobalEmail = require('../../core/global_email');

var role_require = require('../../models/common/Role');
var system_setting = require('../../models/common/SystemSetting');
var userColumnMul = require('../../models/common/UserAdminTableColumnMul');

var Changepassword_require = require('../../models/common/Changepassword');
var changepassword = new Changepassword_require();
var XLSX = require('xlsx');
var request = require('request');

AdminController = GlobalFunction.cloneFunc(GlobalController);



AdminController.prototype.init = function () {
    GlobalController.prototype.init.apply(this, arguments);
}

AdminController.prototype.actionCreate = function (model) {
    var that = this;
    var attributes = this.req.query.attributes || this.req.body.attributes;
    var table_name = this.req.body.table_name || this.req.query.table_name;
    if (this.req.role[table_name + '_create']) {
        this.model.setAttributes(attributes);
        return this.model.validate().then(r => {
            if (r) {
                return this.model.save(false).then(r => {
                    if (attributes['reFindOneData']) {
                        return that.model.findOneData({ id: that.model.id }).then(rs => {
                            return {
                                code: 200,
                                attributes: rs,
                            }
                        });
                    } else {
                        var a = {
                            code: 200,
                            attributes: that.model.getAttributes(),
                        };
                        return a;
                    }
                });
            } else {
                return Promise.resolve({
                    code: 400,
                    error: this.model.rs_msg,
                });
            }
        })
    } else {
        return Promise.resolve({
            code: 400,
            message: "Bạn không có quyền tạo bảng này"
        });
    }
}

AdminController.prototype.actionUpdate = function () {
    var attributes = this.req.query.attributes || this.req.body.attributes;
    var id = this.req.query.id || this.req.body.id;
    
    var that = this;
    var table_name = this.req.body.table_name || this.req.query.table_name;
    if (this.req.role[table_name + '_update']) {
        return this.model.findOne(id, false).then(rs => {
            if (rs) {
                for (var i in attributes) {
                    if (attributes[i] == 'null' && !GlobalFunction.contains(this.model.rule[i].type, ['any', 'string', 'varchar', 'text', 'longtext'])) {
                        attributes[i] = null;
                    }
                }
                this.model.setAttributes(attributes);
                this.model.ID = this.model.id;
                return this.model.validate().then(r => {
                    if (r) {
                        return this.model.save(false).then(r => {
                            if (attributes['reFindOneData']) {
                                return that.model.findOneData({ id: id }).then(rs => {
                                    return {
                                        code: 200,
                                        attributes: rs,
                                    }
                                });
                            } else {
                                return {
                                    code: 200,
                                    attributes: that.model.getAttributes(),
                                };
                            }
                        });
                    } else {
                        return Promise.resolve({
                            code: 400,
                            error: this.model.rs_msg,
                        });
                    }
                });
            } else {
                return Promise.resolve({
                    code: 400,
                    error: { id: 'Id not found' }
                });
            }
        });
    } else {
        return Promise.resolve({
            code: 400,
            message: "Bạn không có quyền update bảng này"
        });
    }
}

AdminController.prototype.actionView = function () {
    if (this.req.role[this.req.query.table_name + '_read']) {
        return this.model.findOne(this.req.query.id);
    } else {
        return Promise.resolve({
            code: 400,
            message: "Bạn không có quyền xem bảng này"
        });
    }
}

AdminController.prototype.actionImport = function () {
    return this.model.import(this.readexcel(this.req.query.data || this.req.body.data)).then(r => {
        return {
            code        : 200,
            attributes  : r,
        }
    });
}

AdminController.prototype.readexcel = function(data) {
    var data = this.req.query.data || this.req.body.data;
    data = data.replace("data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,","");
    var workbook = XLSX.read(data.replace(/_/g, "/").replace(/-/g, "+"), {type:'base64'})

    var excel = new GlobalExcel(false);
    excel.setWorkbook(workbook);
    return excel.getData();
}

AdminController.prototype.put_actionReadexcel = function () {
    return Promise.resolve({
        code: 200,
        data: this.readexcel()
    });
}


AdminController.prototype.put_actionDownloadtemplate = function (model) {
    var fn = this.req.query.data || this.req.body.data;
    // read binary data
    var dat = fs.readFileSync(CONFIG.APPLiCATION_PATH + 'core/template/' + fn);
    // convert binary data to base64 encoded string
    var buff = new Buffer(dat).toString('base64');

    return Promise.resolve({
        code: 200,
        data: buff
    });
}

AdminController.prototype.post_actionRefkattribute = async function() {
    var table_name = this.req.body.table_name;
    var attribute = this.req.body.attribute;
    var cond = this.req.body.condition;
    if (this.req.role[table_name + '_read']) {
        return this.model.ref_fk_by_attribute(attribute, cond);
    } else {
        return Promise.resolve({
            code: 400,
            message: "Bạn không có quyền xem bảng này"
        });
    }
}

AdminController.prototype.actionGetfkmul = function () {
    var table_name = this.req.body.table_name || this.req.query.table_name;
    if (this.req.role[table_name + '_read']) {
        return this.model.get_fk_mul();
    } else {
        return Promise.resolve({
            code: 400,
            message: "Bạn không có quyền xem bảng này"
        });
    }
}

AdminController.prototype.actionRead = function () {
    var table_name = this.req.body.table_name || this.req.query.table_name;
    if (this.req.role[table_name + '_read']) {
        var params = this.model.get_condition_from_query();
        return this.model.searchAdvance(params.condition, params.limit, params.offset);
    } else {
        return Promise.resolve({
            code: 400,
            message: "Bạn không có quyền xem bảng này"
        });
    }
}

AdminController.prototype.actionFindonedata = function () {
    if (GlobalFunction.contains(this.req.query.table_name,['admin_table','admin_page','admin_page_line','admin_page_cell']) || this.req.role[this.req.query.table_name + '_read']) {
        var params = this.req.query;
        delete params['token'];
        delete params['table_name'];
        return this.model.findOneData(params);
    } else {
        return Promise.resolve({
            code: 400,
            message: "Bạn không có quyền xem bảng này"
        });
    }
}

AdminController.prototype.actionFindalldata = function () {
    var table_name = this.req.body.table_name || this.req.query.table_name;
    if (this.req.role[table_name + '_read']) {
        var params = this.req.query;
        delete params['token'];
        delete params['table_name'];
        return this.model.findAllData(params);
    } else {
        return Promise.resolve({
            code: 400,
            message: "Bạn không có quyền xem bảng này"
        });
    }
}

AdminController.prototype.actionCopy = function (model) {
    var table_name = this.req.body.table_name || this.req.query.table_name;
    if (this.req.role[table_name + '_create']) {
        return this.model.findOne(this.req.query.id, true).then(rs => {
            if (rs) {
                var model2 = new this.model_require();
                model2.setAttributes(this.model.getAttributes());
                return model2.save().then(r => {
                    return Promise.resolve({
                        code: 200,
                    });
                });
            } else {
                return Promise.resolve({
                    code: 400,
                    message: 'Id not found'
                });
            }
        });

    } else {
        return Promise.resolve({
            code: 400,
            message: "Bạn không có quyền tạo bảng này"
        });
    }
}

AdminController.prototype.post_actionApproveall = function (model) {
    var where = this.req.body.where;
    var table_name = this.req.body.table_name || this.req.query.table_name;
    if (this.req.role[table_name + '_update']) {
        if (typeof (where) == 'object') {

            return this.model.approveAll(where).then(rs => {
                return Promise.resolve({
                    code: 200,
                });
            });

        } else {
            return Promise.resolve({
                code: 400,
                message: "điều kiện phê duyệt không đúng"
            });
        }
    } else {
        return Promise.resolve({
            code: 400,
            message: "Bạn không có quyền phê duyệt bảng này"
        });
    }
}

AdminController.prototype.post_actionDeleteall = function (model) {
    var where = this.req.body.where;
    var table_name = this.req.body.table_name || this.req.query.table_name;
    if (this.req.role[table_name + '_delete']) {
        if (typeof (where) == 'object') {

            return this.model.deleteAll(where).then(rs => {
                return Promise.resolve({
                    code: 200,
                });
            });
        } else {
            return Promise.resolve({
                code: 400,
                message: "điều kiện xóa không đúng"
            });
        }
    } else {
        return Promise.resolve({
            code: 400,
            message: "Bạn không có quyền xóa bảng này"
        });
    }
}

AdminController.prototype.actionDelete = async function (model) {
    var id = this.req.query.id;
    var table_name = '';
    table_name = this.req.query['table_name'];
    if (!id || id === undefined) {
        var query = this.req.query;
        delete query['table_name'];
        id = Object.assign({}, query);
    }
    if (this.req.role[table_name + '_delete']) {
        if (typeof (id) == 'object') {
            var rs = await this.model.deleteAll(id);
            if(rs){}
            return Promise.resolve({
                code: 200,
            });
        } else {
            return this.model.delete(id).then(rs => {
                return Promise.resolve({
                    code: 200,
                });
            });
        }
    } else {
        return Promise.resolve({
            code: 400,
            message: "Bạn không có quyền xóa bảng này"
        });
    }
}

AdminController.prototype.actionStatus = function (model) {
    var table_name = this.req.body.table_name || this.req.query.table_name;
    if (this.req.role[table_name + '_update']) {
        return this.model.findOne(this.req.query.id, true).then(rs => {
            if (rs && this.req.query.attr) {
                this.model[this.req.query.attr] = this.req.query.value;
                return this.model.save(false).then(rs => {
                    return Promise.resolve({
                        code: 200,
                    });
                })
            } else {
                return Promise.resolve({
                    code: 400,
                    message: 'Id not found'
                });
            }
        });
    } else {
        return Promise.resolve({
            code: 400,
            message: "Bạn không có quyền update bảng này"
        });
    }
}

AdminController.prototype.post_actionImage = function (model) {
    var body = this.req.body;
    var settings_images = new settings_images_require();
    return settings_images.uploadImage(body);
}

AdminController.prototype.post_actionFile = function (model) {
    var body = this.req.body;
    var settings_files = new settings_files_require();
    return settings_files.uploadFile(body);
}


AdminController.prototype.post_actionImport = async function () {
    return this.actionImport();
    // var data = this.req.query.data || this.req.body.data;
    // data_after = data.replace("data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,","");
    // if(data_after == data)
    // {
    //     return Promise.resolve(false);
    // }
    // var workbook = XLSX.read(data_after.replace(/_/g, "/").replace(/-/g, "+"), {type:'base64'})

    // var excel = new GlobalExcel(false);
    // excel.setWorkbook(workbook);
    // var that = this;
    // var rs = await this.model.search_by_excel(excel.getData(), this.req.user.id, this.req.user.display_name);
    // var r = await GlobalFunction.runMultiRequest(rs, function(data,index){
    //     var md = that.model.get_class_new_by_table_name(that.model.tableName());
    //     md.setAttributes(data[index]);
    //     return md.save();
    // },20);
    // if(r){}
    // return Promise.resolve(true);
}

AdminController.prototype.post_actionUpdateattribute = function () {
    var table_name = this.req.body.table_name || this.req.query.table_name;
    if (this.req.role[table_name + '_update']) {
        var that = this;
        var attributes = this.req.query.attributes || this.req.body.attributes;
        var id = this.req.query.id || this.req.body.id;
        return this.model.findOne(id, true).then(rs => {
            if (rs) {
                for (var i in attributes) {
                    if (attributes[i] == 'null') {
                        attributes[i] = null;
                    }
                }
                that.model.setAttributes(attributes);
                return that.model.validate_attributes(attributes).then(r => {
                    if (r) {
                        return that.model.save(false).then(r => {
                            return {
                                code: 200,
                                attributes: that.model.getAttributes(),
                            };
                        });
                    } else {
                        return Promise.resolve({
                            code: 400,
                            error: that.model.rs_msg,
                        });
                    }
                });
            } else {
                return Promise.resolve({
                    code: 400,
                    error: { id: 'Id not found' }
                });
            }
        });
    } else {
        return Promise.resolve({
            code: 400,
            message: "Bạn không có quyền update bảng này"
        });
    }
}

AdminController.prototype.post_actionUpdateattributemany = function () {
    var table_name = this.req.body.table_name || this.req.query.table_name;
    if (this.req.role[table_name + '_update']) {
        var that = this;
        var attributes = this.req.query.attributes || this.req.body.attributes;
        var ids = this.req.query.ids || this.req.body.ids;
        this.model.setAttributes(attributes);
        return this.model.validate_attributes(attributes).then(r => {
            if (r) {
                return that.model.update_attributes_many(attributes, ids).then(r => {
                    return Promise.resolve({
                        code: 200,
                    });
                })
            } else {
                return Promise.resolve({
                    code: 400,
                    error: that.model.rs_msg,
                });
            }
        });
    } else {
        return Promise.resolve({
            code: 400,
            message: "Bạn không có quyền update bảng này"
        });
    }
}

AdminController.prototype.get_actionListrole = function (model) {
    var role = new role_require();
    role.req = this.req;
    var condition = this.req.query;
    if (condition && typeof (condition) == 'object') {
        delete condition['token'];
        delete condition['limit'];
    }
    return role.get_list_role(condition).then(r => {
        return Promise.resolve({
            'count': r.length,
            'list': r,
        });
    });
}

AdminController.prototype.get_actionHeaderrole = function (model) {
    var role = new role_require();
    role.req = this.req;
    return role.get_header_role();
}

AdminController.prototype.get_actionSystemsetting = function (model) {
    if (this.req.role['system_setting_view']) {
        var systemSetting = new system_setting();
        systemSetting.req = this.req;
        return systemSetting.getValues().then(r => {
            var response = [];
            for (var i in r) {
                if ('' == r[i]['option_key'] || 'mail_server_password' == r[i]['option_key']) {
                    continue;
                }
                response.push(r[i]);
            }
            return Promise.resolve(response);
        });
    } else {
        return Promise.resolve({
            code: 400,
            message: "Bạn không có quyền xem bảng này"
        });
    }
}

AdminController.prototype.post_actionConfigsetting = function (model) {
    if (this.req.role['system_setting_update']) {
        var systemSetting;
        var reqData = this.req.body;
        var reqDataLen = Object.keys(reqData).length;
        var def = Q.defer();
        var count = 1;
        var data;
        for (var i in reqData) {
            systemSetting = new system_setting();
            data = {};
            data['option_value'] = reqData[i];
            systemSetting.updateAll(data, { 'option_key': i }).then(rs => {
                if (rs) {
                    if (count == reqDataLen) {
                        def.resolve({
                            code: 200,
                            data: rs
                        });
                    } else {
                        count++;
                    }
                } else {
                    if (count == reqData.length) {
                        def.reject(false);
                    } else {
                        count++;
                    }
                }
            });
        }
        return def.promise;
    } else {
        return Promise.resolve({
            code: 400,
            message: "Bạn không có quyền update bảng này"
        });
    }
}
AdminController.prototype.post_actionSendtestmail = function () {
    var reqData = this.req.body;
    var option = {
        to: reqData['email_test'],
        subject: 'Test config mail server',
        html: reqData['email_content']
    }
    return GlobalEmail.sendmail(option);
}

AdminController.prototype.get_actionExportexcel = function () {
    var that = this;
    var params = this.model.get_condition_from_query();
    var columns_excel = this.req.query.columns_excel;
    if (columns_excel && typeof (columns_excel) == 'string') {
        columns_excel = decodeURIComponent(columns_excel);
        columns_excel = JSON.parse(columns_excel);
        this.model.columns_excel = columns_excel;
    }
    return this.model.searchAdvance(params.condition, 100000, 0).then(r => {
        that.model.setAttributes(r);
        that.model._old_attributes = r;
        if (r.list) {
            var file_link = CONFIG.LINK_FILE_EXCEL + 'db.xlsx';
            var file_link_save = CONFIG.LINK_FILE_EXCEL + that.model.tableName() + '_excel_' + new Date().getTime() + '.xlsx';
            var file_excel = new GlobalExcel(file_link);
            file_excel.save(r.list, that.model, file_link_save);

            var file = file_link_save;

            var mimetype = mime.getType(file);
            var name = that.model.tableName() + ' ' + GlobalFunction.formatDateTime(GlobalFunction.newDate(), 'd-m-y') + '.xlsx';
            name = name.replace(/ /gi, '-');
            that.res.setHeader('Content-disposition', ' filename=' + name);
            that.res.setHeader('Content-type', mimetype);

            var filestream = fs.createReadStream(file);
            setTimeout(function () {
                GlobalFile.removeFile(file);
            }, 3000);
            return Promise.resolve({
                code: 200,
                pipe: filestream,
            });

        } else {
            return Promise.resolve({
                code: 200,
                message: 'Không có dữ liệu nào trong query',
            });
        }
    });
}

AdminController.prototype.post_actionCallfunc = function () {
    var that = this;
    var func = this.req.body.func;
    var argv = this.req.body.argv;
    if (typeof (argv) == 'string') {
        argv = argv.split(',');
    }
    return this.model[func].apply(this.model, argv).then(r => {
        var rs = {};
        if (r.id) {
            rs['code'] = 200;
            rs['attributes'] = r;
        } else {
            rs['code'] = 400;
        }
        return Promise.resolve(rs);
    });
}

AdminController.prototype.post_actionUsercolumn = function () {
    var req = this.req.body;
    var userColumns = new userColumnMul();
    return userColumns.updateValue(req);
}

AdminController.prototype.get_actionUpdatefilterdefault = function () {
    var that = this;
    return this.model.findOne(this.req.query.id).then(rs => {
        return that.model.update_default();
    })
}

AdminController.prototype.get_actionTokeninput = async function () {
    var that = this;
    var search = this.req.query.term;
    var field = this.req.query.field;
    if (search) {
        var rs = await this.model.tokenInput(search, field);
        console.log(rs);
        if (rs && rs.length) {
            for (var item of rs) {
                if (item._id) {
                    item.id = item._id;
                    item.name = item._id + ' ' + item.name + ' (' + item.sum + ')';
                    if(item.privacy) {
                        item.name = (item.privacy.toLowerCase()=='closed'?'🔒 ':' 👩‍👧‍👦  &nbsp;') + item.name;
                    }
                }
            }
        }
        return rs;
    } else {
        return Promise.resolve([]);
    }

}

AdminController.prototype.post_actionSuggestionkeyword = async function(){
      var params = {
        "keyword": this.req.body.keyword,
        "exp_suggested_keyword_num": 200 + parseInt(this.req.body.length)
      }
      // http://192.168.104.70:30114/api/suggestion_keyword

      var d = Q.defer();
      request.post('http://192.168.104.70:30114/api/suggestion_keyword', {
        json: params,
        timeout: 5000,
      }, async function (req, res, body) {
        if (body && body.suggested_keywords) {
        }
        d.resolve(body && body.suggested_keywords ? body : []);
      });
      return d.promise;
}

AdminController.prototype.get_actionRefapprove = async function() {
    var id = this.req.query.id;
    var model = this.model;
    if(id.indexOf(',') >= 0) {
        var ids = id.split(',');
        for(var i = 0; i < ids.length;i++) {
            ids[i] = parseInt(ids[i]);
        }
        return model.approve_all(ids);
    } else {
        return model.findOne(parseInt(id)).then(r => {
            if(model.id) {
                return model.approve().then(r => {
                    return Promise.resolve({
                        code    : 200,
                        message : 'Approve thành công'
                    });    
                })
            } else {
                return Promise.resolve({
                    code    : 400,
                    message : 'Bản ghi không tồn tại không thể approve được.'
                });
            }
            
        });
    }
}


AdminController.prototype.get_actionRefreject = async function() {
    var id = this.req.query.id;
    var model = this.model;
    if(id.indexOf(',') >= 0) {
        var ids = id.split(',');
        for(var i = 0; i < ids.length;i++) {
            ids[i] = parseInt(ids[i]);
        }
        return model.reject_all(ids);
    } else {
        return model.findOne(parseInt(id)).then(r => {
            if(model.id) {
                return model.reject().then(r => {
                    return Promise.resolve({
                        code    : 200,
                        message : 'Approve thành công'
                    });    
                })
            } else {
                return Promise.resolve({
                    code    : 400,
                    message : 'Bản ghi không tồn tại không thể approve được.'
                });
            }
            
        });
    }
}

AdminController.prototype.get_actionCount = async function() {
    var UserAllDb2 = require('../../application/cyberinsights/models/UserAllDb2');
    var count = await UserAllDb2.get_all_count({});
    return Promise.resolve({
        code    : 200,
        message : count
    });       
}

exports = module.exports = AdminController; 