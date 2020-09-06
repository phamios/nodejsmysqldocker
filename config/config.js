exports = module.exports = config;
var argv = {};
process.argv.forEach(function (val, index, array) {
    if (val.indexOf('=') != -1) {
        let k = val.substr(0, val.indexOf('='));
        let v = val.substr(val.indexOf('=') + 1);
        k = k.replace(/-/gi, '');
        argv[k] = v;
    }
});

function config() {

}
config.APPLiCATION_PATH = __dirname.replace(/\\/gi, '/').replace(/\/config(|\/)/gi, '/');
if (!argv || typeof (argv) != 'object') {
    argv = {};
}
config.argv = argv;
if (config.APPLiCATION_PATH.replace('/var/www/html/', '') != config.APPLiCATION_PATH) {
    argv.env = 'prod';
}

config.LINK_PDF = 'http://192.168.102.104:6300/msbpdf';

config.ACCESS_TOKEN_INDEX = 0;
config.LIST_ACCESS_TOKEN = [
    "EAAAAUaZA8jlABAEpBRI5AeyZCPjAkz5VGV4gxmZADLoOsUjMnyzAX0NAres5SRUZBN1MYqF9MZBngJhHnFwz7BiMI558qk2QrFWc5sALZAUrLRw92QZAWs9TlC4emeQX4jrMqbm60ty1YZC9CUdMxDdveYF1K1HdyTm2QUrR9rKQoQt9BZCKeyBHxdApz5uo2h8gZD",
    "EAAAAUaZA8jlABADwHcqi7vo1gYvXGmyqathOKJiHZCN5JNs6QgVwOuvlsEWlHron7OjPZCOKMEwVZAIlx0oqbzAMZBZA9uouoTpBqhlv4SpSmS0taKmY0q4Ee7FkcUcIUlWCDzy3IdMEZAnZCEsZBZC7GCNrLuKewyjEqcGtkCvPIuoMldPV97teXySGi9LnwvyRUZD"
];


config.ALL_DEFER = {};
config.MAP_API_KEY = "AIzaSyBD1yh4p30kaKpA2idu_e_rcR1GZkUYXCA";

setMapApiKey = function (apikey) {
    config.MAP_API_KEY = apikey;
}
config.LINK_IMAGE = '/var/www/html/files/crawlermanagement/';
config.LINK_IMAGE_URL = 'http://192.168.105.71:6801/static/';
config.MYSQL = {};
config.MONGO = {};
config.DB2 = {};
config.ORACLEDB_SERVER = "http://192.168.105.72:1006/";

config.SERVER = {
    'crawlermanagement': 'crawlermanagement',
};
config.MYSQL[config.SERVER['crawlermanagement']] = {
    // server: '192.168.105.71',
    // username: 'five9',
    // password: 'five9123',
    server: 'db',
    port:'3306',
    username: 'root',
    password: '1q2w3e4r',
    // server: 'localhost',
    // username: 'root',
    // password: '',
    database: 'crownx',
    reconnectTimeout: 2000
}


config.MAILSERVER = {
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    requireTLS: true,
    from: 'info@cybersales.vn',
    auth: {
        user: 'info@cybersales.vn',
        pass: 'five9.vn'
    }
}

config.LINK_REFRESH_SCHEDULE_JOB = 'http://192.168.105.71:6801/crawlermanagement/notauthen/restartschedulejob';

config.LINK_FILE_EXCEL = '/var/www/html/';


config.CUONG_API = {
    PROFILE: 'http://192.168.9.95:4040/object/common',
    FRIENDS: 'http://192.168.9.95:4040/profile/friend_list',
    GROUPS: 'http://192.168.9.95:4040/profile/joined_groups',
    FEED: 'http://192.168.9.95:4040/object/feed',
    COVER: 'https://graph.facebook.com/v1.0/{id}/cover/?access_token={access_token}',
    SUBSCRIBERS: 'http://192.168.9.95:4040/profile/followers',
    LIKES: 'http://192.168.9.95:4040/profile/liked_fanpage',
    MEMBERS: 'http://192.168.9.95:4040/group/members',
    FAMILY: 'https://graph.facebook.com/v1.0/{id}/family?access_token={access_token}',
};

config.MAP_API = {
    geocode: 'https://maps.googleapis.com/maps/api/geocode/json?address={address}&key=' + config.MAP_API_KEY,
};

config.DUNG_API = {
    PROFILE: 'https://graph.facebook.com/v1.0/{id}?access_token={access_token}',
    FRIENDS: 'https://graph.facebook.com/v1.0/{id}/friends/?access_token={access_token}',
    GROUPS: 'https://graph.facebook.com/v1.0/{id}/groups/?access_token={access_token}',
    FEED: 'https://graph.facebook.com/v1.0/{id}/feed/?access_token={access_token}&summary=true&limit={limit}&pretty=1',
    COVER: 'https://graph.facebook.com/v1.0/{id}/cover/?access_token={access_token}',
    SUBSCRIBERS: 'https://graph.facebook.com/v1.0/{id}/subscribers?limit=5000&access_token={access_token}',
    SUBSCRIBEDTO: 'https://graph.facebook.com/v1.0/{id}/subscribedto?access_token={access_token}',
    LIKES: 'https://graph.facebook.com/v1.0/{id}/likes?access_token={access_token}',
    MEMBERS: 'https://graph.facebook.com/v1.0/{id}/members/?limit=10000&access_token={access_token}',
    FAMILY: 'https://graph.facebook.com/v1.0/{id}/family?access_token={access_token}',
}

config.LIST_TABLE_CORE = [
    'mail_settings',
    'settings_cron',
    'settings_field',
    'settings_files',
    'settings_form',
    'settings_grid',
    'settings_icon',
    'settings_images',
    'settings_mapping',
    'settings_menu_admin',
    'settings_message',
    'settings_statistical',
    'settings_table',
    'settings_token',
    'settings_webcron',
    'system_setting',
    'user',
    'useronline',
    'webaccess',
    'role',
    'role_group',
    'role_item',
    'role_role_item_mul',
    'user_role_mul',
    'sendmail',
    'copyweb',
    'error_log',
    'admin_other',
    'admin_table_column',
    'admin_table',
    'admin_page',
    'admin_page_line',
    'admin_page_cell',
    'admin_form_tab',
    'admin_form_field',
    'admin_form',
    'filter_user_field',
    'filter_user',
    'filter_default_field',
    'filter_default',
    'user_admin_table_column_mul',
    "filter_user_admin_table_column_mul",
    'image_verification',
    'image_verification_result',
];
