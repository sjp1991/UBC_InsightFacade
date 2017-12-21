

export abstract class DataSet {
    private _id: string;
    private _dataType : string;

    constructor(id : string, type : string) {
        this._id = id;
        this._dataType = type;
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get dataType(): string {
        return this._dataType;
    }

    set dataType(value: string) {
        this._dataType = value;
    }


}