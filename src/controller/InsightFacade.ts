/**
 * This is the main programmatic entry point for the project.
 */
import {IInsightFacade, InsightResponse} from "./IInsightFacade";
import Log from "../Util";
import Response from "../model/Response";
import Course from "../model/Course";
import {Query} from "../AST/Query";
import Room from "../model/Room";
import JSONHelper from "../helper/JSONHelper";
import DataStorage from "../model/DataStorage";

var JSZip = require("jszip");
var parse5 = require("parse5");

var dataStorage: DataStorage;

export default class InsightFacade implements IInsightFacade {

    constructor() {
        Log.trace('InsightFacadeImpl::init()');
        dataStorage = new DataStorage();

        try {
            dataStorage.storeAllDataFileBackToLocal();
        } catch (err) {
        }
    }

    addDataset(id: string, content: string): Promise<InsightResponse> {
        let that = this;
        if (id === "rooms") {
            return new Promise(function (fulfill, reject) {
                let response: Response = new Response();
                let dataset = new Set<Room>();
                let zip = new JSZip();

                zip.loadAsync(content, {base64: true}).then(function (zip: any) {
                    zip.file("index.htm").async("string").then(function (file: any) {
                        const document = parse5.parse(file);
                        const buildingTable = JSONHelper.getBuildingTable(document);
                        let allValidBuildingFilePaths: string[] =
                            JSONHelper.getAllValidBuildingFilePaths(buildingTable);
                        let allValidBuildingInfo: any[] = JSONHelper.getAllBuildingInfo(buildingTable);
                        let fileArray: Promise<any>[] = [];

                        for (let path of allValidBuildingFilePaths) {
                            fileArray.push(zip.file(path).async("string"));
                        }

                        Promise.all(fileArray).then(function (fileArray) {
                            let allRoomsPromises: Promise<Room[]>[] = [];
                            for (let i = 0; i < allValidBuildingInfo.length; i++) {
                                let building = allValidBuildingInfo[i];
                                let shortName = JSONHelper.getOneBuildingShortName(building);
                                let fullName = JSONHelper.getOneBuildingFullName(building);
                                let address = JSONHelper.getOneBuildingAddress(building);
                                allRoomsPromises.push(
                                    that.extractJSONIntoRooms(shortName, fullName, address, parse5.parse(fileArray[i])));
                            }
                            Promise.all(allRoomsPromises).then(function (allRoomSets) {
                                let allRooms: Room[] = [];
                                for (let roomSet of allRoomSets) {
                                    allRooms = allRooms.concat(roomSet);
                                }
                                dataset = new Set(allRooms);

                                if (dataStorage.hasRoomId(id)) {
                                    response.setCode(201);
                                    response.setBody("the operation was successful and the id already existed");
                                } else {
                                    response.setCode(204);
                                    response.setBody("The operation was successful and the id was new.");
                                }

                                dataStorage.storeRoomsInMap(id, dataset);

                                try {
                                    dataStorage.storeRoomMapOnDisk();
                                    fulfill(response);
                                } catch (err) {
                                    response.setCode(400);
                                    response.setBody({"error": "Cannot cache the dataset."});
                                    reject(response);
                                    return;
                                }
                            })
                        })
                    })
                }).catch(function (err: any) {
                    response.setCode(400);
                    response.setBody({"error": "Cannot read the zip file."});
                    reject(response);
                    return;
                });
            });
        } else if (id === "courses") {
            return new Promise(function (fulfill, reject) {
                let response: Response = new Response();
                let dataset = new Set<Course>();
                let zip = new JSZip();
                zip.loadAsync(content, {base64: true}).then(function (zip: any) {
                    //case courses
                    let fileArray: Promise<any>[] = [];

                    zip.forEach(function (filePath: any, file: any) {
                        if (!filePath.endsWith("/")) {
                            fileArray.push(file.async("string"));
                        }
                    });

                    Promise.all(fileArray).then(function (fileArray) {
                        for (let i = 0; i < fileArray.length; i++) {
                            let jsonObj;
                            try {
                                jsonObj = JSON.parse(fileArray[i]);
                                if (that.relevantData(jsonObj)) {
                                    let courses: Course[] = [];
                                    courses = that.extractJSONIntoCourse(jsonObj);
                                    courses.forEach(function (course) {
                                        dataset.add(course);
                                    })
                                }
                            } catch (err) {
                            }
                        }

                        if (dataset.size == 0) {
                            response.setCode(400);
                            response.setBody({"error": "No valid course entry is found in the dataset."});
                            reject(response);
                            return;
                        } else {
                            if (dataStorage.hasCourseId(id)) {
                                response.setCode(201);
                                response.setBody("the operation was successful and the id already existed");
                            } else {
                                response.setCode(204);
                                response.setBody("The operation was successful and the id was new.");
                            }

                            dataStorage.storeCoursesInMap(id, dataset);

                            try {
                                dataStorage.storeCourseMapOnDisk();
                                fulfill(response);
                            } catch (err) {
                                response.setCode(400);
                                response.setBody({"error": "Cannot cache the dataset."});
                                reject(response);
                                return;
                            }
                        }
                    });
                }).catch(function () {
                    response.setCode(400);
                    response.setBody({"error": "Cannot read the zip file."});
                    reject(response);
                    return;
                });
            });
        } else {
            return new Promise(function (fulfill, reject) {
                let response: Response = new Response();
                response.setCode(400);
                response.setBody({"error": "Cannot read the zip file."});
                reject(response);
            });
        }
    }

