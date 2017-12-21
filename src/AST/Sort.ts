import {Direction} from "./Direction";
import {Columns} from "./Columns";
import {Data} from "../model/Data";
import {DataColumns} from "./DataColumns";

export class Sort {

    static ORDER: string = "ORDER";
    direction: Direction;
    keys: string[] = [];
    string: string;
    stringOrDirAndKeys: string;

    static parse(sort: any, columns: Columns): Sort {
        let parsedSort = new Sort();
        let innerObj = sort[Sort.ORDER];

        if (typeof innerObj === 'string') {
            parsedSort.string = sort[Sort.ORDER];

            if (!columns.stringArray.includes(parsedSort.string) &&
                !columns.stringMightInApply.includes(parsedSort.string)) {
                return null;
            }

            parsedSort.stringOrDirAndKeys = "string";
            return parsedSort;
        } else if (Object.keys(innerObj).length == 2) {
            let innerKeys = Object.keys(innerObj);
            if (innerKeys[0] == 'dir' && innerKeys[1] == 'keys') {
                if (Direction.keys.includes(innerObj['dir'])) {
                    parsedSort.direction = innerObj['dir'];
                } else {
                    return null;
                }
                let innerArray = innerObj['keys'];
                if (!Array.isArray(innerArray)) {
                    return null;
                }
                if (innerArray.length != 0) {
                    for (let i = 0; i < innerArray.length; i++) {
                        if (typeof innerArray[i] === 'string') {
                            if (!columns.stringArray.includes(innerArray[i]) &&
                                !columns.stringMightInApply.includes(innerArray[i])) {
                                return null;
                            }
                            parsedSort.keys.push(innerArray[i]);
                        } else {
                            return null;
                        }
                    }
                    parsedSort.stringOrDirAndKeys = "DirAndKeys";
                    return parsedSort;
                }
            }
        }
        return null;
    }

    evaluate(data: any[]): any[] {
        let that = this;
        if (this.stringOrDirAndKeys === "string") {
            let functionKey = this.string;
            let sortedData = data.sort(function (a: any, b: any): number {
                if (a[functionKey] < b[functionKey]) return -1;
                if (a[functionKey] > b[functionKey]) return 1;
                return 0;
            });
            return sortedData;
        } else {
            let sortedData;
            if (this.direction === "UP") {
                sortedData = data.sort(function (a: any, b: any): number {
                    let index = 0;
                    while (index < that.keys.length) {
                        let key = that.keys[index];
                        if (a[key] < b[key]) return -1;
                        if (a[key] > b[key]) return 1;
                        index++;
                    }
                    return 0;
                });
            } else {
                sortedData = data.sort(function (a: any, b: any): number {
                    let index = 0;
                    while (index < that.keys.length) {
                        let key = that.keys[index];
                        if (a[key] > b[key]) return -1;
                        if (a[key] < b[key]) return 1;
                        index++;
                    }
                    return 0;
                });
            }
            return sortedData;
        }
    }

}