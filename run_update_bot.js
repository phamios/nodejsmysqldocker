var FacebookToken = require('./application/crawlermanagement/models/FacebookToken');
var CONFIG = require('./config/config');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
process.on('uncaughtException', function (err) {
    console.error("Node NOT Exiting...", err);
});

async function run() {
    return FacebookToken.refresh_row_by_file( CONFIG.APPLiCATION_PATH + 'bot/400_full.txt','192.168.106.170',0);
}

run();
