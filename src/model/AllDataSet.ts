
/* This class stores every DataSet, used in InsightFacade's datasetsMap.
 * The purpose of this class is for easy read and write to store data into datasetsMap.
 */
import { DataSet } from "./DataSet";

export default class AllDataSet {

    private dataSets : Set<DataSet>;

    constructor() {
        this.dataSets = new Set<DataSet>();
    }

    addDataSet(dataSet : DataSet) {
        this.dataSets.add(dataSet);
    }

    removeDataSet(dataSet : DataSet) {
        this.dataSets.forEach(function(item) {
            if (item.id == dataSet.id) {
                this.dataSets.remove(item);
                return;
            }
        })
    }

    getArrayOfDataSets() : DataSet[] {
        return Array.from(this.dataSets);
    }

}