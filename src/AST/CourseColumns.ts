

import {DataColumns} from "./DataColumns";

export interface CourseColumns extends DataColumns {
    courses_dept ?: string
    courses_id ?: string
    courses_avg ?: number
    courses_instructor ?: string
    courses_title ?: string
    courses_pass ?: number
    courses_fail ?: number
    courses_audit ?: number
    courses_uuid ?: string;

    [key: string]: any;

}