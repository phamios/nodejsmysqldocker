var GlobalController = require('../../../core/global_controller');
const GlobalFunction = require('../../../core/global_function');
const Global_Oracledb = require('../../../core/global_oracledb');
const Q = require('q');
ApiController = GlobalFunction.cloneFunc(GlobalController);
const config = require('../../../config/config');
var FacebookToken = require('../models/FacebookToken');
FacebookToken.init_insert_facebook_token_die();
ApiController.prototype.init = async function () {
    GlobalController.prototype.init.apply(this, arguments);
}


ApiController.prototype.get_actionJobtotalresult = async function () {
    var that = this;
    if (that.req.role['dashboard_read']) {
        var j = FacebookToken.get_model();
        var rs = await j.query(`select b.name NAME,a.VALID,a.TOTAL,a.ERROR from (
            select api_id,sum(count_valid) VALID,sum(count_all) TOTAL,sum(count_error) ERROR from api_log where count_all > 0 group by api_id
            ) a inner join facebook_graph_api_mapping b ON a.api_id = b.id
            UNION ALL
            select 'Tổng' NAME,sum(count_valid) VALID,sum(count_all) TOTAL,sum(count_error) ERROR from api_log where count_all > 0
        `);
        if (rs && rs.length) {
            for (var r of rs) {
                r.PERCENT = (r.VALID / r.TOTAL * 100).toFixed(2).toString() + "%";
                r.ERROR = GlobalFunction.number_format(r.ERROR.toString());
                r.VALID = GlobalFunction.number_format(r.VALID.toString());
                r.TOTAL = GlobalFunction.number_format(r.TOTAL.toString());
            }
        } else {
            rs = [];
        }
        return Promise.resolve({
            data: rs,
            code: 200,
        });
    } else {
        return Promise.resolve({
            code: 400,
            error: 'Bạn không có quyền truy cập api này'
        });
    }
}


ApiController.prototype.get_actionJobdailyresult = async function () {    
    var that = this;
    if (that.req.role['dashboard_read']) {
        var j = FacebookToken.get_model();
        var rs = await j.query(`select b.name NAME,a.VALID,a.TOTAL,a.ERROR from (
            select api_id,sum(count_valid) VALID,sum(count_all) TOTAL,sum(count_error) ERROR from api_log where count_all > 0 and date_log = '` + GlobalFunction.getDateNow() + `' group by api_id
            ) a inner join facebook_graph_api_mapping b ON a.api_id = b.id
            UNION ALL
            select 'Tổng' NAME,sum(count_valid) VALID,sum(count_all) TOTAL,sum(count_error) ERROR from api_log where count_all > 0 and date_log = '` + GlobalFunction.getDateNow() + `'
            `);
        if (rs && rs.length) {
            for (var r of rs) {
                r.PERCENT = (r.VALID / r.TOTAL * 100).toFixed(2).toString() + "%";
                r.ERROR = GlobalFunction.number_format(r.ERROR.toString());
                r.VALID = GlobalFunction.number_format(r.VALID.toString());
                r.TOTAL = GlobalFunction.number_format(r.TOTAL.toString());
            }
        } else {
            rs = [];
        }
        return Promise.resolve({
            data: rs,
            code: 200,
        });
    } else {
        return Promise.resolve({
            code: 400,
            error: 'Bạn không có quyền truy cập api này'
        });
    }
}

