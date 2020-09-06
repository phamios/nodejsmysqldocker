exports = module.exports = GlobalPdf;
const GlobalFunction = require('./global_function');
const GlobalFile = require('./global_file');
const CONFIG = require('../config/config');
var pdf = require('html-pdf');
const Q = require('q');
var fs = require('fs');
const exec = require('child_process').exec;
var request = require('request');
function GlobalPdf() {

}

GlobalPdf.createFile = function (content, link, attributes = {}, opt = {}) {
    var def = Q.defer();
    if (GlobalFunction.count(attributes)) {
        content = GlobalFunction.replaceTemplate(content, attributes);
    }
    var options = Object.assign({
        "height": "1135px",
        "width": "755px",
        "format": "Letter",
        "orientation": "portrait",
        "base": "file:///C:/project/cybermsb/landingpages/maritimebank/",
        "zoomFactor": "1",
        "type": "pdf",
        "quality": "100",
    }, opt);
    GlobalFile.removeFile(link);
    pdf.create(content, options).toFile(link, function (err, res) {
        if (err) return console.log(err);
        var a = link.split('/');
        var name = a[a.length - 1];
        def.resolve({
            link_save       : link,
            name            : name,
        });
    })
    return def.promise;
}

GlobalPdf.create_pdf_window = function(link_save, attributes = {}) {
    var def = Q.defer();
    GlobalFile.removeFile(link_save);
    GlobalFile.mkdir(GlobalFile.dirname(link_save));
    var file = fs.createWriteStream(link_save);
    GlobalFunction.post_pipe(CONFIG.LINK_PDF,attributes, function(res) {
        res.pipe(file);
        res.on('end', function () {
            setTimeout(function(){
                file.end();
                def.resolve(GlobalFile.readFile(link_save));
                GlobalFile.removeFile(link_save);
            },200);
        });
        
    })
    return def.promise;
}

GlobalPdf.create_pdf_by_link = function (link_content, link_save, attributes, opt = {}) {
    var options = Object.assign({
        width: 755,
        height: 1135,
    }, opt);
    var content = GlobalFile.readFile(link_content);
    if (GlobalFunction.count(attributes)) {
        content = GlobalFunction.replaceTemplate(content, attributes);
    }
    
    var link_html = link_content.replace('index.html',attributes['id'] + '_' + (new Date().getTime()) + '.html');
    var link_html_old = link_html;
    if(link_html.match(/^[A-Z]\:/gi)) {
        link_html = 'file:///' + link_html;
    }
    GlobalFile.writeFile(link_html_old, content);
    var exec_array = ['phantomjs'];
    exec_array.push(CONFIG.APPLiCATION_PATH + 'core/phantomjs/rasterize.js');
    exec_array.push(link_html);
    exec_array.push(link_save);
    exec_array.push(options.width + '*' + options.height);
    exec_array.push('1');
    var def = Q.defer();
    var exec_command = exec_array.join(' ');
    GlobalFile.removeFile(link_save);
    exec(exec_command,function(err, res){
        var a = link_save.split('/');
        var name = a[a.length - 1];
        GlobalFile.removeFile(link_html_old);
        def.resolve({
            link_save       : link_save,
            name            : name,
        });
    })
    return def.promise;
}

