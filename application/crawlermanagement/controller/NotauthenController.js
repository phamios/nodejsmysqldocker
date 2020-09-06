var GlobalController = require('../../../core/global_controller');
const GlobalFunction = require('../../../core/global_function');
var Promise = require('promise');
var GmailBots = require('../models/GmailBots');
NotauthenController = GlobalFunction.cloneFunc(GlobalController);

NotauthenController.prototype.init = async function () {
    GlobalController.prototype.init.apply(this, arguments);
}

NotauthenController.prototype.get_actionLoadaccountgmail = async function() {
    return GmailBots.load_account_create_gmail();
}

exports = module.exports = NotauthenController;