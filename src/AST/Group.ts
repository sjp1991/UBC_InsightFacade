import {Key} from "./Key";
import {Columns} from "./Columns";
import {Data} from "../model/Data";
import Room from "../model/Room";
import Course from "../model/Course";

export class Group {
    static readonly GROUP: string = "GROUP";
    keys: Key[] = [];
    dataType : string;

    static parse(group: any, columns: Columns, type : string): Group {
        let keysArray = group[Group.GROUP];
        if (keysArray) {
            let parsedGroup = new Group();
            parsedGroup.dataType = type;
            for (let i = 0; i < keysArray.length; i++) {
                if (Key.parse(keysArray[i]) != null) {
                    parsedGroup.keys.push(Key.parse(keysArray[i]));
                } else {
                    return null;
                }
            }
            if (parsedGroup.keys.length == 0) {
                return null;
            }

            // for (let key of parsedGroup.keys){
            //     if (!columns.stringArray.includes(key.theKey)) {
            //         return null;
            //     }
            // }

            let countArray : string[] = [];
            for (let columnString of columns.stringArray) {
                for (let key of parsedGroup.keys) {
                    if (key.theKey === columnString) {
                        countArray.push(columnString);
                    }
                }
            }
            if (columns.stringArray.length != countArray.length){
                return null;
            }

            return parsedGroup;
        } else {
            return null;
        }
    }

    private groupUp(data: Data[]): Data[][] {
        if (this.dataType === Data.ROOM_TYPE) {
            data = <Room[]> data;
        } else {
            data = <Course[]> data;
        }
        let groups: Data[][] = [];
        let map: any = {};
        for (let entry of data) {
            let m = map;
            let groupTermKey;
            for (let i = 0; i < this.keys.length-1; i++) {
                groupTermKey = entry[this.keys[i].theKey];
                if (m[groupTermKey] == undefined) {
                    m[groupTermKey] = {};
                }
                m = m[groupTermKey];
            }
            groupTermKey = entry[this.keys[this.keys.length-1].theKey];
            if (m[groupTermKey] == undefined) {
                m[groupTermKey] = [];
                groups.push(m[groupTermKey]);
            }
            m[groupTermKey].push(entry);
        }
        return groups;
    }

    evaluate(data: Data[]): Data[][] {
        return this.groupUp(data);
    }
}