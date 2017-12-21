import {S_Key} from "./S_Key";
import {M_Key} from "./M_Key";

export class Key {
    theKey : string;
    s_key : S_Key;
    m_key : M_Key;
    type : string;

    static parse(key : any) : Key {
        let parsedKey = new Key();
        parsedKey.s_key = S_Key.parseV(key);
        if (parsedKey.s_key != null) {
            parsedKey.theKey = parsedKey.s_key.key;
            parsedKey.type = parsedKey.s_key.type;
            return parsedKey;
        }

        parsedKey.m_key = M_Key.parseV(key);
        if (parsedKey.m_key != null) {
            parsedKey.theKey = parsedKey.m_key.key;
            parsedKey.type = parsedKey.m_key.type;
            return parsedKey;
        }
        return null;
    }

}