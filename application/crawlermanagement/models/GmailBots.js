var GlobalActiveRecord = require('../../../core/global_activerecord');
const GlobalFunction = require('../../../core/global_function');
var CONFIG = require('../../../config/config');
var Q = require('q');
var Promise = require('promise');
var NameViet = require('./NameViet');
var HoViet = require('./HoViet');
var Proxy = require('./Proxy');
const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
GmailBots = GlobalFunction.cloneFunc(GlobalActiveRecord);
GmailBots.prototype.tableName = function() {
    return 'gmail_bots';
}
GmailBots.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
GmailBots.prototype.LABEL = {
    "id": "Id",
    "instance_id": "Instance Id",
    "chrome_id": "Chrome Id",
    "username": "Username",
    "pass": "Pass",
    "first_name": "First Name",
    "last_name": "Last Name",
    "mobile_phone": "Mobile Phone",
    "email_recover": "Email Recover",
    "birthday": "Birthday",
    "gender": "Gender",
    "is_create_gmail": "Is Create Gmail",
    "is_create_facebook": "Is Create Facebook",
    "is_delete": "Is Delete",
    "cookie": "Cookie",
    "is_active": "Is Active",
    "is_create_facebook_pending": "Is Create Facebook Pending"
};
GmailBots.prototype.RULE = {
    "id": {
        "type": "bigint",
        "auto_increment": true,
        "primary_key": true,
        "size": 20
    },
    "instance_id": {
        "type": "int",
        "size": 11,
        "fk": {
            "table": "instance",
            "ref_id": "id"
        }
    },
    "chrome_id": {
        "type": "int",
        "size": 11
    },
    "username": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 50,
            "unique": true
        },
        "size": 50
    },
    "pass": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 50
        },
        "size": 50
    },
    "first_name": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 50
        },
        "size": 50
    },
    "last_name": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 50
        },
        "size": 50
    },
    "mobile_phone": {
        "type": "varchar",
        "require": {
            "size": 20,
            "phone": true
        },
        "size": 20
    },
    "email_recover": {
        "type": "varchar",
        "require": {
            "size": 255,
            "email": true
        },
        "size": 255
    },
    "birthday": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 20
        },
        "size": 20
    },
    "gender": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 20
        },
        "size": 20
    },
    "is_create_gmail": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "is_create_facebook": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "is_delete": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "cookie": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        },
        "size": 23456000
    },
    "fk_table_instance_id": {
        "type": "any"
    },
    "is_active": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "is_create_facebook_pending": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    }
};

GmailBots.auto_generate_gmail = async function(limit = 2000) {
    if(typeof(limit) == 'string') {limit = parseInt(limit);}
    if(limit>2000) {limit = 0;}
    var list_name = await NameViet.get_list_name();
    var list_ho = await HoViet.get_list_name();
    var list_data = [];
    for(var i = 0; i < limit;i++) {
        var last_name = list_name[GlobalFunction.rand(0,list_name.length - 1)];
        var first_name = list_ho[GlobalFunction.rand(0,list_ho.length - 1)];
        var birthday = GmailBots.get_birthday_random();
        var gender = GmailBots.get_gender_random();
        list_data.push({
            "username": GmailBots.get_username(last_name,first_name,birthday),
            "pass":GmailBots.get_password(last_name,first_name,birthday),
            "first_name": first_name,
            "last_name": last_name,
            "email_recover": "anhdung17041986@gmail.com",
            "birthday": birthday,
            "gender": gender,
            "is_create_gmail": 0,
            "is_create_facebook": 0,
            "is_delete": 0,
        });
    }
    var model = new GmailBots();
    var a = await model.insertMany(list_data);
    console.log('thanh cong',a);
    return a;
}

GmailBots.get_last_name_random = async function() {
    var list_name = await NameViet.get_list_name();
    return list_name[GlobalFunction.rand(0,list_name.length - 1)];
}

GmailBots.get_first_name_random = async function() {
    var list_ho = await HoViet.get_list_name();
    return list_ho[GlobalFunction.rand(0,list_ho.length - 1)];
}

GmailBots.get_username = function(last_name,first_name,birthday) {
    return GlobalFunction.stripUnicode(first_name,'') + GlobalFunction.stripUnicode(last_name,'') + '' + birthday.replace(/-/gi,'') +'' + GlobalFunction.rand(1000,10000);
}

GmailBots.get_password = function(last_name,first_name,birthday) {
    return GlobalFunction.stripUnicode(first_name,'') + GlobalFunction.stripUnicode(last_name,'') + '' + birthday.replace(/-/gi,'');
}

