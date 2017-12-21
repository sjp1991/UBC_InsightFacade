import {DataColumns} from "./DataColumns";

export interface RoomColumns extends DataColumns{
    rooms_fullname ?: string; //Full building name (e.g., "Hugh Dempster Pavilion").
    rooms_shortname ?: string; //Short building name (e.g., "DMP").
    rooms_number ?: string; //The room number. Not always a number, so represented as a applyKeyString.
    rooms_name ?: string; //The room id; should be rooms_shortname+"_"+rooms_number.
    rooms_address ?: string; //The building address. (e.g., "6245 Agronomy Road V6T 1Z4").
    rooms_lat ?: number; //The latitude of the building.
    rooms_lon ?: number; //The longitude of the building.
    rooms_seats ?: number; //The number of seats in the room.
    rooms_type ?: string; //The room type (e.g., "Small Group").
    rooms_furniture ?: string; //The room type (e.g., "Classroom-Movable Tables & Chairs").
    rooms_href ?: string; //The link to full details online (e.g., "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/DMP-201").

    [key: string] : any;
}