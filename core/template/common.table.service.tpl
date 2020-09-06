{application_import}
export class CommonTableService {
    static list_obj = {};
    static flag = false;
    static get_list_class(user_service: UserService) {
        if(!CommonTableService.flag) {
            CommonTableService.flag = true;
            {attributes}
        }
        return CommonTableService.list_obj;
    }
    static getAttributeSelect(table_name) {
        var attributes = CommonTableService.list_obj[table_name].attributeNotGet();
        var rs = [{id:'',text:'-- Chọn --'}];
        for(var i in attributes) {
            rs.push({id: i,  text: attributes[i]});
        }
        return rs;
    }
}