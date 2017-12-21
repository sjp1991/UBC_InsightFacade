import {MComparator} from "./MComparator";
import {M_Key} from "./M_Key";
import Course from "../model/Course";
import {Data} from "../model/Data";
import Room from "../model/Room";
import DataStorage from "../model/DataStorage";

export class MComparison {

    MCOMPARATOR : string;
    m_key : M_Key;
    num : number;

    static parse(filter : any, type : string) : MComparison {
        let keys: string[] = Object.keys(filter);
        if (keys.length != 1) {
            return null;
        }
        let parsedMComparison = new MComparison();
        for (let key of MComparator.keys) {
            if (key === keys[0]) {
                parsedMComparison.MCOMPARATOR = key;
            }
        }
        if (parsedMComparison.MCOMPARATOR == null) {
            return null;
        }
        parsedMComparison.m_key = M_Key.parse(filter[parsedMComparison.MCOMPARATOR], type);
        if (parsedMComparison.m_key == null) {
            return null;
        }

        if (typeof filter[parsedMComparison.MCOMPARATOR][parsedMComparison.m_key.key] != "number") {
            return null;
        }
        parsedMComparison.num = filter[parsedMComparison.MCOMPARATOR][parsedMComparison.m_key.key];

        return parsedMComparison;
    }

    evaluate(datasetsMap: DataStorage) : any {
        if (this.m_key.type === "rooms") {
            let results : Room[] = [];
            let allRooms = datasetsMap.getAllRooms();

            switch(this.MCOMPARATOR) {
            case "GT": {
                    for (let i = 0; i < allRooms.length; i++) {
                        let valueBeingCompared = allRooms[i][this.m_key.key];
                        if (valueBeingCompared > this.num) {
                            results.push(allRooms[i]);
                        }
                    }
                    break;
                }

            case "LT": {
                    for (let i = 0; i < allRooms.length; i++) {
                        let valueBeingCompared = allRooms[i][this.m_key.key];
                        if (valueBeingCompared < this.num) {
                            results.push(allRooms[i]);
                        }
                    }
                    break;
                }

            case "EQ": {
                    for (let i = 0; i < allRooms.length; i++) {
                        let valueBeingCompared = allRooms[i][this.m_key.key];
                        if (valueBeingCompared == this.num) {
                            results.push(allRooms[i]);
                        }
                    }
                    break;
                }
            }
            return results;
        } else {
            let allCourses: Course[] = datasetsMap.getAllCourses();
            let results: Course[] = [];

            switch(this.MCOMPARATOR) {
                case "GT": {
                    for (let i = 0; i < allCourses.length; i++) {
                        let valueBeingCompared = allCourses[i][this.m_key.key];
                        if (valueBeingCompared > this.num) {
                            results.push(allCourses[i]);
                        }
                    }
                    break;
                }

                case "LT": {
                    for (let i = 0; i < allCourses.length; i++) {
                        let valueBeingCompared = allCourses[i][this.m_key.key];
                        if (valueBeingCompared < this.num) {
                            results.push(allCourses[i]);
                        }
                    }
                    break;
                }

                case "EQ": {
                    for (let i = 0; i < allCourses.length; i++) {
                        let valueBeingCompared = allCourses[i][this.m_key.key];
                        if (valueBeingCompared == this.num) {
                            results.push(allCourses[i]);
                        }
                    }
                    break;
                }
            }
            return results;
        }

    }
   
    evaluateNegated(datasetsMap: DataStorage) : any{
        if (this.m_key.type === "rooms") {
            let results : Room[] = [];
            let allRooms = datasetsMap.getAllRooms();

            switch(this.MCOMPARATOR) {
                case "GT": {
                    for (let i = 0; i < allRooms.length; i++) {
                        let valueBeingCompared : number = allRooms[i][this.m_key.key];
                        if (valueBeingCompared <= this.num) {
                            results.push(allRooms[i]);
                        }
                    }
                    break;
                }

                case "LT": {
                    for (let i = 0; i < allRooms.length; i++) {
                        let valueBeingCompared = allRooms[i][this.m_key.key];
                        if (valueBeingCompared >= this.num) {
                            results.push(allRooms[i]);
                        }
                    }
                    break;
                }

                case "EQ": {
                    for (let i = 0; i < allRooms.length; i++) {
                        let valueBeingCompared = allRooms[i][this.m_key.key];
                        if (valueBeingCompared != this.num) {
                            results.push(allRooms[i]);
                        }
                    }
                    break;
                }
            }

            return results;
        } else {
            let allCourses: Course[] = datasetsMap.getAllCourses();
            let results: Course[] = [];

            switch(this.MCOMPARATOR) {
                case "GT": {
                    for (let i = 0; i < allCourses.length; i++) {
                        let valueBeingCompared : number = allCourses[i][this.m_key.key];
                        if (valueBeingCompared <= this.num) {
                            results.push(allCourses[i]);
                        }
                    }
                    break;
                }

                case "LT": {
                    for (let i = 0; i < allCourses.length; i++) {
                        let valueBeingCompared = allCourses[i][this.m_key.key];
                        if (valueBeingCompared >= this.num) {
                            results.push(allCourses[i]);
                        }
                    }
                    break;
                }

                case "EQ": {
                    for (let i = 0; i < allCourses.length; i++) {
                        let valueBeingCompared = allCourses[i][this.m_key.key];
                        if (valueBeingCompared != this.num) {
                            results.push(allCourses[i]);
                        }
                    }
                    break;
                }
            }
            return results;
        }
    }


}