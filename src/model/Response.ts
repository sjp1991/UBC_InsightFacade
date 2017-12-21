
import {InsightResponse} from "../controller/IInsightFacade";

//A Response is a response implemented form InsightResponse but with a few more methods
export default class Response implements InsightResponse{

    code : number = 0;
    body : {};

    constructor() {

    }

    setCode(val : number) {
        this.code = val;
    }

    getCode() : number {
        return this.code;
    }

    setBody(val : {}) {
        this.body = val;
    }

    getBody() : {} {
        return this.body;
    }


}