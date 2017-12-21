export class M_Key {

    key: string;
    type : string;

    static allowedCourseKeys: string[] = ["courses_avg", "courses_pass", "courses_fail", "courses_audit", "courses_year"];
    static allowedRoomKeys : string [] = ["rooms_lat", "rooms_lon", "rooms_seats"];

    static parse(mComparisonBody: any, typeData : string) : M_Key {
        let keys: string[] = Object.keys(mComparisonBody);
        if (keys.length != 1) {
            return null;
        }
        let parsedM_Key = new M_Key();
        if (M_Key.allowedCourseKeys.includes(keys[0])) {
            parsedM_Key.key = keys[0];
            parsedM_Key.type = "courses";
        }
        if (M_Key.allowedRoomKeys.includes(keys[0])) {
            parsedM_Key.key = keys[0];
            parsedM_Key.type = "rooms";
        }

        if (parsedM_Key.type !== typeData ||
            parsedM_Key.key == null) {
            return null;
        }
        return parsedM_Key;
    }

    static parseV(value : any) : M_Key {
        let parsedM_Key = new M_Key();
        if (M_Key.allowedCourseKeys.includes(value)) {
            parsedM_Key.key = value;
            parsedM_Key.type = "courses";
        }
        if (M_Key.allowedRoomKeys.includes(value)) {
            parsedM_Key.key = value;
            parsedM_Key.type = "rooms";
        }
        if (parsedM_Key.key == null) {
            return null;
        }
        return parsedM_Key;
    }

}