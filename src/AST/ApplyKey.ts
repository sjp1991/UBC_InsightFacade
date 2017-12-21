import { ApplyToken } from "./ApplyToken";
import { Key } from "./Key";
import {Columns} from "./Columns";
import {Data} from "../model/Data";

let Decimal = require('decimal.js');

export class ApplyKey {
    applyKeyString: string;
    applyToken: string;
    key: Key;

    static parse(applyKey: any, columns : Columns): ApplyKey {
        let keys: string[] = Object.keys(applyKey);
        let parsedApplyKey = new ApplyKey();

        if (keys.length != 1) {
            return null;
        }

        if (typeof keys[0] != 'string') {
            return null;
        }

        let keyStr = keys[0];

        parsedApplyKey.applyKeyString = keyStr;

        let innerObj = applyKey[keyStr];
        let innerKeys: string[] = Object.keys(innerObj);
        
        if (innerKeys.length != 1) {
            return null;
        }
        if (!ApplyToken.token.includes(innerKeys[0])) {
            return null;
        }
        let applyToken = innerKeys[0];
        parsedApplyKey.applyToken = applyToken;

        parsedApplyKey.key = Key.parse(innerObj[applyToken]);

        if (parsedApplyKey.key.s_key != null) {
            if (ApplyToken.mathToken.includes(applyToken)){
                return null;
            }
        }

        if (parsedApplyKey.key == null) {
            return null;
        }
        return parsedApplyKey;
    }

    evaluate(dataColumnArray : Data[][]) : any[] {
        switch(this.applyToken) {
            case "MAX": {
                return this.evaluateMax(dataColumnArray);
            }
            case "MIN": {
                return this.evaluateMin(dataColumnArray);
            }
            case "AVG": {
                return this.evaluateAvg(dataColumnArray);
            }
            case "COUNT": {
                return this.evaluateCount(dataColumnArray);
            }
            case "SUM": {
                return this.evaluateSum(dataColumnArray);
            }
        }
    }

    private evaluateMax(data : Data[][]) : any[] {
        let returnData : any[] = [];
        for (let group of data) {
            let max = Number.MIN_SAFE_INTEGER;
            for (let groupEntry of group) {
                if (groupEntry[this.key.theKey] > max) {
                    max = groupEntry[this.key.theKey];
                }
            }
            let groupObj: any = {};
            groupObj[this.applyKeyString] = max;
            groupObj["representative"] = group[0];
            returnData.push(groupObj);
        }
        return returnData;
    }

    private evaluateMin(data : Data[][]) : any[] {
        let returnData : any[] = [];
        for (let group of data) {
            let min = Number.MAX_SAFE_INTEGER;
            for (let groupEntry of group) {
                if (groupEntry[this.key.theKey] < min) {
                    min = groupEntry[this.key.theKey];
                }
            }
            let groupObj: any = {};
            groupObj[this.applyKeyString] = min;
            groupObj["representative"] = group[0];
            returnData.push(groupObj);
        }
        return returnData;
    }

    private evaluateCount(data : Data[][]) : any[] {
        let returnData : any[] = [];
        for (let group of data) {
            let appearedKeys : any[] = [];
            let count = 0;
            for (let groupEntry of group) {
                if (!appearedKeys.includes(groupEntry[this.key.theKey])) {
                    appearedKeys.push(groupEntry[this.key.theKey]);
                    count++;
                }
            }
            let groupObj: any = {};
            groupObj[this.applyKeyString] = count;
            groupObj["representative"] = group[0];
            returnData.push(groupObj);
        }
        return returnData;
    }

    private evaluateAvg(data : Data[][]) : any[] {
        let returnData : any[] = [];
        for (let group of data) {
            let allNums : number[] = [];
            for (let groupEntry of group) {
                allNums.push(groupEntry[this.key.theKey]);
            }
            let avg : number = Number((allNums.map(val => <any>new Decimal(val))
                .reduce((a,b) => a.plus(b)).toNumber() / allNums.length).toFixed(2));
            let groupObj : any = {};
            groupObj[this.applyKeyString] = avg;
            groupObj["representative"] = group[0];
            returnData.push(groupObj);
        }
        return returnData;
    }

    private evaluateSum(data : Data[][]) : any[] {
        let returnData : any[] = [];
        for (let group of data) {
            let allNums : number[] = [];
            for (let groupEntry of group) {
                allNums.push(groupEntry[this.key.theKey]);
            }
            let sum = Number(allNums.map(val => new Decimal(val))
                .reduce((a,b) => a.plus(b)).toNumber().toFixed(2));
            let groupObj : any = {};
            groupObj[this.applyKeyString] = sum;
            groupObj["representative"] = group[0];
            returnData.push(groupObj);
        }
        return returnData;
    }
}