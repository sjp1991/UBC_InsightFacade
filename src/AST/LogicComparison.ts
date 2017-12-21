import {Logic} from "./Logic";
import {Filter} from "./Filter";
import Course from "../model/Course";
import {Data} from "../model/Data";
import DataStorage from "../model/DataStorage";

export class LogicComparison {
    LOGIC : string;
    FILTERS : Filter[];

    static parse(logicComparison : any, type : string) : LogicComparison {
        let keys: string[] = Object.keys(logicComparison);
        if (keys.length != 1) {
            return null;
        }

        let parsedLogicComparison = new LogicComparison();

        if (Logic.keys.includes(keys[0])) {
            parsedLogicComparison.LOGIC = keys[0];
        }

        if (parsedLogicComparison.LOGIC == null) {
            return null;
        }

        let parsedFilters : Filter[] = [];

        if (Array.isArray(logicComparison[parsedLogicComparison.LOGIC])) {
            let filters = logicComparison[parsedLogicComparison.LOGIC];
            for (let i = 0; i < filters.length; i++) {
                if (Filter.parse(filters[i], type) != null) {
                    let fil = Filter.parse(filters[i], type);
                    parsedFilters.push(fil);
                } else {
                    return null;
                }
            }

            if (parsedFilters.length == 0) {
                return null;
            } else {
                parsedLogicComparison.FILTERS = parsedFilters;
                return parsedLogicComparison;
            }
        } else {
            return null;
        }
    }


    evaluate(datasetsMap: DataStorage) : any{
        let that = this;
        switch(this.LOGIC) {
            case "AND": {
                let currentData : Data[] = this.FILTERS[0].evaluate(datasetsMap);
                let commonData : Data[] = [];
                if (this.FILTERS.length > 1) {
                    for (let i = 1; i < this.FILTERS.length; i++) {
                        let satisfiedData = this.FILTERS[i].evaluate(datasetsMap);
                        for (let j = 0; j < satisfiedData.length; j++) {
                            for (let a = 0; a < currentData.length; a++) {
                                if (satisfiedData[j] == currentData[a]) {
                                    commonData.push(satisfiedData[j]);
                                }
                            }
                        }
                        currentData = commonData;
                        commonData = [];
                    }
                }
                return currentData;
            }

            case "OR": {
                let setOfData = new Set<Data>();
                for (let i = 0; i < that.FILTERS.length; i++) {
                    let satisfiedData = that.FILTERS[i].evaluate(datasetsMap);
                    for (let j = 0; j < satisfiedData.length; j++) {
                        if (!setOfData.has(satisfiedData[j])){
                            setOfData.add(satisfiedData[j]);
                        }
                    }
                }
                return Array.from(setOfData);
            }
        }
    }

    evaluateNegated(datasetsMap: DataStorage) : any {
        switch(this.LOGIC) {
            case "AND": {
                let setOfData = new Set<Data>();
                for (let i = 0; i < this.FILTERS.length; i++) {
                    let satisfiedData = this.FILTERS[i].evaluateNegated(datasetsMap);
                    for (let j = 0; j < satisfiedData.length; j++) {
                        if (!setOfData.has(satisfiedData[j])){
                            setOfData.add(satisfiedData[j]);
                        }
                    }
                }
                return Array.from(setOfData);
            }
            case "OR": {
                let currentData : Data[] = this.FILTERS[0].evaluateNegated(datasetsMap);
                let commonData : Data[] = [];
                if (this.FILTERS.length > 1) {
                    for (let i = 1; i < this.FILTERS.length; i++) {
                        let satisfiedData = this.FILTERS[i].evaluateNegated(datasetsMap);
                        for (let j = 0; j < satisfiedData.length; j++) {
                            for (let a = 0; a < currentData.length; a++) {
                                if (satisfiedData[j] == currentData[a]) {
                                    commonData.push(satisfiedData[j]);
                                }
                            }
                        }
                        currentData = commonData;
                        commonData = [];
                    }
                }
                return currentData;
            }
        }
    }

}