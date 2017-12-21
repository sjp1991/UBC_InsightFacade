import {Columns} from "./Columns";
import {Key} from "./Key";
import Course from "../model/Course";
import {CourseColumns} from "./CourseColumns";
import {Data} from "../model/Data";
import {DataColumns} from "./DataColumns";
import Room from "../model/Room";
import {Sort} from "./Sort";

export class Options {
    static key : string = "OPTIONS";
    COLUMNS : Columns;
    static order : string = "ORDER";
    SORT : Sort; //if null then doesn't exist

    static parse(options: any): Options {

        //if (Object.keys(options).length > 3) {
        //    return null;
        //}

        let val = options[Options.key];
        if (val) {
            let parsedOptions = new Options();
            parsedOptions.COLUMNS = Columns.parse(val);
            if (parsedOptions.COLUMNS == null) {
                return null;
            }

            let order = val[Options.order];
            if (order) {
                let sort = Sort.parse(val, parsedOptions.COLUMNS);
                if (sort == null) {
                    return null;
                }
                parsedOptions.SORT = sort;
            }
            return parsedOptions;
        } else {
            return null;
        }
    }


    evaluate(data : Data[]) : DataColumns[] {
        let sol = this.COLUMNS.evaluate(data);
        if (this.SORT != null) {
            let returnVal = this.SORT.evaluate(sol);
            return returnVal;
        }
        return sol;
    }

    evaluateTransformation(data : any[]) : any[] {
        let sol = this.COLUMNS.evaluateTransformation(data);
        if (this.SORT != null) {
            let returnVal = this.SORT.evaluate(sol);
            return returnVal;
        }
        return sol;
    }

}