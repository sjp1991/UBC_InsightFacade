
import {S_Key} from "./S_Key";
import Course from "../model/Course";
import {Data} from "../model/Data";
import Room from "../model/Room";
import DataStorage from "../model/DataStorage";

export class SComparison {

    static IS : string = "IS";
    s_key : S_Key;
    inputstring : string;

    static parse(scomparason : any, type : string) : SComparison {
        let keys: string[] = Object.keys(scomparason);
        if (keys.length != 1) {
            return null;
        }
        let parsedSComparason = new SComparison();

        if (keys[0] != SComparison.IS) {
            return null;
        }

        parsedSComparason.s_key = S_Key.parse(scomparason[SComparison.IS], type);

        if (parsedSComparason.s_key == null) {
            return null;
        }

        let str = scomparason[SComparison.IS][parsedSComparason.s_key.key];
        if (typeof str != "string"){
            return null;
        }

        let stringPattern = new RegExp("^[*]?[^*]+[*]?$");
        if (stringPattern.test(str)) {
            parsedSComparason.inputstring = str;
        } else {
            return null;
        }

        return parsedSComparason;
    }

    matchRegex(rule : string) {
        return new RegExp("^" + rule.split("*").join(".*") + "$");
    }

    evaluate(datasetsMap: DataStorage) : any {
        let that = this;

        if (that.s_key.type === "rooms") {
            let results : Room[] = [];
            let allRooms = datasetsMap.getAllRooms();

            let stringRegex = this.matchRegex(this.inputstring);
            for (let i = 0; i < allRooms.length; i++) {
                let valueBeingCompared = allRooms[i][that.s_key.key];
                if (stringRegex.test(valueBeingCompared)) {
                    results.push(allRooms[i]);
                }
            }
            return results;
        } else {
            let allCourses: Course[] = datasetsMap.getAllCourses();
            let results: Course[] = [];

            let stringRegex = this.matchRegex(this.inputstring);
            for (let i = 0; i < allCourses.length; i++) {
                let valueBeingCompared = allCourses[i][that.s_key.key];
                if (stringRegex.test(valueBeingCompared)) {
                    results.push(allCourses[i]);
                }
            }
            return results;
        }
    }

    evaluateNegated(datasetsMap: DataStorage) : any {
        let that = this;

        if (that.s_key.type === "rooms") {
            let results : Room[] = [];
            let allRooms = datasetsMap.getAllRooms();

            let stringRegex = this.matchRegex(this.inputstring);
            for (let i = 0; i < allRooms.length; i++) {
                let valueBeingCompared = allRooms[i][that.s_key.key];
                if (!stringRegex.test(valueBeingCompared)) {
                    results.push(allRooms[i]);
                }
            }
            return results;
        } else {
            let allCourses: Course[] = datasetsMap.getAllCourses();
            let results: Course[] = [];

            let stringRegex = this.matchRegex(this.inputstring);
            for (let i = 0; i < allCourses.length; i++) {
                let valueBeingCompared = allCourses[i][that.s_key.key];
                if (!stringRegex.test(valueBeingCompared)) {
                    results.push(allCourses[i]);
                }
            }
            return results;
        }
    }

}