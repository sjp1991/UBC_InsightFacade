import {DataSet} from "./DataSet";
import Room from "./Room";

export default class RoomSet extends DataSet{

    private _rooms: Room[];

    constructor(id: string, rooms: Room[]) {
        super(id,"rooms");
        this._rooms = rooms;
    }

    get rooms(): Room[] {
        return this._rooms;
    }

    set rooms(value: Room[]) {
        this._rooms = value;
    }

}