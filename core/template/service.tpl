import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { ServiceGlobal } from '{application}service.global';

@Injectable()
export class {model} extends ServiceGlobal {

    {attributes}

    dbname() {
        return '{configdb}';
    }
    tableName() { return '{table_name}'; }

    attributeLabels() {
        return Object.assign(super.attributeLabels(), {
        });
    }

    rule() {
        return Object.assign(super.rule(), {
        });
    }
}