/*
This class contains helper methods for searching a JSON object.
 */

import {error} from "util";

var http = require("http");

export default class JSONHelper {

    static getBuildingTable(document: any): any {
        return document
            ["childNodes"][6]
            ["childNodes"][3]
            ["childNodes"][31]
            ["childNodes"][10]
            ["childNodes"][1]
            ["childNodes"][3]
            ["childNodes"][1]
            ["childNodes"][5]
            ["childNodes"][1]
            ["childNodes"][3];
    }

    static getAllValidBuildingFilePaths(buildingTable: any): string[] {
        let allValidBuildingFilePaths: string[] = [];
        for (let c of buildingTable["childNodes"]) {
            if (c["nodeName"] == "tr") {
                let path: string = c["childNodes"][9]["childNodes"][1]["attrs"][0]["value"];
                allValidBuildingFilePaths.push(path.substr(2));
            }
        }
        return allValidBuildingFilePaths;
    }

    static getAllBuildingInfo(buildingTable: any): any[] {
        let allBuildingInfo: any[] = [];
        for (let c of buildingTable["childNodes"]) {
            if (c["nodeName"] == "tr"){
                allBuildingInfo.push(c);
            }
        }
        return allBuildingInfo;
    }

    static getOneBuildingShortName(buildingInfo : any) : string {
        let shortName = buildingInfo["childNodes"][3]["childNodes"][0]["value"];
        return shortName.trim();
    }

    static getOneBuildingFullName(buildingInfo : any) : string {
        let fullName = buildingInfo["childNodes"][5]["childNodes"][1]["childNodes"][0]["value"];
        return fullName.trim();
    }

    static getOneBuildingAddress(buildingInfo : any) : string {
        let address = buildingInfo["childNodes"][7]["childNodes"][0]["value"];
        return address.trim();
    }

    // Uses BFS to search through all <div>'s or <section>'s for <tbody>
    static getRoomTable(buildingFile: any) : any {
        try {
            let root = buildingFile["childNodes"][6]["childNodes"][3];
            let divsAndSections: any[] = [];

            for (let c of root["childNodes"]) {
                if (c["nodeName"] == "table") {
                    return c["childNodes"][3];
                } else if (c["nodeName"] == "div" || c["nodeName"] == "section") {
                    divsAndSections.push(c);
                }
            }

            // search through all <divs> iteratively
            while (divsAndSections.length != 0) {
                let ds = divsAndSections.shift();
                for (let c of ds["childNodes"]) {
                    if (c["nodeName"] == "table") {
                        return c["childNodes"][3];
                    } else if (c["nodeName"] == "div" || c["nodeName"] == "section") {
                        divsAndSections.push(c);
                    }
                }
            }

            return null;
        } catch (err) {
            return null;
        }

    }

    static getAllRooms(roomTable : any) : any[] {
        let allRooms: any[] = [];
        for (let c of roomTable["childNodes"]) {
            if (c["nodeName"] == "tr"){
                allRooms.push(c);
            }
        }
        return allRooms;
    }

    static getRoomNumber(room : any) : string {
        let roomNum = room["childNodes"][1]["childNodes"][1]["childNodes"][0]["value"];
        return roomNum;
    }

    static getRoomSeats(room : any) : number {
        let roomSeats = Number.parseInt(room["childNodes"][3]["childNodes"][0]["value"]);
        return roomSeats;
    }

    static getRoomFurniture(room :any) : string {
        let roomFurniture = room["childNodes"][5]["childNodes"][0]["value"];
        return roomFurniture.trim();
    }

    static getRoomType(room:any) : string {
        let roomType = room["childNodes"][7]["childNodes"][0]["value"];
        return roomType.trim();
    }

    static getRoomLink(room:any) : string {
        let roomLink = room["childNodes"][9]["childNodes"][1]["attrs"][0]["value"];
        return roomLink;
    }

    static getLatLon(address : string) : Promise<number[]> {
        //address needs to appear exactly the same as they appear in data files
        const url = "http://skaha.cs.ubc.ca:11316/api/v1/team138/";
        let encodedAddress = encodeURIComponent(address);
        let requestURL = url + encodedAddress;
        return new Promise(function (fulfill, reject) {
            http.get(requestURL, function (response: any) {
                let body = "";

                response.on('data', function(chunk : any) {
                    body += (chunk);
                });
                response.on('end', function() {
                    let latlon = JSON.parse(body);
                    if (Object.keys(latlon)[0] == "error") {
                        reject(null);
                        return;
                    } else {
                        let latlonPair : number[] = [];
                        latlonPair.push(latlon["lat"]);
                        latlonPair.push(latlon["lon"]);
                        fulfill(latlonPair);
                    }
                });
            });
        });
    }


}