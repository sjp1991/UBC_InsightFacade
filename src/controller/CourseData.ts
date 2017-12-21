export class CourseData {
    course: string; // - The course number
    content: Array<SectionData>;
}

export class SectionData {
    dept: string; // - The department that offered the course.
    id: string; // - The course number (will be treated as a applyKeyString, e.g., 499b).
    avg: number; // - The average of the course offering.
    instructor: string; // - The instructor teaching the course offering.
    title: string; // - The name of the course.
    pass: number; // - The number of students that passed the course offering.
    fail: number; // - The number of students that failed the course offering.
    audit: number; // - The number of students that audited the course offering.
    uuid: string; // - The unique id of a course offering.

    constructor(dept:string, id:string, avg:number, instructor:string, 
        title:string, pass:number, fail:number, audit:number, uuid:string) {
        this.dept = dept;
        this.id = id;
        this.avg = avg;
        this.instructor = instructor;
        this.title = title;
        this.pass = pass;
        this.fail = fail;
        this.audit = audit;
        this.uuid = uuid;
    }
}