import Course from "../model/Course";
import {Filter} from "./Filter";
import {Data} from "../model/Data";
import DataStorage from "../model/DataStorage";

export class Negation {

    static NOT: string = "NOT";
    FILTER : Filter;

    static parse(filter : any, type : string) : Negation {
        let keys: string[] = Object.keys(filter);
        if (keys.length != 1) {
            return null;
        }

        if (keys[0] != this.NOT) {
            return null;
        }

        let parsedNegation = new Negation();
        parsedNegation.FILTER = Filter.parse(filter[this.NOT], type);
        if (parsedNegation.FILTER == null) {
            return null;
        }
        return parsedNegation;
    }

    evaluate(datasetsMap: DataStorage) : any {
        return this.FILTER.evaluateNegated(datasetsMap);
    }

    evaluateNegated(datasetsMap: DataStorage) : any{
        return this.FILTER.evaluate(datasetsMap);
    }

}