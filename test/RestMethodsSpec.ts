import Server from "../src/rest/Server";
import {expect} from 'chai';
import Log from "../src/Util";
import {InsightResponse} from "../src/controller/IInsightFacade";
import chaiHttp = require("chai-http");
import chai = require('chai');
import Response = ChaiHttp.Response;
import restify = require('restify');

var fs = require("fs");
var server: Server;
var URL: string;

describe("RestMethodsSpec", function () {
    beforeEach(function () {
        // Init
        chai.use(chaiHttp);
        server = new Server(4565);
        URL = "http://127.0.0.1:4565";
        return server.start();
    });

    afterEach(function() {
        return server.stop();
    });

    it("It should be able to put the rooms dataset", function () {
        let file = "./rooms.zip";
    
        return chai.request(URL)
        .put('/dataset/rooms')
        .attach("body", fs.readFileSync(file), file)
        .then(function (res : Response) {
            Log.trace('then:' + JSON.stringify(res));
            expect(res.status).to.equal(204);
        })
    });

    it("It should be able to put the course dataset", function () {
        let file = "./sample.zip";
    
        return chai.request(URL)
        .put('/dataset/courses')
        .attach("body", fs.readFileSync(file), file)
        .then(function (res : Response) {
            Log.trace('then:' + JSON.stringify(res));
            expect(res.status).to.equal(201);
        })
    });

    it("It should not be able to put bad dataset", function () {
        let file = "./sampleWithTwoBadFiles.zip";

        return chai.request(URL)
        .put('/dataset/courses')
        .attach("body", fs.readFileSync(file), file)
        .then(function (res : Response) {
            expect.fail();
        }).catch(function (err) {
            expect(err.status).to.equal(400);
        })
    });

    it("It should be able to delete existing dataset", function () {
        let file = "./rooms.zip";
    
        return chai.request(URL)
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync(file), file)
            .then(function (res : Response) {
        return chai.request(URL)
            .del('/dataset/rooms')
        }).then(function (res: Response) {
            expect(res.status).to.equal(204);
        })
    });

    
    it("It should not be able to delete non-existing dataset", function () {
        let file = "./rooms.zip";
        
        return chai.request(URL)
            .del('/dataset/rooms')
            .then(function (res: Response) {
                expect.fail();
            }).catch(function (err) {
                expect(err.status).to.equal(404);
            })
    });

    it("valid query with course data", function () {
        let file = "./sample.zip";
        let json =  {"WHERE": {"GT" : {"courses_avg" : 80}}, "OPTIONS":{"COLUMNS":["courses_avg", "courses_dept"]}}
        
        return chai.request(URL)
        .put('/dataset/courses')
        .attach("body", fs.readFileSync(file), file)
        .then(function (res: Response) {
            return chai.request(URL)
            .post('/query')
            .send(json)
        }).then(function (res: Response) {
            expect(res.status).to.equal(200);
        }).catch(function (err) {
            expect.fail();
        })
    })

    it("invalid query with course data", function () {
        let file = "./sample.zip";
        let json =  {"HELLO": "WORLD"};

        return chai.request(URL)
        .put('/dataset/courses')
        .attach("body", fs.readFileSync(file), file)
        .then(function (res: Response) {
            return chai.request(URL)
            .post('/query')
            .send(json)
        }).then(function (res: Response) {
            expect.fail();
        }).catch(function (err) {
            expect(err.status).to.deep.equal(400);
        })
    })

})