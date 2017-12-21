import {Filter} from "./Filter";
import Course from "../model/Course";
import {Data} from "../model/Data";
import DataStorage from "../model/DataStorage";

export class Body {
    static key : string = "WHERE";
    FILTER : Filter;  //can be null

    static parse(query : any, type : string) : Body {
        if (Object.keys(query).includes(Body.key)) {
            let filter = query[Body.key];
            let parsedBody = new Body();
            if (Object.keys(filter).length === 0 && filter.constructor === Object) {
                parsedBody.FILTER = null; //filter is {}
                return parsedBody;
            } else {
                parsedBody.FILTER = Filter.parse(filter, type);
                if (parsedBody.FILTER == null) {
                    return null; //filter is illegal
                }
                return parsedBody;
            }
        } else {
            return null;
        }
    }

    evaluate(datasetsMap: DataStorage, type : string) : any {
        if (this.FILTER == null) {
            if (type === Data.ROOM_TYPE) {
                return datasetsMap.getAllRooms();
            } else {
                return datasetsMap.getAllCourses();
            }
        }
        let returnVal = this.FILTER.evaluate(datasetsMap);
        return returnVal;
    }

}