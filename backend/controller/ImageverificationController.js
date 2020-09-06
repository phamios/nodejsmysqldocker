var GlobalController = require('../../core/global_controller');
const GlobalFunction = require('../../core/global_function');
const Q = require('q');
const CANCEL_RELEASE_CARD = 65;
var Promise = require('promise');
const fs = require('fs');
ImageverificationController = GlobalFunction.cloneFunc(GlobalController);
var image_verification_require = require('../../models/common/ImageVerification');

ImageverificationController.prototype.init = function () {
    GlobalController.prototype.init.apply(this, arguments);
}

ImageverificationController.prototype.get_actionFindall = function () {
    var model = new image_verification_require();
    var query = this.req.query;
    var condition = {limit_db: 10000, order_by: 'subject_id desc, id desc'};
    condition = Object.assign(condition, query);
    return model.findAll(condition);
}

ImageverificationController.prototype.get_actionVerify = function () {
    var model = new image_verification_require();
    var query = this.req.query;
    return model.verify_two_image(query.id_model, query.id_compare);
}

ImageverificationController.prototype.post_actionUpload = function (model) {
    var body = this.req.body;
    var image_verification = new image_verification_require();
    return image_verification.uploadImage(body);
}

exports = module.exports = ImageverificationController;