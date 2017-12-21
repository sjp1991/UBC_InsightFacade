import {Key} from "./Key";
import Course from "../model/Course";
import {CourseColumns} from "./CourseColumns";
import {Data} from "../model/Data";
import {DataColumns} from "./DataColumns";
import {RoomColumns} from "./RoomColumns";
import Room from "../model/Room";

export class Columns {
    static key: string = "COLUMNS";
    keysArray: Key[];
    //if stringArray is [], check if all keys in stringMightInApply is in Apply.
    //if stringMightInApply is [], then check if all keys in stringArray is in Group.
    stringArray : string[];
    stringMightInApply : string[];
    type: string;

    static parse(column: any): Columns {
        let val = column[Columns.key];
        if (val) {
            let parsedColumns = new Columns();

            let successKeys: Key[] = [];
            if (!Array.isArray(val)) {
                return null;
            }

            let stringMightInApply : string[] = [];

            for (let i = 0; i < val.length; i++) {
                let tryKey = Key.parse(val[i]);
                if (tryKey == null) {
                    if (<string> val[i].includes("_")) {
                        return null;
                    } else {
                        stringMightInApply.push(val[i]);
                    }
                } else {
                    successKeys.push(tryKey);
                }
            }

            if (successKeys.length == 0 && stringMightInApply.length == 0) {
                return null;
            } else if (successKeys.length == 0) {
                parsedColumns.stringArray = [];
                parsedColumns.stringMightInApply = stringMightInApply;
            } else {
                for (let i = 0; i < successKeys.length - 1; i++) {
                    for (let j = 1; j < successKeys.length; j++) {
                        if (successKeys[i].type !== successKeys[j].type) {
                            return null;
                        }
                    }
                }
                parsedColumns.type = successKeys[0].type;
                parsedColumns.keysArray = successKeys;
                let arrayOfKeyVal : string[] = [];
                for (let i = 0; i < parsedColumns.keysArray.length; i++) {
                    arrayOfKeyVal.push(parsedColumns.keysArray[i].theKey);
                }
                parsedColumns.stringArray = arrayOfKeyVal;
                parsedColumns.stringMightInApply = stringMightInApply;
            }
            return parsedColumns;
        } else {
            return null;
        }
    }


    evaluate(data: Data[]): any[] {
        if (this.type === "rooms") {
            let dataWithTypeChanged = <Room[]> data;
            let newRooms: RoomColumns[] = [];
            for (let i = 0; i < data.length; i++) {
                let newRoom: RoomColumns = {};
                for (let j = 0; j < this.stringArray.length; j++) {
                    let keyInArray = this.stringArray[j];
                    newRoom[keyInArray] = dataWithTypeChanged[i][keyInArray];
                }
                newRooms.push(newRoom);
            }
            return newRooms;
        } else {
            let newCourses: CourseColumns[] = [];
            let dataWithTypeChanged = <Course[]> data;
            for (let i = 0; i < data.length; i++) {
                let newCourse: CourseColumns = {};
                for (let j = 0; j < this.stringArray.length; j++) {
                    let keyInArray = this.stringArray[j];
                    newCourse[keyInArray] = <Course> dataWithTypeChanged[i][keyInArray];
                }
                newCourses.push(newCourse);
            }
            return newCourses;
        }
    }

    evaluateTransformation(data : any[]) : any[] {
        let solution : any[] = [];
        for (let i = 0 ; i < data.length; i++) {
            let obj : any = {};
            for (let key of this.stringArray) {
                obj[key] = data[i]['representative'][key];
            }
            for (let key of this.stringMightInApply) {
                obj[key] = data[i][key];
            }
            solution[i] = obj;
        }
        return solution;
    }
}