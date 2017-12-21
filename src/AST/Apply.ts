import { ApplyKey } from "./ApplyKey";
import {DataColumns} from "./DataColumns";
import {Columns} from "./Columns";
import {Data} from "../model/Data";

export class Apply {
    static APPLY: string = "APPLY";
    applyKeys: ApplyKey[] = [];

    static parse(apply: any, columns : Columns): Apply {
        let applyKeyArray = apply[Apply.APPLY];

        if (Array.isArray(applyKeyArray)){
            let parsedApply = new Apply();
            if (applyKeyArray.length == 0) {
                return parsedApply;
            }

            for (let i = 0; i < applyKeyArray.length; i++) {
                let applyKey = ApplyKey.parse(applyKeyArray[i], columns);
                if (applyKey != null) {
                    parsedApply.applyKeys.push(applyKey);
                } else {
                    return null;
                }
            }

            for (let i = 0; i < parsedApply.applyKeys.length - 1; i++) {
                for (let j = i + 1; j < parsedApply.applyKeys.length; j++) {
                    if (parsedApply.applyKeys[i].applyKeyString === parsedApply.applyKeys[j].applyKeyString){
                        return null;
                    }
                }
            }

            let tempArray : string[] = [];
            for (let columnsKey of columns.stringMightInApply){
                for (let applyKey of parsedApply.applyKeys) {
                    if (applyKey.applyKeyString === columnsKey) {
                        tempArray.push(columnsKey);
                    }
                }
            }
            if (tempArray.length != columns.stringMightInApply.length) {
                return null;
            }


            return parsedApply;
        } else {
            return null;
        }
    }

    evaluate(dataGrouped : Data[][]) : any[] {
        let returnJSON : any[] =[];
        if (this.applyKeys.length == 0) {
            for (let entry of dataGrouped) {
                let result : any = {};
                result['representative'] = entry[0];
                returnJSON.push(result);
            }
        } else {
            for (let key of this.applyKeys) {
                let result = key.evaluate(dataGrouped);
                if (returnJSON.length === 0) {
                    for (let groupObj of result) {
                        returnJSON.push(groupObj);
                    }
                } else {
                    for (let i = 0; i < result.length; i++) {
                        let groupObj = result[i];
                        returnJSON[i][key.applyKeyString] = groupObj[key.applyKeyString];
                    }
                }
            }
        }
        return returnJSON;
    }

}