const const_list_gender = ['male','female'];

GmailBots.get_gender_random = function() {
    return const_list_gender[GlobalFunction.rand(0,1)];
}

var list_year = [];
for(var i = 1980; i < 2002;i++) {list_year.push(i)}
var list_month = [];
for(var i = 1; i < 13;i++) {list_month.push(i < 10 ? '0' + i : i)}
var list_date = [];
for(var i = 1; i < 32;i++) {list_date.push(i < 10 ? '0' + i : i)}

GmailBots.get_birthday_random = function() {
    var date = new Date(list_year[GlobalFunction.rand(0,list_year.length - 1)] + '-' + list_month[GlobalFunction.rand(0,list_month.length - 1)] + '-' + list_date[GlobalFunction.rand(0,list_date.length - 1)]);
    var y = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1): (date.getMonth() + 1);
    var d = date.getDate() + 1 < 10 ? '0' + date.getDate() : date.getDate();
    return date.getFullYear() + '-' + y + '-' + d;
}

GmailBots.get_model_instance = false;
GmailBots.get_model = function () {
    if (!GmailBots.get_model_instance) {
        GmailBots.get_model_instance = new GmailBots();
    }
    return GmailBots.get_model_instance;
}

GmailBots.get_list_all_create_gmail_instance = false;
GmailBots.reload_list_all_create_gmail_instance = false;
GmailBots.get_list_all_create_gmail = async function () {
    if (!GmailBots.get_list_all_create_gmail_instance) {
        GmailBots.get_list_all_create_gmail_instance = await GmailBots.get_model().findAll({is_create_gmail:0});
    }
    return GmailBots.get_list_all_create_gmail_instance;
}

GmailBots.load_account_create_gmail = async function() {
    var list_data_gmail = await GmailBots.get_list_all_create_gmail();
    if(!GmailBots.reload_list_all_create_gmail_instance) {
        GmailBots.reload_list_all_create_gmail_instance = true;
        setTimeout(function(){
            GmailBots.get_list_all_create_gmail_instance = false;
            GmailBots.reload_list_all_create_gmail_instance = false;
        },60 * 60 * 1000);
    }
    var rs = {};
    for(var item of list_data_gmail) {
        if(!item.is_running) {
            rs = item;
            item.is_running = true;
            break;
        }
    }
    setTimeout(function(){
        rs.is_running = false;
    },4 * 60 * 1000);
    return rs;
}

GmailBots.timeout = async function (timeout = 1000) {
    var def = Q.defer();
    setTimeout(function(){
        def.resolve(true);
    }, timeout);
    return def.promise;
}