ApiController.prototype.get_actionJobmonthlyresult = async function () {
    var firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    var lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    var that = this;
    if (that.req.role['dashboard_read']) {
        var j = FacebookToken.get_model();
        var rs = await j.query(`select b.name NAME,a.VALID,a.TOTAL,a.ERROR from (
            select api_id,sum(count_valid) VALID,sum(count_all) TOTAL,sum(count_error) ERROR from api_log 
                where count_all > 0 
                and date_log >= '` + GlobalFunction.getDateNow(firstDay) + `' 
                and date_log <= '` + GlobalFunction.getDateNow(lastDay) + `' group by api_id
            ) a inner join facebook_graph_api_mapping b ON a.api_id = b.id
            UNION ALL
            select 'Tổng' NAME,sum(count_valid) VALID,sum(count_all) TOTAL,sum(count_error) ERROR from api_log where count_all > 0 
            and date_log >= '` + GlobalFunction.getDateNow(firstDay) + `' 
            and date_log <= '` + GlobalFunction.getDateNow(lastDay) + `'
            `);
        if (rs && rs.length) {
            for (var r of rs) {
                r.PERCENT = (r.VALID / r.TOTAL * 100).toFixed(2).toString() + "%";
                r.ERROR = GlobalFunction.number_format(r.ERROR.toString());
                r.VALID = GlobalFunction.number_format(r.VALID.toString());
                r.TOTAL = GlobalFunction.number_format(r.TOTAL.toString());
            }
        } else {
            rs = [];
        }
        return Promise.resolve({
            data: rs,
            code: 200,
        });
    } else {
        return Promise.resolve({
            code: 400,
            error: 'Bạn không có quyền truy cập api này'
        });
    }
}

ApiController.prototype.get_actionJobyearlyresult = async function () {
    var start = new Date(new Date().getFullYear(), 0, 1);

    var end = new Date(new Date().getFullYear(), 11, 31);

    var that = this;
    if (that.req.role['dashboard_read']) {
        var j = FacebookToken.get_model();
        var rs = await j.query(`select b.name NAME,a.VALID,a.TOTAL,a.ERROR from (
            select api_id,sum(count_valid) VALID,sum(count_all) TOTAL,sum(count_error) ERROR from api_log 
                where count_all > 0 
                and date_log >= '` + GlobalFunction.getDateNow(start) + `' 
                and date_log <= '` + GlobalFunction.getDateNow(end) + `' group by api_id
            ) a inner join facebook_graph_api_mapping b ON a.api_id = b.id
            UNION ALL
            select 'Tổng' NAME,sum(count_valid) VALID,sum(count_all) TOTAL,sum(count_error) ERROR from api_log where count_all > 0 
            and date_log >= '` + GlobalFunction.getDateNow(start) + `' 
                and date_log <= '` + GlobalFunction.getDateNow(end) + `'
            `);
        if (rs && rs.length) {
            for (var r of rs) {
                r.PERCENT = (r.VALID / r.TOTAL * 100).toFixed(2).toString() + "%";
                r.ERROR = GlobalFunction.number_format(r.ERROR.toString());
                r.VALID = GlobalFunction.number_format(r.VALID.toString());
                r.TOTAL = GlobalFunction.number_format(r.TOTAL.toString());
            }
        } else {
            rs = [];
        }
        return Promise.resolve({
            data: rs,
            code: 200,
        });
    } else {
        return Promise.resolve({
            code: 400,
            error: 'Bạn không có quyền truy cập api này'
        });
    }
}







ApiController.prototype.get_actionJobtotalresultcustomer = async function () {
    var that = this;
    if (that.req.role['dashboard_read']) {
        var j = FacebookToken.get_model();
        var rs = await j.query(`select b.name NAME,a.VALID,a.TOTAL,a.ERROR from (
            select customer_id,sum(count_valid) VALID,sum(count_all) TOTAL,sum(count_error) ERROR from customer_log where count_all > 0 group by customer_id
            ) a inner join customer b ON a.customer_id = b.id 
            UNION ALL
            select 'Tổng' NAME,sum(count_valid) VALID,sum(count_all) TOTAL,sum(count_error) ERROR from customer_log where count_all > 0
            `);
        if (rs && rs.length) {
            for (var r of rs) {
                r.PERCENT = (r.VALID / r.TOTAL * 100).toFixed(2).toString() + "%";
                r.ERROR = GlobalFunction.number_format(r.ERROR.toString());
                r.VALID = GlobalFunction.number_format(r.VALID.toString());
                r.TOTAL = GlobalFunction.number_format(r.TOTAL.toString());
            }
        } else {
            rs = [];
        }
        return Promise.resolve({
            data: rs,
            code: 200,
        });
    } else {
        return Promise.resolve({
            code: 400,
            error: 'Bạn không có quyền truy cập api này'
        });
    }
}


