export class S_Key {
    key: string;
    type : string;

    static allowedKeys: string[] = ["courses_dept", "courses_id", "courses_instructor", "courses_title" ,
        "courses_uuid"];
    static allowedRoomKeys : string [] = ["rooms_fullname", "rooms_shortname", "rooms_number", "rooms_name",
        "rooms_address", "rooms_type", "rooms_furniture", "rooms_href"];

    static parse(sComparisonBody: any, typeData : string) : S_Key {
        let keys: string[] = Object.keys(sComparisonBody);
        if (keys.length != 1) {
            return null;
        }

        let parsedS_Key = new S_Key();
        for (let key of S_Key.allowedKeys) {
            if (key === keys[0]) {
                parsedS_Key.key = key;
                parsedS_Key.type = "courses";
            }
        }
        for (let key of S_Key.allowedRoomKeys) {
            if (key === keys[0]) {
                parsedS_Key.key = key;
                parsedS_Key.type = "rooms";
            }
        }

        if (parsedS_Key.type !== typeData) {
            return null;
        }

        if (parsedS_Key.key == null) {
            return null;
        }
        return parsedS_Key;
    }

    static parseV(value : any) : S_Key {
        let parsedS_Key = new S_Key();
        for (let key of S_Key.allowedKeys) {
            if (key === value) {
                parsedS_Key.key = key;
                parsedS_Key.type = "courses";
            }
        }
        for (let key of S_Key.allowedRoomKeys) {
            if (key === value) {
                parsedS_Key.key = key;
                parsedS_Key.type = "rooms";
            }
        }

        if (parsedS_Key.key == null) {
            return null;
        }
        return parsedS_Key;
    }


}