GmailBots.prototype.create_facebook = async function(id) {
    if(id) {
        var r = await this.findOne(id);
        if(r){}
    }
    console.log('id',id);
    var driver = await Proxy.get_driver();
    var array_date = this.birthday.replace(/\//gi,'-').replace(/[-]+/gi,'-').split('-');
    var month = parseInt(array_date[1]);
    if(array_date[2].length == 4) {
        var day = parseInt(array_date[0]);
        var year = array_date[2];
    } else {
        var day = parseInt(array_date[2]);
        var year = array_date[0];
    }
    console.log(this.username, array_date);
    await driver.get('https://www.facebook.com/');
    //BEGIN BUOC 1
    await driver.findElement(By.name('lastname')).sendKeys(this.last_name, Key.RETURN);
    await driver.findElement(By.name('firstname')).sendKeys(this.first_name, Key.RETURN);
    await driver.findElement(By.name('reg_email__')).sendKeys(this.username + '@gmail.com', Key.RETURN);
    await driver.findElement(By.name('reg_email_confirmation__')).sendKeys(this.username + '@gmail.com', Key.RETURN);
    await driver.findElement(By.name('reg_passwd__')).sendKeys(this.pass, Key.RETURN);
    await driver.findElement(By.xpath("//select[@id='day']/option[@value='" + day + "']")).click();
    await driver.findElement(By.xpath("//select[@id='month']/option[@value='" + month + "']")).click();
    await driver.findElement(By.xpath("//select[@id='year']/option[@value='" + year + "']")).click();
    (await driver.findElements(By.xpath("//input[@name='sex']")))[(this.gender == 'male' ? 1 : 0)].click();;
    var cookies = await driver.manage().getCookies();
    console.log('cookies', cookies);
    
    await driver.findElement(By.xpath("//button[@name='websubmit']")).click();

    // this.is_create_facebook = 1;
    this.is_create_facebook_pending = 1;
    return this.save();
} 

GmailBots.prototype.get_fb_code_verify_from_email = async function(id) {
    if(id) {
        var r = await this.findOne(id);
        if(r){}
    }
    console.log('id',id);
    var driver = await Proxy.get_driver();
    await driver.get('http://youtube.com/');
    // await this.login_gmail(driver);
    // await driver.get('https://mail.google.com/mail/u/0/#inbox');
    await GmailBots.timeout(10003000);

    
}

GmailBots.prototype.login_gmail = async function(driver) {
    await driver.get('https://accounts.google.com/signin/v2/identifier?flowName=GlifWebSignIn&flowEntry=ServiceLogin');
    await driver.findElement(By.id('identifierId')).sendKeys(this.username + '@gmail.com', Key.RETURN);
    try {
        await driver.findElement(By.id('identifierNext')).click();
    } catch(e){}
    do {
        await GmailBots.timeout(1000);
        var list_tr = await driver.findElements(By.name('password'));
        console.log('buoc 2 bat dau', list_tr.length);
        if(list_tr.length == 1) {
            var a2 = await list_tr[0].sendKeys(this.pass, Key.RETURN);
            if(a2){}
        }
    } while(list_tr.length != 1);
    try {
        await driver.findElement(By.id('passwordNext')).click();
    } catch(e){}
    await GmailBots.timeout(3000);
    try {
        var list_button = await driver.findElements(By.xpath("//div[@role='button']"));
        if(list_button.length == 2) {
            await list_button[1].click();
        } else {
            await list_button[0].click();
        }
    } catch(e){}
    return GmailBots.timeout(2000);
}

GmailBots.prototype.update_create_facebook = async function(id,facebook_id = '100039760300193') {
    if(id) {
        var r = await this.findOne(id);
        if(r){}
    }
    console.log('id',id);
    this.is_create_facebook = 1;
    var FacebookBots = require('./FacebookBots');
    var model = new FacebookBots();
    model.facebook_id = facebook_id;
    model.email = this.username + '@gmail.com';
    model.pass = this.pass;
    model.first_name = this.first_name;
    model.last_name = this.last_name;
    model.name = this.first_name + ' ' + this.last_name;
    model.gender = this.gender;
    model.language = 'vn';
    model.is_active = 1;
    var that = this;
    return model.save().then(r => {
        that.is_create_facebook_pending = 2;
        that.is_create_facebook = 1;
        return that.save();
    })
}

GmailBots.prototype.login_get_cookie = async function(id) {
    if(id) {
        var r = await this.findOne(id);
        if(r){}
    }
    console.log('id',id);
    var driver = await Proxy.get_driver();
    await driver.get('https://accounts.google.com/signin/v2/identifier?flowName=GlifWebSignIn&flowEntry=ServiceLogin');
    await driver.findElement(By.id('identifierId')).sendKeys(this.username + '@gmail.com', Key.RETURN);
    try {
        await driver.findElement(By.id('identifierNext')).click();
    } catch(e){}
    do {
        await GmailBots.timeout(1000);
        var list_tr = await driver.findElements(By.name('password'));
        console.log('buoc 2 bat dau', list_tr.length);
        if(list_tr.length == 1) {
            var a2 = await list_tr[0].sendKeys(this.pass, Key.RETURN);
            if(a2){}
        }
    } while(list_tr.length != 1);
    try {
        await driver.findElement(By.id('passwordNext')).click();
    } catch(e){}
    await GmailBots.timeout(3000);
    try {
        var list_button = await driver.findElements(By.xpath("//div[@role='button']"));
        if(list_button.length == 2) {
            await list_button[1].click();
        } else {
            await list_button[0].click();
        }
    } catch(e){}
    await GmailBots.timeout(2000);
    
    this.cookie = await driver.manage().getCookies();
    await driver.quit();
    console.log('this.cookie', this.cookie);
    if(this.cookie && typeof(this.cookie) == 'object') {
        this.cookie = JSON.stringify(this.cookie);
    }
    this.is_create_gmail = 1;
    var a = await this.save(false);
    console.log(a);
    return a;
}

GmailBots.prototype.create_gmail = async function(id) {
    if(id) {
        var r = await this.findOne(id);
        if(r){}
    }
    console.log('id',id);
    var driver = await Proxy.get_driver();
    var array_date = this.birthday.split('-');
    console.log(this.username);
    await driver.get('https://accounts.google.com/signup/v2/webcreateaccount?service=mail&continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&ltmpl=default&gmb=exp&biz=false&flowName=GlifWebSignIn&flowEntry=SignUp');
    //BEGIN BUOC 1
    await driver.findElement(By.id('lastName')).sendKeys(this.last_name, Key.RETURN);
    await driver.findElement(By.id('firstName')).sendKeys(this.first_name, Key.RETURN);
    await driver.findElement(By.id('username')).sendKeys(this.username, Key.RETURN);
    await driver.findElement(By.name('Passwd')).sendKeys(this.pass, Key.RETURN);
    await driver.findElement(By.name('ConfirmPasswd')).sendKeys(this.pass, Key.RETURN);
    console.log('buoc 1 truoc khi wait');
    await GmailBots.timeout(1000);
    console.log('buoc 1 sau khi wait');
    try {
        await driver.findElement(By.id('accountDetailsNext')).click();
    } catch(e){}
    console.log('xuong buoc 1');
    //END BUOC 1
    //BEGIN BUOC 2
    do {
        await GmailBots.timeout(2000);
        var list_tr = await driver.findElements(By.xpath("//input[@id='day']"));
        console.log('buoc 2 bat dau', list_tr.length);
        if(list_tr.length == 1) {
            var a2 = await driver.findElements(By.xpath("//input[@aria-label='Địa chỉ email khôi phục (tùy chọn)']"));
            if(a2.length) {
                await a2[0].sendKeys(this.email_recover, Key.RETURN);
            }
            await driver.findElement(By.id('day')).sendKeys(array_date[2], Key.RETURN);
            await driver.findElement(By.id('month')).sendKeys(array_date[1], Key.RETURN);
            await driver.findElement(By.id('year')).sendKeys(array_date[0], Key.RETURN);
            await driver.findElement(By.id('gender')).sendKeys(this.gender == 'male' ? 1 : 2, Key.RETURN);
            await GmailBots.timeout(500);
            try {
                await driver.findElement(By.id('personalDetailsNext')).click();
            } catch(e){}
            await GmailBots.timeout(1000);
        }
    } while(list_tr.length != 1);
    //END BUOC 2
    //BEGIN BUOC 3
    do {
        await GmailBots.timeout(1000);
        var list_tr_3 = await driver.findElements(By.xpath("//input[@id='phoneUsageNext']"));
        console.log('buoc 3 bat dau', list_tr.length);
        if(list_tr_3.length == 1) {
            try {
                await driver.findElement(By.id('phoneUsageNext')).click();
            } catch(e){}
            await GmailBots.timeout(1000);
        }
    } while(list_tr_3.length != 1);
    //END BUOC 3
    //BEGIN BUOC 4
    do {
        await GmailBots.timeout(2000);
        var list_tr_3 = await driver.findElements(By.xpath("//div[@role='button']"));
        if(list_tr_3.length == 1) {
            try {
                await driver.findElement(By.xpath("//div[@role='button']")).click();
            } catch(e){}
            await GmailBots.timeout(400);
            try {
                await driver.findElement(By.xpath("//div[@role='button']")).click();
            } catch(e){}
            await GmailBots.timeout(500);
            try {
                await driver.findElement(By.xpath("//div[@role='button']")).click();
            } catch(e){}
            await GmailBots.timeout(600);
        }
    } while(list_tr_3.length != 1);
    try {
        await driver.findElement(By.id('termsofserviceNext')).click();
    } catch(e){}
    await GmailBots.timeout(5000);
    await driver.quit();
    //welcome_dialog_next => ok
    //END BUOC 4
    this.is_create_gmail = 1;
    return this.save(false);
}

GmailBots.auto_generate_account_gmail_by_limit = async function(limit = 1) {
    var model = new GmailBots();
    var list = await model.findAll({is_create_gmail:0,limit_db:limit,order_by:'id desc'});
    for(var i in list) {
        var row = list[i];
        list[i] = new GmailBots();
        list[i].setAttributes(row);
        list[i]._old_attributes = row;
    }
    return GlobalFunction.runMultiRequest(list, async function(data,index){
        var item = data[index];
        return item.create_gmail();
    },1);
}

GmailBots.auto_generate_account_facebook_by_limit = async function(limit = 1) {
    var model = new GmailBots();
    var list = await model.findAll({is_create_facebook:0,is_create_gmail:1,limit_db:limit,order_by:'id desc'});
    for(var i in list) {
        var row = list[i];
        list[i] = new GmailBots();
        list[i].setAttributes(row);
        list[i]._old_attributes = row;
    }
    return GlobalFunction.runMultiRequest(list, async function(data,index){
        var item = data[index];
        console.log('bat dau', index, item.id);
        return item.create_facebook();
    },1);
}

exports = module.exports = GmailBots;