ApiController.prototype.get_actionJobdailyresultcustomer = async function () {    
    var that = this;
    if (that.req.role['dashboard_read']) {
        var j = FacebookToken.get_model();
        var rs = await j.query(`select b.name NAME,a.VALID,a.TOTAL,a.ERROR from (
            select customer_id,sum(count_valid) VALID,sum(count_all) TOTAL,sum(count_error) ERROR from customer_log where count_all > 0 and date_log = '` + GlobalFunction.getDateNow() + `' group by customer_id
            ) a inner join customer b ON a.customer_id = b.id
            UNION ALL
            select 'Tổng' NAME,sum(count_valid) VALID,sum(count_all) TOTAL,sum(count_error) ERROR from customer_log where count_all > 0 and date_log = '` + GlobalFunction.getDateNow() + `'
            `);
        if (rs && rs.length) {
            for (var r of rs) {
                r.PERCENT = (r.VALID / r.TOTAL * 100).toFixed(2).toString() + "%";
                r.ERROR = GlobalFunction.number_format(r.ERROR.toString());
                r.VALID = GlobalFunction.number_format(r.VALID.toString());
                r.TOTAL = GlobalFunction.number_format(r.TOTAL.toString());
            }
        } else {
            rs = [];
        }
        return Promise.resolve({
            data: rs,
            code: 200,
        });
    } else {
        return Promise.resolve({
            code: 400,
            error: 'Bạn không có quyền truy cập api này'
        });
    }
}

ApiController.prototype.get_actionJobmonthlyresultcustomer = async function () {
    var firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    var lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    var that = this;
    if (that.req.role['dashboard_read']) {
        var j = FacebookToken.get_model();
        var rs = await j.query(`select b.name NAME,a.VALID,a.TOTAL,a.ERROR from (
            select customer_id,sum(count_valid) VALID,sum(count_all) TOTAL,sum(count_error) ERROR from customer_log 
                where count_all > 0 
                and date_log >= '` + GlobalFunction.getDateNow(firstDay) + `' 
                and date_log <= '` + GlobalFunction.getDateNow(lastDay) + `' group by customer_id
            ) a inner join customer b ON a.customer_id = b.id
            UNION ALL
            select 'Tổng' NAME,sum(count_valid) VALID,sum(count_all) TOTAL,sum(count_error) ERROR from customer_log where count_all > 0 
            and date_log >= '` + GlobalFunction.getDateNow(firstDay) + `' 
            and date_log <= '` + GlobalFunction.getDateNow(lastDay) + `'
            `);
        if (rs && rs.length) {
            for (var r of rs) {
                r.PERCENT = (r.VALID / r.TOTAL * 100).toFixed(2).toString() + "%";
                r.ERROR = GlobalFunction.number_format(r.ERROR.toString());
                r.VALID = GlobalFunction.number_format(r.VALID.toString());
                r.TOTAL = GlobalFunction.number_format(r.TOTAL.toString());
            }
        } else {
            rs = [];
        }
        return Promise.resolve({
            data: rs,
            code: 200,
        });
    } else {
        return Promise.resolve({
            code: 400,
            error: 'Bạn không có quyền truy cập api này'
        });
    }
}

ApiController.prototype.get_actionJobyearlyresultcustomer = async function () {
    var start = new Date(new Date().getFullYear(), 0, 1);

    var end = new Date(new Date().getFullYear(), 11, 31);

    var that = this;
    if (that.req.role['dashboard_read']) {
        var j = FacebookToken.get_model();
        var rs = await j.query(`select b.name NAME,a.VALID,a.TOTAL,a.ERROR from (
            select customer_id,sum(count_valid) VALID,sum(count_all) TOTAL,sum(count_error) ERROR from customer_log 
                where count_all > 0 
                and date_log >= '` + GlobalFunction.getDateNow(start) + `' 
                and date_log <= '` + GlobalFunction.getDateNow(end) + `' group by customer_id
            ) a inner join customer b ON a.customer_id = b.id
            UNION ALL
            select 'Tổng' NAME,sum(count_valid) VALID,sum(count_all) TOTAL,sum(count_error) ERROR from customer_log where count_all > 0 
            and date_log >= '` + GlobalFunction.getDateNow(start) + `' 
            and date_log <= '` + GlobalFunction.getDateNow(end) + `'
            `);
        if (rs && rs.length) {
            for (var r of rs) {
                r.PERCENT = (r.VALID / r.TOTAL * 100).toFixed(2).toString() + "%";
                r.ERROR = GlobalFunction.number_format(r.ERROR.toString());
                r.VALID = GlobalFunction.number_format(r.VALID.toString());
                r.TOTAL = GlobalFunction.number_format(r.TOTAL.toString());
            }
        } else {
            rs = [];
        }
        return Promise.resolve({
            data: rs,
            code: 200,
        });
    } else {
        return Promise.resolve({
            code: 400,
            error: 'Bạn không có quyền truy cập api này'
        });
    }
}






