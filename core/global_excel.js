exports = module.exports = GlobalExcel;
const GlobalFunction = require('./global_function');
const GlobalFile = require('./global_file');
var XLSX = require('xlsx');

function GlobalExcel(filename) {
    
    this.link = filename;
    if(GlobalFile.isFile(filename)) {
        this.workbook = XLSX.readFile(filename);
    }
}

GlobalExcel.prototype.setWorkbook = function(workbook_) {
    this.workbook = workbook_;
}

GlobalExcel.prototype.AZ = 'ABCDEFGHIJKLMNOPQRSTUVXYZ';

GlobalExcel.prototype.save = function(data, header, link = false, sheet_index = 0) {
    if(header.db_key || header.db_key !== undefined) {
        this.setSheetModel(data, header, sheet_index);
    } else {
        this.setSheet(data, header, sheet_index);
    }
    
    XLSX.writeFile(this.workbook, link || this.link);
}

GlobalExcel.prototype.getData = function (sheet_index = 0, header_index = 1, rowIndex = 2) {
    if (!rowIndex) { rowIndex = 2; }
    var sheet = this.getSheet(sheet_index);
    var AZ = 'ABCDEFGHIJKLMNOPQRSTUVXYZ';
    var header = this.getHeaderStrip(sheet_index, header_index);
    var length_column = this.getHighestColumn(sheet_index);
    var rs = [];
    console.log(header);
    for (var i = rowIndex, length = this.getHighestRow(sheet_index); i <= length; i++) {
        var row = {};
        for (var j = 0; j < length_column; j++) {
            if (header[j]) {
                var key = this.get_char_az(j) + i;
                row[header[j]] = sheet[key] && sheet[key]['v'] ? ('' + sheet[key]['v']) : '';
                if(typeof(row[header[j]]) == 'string') {
                    row[header[j]] = row[header[j]].trim();
                }
            }
        }
        rs.push(row);
    }
    return rs;
}

GlobalExcel.prototype.getSheet = function (sheet_index = 0) {
    var sheet_name_list = this.workbook.SheetNames;
    return this.workbook.Sheets[sheet_name_list[sheet_index]];
}

GlobalExcel.prototype.getSheetName = function () {
    return this.workbook.SheetNames;
}

GlobalExcel.prototype.setHeaderSheet = function(header, sheet) {
    var cols = [];
    for(var i in header) {
        var key = this.AZ[i] + '1';
        if(!sheet[key]) {
            sheet[key] = {
                t: header[i].format || 's',
                v: header[i].label,
                h: header[i].label,
                w: header[i].label,
            };
        } else {
            sheet[key].t = header[i].format || 's';
            sheet[key].v = header[i].label;
            sheet[key].h = header[i].label;
            sheet[key].e = header[i].label;
        }
        cols.push({
            width: header[i].width,
        });
    }
    if(cols.length) {
        sheet['!cols'] = cols;
    }
}

GlobalExcel.prototype.setSheet = function (data, header, sheet_index) {
    var sheet = this.getSheet(sheet_index);
    this.setHeaderSheet(header,sheet);
    var height = 22;
    sheet['!rows'] = [{hpx:height}];
    var key = '';
    for(var i = 0, length = data.length;i < length;i++) {
        var ii = i + 2;
        for(var j in header) {
            var key = this.AZ[j] + ii;
            var v= data[i][header[j].attribute] || '';
            sheet[key] = {
                t: header[j].format || 's',
                v: v,
                h: v,
                w: v,
            };
        }
        sheet['!rows'].push({hpx:height});
    }
    sheet['!ref'] = 'A1:' + key;
}

GlobalExcel.prototype.setSheetModel = function(data, model, sheet_index = 0) {
    var sheet = this.getSheet(sheet_index);
    var header = model.attributesExcel();
    this.setHeaderSheet(header,sheet);
    var height = 22;
    sheet['!rows'] = [{hpx:height}];
    var key = '';
    for(var i = 0, length = data.length;i < length;i++) {
        var ii = i + 2;
        for(var j in header) {
            var key = this.AZ[j] + ii;
            var v= model.showAttribute(header[j].attribute, data[i][header[j].attribute], data[i])  || '';
            sheet[key] = {
                t: header[j].format || 's',
                v: v,
                h: v,
                w: v,
            };
        }
        sheet['!rows'].push({hpx:height});
    }
    sheet['!ref'] = 'A1:' + key;
}

GlobalExcel.prototype.getHeaderStrip = function (sheet_index = 0, index_row) {
    var header = this.getHeader(sheet_index, index_row);
    for (var i in header) {
        header[i] = header[i].replace(/_/gi,' ');
        header[i] = GlobalFunction.stripUnicode(header[i], '_');
    }
    return header;
}

GlobalExcel.prototype.get_char_az = function(i) {
    var number1 = parseInt(i / 25);
    var char1 = number1 >= 1 ? this.AZ[number1 - 1] : '';
    var char2 = this.AZ[parseInt(i % 25)];
    return char1 + char2;
}

GlobalExcel.prototype.getHeader = function (sheet_index = 0, index_row) {
    var sheet = this.getSheet(sheet_index);
    if (!index_row) { index_row = 1; }
    var rs = {};
    for (var i = 0, length = this.getHighestColumn(sheet_index); i < length; i++) {
        var key = this.get_char_az(i) + index_row;
        if (sheet[key] && sheet[key]['v']) {
            if(typeof(sheet[key]['v']) != 'string') {
                sheet[key]['v'] = '' + sheet[key]['v'];
            }
            rs[i] = sheet[key]['v'].trim();
        }
    }
    return rs;
}

GlobalExcel.prototype.getHighestRow = function (sheet_index = 0) {
    var sheet = this.getSheet(sheet_index);
    var a_ref = sheet['!ref'].split(':');
    return parseInt(a_ref[1].replace(/[^0-9]+/gi, ''));
}

GlobalExcel.prototype.check_data_exists = function(sheet_index = 0) {
    var sheet = this.getSheet(sheet_index);
    return sheet['!ref'];
}

GlobalExcel.prototype.getHighestColumn = function (sheet_index = 0) {
    var sheet = this.getSheet(sheet_index);
    var a_ref = sheet['!ref'].split(':');
    var AZ = 'ABCDEFGHIJKLMNOPQRSTUVXYZ';
    var highestColumnChar = a_ref[1].replace(/[0-9]/gi, '');
    var highestColumn = 0;
    if(highestColumnChar.length == 2) {
        highestColumn = (AZ.indexOf(highestColumnChar[0]) + 1) * 25 + AZ.indexOf(highestColumnChar[1]);
    } else if (highestColumnChar.length == 1) {
        highestColumn = AZ.indexOf(highestColumnChar);
    }
    return highestColumn + 1;
}