    //checks if one jsonObj contains the relevantData
    private relevantData(jsonObj: any): boolean {
        if (jsonObj["result"].length > 0) {
            return true;
        }
        return false;
    }

    private extractJSONIntoRooms(shortName: string, fullName: string, address: string, buildingFile: any):
    Promise<Room[]> {
        return new Promise(function (fullfill, reject) {
            let rooms: Room[] = [];
            let roomTable = JSONHelper.getRoomTable(buildingFile);
            let lat = 0;
            let lon = 0;
            if (roomTable == null) {
                fullfill(rooms);
            } else {
                let allRooms = JSONHelper.getAllRooms(roomTable);
                JSONHelper.getLatLon(address).then(function (latlon: any) {
                    lat = latlon[0];
                    lon = latlon[1];
                    for (let i = 0; i < allRooms.length; i++) {
                        let newRoom = new Room();
                        let room = allRooms[i];
                        let roomNumber = JSONHelper.getRoomNumber(room);
                        let roomSeats = JSONHelper.getRoomSeats(room);
                        let roomFurniture = JSONHelper.getRoomFurniture(room);
                        let roomType = JSONHelper.getRoomType(room);
                        let roomLink = JSONHelper.getRoomLink(room);
                        newRoom.rooms_shortname = shortName;
                        newRoom.rooms_fullname = fullName;
                        newRoom.rooms_address = address;
                        newRoom.rooms_number = roomNumber;
                        newRoom.rooms_name = newRoom.rooms_shortname + "_" + newRoom.rooms_number;
                        newRoom.rooms_seats = roomSeats;
                        newRoom.rooms_furniture = roomFurniture;
                        newRoom.rooms_type = roomType;
                        newRoom.rooms_href = roomLink;
                        newRoom.rooms_lat = lat;
                        newRoom.rooms_lon = lon;
                        rooms.push(newRoom);
                    }
                    fullfill(rooms);
                }).catch(function (err) {
                    reject([]);
                });
            }
        })
    }

    //change a JSON(applyKeyString) of courses into an array of courses
    private extractJSONIntoCourse(courseJSON: any): Course[] {
        let value = courseJSON['result'];
        let courses: Course[] = [];
        for (let i = 0; i < value.length; i++) {
            let course = new Course();
            course.courses_dept = (value[i]['Subject']);
            course.courses_audit = Number.parseInt(value[i]['Audit']);
            course.courses_avg = (value[i]['Avg']);
            course.courses_fail = Number.parseInt(value[i]['Fail']);
            course.courses_id = (value[i]['Course']);
            course.courses_instructor = (value[i]['Professor']);
            course.courses_pass = Number.parseInt(value[i]['Pass']);
            course.courses_title = (value[i]['Title']);
            course.courses_uuid = value[i]['id'].toString();
            if (value[i]['Section'] === "overall") {
                course.courses_year = 1900;
            } else {
                course.courses_year = Number.parseInt((value[i]['Year']));
            }
            courses.push(course);
        }
        return courses;
    }

    removeDataset(id: string): Promise<InsightResponse> {
        let that = this;
        return new Promise(function (fulfill, reject) {
            let response: Response = new Response();
            try {
                if (id === "courses") {
                    dataStorage.deleteCourseId(id);
                } else if (id === "rooms") {
                    dataStorage.deleteRoomId(id);
                } else {
                    throw new Error ("the operation was " +
                    "unsuccessful because the delete was for a resource that was not previously added");
                }
                dataStorage.storeAllLocalFileBackToDisk();
                response.setCode(204);
                response.setBody("The operation was successful.");
                fulfill(response);
            } catch (err) {
                response.setCode(404);
                response.setBody(err);
                reject(response);
            }
        });
    }

    performQuery(query: any): Promise<InsightResponse> {
        let response = new Response();
        let that = this;
        return new Promise(function (fulfill, reject) {
            let parsedQuery = Query.parse(query);
            if (parsedQuery == null) {
                response.setCode(400);
                response.setBody({"error": "query syntax is invalid"});
                reject(response);
                return;
            }
            
            let type = parsedQuery.OPTIONS.COLUMNS.type;
            if (!that.hasRightDataForType(type)) {
                response.setCode(424);
                response.setBody({"error": "missing dataset"});
                reject(response);
                return;
            }
            let result = parsedQuery.evaluate(dataStorage);
            response.setCode(200);
            response.setBody(result);
            fulfill(response);
        });
    }

    private hasRightDataForType (type: String): Boolean {
        if (type === "courses") {
            return dataStorage.hasCourse();
        } else if (type === "rooms") {
            return dataStorage.hasRoom();
        }
    }
}