ApiController.prototype.get_actionJobrequestmonthly = async function () {    
    var that = this;
    if (that.req.role['dashboard_read']) {
        var j = FacebookToken.get_model();
        var list_query = [];
        for(var i = 1; i <= 12;i++) {
            var firstDay = new Date(new Date().getFullYear(), i - 1, 1);
            var lastDay = new Date(new Date().getFullYear(), i, 0);
            var month = i;
            if(month < 10) {month = '0' + month};
            list_query.push(`select 'Tháng ` + GlobalFunction.formatDateTime(GlobalFunction.getDateNow(lastDay),'m-y') + `' NAME,sum(count_valid) VALID,sum(count_all) TOTAL,sum(count_error) ERROR from facebook_token_log where date_log <= '` + GlobalFunction.getDateNow(lastDay) + `' AND date_log >= '` + GlobalFunction.getDateNow(firstDay) + `'`);
        }
        list_query.push(`select 'Tổng' NAME,sum(count_valid) VALID,sum(count_all) TOTAL,sum(count_error) ERROR from facebook_token_log where date_log <= '` + new Date().getFullYear() + `-12-31' AND date_log >= '` + new Date().getFullYear() + `-01-01'`);
        var rs = await j.query(list_query.join(' UNION ALL '));
        if (rs && rs.length) {
            var list = [];
            for (var r of rs) {
                if(!r.TOTAL) {r.TOTAL = 0;}
                if(!r.ERROR) {r.ERROR = 0;}
                if(!r.VALID) {r.VALID = 0;}
                if(r.TOTAL) {
                    r.PERCENT = (r.VALID / r.TOTAL * 100).toFixed(2).toString() + "%";
                    r.ERROR = GlobalFunction.number_format(r.ERROR.toString());
                    r.VALID = GlobalFunction.number_format(r.VALID.toString());
                    r.TOTAL = GlobalFunction.number_format(r.TOTAL.toString());
                    list.push(r);
                }
            }
            rs = list;
        } else {
            rs = [];
        }
        return Promise.resolve({
            data: rs,
            code: 200,
        });
    } else {
        return Promise.resolve({
            code: 400,
            error: 'Bạn không có quyền truy cập api này'
        });
    }
}



ApiController.prototype.get_actionJobrequestyear = async function () {    
    var that = this;
    if (that.req.role['dashboard_read']) {
        var j = FacebookToken.get_model();
        var list_query = [];
        var year = new Date().getFullYear();
        for(var i = 2019; i <= year;i++) {
            var start = new Date(i, 0, 1);
            var end = new Date(i, 11, 31);
            list_query.push(`select 'Năm ` + i + `' NAME,sum(count_valid) VALID,sum(count_all) TOTAL,sum(count_error) ERROR from facebook_token_log where date_log <= '` + GlobalFunction.getDateNow(end) + `' AND date_log >= '` + GlobalFunction.getDateNow(start) + `'`);
        }
        list_query.push(`select 'Tổng' NAME,sum(count_valid) VALID,sum(count_all) TOTAL,sum(count_error) ERROR from facebook_token_log`);
        var rs = await j.query(list_query.join(' UNION ALL '));
        if (rs && rs.length) {
            var list = [];
            for (var r of rs) {
                if(!r.TOTAL) {r.TOTAL = 0;}
                if(!r.ERROR) {r.ERROR = 0;}
                if(!r.VALID) {r.VALID = 0;}
                if(r.TOTAL) {
                    r.PERCENT = (r.VALID / r.TOTAL * 100).toFixed(2).toString() + "%";
                    r.ERROR = GlobalFunction.number_format(r.ERROR.toString());
                    r.VALID = GlobalFunction.number_format(r.VALID.toString());
                    r.TOTAL = GlobalFunction.number_format(r.TOTAL.toString());
                    list.push(r);
                }
            }
            rs = list;
        } else {
            rs = [];
        }
        return Promise.resolve({
            data: rs,
            code: 200,
        });
    } else {
        return Promise.resolve({
            code: 400,
            error: 'Bạn không có quyền truy cập api này'
        });
    }
}

