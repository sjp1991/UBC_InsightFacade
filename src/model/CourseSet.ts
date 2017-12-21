import Course from "./Course";
import { DataSet } from "./DataSet";

/* A CourseSet is a course set, with an id, and an array of courses corresponding to the id
This class is used for easy read/write to disk
* */
export default class CourseSet extends DataSet{

    private _courses: Course[];

    constructor(id: string, courses: Course[]) {
        super(id, "courses");
        this._courses = courses;
    }

    get courses(): Course[] {
        return this._courses;
    }

    set courses(value: Course[]) {
        this._courses = value;
    }

}