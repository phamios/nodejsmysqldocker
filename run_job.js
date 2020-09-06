var CONFIG = require('./config/config');
var GlobalFile = require('./core/global_file');
var GlobalController = require('./core/global_controller');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var configdb = CONFIG.argv.configdb || 'crawlermanagement';
// hướng dẫn sử dụng
// node run_job.js m=facebookgroupschool f=update_school_id a=1,2,3,4
async function run() {
    var model_name = CONFIG.argv.m;
    var func = CONFIG.argv.f;
    var argv = CONFIG.argv.a || CONFIG.argv.argv;
    var type = CONFIG.argv.t || CONFIG.argv.type || 0;
    if (model_name && func) {
        var RequireModel = GlobalFile.getRequireModel(model_name, configdb);
        if (type === 0) {
            if (RequireModel[func]) {
                if (argv) {
                    return RequireModel[func].apply(this, argv.split(','));
                } else {
                    return RequireModel[func]();
                }
            }
        } else {
            var model = new RequireModel();
            if (model[func]) {
                if (argv) {
                    console.log(argv.split(','));
                    return model[func].apply(model, argv.split(','));
                } else {
                    return model[func]();
                }
            }
        }
    }
}

run().then(r => {
    return process.exit(r);
})