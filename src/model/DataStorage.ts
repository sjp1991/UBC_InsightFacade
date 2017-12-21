import Course from "./Course";
import Room from "./Room";
import AllDataSet from "./AllDataSet";
import RoomSet from "./RoomSet";
import CourseSet from "./CourseSet";

var fs = require("fs");

export default class DataStorage {
    private coursesMap: Map<string, Set<Course>>;
    private roomsMap: Map<string, Set<Room>>;
    static roomFileName = "RoomMapStorageFile";
    static courseFileName = "CourseMapStorageFile";

    constructor() {
        this.coursesMap = new Map<string, Set<Course>>();
        this.roomsMap = new Map<string, Set<Room>>();
    }

    getAllRooms() : Room[] {
        let allRooms: Room[] = [];
        let roomSets = Array.from(this.roomsMap.values());
        for (let roomSet of roomSets) {
            allRooms = allRooms.concat(Array.from(roomSet));
        }
        return allRooms;
    }

    getAllCourses() : Course[] {
        let allCourses: Course[] = [];
        let courseSets = Array.from(this.coursesMap.values());
        for (let courseSet of courseSets) {
            allCourses = allCourses.concat(Array.from(courseSet));
        }
        return allCourses;
    }

    hasRoom(): boolean {
        if (this.roomsMap.size != 0) {
            return true;
        }
        return false;
    }

    hasCourse(): boolean {
        if (this.coursesMap.size != 0) {
            return true;
        }
        return false;
    }

    hasRoomId(id: string): boolean {
        if (this.roomsMap.has(id)) {
            return true;
        }
        return false;
    }

    hasCourseId(id: string): boolean {
        if (this.coursesMap.has(id)) {
            return true;
        }
        return false;
    }

    deleteRoomId(id:string) {
        if (this.hasRoomId(id)){
            this.roomsMap.delete(id);
        } else {
            throw "the operation was unsuccessful because the delete was for a resource that was not previously added";
        }
    }

    deleteCourseId(id:string) {
        if (this.hasCourseId(id)){
            this.coursesMap.delete(id);
        } else {
            throw "the operation was unsuccessful because the delete was for a resource that was not previously added";
        }
    }

    storeRoomsInMap(id: string, setOfRooms: Set<Room>) {
        this.roomsMap.set(id, setOfRooms);
    }

    storeCoursesInMap(id: string, setOfCourses: Set<Course>) {
        this.coursesMap.set(id, setOfCourses);
    }

    storeRoomMapOnDisk() {
        let roomSets: AllDataSet = new AllDataSet();
        this.roomsMap.forEach(function (value: Set<Room>, key: string) {
            let newRoomSet = new RoomSet(key, Array.from(value));
            roomSets.addDataSet(newRoomSet);
        })

        let stringifiedRoomData = JSON.stringify(roomSets.getArrayOfDataSets());

        fs.writeFile(DataStorage.roomFileName + ".txt", stringifiedRoomData, function (err: any) {
            if (err) {
                throw err;
            }
        });
    }

    storeCourseMapOnDisk() {
        let courseSets: AllDataSet = new AllDataSet();
        this.coursesMap.forEach(function (value: Set<Course>, key: string) {
            let newCourseSet = new CourseSet(key, Array.from(value));
            courseSets.addDataSet(newCourseSet);
        })

        let stringifiedCourseData = JSON.stringify(courseSets.getArrayOfDataSets());

        fs.writeFile(DataStorage.courseFileName + ".txt", stringifiedCourseData, function (err: any) {
            if (err) {
                throw err;
            }
        });
    }

    storeAllLocalFileBackToDisk(){
        this.storeRoomMapOnDisk();
        this.storeCourseMapOnDisk();
    }

    storeDiskRoomFileBackToRoomsMap() {
        let file = fs.readFileSync(DataStorage.roomFileName + ".txt");
        let jsonOjb = JSON.parse(file.toString());
        for (let items of jsonOjb) {
            this.roomsMap.set(items._id, new Set<Room>(items._rooms));
        }
    }

    storeDiskCourseFileBackToCoursesMap() {
        let file = fs.readFileSync(DataStorage.courseFileName + ".txt");
        let jsonOjb = JSON.parse(file.toString());
        for (let items of jsonOjb) {
            this.coursesMap.set(items._id, new Set<Course>(items._courses));
        }
    }

    storeAllDataFileBackToLocal() {
        this.storeDiskCourseFileBackToCoursesMap();
        this.storeDiskRoomFileBackToRoomsMap();
    }

}