import {LogicComparison} from "./LogicComparison";
import {MComparison} from "./MComparison";
import Course from "../model/Course";
import {SComparison} from "./SComparison";
import {Negation} from "./Negation";
import {Data} from "../model/Data";
import DataStorage from "../model/DataStorage";
import {stringify} from "querystring";

export class Filter {

    filterType: string;
    LOGICCOMPARISON : LogicComparison
    MCOMPARISON : MComparison
    SCOMPARISON : SComparison
    NEGATION : Negation

    static parse(filter : any, type : string) : Filter {
        let that = this;
        let parsedFilter = new Filter();

        parsedFilter.MCOMPARISON = MComparison.parse(filter, type);
        parsedFilter.NEGATION = Negation.parse(filter, type);
        parsedFilter.SCOMPARISON = SComparison.parse(filter, type);
        parsedFilter.LOGICCOMPARISON = LogicComparison.parse(filter, type);
        parsedFilter.filterType = that.chooseNonNull(parsedFilter)

        if (parsedFilter.filterType == null) {
            return null;
        }
        return parsedFilter;
    }

    private static chooseNonNull(parsedFilter: Filter): string {
        if (parsedFilter.MCOMPARISON != null) {
            return "MCOMPARISON";
        }
        if (parsedFilter.SCOMPARISON != null) {
            return "SCOMPARISON";
        }
        if (parsedFilter.NEGATION != null) {
            return "NEGATION";
        }
        if (parsedFilter.LOGICCOMPARISON != null) {
            return "LOGICCOMPARISON";
        }
        return null;
    }

    evaluate(datasetsMap: DataStorage) : any {
        switch(this.filterType) {
            case ("MCOMPARISON"): {
                return this.MCOMPARISON.evaluate(datasetsMap);
            }

            case ("NEGATION"): {
                return this.NEGATION.evaluate(datasetsMap);
            }

            case ("SCOMPARISON") :{
                return this.SCOMPARISON.evaluate(datasetsMap);
            }

            case ("LOGICCOMPARISON") :{
                return this.LOGICCOMPARISON.evaluate(datasetsMap);
            }
        }
    }

    evaluateNegated(datasetsMap: DataStorage) : any {
        switch(this.filterType) {
            case ("MCOMPARISON"): {
                return this.MCOMPARISON.evaluateNegated(datasetsMap);
            }

            case ("NEGATION"): {
                return this.NEGATION.evaluateNegated(datasetsMap);
            }

            case ("SCOMPARISON") :{
                return this.SCOMPARISON.evaluateNegated(datasetsMap);
            }

            case ("LOGICCOMPARISON") :{
                return this.LOGICCOMPARISON.evaluateNegated(datasetsMap);
            }
        }
    }

}