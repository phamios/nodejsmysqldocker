exports = module.exports = GlobalEmail;
var nodemailer = require('nodemailer');
var SystemSettingRequire = require('../models/common/SystemSetting');
var Q = require('q');
var CONFIG = require('../config/config');
function GlobalEmail() {
    
}
GlobalEmail.sendmail = function(mailOptions) {
    var defer = Q.defer();
    SystemSetting.setInformationEmail().then(rs => {
        var transporter =  nodemailer.createTransport(rs);
        mailOptions['from'] = rs['from'];
        setTimeout(function(){
            defer.resolve({
                code    : 400,
                message : 'Gửi mail test không thành công'
            });
        },15000);
        transporter.sendMail(mailOptions, function(err, info){
            if (err) {
                console.log('err', err);
                defer.resolve(err);
            } else {
                defer.resolve({'code':200});
            }
        });
    })
    return defer.promise;
}