import {Group} from "./Group";
import {Apply} from "./Apply";
import {Columns} from "./Columns";
import {Data} from "../model/Data";

export class Transformations {

    static TRANSFORMATIONS : string = "TRANSFORMATIONS";
    GROUP : Group;
    APPLY : Apply;

    static parse(transformation : any, columns : Columns, type : string) : Transformations{
        let isTransformation = transformation[Transformations.TRANSFORMATIONS];
        if (isTransformation) {
            let parsedTransformations = new Transformations();
            parsedTransformations.GROUP = Group.parse(isTransformation, columns, type);
            if (parsedTransformations.GROUP == null){
                return null;
            }
            parsedTransformations.APPLY = Apply.parse(isTransformation, columns);
            if (parsedTransformations.APPLY == null) {
                return null;
            }
            return parsedTransformations;
        } else {
            return null;
        }
    }

    evaluate(data : Data[]) :  any[] {
        let groupedData = this.GROUP.evaluate(data);
        let apply = this.APPLY.evaluate(groupedData);
        return apply;
    }
}