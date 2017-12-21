
import {Data} from "./Data";

export default class Room extends Data{

    rooms_fullname: string; //Full building name (e.g., "Hugh Dempster Pavilion").
    rooms_shortname: string; //Short building name (e.g., "DMP").
    rooms_number: string; //The room number. Not always a number, so represented as a applyKeyString.
    rooms_name: string; //The room id; should be rooms_shortname+"_"+rooms_number.
    rooms_address: string; //The building address. (e.g., "6245 Agronomy Road V6T 1Z4").
    rooms_lat: number; //The latitude of the building.
    rooms_lon: number; //The longitude of the building.
    rooms_seats: number; //The number of seats in the room.
    rooms_type: string; //The room type (e.g., "Small Group").
    rooms_furniture: string; //The room type (e.g., "Classroom-Movable Tables & Chairs").
    rooms_href: string; //The link to full details online (e.g., "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/DMP-201").

    [key: string] : any;

    // get rooms_fullname(): applyKeyString {
    //     return this._rooms_fullname;
    // }
    //
    // set rooms_fullname(value: applyKeyString) {
    //     this._rooms_fullname = value;
    // }
    //
    // get rooms_shortname(): applyKeyString {
    //     return this._rooms_shortname;
    // }
    //
    // set rooms_shortname(value: applyKeyString) {
    //     this._rooms_shortname = value;
    // }
    //
    // get rooms_number(): applyKeyString {
    //     return this._rooms_number;
    // }
    //
    // set rooms_number(value: applyKeyString) {
    //     this._rooms_number = value;
    // }
    //
    // get rooms_name(): applyKeyString {
    //     return this._rooms_name;
    // }
    //
    // set rooms_name(value: applyKeyString) {
    //     this._rooms_name = value;
    // }
    //
    // get rooms_address(): applyKeyString {
    //     return this._rooms_address;
    // }
    //
    // set rooms_address(value: applyKeyString) {
    //     this._rooms_address = value;
    // }
    //
    // get rooms_lat(): number {
    //     return this._rooms_lat;
    // }
    //
    // set rooms_lat(value: number) {
    //     this._rooms_lat = value;
    // }
    //
    // get rooms_lon(): number {
    //     return this._rooms_lon;
    // }
    //
    // set rooms_lon(value: number) {
    //     this._rooms_lon = value;
    // }
    //
    // get rooms_seats(): number {
    //     return this._rooms_seats;
    // }
    //
    // set rooms_seats(value: number) {
    //     this._rooms_seats = value;
    // }
    //
    // get rooms_type(): applyKeyString {
    //     return this._rooms_type;
    // }
    //
    // set rooms_type(value: applyKeyString) {
    //     this._rooms_type = value;
    // }
    //
    // get rooms_furniture(): applyKeyString {
    //     return this._rooms_furniture;
    // }
    //
    // set rooms_furniture(value: applyKeyString) {
    //     this._rooms_furniture = value;
    // }
    //
    // get rooms_href(): applyKeyString {
    //     return this._rooms_href;
    // }
    //
    // set rooms_href(value: applyKeyString) {
    //     this._rooms_href = value;
    // }

}
