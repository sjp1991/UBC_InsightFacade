import {Body} from "./Body";
import {Options} from "./Options";
import Course from "../model/Course";
import {Data} from "../model/Data";
import DataStorage from "../model/DataStorage";
import {Transformations} from "./Transformations";
import {Group} from "./Group";
import {type} from "os";

export class Query {

    BODY : Body;
    OPTIONS : Options;
    TRANSFORMATIONS : Transformations;
    type : string;

    static parse(query: any) : Query {
        let parsedQuery = new Query();

        parsedQuery.OPTIONS = Options.parse(query);
        if (parsedQuery.OPTIONS == null){
            return null;
        }

        parsedQuery.type = parsedQuery.OPTIONS.COLUMNS.type;
        parsedQuery.BODY = Body.parse(query, parsedQuery.type);
        if (parsedQuery.BODY == null) {
            return null;
        }

        if (query[Transformations.TRANSFORMATIONS]) {
            parsedQuery.TRANSFORMATIONS = Transformations.parse(query, parsedQuery.OPTIONS.COLUMNS, parsedQuery.type);
            if (parsedQuery.TRANSFORMATIONS == null) {
                return null;
            }
        }

        return parsedQuery;
    }

    evaluate(datasetsMap: DataStorage) : any {
        let solutions = this.BODY.evaluate(datasetsMap, this.type);
        if (this.TRANSFORMATIONS != null) {
            let evaluatedTransformation = this.TRANSFORMATIONS.evaluate(solutions);
            return {result:this.OPTIONS.evaluateTransformation(evaluatedTransformation)};
        }
        return {result: this.OPTIONS.evaluate(solutions)};
    }

}