ApiController.prototype.get_actionHeatchartdata = async function () {
    var that = this;
    if (that.req.role['dashboard_read']) {
        var j = FacebookToken.get_model();
        var rs = await j.query(`select DATE_FORMAT(date_log,'%Y-%m-%d') as FILTER_DATE,sum(count_all) as CNT from facebook_token_log group by date_log having sum(count_all) > 0;`);
        return Promise.resolve({
            data: rs,
            code: 200,
        });
    } else {
        return Promise.resolve({
            code: 400,
            error: 'Bạn không có quyền truy cập api này'
        });
    }
}



ApiController.prototype.get_actionHeatchartdatatokendie = async function () {
    var that = this;
    if (that.req.role['dashboard_read']) {
        var j = FacebookToken.get_model();
        var rs = await j.query(`select DATE_FORMAT(date_log,'%Y-%m-%d') as FILTER_DATE,sum(count_error) as CNT from facebook_token_die group by date_log having sum(count_error) > 0;`);

        return Promise.resolve({
            data: rs,
            code: 200,
        });
    } else {
        return Promise.resolve({
            code: 400,
            error: 'Bạn không có quyền truy cập api này'
        });
    }
}




ApiController.prototype.get_actionJobtokenlive = async function () {
    var that = this;
    if (that.req.role['dashboard_read']) {
        var j = FacebookToken.get_model();
        var rs = await j.query(`select 
            group_name NAME,
            count(IF(status = 1,1,null)) VALID,
            count(IF(status = 0,1,null)) ERROR,
            count(*) TOTAL from facebook_token group by group_name
            UNION ALL 
            select 'Tổng' NAME,count(IF(status = 1,1,null)) VALID,
            count(IF(status = 0,1,null)) ERROR,
            count(*) TOTAL from facebook_token
            `);
        if (rs && rs.length) {
            var list = [];
            for (var r of rs) {
                if(!r.TOTAL) {r.TOTAL = 0;}
                if(!r.ERROR) {r.ERROR = 0;}
                if(!r.VALID) {r.VALID = 0;}
                if(r.TOTAL) {
                    r.PERCENT = (r.VALID / r.TOTAL * 100).toFixed(2).toString() + "%";
                    r.ERROR = GlobalFunction.number_format(r.ERROR.toString());
                    r.VALID = GlobalFunction.number_format(r.VALID.toString());
                    r.TOTAL = GlobalFunction.number_format(r.TOTAL.toString());
                    list.push(r);
                }
            }
            rs = list;
        } else {
            rs = [];
        }
        return Promise.resolve({
            data: rs,
            code: 200,
        });
    } else {
        return Promise.resolve({
            code: 400,
            error: 'Bạn không có quyền truy cập api này'
        });
    }
}



ApiController.prototype.post_actionUploadtoken = async function () {
    var that = this;
    if (that.req.role['facebook_token_upload']) {
        var value = this.req.body.value;
        if(!value || !value.trim()) {
            return Promise.resolve({
                code: 400,
                message: 'Dữ liệu không được để trống'
            });    
        }
        var rs = await FacebookToken.upload_token(value);
        var list_message = [];
        if(rs.count_error) {
            list_message.push(`Có ` + rs.count_error + ` token bị lỗi. `)
        }
        if(rs.count_exists) {
            list_message.push(`Có ` + rs.count_exists + ` token đã tồn tại. `)
        }
        if(rs.count_valid) {
            list_message.push(`Có ` + rs.count_valid + ` token thành công. `)
        }
        return Promise.resolve({
            code: 200,
            message: list_message.join(`\n`),
            
        });
    } else {
        return Promise.resolve({
            code: 400,
            message: 'Bạn không có quyền truy cập api này'
        });
    }
}

exports = module.exports = ApiController; 