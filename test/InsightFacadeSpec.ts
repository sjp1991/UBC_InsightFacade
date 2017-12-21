import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util"
import {expect} from 'chai';
import DataStorage from "../src/model/DataStorage";
import restify = require('restify');

var fs = require("fs");


describe("InsightFacadeSpec", function () {

    var fs = require('fs');
    var insightFacade: InsightFacade = null;
    var contentString: string = null;

    beforeEach(function() {
        insightFacade = new InsightFacade();
    });

    afterEach(function() {
        try {
            fs.unlinkSync(DataStorage.roomFileName + ".txt");
        }catch(err) {
            try {
                fs.unlinkSync(DataStorage.courseFileName + ".txt");
            } catch (err){
            }
        }
    });

    // ------------------------addDataset() ----------------------------------------------
    it("courses: should read a sample zip with course data", function () {
        contentString = fs.readFileSync('./sample.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then(function(response) {
            expect(response.code).to.equal(204);
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("couses: should not read a zip without any real data", function () {
        contentString = fs.readFileSync('./sampleWithTwoBadFiles.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then(function(response) {
            expect(response.code).to.equal(400);
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
            expect(err.body).to.deep.equal({"error" : "No valid course entry is found in the dataset."});
        })
    });

    it("courses: should not read a zip with one invalid JSON data", function () {
        contentString = fs.readFileSync('./sampleOneInvalidJSON.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString)
            .then(function(response) {
            expect.fail();
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
            expect(err.body).to.deep.equal({"error" : "No valid course entry is found in the dataset."});
        })
    });

    //   ------------------------removeDataset() ----------------------------------------------
    it("should fail to delete if id doesnt exist ", function () {
        return insightFacade.removeDataset("randomId")
            .then(function(response) {
                expect.fail();
            }).catch(function (err) {
                Log.test('Error: ' + err);
                expect(err.code).to.equal(404);
            })
    });

    it("should delete if id exists ", function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./courses.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then(function(response) {
            return insightFacade.removeDataset("courses")
                .then(function(response) {
                    expect(response.code).to.equal(204);
                    expect(response.body).to.deep.equal("The operation was successful.");
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect.fail();
                });
        }).catch(function(err){
            expect.fail();
        });
    });

       // ------------------------performQuery() ----------------------------------------------
    it("test case", function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./sample.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{
                    "GT":{
                        "courses_avg":95
                    }
                }})
                .then(function(response) {
                    expect(response.code).to.equal(400);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect(err.code).to.equal(400);
                    expect(err.body).to.deep.equal({"error" : "No valid course entry is found in the dataset."});
                })
        }).catch(function (err) {

        })
    });

    it("should return courses with 70 < avg < 80 ", function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./sample.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({"WHERE": {"AND" :
                [{"LT": {"courses_avg" : 80}}, {"GT" : {"courses_avg" : 70}}]}})
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect(err.code).to.equal(400);
                    expect(err.body).to.deep.equal({"error" : "No valid course entry is found in the dataset."});
                })
        }).catch(function (err) {

        })
    });

    it("should return courses with courses_avg > 70", function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./sample.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({"WHERE": {"OR" :
                [{"GT" : {"courses_avg" : 70}}]}})
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect(err.code).to.equal(400);
                    expect(err.body).to.deep.equal({"error" : "No valid course entry is found in the dataset."});
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
        })
    });

    it("should return courses with courses_fail < 20 and course avg > 70", function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./sample.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({"WHERE": {"AND" :
                [{"GT" : {"courses_avg" : 70}}, {"LT" : {"courses_fail" : 20}}]},
                "OPTIONS":{"COLUMNS":["courses_dept", "courses_avg", "courses_fail"]}})
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect(err.code).to.equal(400);
                    expect(err.body).to.deep.equal({"error" : "No valid course entry is found in the dataset."});
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
        })
    });

    it("should return courses with courses_avg > 80", function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./sample.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({"WHERE": {"GT" : {"courses_avg" : 80}},
                "OPTIONS":{"COLUMNS":["courses_avg", "courses_dept"]}})
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect(err.code).to.equal(400);
                    expect(err.body).to.deep.equal({"error" : "No valid course entry is found in the dataset."});
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
        })
    });

    it("should return courses with ~ courses_avg > 80", function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./sample.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({"WHERE": {"NOT": {"GT" : {"courses_avg" : 80}}},
                "OPTIONS":{"COLUMNS":["courses_avg", "courses_dept"]}})
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect(err.code).to.equal(400);
                    expect(err.body).to.deep.equal({"error" : "No valid course entry is found in the dataset."});
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
        })
    });

    it("should return courses with courses_avg > 90 or courses_avg < 80", function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./sample.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({"WHERE": {"OR": [
                {"LT" : {"courses_avg" : 80}},{"GT" : {"courses_avg" : 90}}]},
                "OPTIONS":{"COLUMNS":["courses_avg", "courses_dept", "courses_uuid"]}})
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect(err.code).to.equal(400);
                    expect(err.body).to.deep.equal({"error" : "No valid course entry is found in the dataset."});
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
        })
    });

    it("should return courses with ~the below query", function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./sample.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({"WHERE": {"NOT" :{ "OR": [
                {"LT" : {"courses_avg" : 80}},{"GT" : {"courses_avg" : 85}}]}},
                "OPTIONS":{"COLUMNS":["courses_avg", "courses_dept", "courses_uuid"]}})
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect(err.code).to.equal(400);
                    expect(err.body).to.deep.equal({"error" : "No valid course entry is found in the dataset."});
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
        })
    });

    it("should return courses with courses_avg > 80 with only courses_avg", function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./sample.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({"WHERE": {"GT" : {"courses_avg" : 80}},
                "OPTIONS":{"COLUMNS":["courses_avg", "courses_dept"]}})
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect(err.code).to.equal(400);
                    expect(err.body).to.deep.equal({"error" : "No valid course entry is found in the dataset."});
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
        })
    });

    it("should return courses with courses_avg > 80 with only courses_avg and ORDER:courses_avg", function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./sample.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({"WHERE": {"GT" : {"courses_avg" : 80}},
                "OPTIONS":{"COLUMNS":["courses_avg"], "ORDER":"courses_avg"}})
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect(err.code).to.equal(400);
                    expect(err.body).to.deep.equal({"error" : "No valid course entry is found in the dataset."});
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
        })
    });

    it("should return courses with courses with the same dept bioc",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./sample.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({"WHERE": {"IS":{
                "courses_dept":"bioc"}}, "OPTIONS":{"COLUMNS":["courses_avg", "courses_dept"]}})
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect(err.code).to.equal(400);
                    expect(err.body).to.deep.equal({"error" : "No valid course entry is found in the dataset."});
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
        })
    });

    it("should return simple query",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./sample.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{
                    "GT":{
                        "courses_avg":85
                    }
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_avg"
                    ],
                    "ORDER":"courses_avg"
                }
            })
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect(err.code).to.equal(400);
                    expect(err.body).to.deep.equal({"error" : "No valid course entry is found in the dataset."});
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
        })
    });

    it("should return simple query, by order courses_avg",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./sample.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{
                    "GT":{
                        "courses_avg":80
                    }
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_avg"
                    ],
                    "ORDER":"courses_avg"
                }
            })
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect(err.code).to.equal(400);
                    expect(err.body).to.deep.equal({"error" : "No valid course entry is found in the dataset."});
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
        })
    });

    it("should return simple query, by order courses_dept",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./sample.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{
                    "GT":{
                        "courses_avg":80
                    }
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_avg"
                    ],
                    "ORDER":"courses_dept"
                }
            })
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect(err.code).to.equal(400);
                    expect(err.body).to.deep.equal({"error" : "No valid course entry is found in the dataset."});
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
        })
    });

    //testing for invalid queries
    it("should reject with code 400, for invalid query IS",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./sample.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{
                    "IS":{
                    "courses_dept":"*"}
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_avg"
                    ],
                    "ORDER":"courses_dept"
                }
            })
                .then(function(response) {
                    expect.fail();
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect(err.code).to.equal(400);
                    expect(err.body).to.deep.equals({"error": "query syntax is invalid"});
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    });

    it("should be able to find all sections for a department",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./courses.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{
                    "IS":{
                        "courses_dept":"bioc"}
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_id"
                    ],
                    "ORDER":"courses_dept"
                }
            })
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err)
                    expect.fail();
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("should be able to find all sections taught by a specific person",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./courses.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{
                    "IS":{
                        "courses_instructor":"krems, roman"}
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_instructor"
                    ],
                    "ORDER":"courses_dept"
                }
            })
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect.fail();
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("should be able to return super complex query",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./courses.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE": {
                    "OR": [
                        {
                            "NOT": {
                                "AND":[
                                    {
                                        "LT":{
                                            "courses_avg":99
                                        }
                                    },
                                    {
                                        "GT":{
                                            "courses_pass":0
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "AND":[
                                {
                                    "NOT":{
                                        "NOT": {
                                            "IS":{
                                                "courses_dept":"cpsc"
                                            }
                                        }
                                    }
                                },
                                {
                                    "IS":{
                                        "courses_id": "34*"
                                    }
                                }
                            ]
                        },
                        {
                            "AND":[
                                {
                                    "IS":{
                                        "courses_dept":"math"
                                    }
                                },
                                {
                                    "IS":{
                                        "courses_id": "*1"
                                    }
                                },
                                {
                                    "GT":{
                                        "courses_avg": 70
                                    }
                                }
                            ]
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_id",
                        "courses_avg"
                    ],
                    "ORDER": "courses_avg"
                }
            })
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect.fail();
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
            expect.fail();
        })
    });

    it("should be able to find all course department with ps in between",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./sample.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{
                    "IS":{
                        "courses_dept":"*ps*"}
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_instructor"
                    ],
                    "ORDER":"courses_dept"
                }
            })
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect.fail();
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("should fail with code 400 if MComparator Key is not valid",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./sample.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result) {
            return insightFacade.performQuery({
                "WHERE":{
                    "GFS":{
                        "courses_fail":0}
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_instructor"
                    ],
                    "ORDER":"courses_dept"
                }
            })
                .then(function(response) {
                    expect.fail();
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect(err.code).to.equal(400);
                    expect(err.body).to.deep.equal({"error": "query syntax is invalid"});
                })
        }).catch(function (err) {
            expect.fail();
        })
    });

    it("should fail with code 400 if MComparator value is not valid",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./sample.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{
                    "GT":{
                        "courses_fa":0}
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_instructor"
                    ],
                    "ORDER":"courses_dept"
                }
            })
                .then(function(response) {
                    expect.fail();
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect(err.code).to.equal(400);
                    expect(err.body).to.deep.equal({"error": "query syntax is invalid"});
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
            expect(err.body).to.deep.equal({"error": "query syntax is invalid"});
        })
    });

    it("should fail with code 400 if ORDER is invalid",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./sample.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{
                    "GT":{
                        "courses_fa":0}
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_instructor"
                    ],
                    "ORDER":"courses_"
                }
            })
                .then(function(response) {
                    expect.fail();
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect(err.code).to.equal(400);
                    expect(err.body).to.deep.equal({"error": "query syntax is invalid"});
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
            expect(err.body).to.deep.equal({"error": "query syntax is invalid"});
        })
    });

    it("should fail with code 400 if order is not in columns",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./sample.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{
                    "GT":{
                        "courses_fail":0}
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_instructor"
                    ],
                    "ORDER":"courses_fail"
                }
            })
                .then(function(response) {
                    expect.fail();
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect(err.code).to.equal(400);
                    expect(err.body).to.deep.equal({"error": "query syntax is invalid"});
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
            expect(err.body).to.deep.equal({"error": "query syntax is invalid"});
        })
    });

    it("should fail with code 400 if WHERE does not exist",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./sample.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHRE":{
                    "GT":{
                        "courses_fail":0}
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_instructor"
                    ],
                    "ORDER":"courses_fail"
                }
            })
                .then(function(response) {
                    expect.fail();
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect(err.code).to.equal(400);
                    expect(err.body).to.deep.equal({"error": "query syntax is invalid"});
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
            expect(err.body).to.deep.equal({"error": "query syntax is invalid"});
        })
    });

    it("should fail with code 400 if COLUMNS has an invalid entry",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./sample.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{
                    "GT":{
                        "courses_fail":0}
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_itructor"
                    ],
                    "ORDER":"courses_fail"
                }
            })
                .then(function(response) {
                    expect.fail();
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect(err.code).to.equal(400);
                    expect(err.body).to.deep.equal({"error": "query syntax is invalid"});
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
            expect(err.body).to.deep.equal({"error": "query syntax is invalid"});
        })
    });

    it("should find all instructor name starts with poole",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./courses.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{
                    "IS":{
                        "courses_instructor": "poole*"}
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_instructor"
                    ],
                    "ORDER":"courses_instructor"
                }
            })
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect.fail();
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("should find all instructor name ends with *re, david",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./courses.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{
                    "IS":{
                        "courses_instructor": "*re, david"}
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_instructor"
                    ],
                    "ORDER":"courses_instructor"
                }
            })
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect.fail();
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("should find all instructor name with poole, david",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./courses.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{
                    "IS":{
                        "courses_instructor": "poole, david"}
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_instructor"
                    ],
                    "ORDER":"courses_instructor"
                }
            })
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect.fail();
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("should find all instructor name with ends *pam",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./courses.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{
                    "IS":{
                        "courses_instructor": "*pam"}
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_instructor"
                    ],
                    "ORDER":"courses_instructor"
                }
            })
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect.fail();
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("should find all instructor name with *kicz*",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./courses.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{
                    "IS":{
                        "courses_instructor": "*kicz*"}
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_instructor"
                    ],
                    "ORDER":"courses_instructor"
                }
            })
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect.fail();
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("should fail instructor name with *ki*cz*",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./courses.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{
                    "IS":{
                        "courses_instructor": "*ki*cz*"}
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_instructor"
                    ],
                    "ORDER":"courses_instructor"
                }
            })
                .then(function(response) {
                    expect.fail();
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
        })
    });

    it("should find all instructor name not starts with p",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./sample.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{"NOT":
                    {"IS":{
                        "courses_instructor": "p*"}
                }},
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_instructor"
                    ],
                    "ORDER":"courses_instructor"
                }
            })
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect.fail();
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("should fail if MCOMPARATOR value is not a number",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./sample.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":
                    {"GT":{
                        "courses_avg": "80"}
                    },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_instructor"
                    ],
                    "ORDER":"courses_instructor"
                }
            })
                .then(function(response) {
                    expect.fail();
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect(err.code).to.equal(400);
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
        })
    });

    it("should give something..",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./courses.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{
                    "NOT":{
                        "IS": {
                            "courses_dept": "*e"
                        }
                    }
                },
                "OPTIONS":{
                    "COLUMNS":[
                    "courses_dept",
                        "courses_avg"
        ],
            "ORDER":"courses_avg"
        }
            })
                .then(function(response) {

                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect.fail();
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("should give something.. without order",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./courses.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{
                    "IS": {
                        "courses_dept": "*e"
                    }
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_avg"
                    ]
                }
            })
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect.fail();
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });


    //==========================================================================//
    //=============================D2 TESTS=====================================//
    //==========================================================================//

    it("should be able to test courses_year without Order",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./courses.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{
                    "EQ":{
                        "courses_year": 1900
                    }
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_year"
                    ]
                }
            })
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect.fail();
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("should be able to test courses_year with order",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./courses.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{
                    "EQ":{
                        "courses_year": 2010
                    }
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_year"
                    ],
                    "ORDER":"courses_dept"
                }
            })
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect.fail();
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("should read a rooms.zip and test", function () {
        this.timeout(10000);
        contentString = fs.readFileSync('./rooms.zip').toString('base64');
        return insightFacade.addDataset("rooms", contentString).then(function(response) {
            expect(response.code).to.equal(204);
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("should read a rooms.zip twice", function () {
        this.timeout(10000);
        contentString = fs.readFileSync('./rooms.zip').toString('base64');
        return insightFacade.addDataset("rooms", contentString).then(function(result) {
            return insightFacade.addDataset("rooms", contentString).then(function(response) {
                expect(response.code).to.equal(201);
            }).catch(function (err) {
                Log.test('Error: ' + err);
                expect.fail();
            })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("should delete if id exists ", function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./rooms.zip').toString('base64');
        return insightFacade.addDataset("rooms", contentString).then(function(response) {
            return insightFacade.removeDataset("rooms")
                .then(function(response) {
                    expect(response.code).to.equal(204);
                    expect(response.body).to.deep.equal("The operation was successful.");
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect.fail();
                });
        }).catch(function(err){
            expect.fail();
        });
    });

    it("perform query without adding dataset",  function () {
        this.timeout(20000);
        return insightFacade.performQuery({
            "WHERE":{
                "IS":{
                    "rooms_shortname":"DMP"}
            },
            "OPTIONS":{
                "COLUMNS":[
                    "rooms_shortname",
                    "rooms_name"
                ],
                "ORDER":"rooms_name"
            }
        }).then(function(response) {
            expect.fail();
        }).catch(function (err) {
            expect(err.code).to.equal(424);
            expect(err.body).to.deep.equal({"error": "missing dataset"});
        })
    });

    it("perform room query after adding courses data",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./sample.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{
                    "IS":{
                        "rooms_shortname":"DMP"}
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "rooms_shortname",
                        "rooms_name"
                    ],
                    "ORDER":"rooms_name"
                }
            }).then(function(response) {
                expect.fail();
            }).catch(function (err) {
                expect(err.code).to.equal(424);
                expect(err.body).to.deep.equal({"error": "missing dataset"});
            })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("perform course query after adding rooms data",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./rooms.zip').toString('base64');
        return insightFacade.addDataset("rooms", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{
                    "EQ":{
                        "courses_year": 2010
                    }
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_year"
                    ],
                    "ORDER":"courses_dept"
                }
            }).then(function(response) {
                expect.fail();
            }).catch(function (err) {
                expect(err.code).to.equal(424);
                expect(err.body).to.deep.equal({"error": "missing dataset"});
            })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("should be able to find all rooms with shortname = DMP",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./rooms.zip').toString('base64');
        return insightFacade.addDataset("rooms", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{
                    "IS":{
                        "rooms_shortname":"DMP"}
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "rooms_shortname",
                        "rooms_name"
                    ],
                    "ORDER":"rooms_name"
                }
            }).then(function(response) {
                expect(response.code).to.equal(200);
            }).catch(function (err) {
                Log.test('Error: ' + err);
                expect.fail();
            })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("should be able to find all rooms with seats more than 0",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./rooms.zip').toString('base64');
        return insightFacade.addDataset("rooms", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{
                    "GT":{
                        "rooms_seats":0
                    }
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "rooms_name",
                        "rooms_seats",
                        "rooms_type",
                        "rooms_furniture",
                        "rooms_href",
                        // "rooms_lat",
                        // "rooms_lon",
                        // "rooms_seats",
                        // "rooms_type",
                        // "rooms_furniture",
                        // "rooms_href"
                    ],
                    "ORDER":"rooms_name"
                }
            })
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect.fail();
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("should be able to find all rooms with seats equal to 100",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./rooms.zip').toString('base64');
        return insightFacade.addDataset("rooms", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{
                    "EQ":{
                        "rooms_seats":100
                    }
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "rooms_name",
                        "rooms_seats",
                    ],
                    "ORDER":"rooms_name"
                }
            })
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect.fail();
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("should be able to find all rooms with latitude less than 50",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./rooms.zip').toString('base64');
        return insightFacade.addDataset("rooms", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{
                    "LT":{
                        "rooms_lat":50
                    }
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "rooms_name",
                        "rooms_lat",
                        "rooms_lon",
                    ],
                    "ORDER":"rooms_name"
                }
            })
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect.fail();
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("should be able to find all rooms with sample query from website",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./rooms.zip').toString('base64');
        return insightFacade.addDataset("rooms", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE": {
                    "IS": {
                        "rooms_address": "*Agrono*"
                    }
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_address", "rooms_name"
                    ]
                }
            })
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect.fail();
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("should be able to find all rooms in angu as small group",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./rooms.zip').toString('base64');
        return insightFacade.addDataset("rooms", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE": {
                    "AND": [
                        {
                            "IS": {
                                "rooms_type": "Small Group"
                            }
                        },
                        {
                            "IS": {
                                "rooms_shortname": "ANGU"
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_address", "rooms_name", "rooms_lat", "rooms_lon"
                    ]
                }
            })
                .then(function(response) {
                    expect(response.code).to.equal(200);
                    console.log(response.body);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect.fail();
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("a simple rooms query involving OR",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./rooms.zip').toString('base64');
        return insightFacade.addDataset("rooms", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE": {
                    "OR": [
                        {
                            "IS": {
                                "rooms_shortname": "DMP"
                            }
                        },
                        {
                            "IS": {
                                "rooms_shortname": "LSK"
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_address", "rooms_name"
                    ]
                }
            })
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect.fail();
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("should be able to find the year a courses is offered in",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./courses.zip').toString('base64');
        return insightFacade.addDataset("courses", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE":{
                    "EQ":{
                        "courses_year":2010
                    }
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_year"
                    ],
                    "ORDER":"courses_dept"
                }
            })
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect.fail();
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("should fail if no dataset was added",  function () {
        this.timeout(20000);
        return insightFacade.performQuery({
            "WHERE": {
                "EQ": {
                    "courses_year": 2010
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_year"
                ],
                "ORDER": "courses_dept"
            }
        })
            .then(function (response) {
                expect.fail();
            }).catch(function (err) {
                expect(err.code).to.equal(424);
                expect(err.body).to.deep.equal({"error": "missing dataset"});
            })
    })

    it("should be able to sort by url",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./rooms.zip').toString('base64');
        return insightFacade.addDataset("rooms", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE": {
                    "IS": {
                        "rooms_address": "*Agrono*"
                    }
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_address", "rooms_href"
                    ],
                    "ORDER": "rooms_href"
                }
            })
                .then(function(response) {
                    expect(response.code).to.equal(200);
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect.fail();
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("should fail if using two differnet keys",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./rooms.zip').toString('base64');
        return insightFacade.addDataset("rooms", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE": {
                    "AND": [{ "IS" : {
                        "rooms_address": "*Agrono*"
                    }
                    }, { "GT": {
                        "courses_year": 2000
                    }
            }]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_address", "rooms_href"
                    ],
                    "ORDER": "rooms_href"
                }
            })
                .then(function(response) {
                    expect.fail();
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect(err.code).to.equal(400);
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    });

    it("should fail if using two differnet keys in columns",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./rooms.zip').toString('base64');
        return insightFacade.addDataset("rooms", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE": {
                    "AND": [{ "IS" : {
                        "rooms_address": "*Agrono*"
                    }
                    }, { "GT": {
                        "courses_year": 2000
                    }
                    }]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_address", "courses_year"
                    ],
                    "ORDER": "rooms_href"
                }
            })
                .then(function(response) {
                    expect.fail();
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect(err.code).to.equal(400);
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    });


    it("should pass if we use ",  function () {
        this.timeout(20000);
        contentString = fs.readFileSync('./rooms.zip').toString('base64');
        return insightFacade.addDataset("rooms", contentString).then (function (result){
            return insightFacade.performQuery({
                "WHERE": {
                    "AND": [{ "IS" : {
                        "rooms_address": "*Agrono*"
                    }
                    }, { "GT": {
                        "courses_year": 2000
                    }
                    }]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_address", "courses_year"
                    ],
                    "ORDER": "rooms_href"
                }
            })
                .then(function(response) {
                    expect.fail();
                }).catch(function (err) {
                    Log.test('Error: ' + err);
                    expect(err.code).to.equal(400);
                })
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    });

    it("should find all rooms outside of a bounding box", function() {
        this.timeout(20000);
        contentString = fs.readFileSync('./rooms.zip').toString('base64');
        return insightFacade.addDataset("rooms", contentString).then (function (result) {
            return insightFacade.performQuery({
                "WHERE": {
                    "NOT": {
                        "AND": [{ "GT" : {
                            "rooms_lat": 49.26372
                        }
                        }, { "LT": {
                            "rooms_lat": 49.2699
                        }
                        }, { "GT" : {
                            "rooms_lon": -123.25318
                        }
                        }, { "LT" : {
                            "rooms_lon": -123.25099
                        }}]
                    }
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_lat", "rooms_lon", "rooms_name"
                    ],
                    "ORDER": "rooms_name"
                }
            })
            .then(function(response: any) {
                expect(response.code).to.equal(200);
                let expected = {"result":[{"rooms_lat":49.26372,"rooms_lon":-123.25099,"rooms_name":"AERL_120"},{"rooms_lat":49.2699,"rooms_lon":-123.25318,"rooms_name":"ALRD_105"},{"rooms_lat":49.2699,"rooms_lon":-123.25318,"rooms_name":"ALRD_112"},{"rooms_lat":49.2699,"rooms_lon":-123.25318,"rooms_name":"ALRD_113"},{"rooms_lat":49.2699,"rooms_lon":-123.25318,"rooms_name":"ALRD_121"},{"rooms_lat":49.2699,"rooms_lon":-123.25318,"rooms_name":"ALRD_B101"},{"rooms_lat":49.26486,"rooms_lon":-123.25364,"rooms_name":"ANGU_037"},{"rooms_lat":49.26486,"rooms_lon":-123.25364,"rooms_name":"ANGU_039"},{"rooms_lat":49.26486,"rooms_lon":-123.25364,"rooms_name":"ANGU_098"},{"rooms_lat":49.26486,"rooms_lon":-123.25364,"rooms_name":"ANGU_232"},{"rooms_lat":49.26486,"rooms_lon":-123.25364,"rooms_name":"ANGU_234"},{"rooms_lat":49.26486,"rooms_lon":-123.25364,"rooms_name":"ANGU_235"},{"rooms_lat":49.26486,"rooms_lon":-123.25364,"rooms_name":"ANGU_237"},{"rooms_lat":49.26486,"rooms_lon":-123.25364,"rooms_name":"ANGU_241"},{"rooms_lat":49.26486,"rooms_lon":-123.25364,"rooms_name":"ANGU_243"},{"rooms_lat":49.26486,"rooms_lon":-123.25364,"rooms_name":"ANGU_254"},{"rooms_lat":49.26486,"rooms_lon":-123.25364,"rooms_name":"ANGU_291"},{"rooms_lat":49.26486,"rooms_lon":-123.25364,"rooms_name":"ANGU_292"},{"rooms_lat":49.26486,"rooms_lon":-123.25364,"rooms_name":"ANGU_293"},{"rooms_lat":49.26486,"rooms_lon":-123.25364,"rooms_name":"ANGU_295"},{"rooms_lat":49.26486,"rooms_lon":-123.25364,"rooms_name":"ANGU_296"},{"rooms_lat":49.26486,"rooms_lon":-123.25364,"rooms_name":"ANGU_332"},{"rooms_lat":49.26486,"rooms_lon":-123.25364,"rooms_name":"ANGU_334"},{"rooms_lat":49.26486,"rooms_lon":-123.25364,"rooms_name":"ANGU_335"},{"rooms_lat":49.26486,"rooms_lon":-123.25364,"rooms_name":"ANGU_339"},{"rooms_lat":49.26486,"rooms_lon":-123.25364,"rooms_name":"ANGU_343"},{"rooms_lat":49.26486,"rooms_lon":-123.25364,"rooms_name":"ANGU_345"},{"rooms_lat":49.26486,"rooms_lon":-123.25364,"rooms_name":"ANGU_347"},{"rooms_lat":49.26486,"rooms_lon":-123.25364,"rooms_name":"ANGU_350"},{"rooms_lat":49.26486,"rooms_lon":-123.25364,"rooms_name":"ANGU_354"},{"rooms_lat":49.26486,"rooms_lon":-123.25364,"rooms_name":"ANGU_432"},{"rooms_lat":49.26486,"rooms_lon":-123.25364,"rooms_name":"ANGU_434"},{"rooms_lat":49.26486,"rooms_lon":-123.25364,"rooms_name":"ANGU_435"},{"rooms_lat":49.26486,"rooms_lon":-123.25364,"rooms_name":"ANGU_437"},{"rooms_lat":49.26958,"rooms_lon":-123.25741,"rooms_name":"ANSO_202"},{"rooms_lat":49.26958,"rooms_lon":-123.25741,"rooms_name":"ANSO_203"},{"rooms_lat":49.26958,"rooms_lon":-123.25741,"rooms_name":"ANSO_205"},{"rooms_lat":49.26958,"rooms_lon":-123.25741,"rooms_name":"ANSO_207"},{"rooms_lat":49.2666,"rooms_lon":-123.25655,"rooms_name":"AUDX_142"},{"rooms_lat":49.2666,"rooms_lon":-123.25655,"rooms_name":"AUDX_157"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_A101"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_A102"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_A103"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_A104"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_A201"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_A202"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_A203"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_B141"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_B142"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_B208"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_B209"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_B210"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_B211"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_B213"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_B215"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_B216"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_B218"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_B219"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_B302"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_B303"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_B304"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_B306"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_B307"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_B308"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_B309"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_B310"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_B312"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_B313"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_B315"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_B316"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_B318"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_B319"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_D201"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_D204"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_D205"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_D207"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_D209"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_D213"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_D214"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_D216"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_D217"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_D218"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_D219"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_D221"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_D222"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_D228"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_D229"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_D301"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_D304"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_D306"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_D307"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_D312"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_D313"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_D314"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_D315"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_D316"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_D317"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_D319"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_D322"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_D323"},{"rooms_lat":49.26826,"rooms_lon":-123.25468,"rooms_name":"BUCH_D325"},{"rooms_lat":49.26273,"rooms_lon":-123.24894,"rooms_name":"CEME_1202"},{"rooms_lat":49.26273,"rooms_lon":-123.24894,"rooms_name":"CEME_1204"},{"rooms_lat":49.26273,"rooms_lon":-123.24894,"rooms_name":"CEME_1206"},{"rooms_lat":49.26273,"rooms_lon":-123.24894,"rooms_name":"CEME_1210"},{"rooms_lat":49.26273,"rooms_lon":-123.24894,"rooms_name":"CEME_1212"},{"rooms_lat":49.26273,"rooms_lon":-123.24894,"rooms_name":"CEME_1215"},{"rooms_lat":49.26228,"rooms_lon":-123.24718,"rooms_name":"CHBE_101"},{"rooms_lat":49.26228,"rooms_lon":-123.24718,"rooms_name":"CHBE_102"},{"rooms_lat":49.26228,"rooms_lon":-123.24718,"rooms_name":"CHBE_103"},{"rooms_lat":49.26207,"rooms_lon":-123.25314,"rooms_name":"CIRS_1250"},{"rooms_lat":49.26125,"rooms_lon":-123.24807,"rooms_name":"DMP_101"},{"rooms_lat":49.26125,"rooms_lon":-123.24807,"rooms_name":"DMP_110"},{"rooms_lat":49.26125,"rooms_lon":-123.24807,"rooms_name":"DMP_201"},{"rooms_lat":49.26125,"rooms_lon":-123.24807,"rooms_name":"DMP_301"},{"rooms_lat":49.26125,"rooms_lon":-123.24807,"rooms_name":"DMP_310"},{"rooms_lat":49.26228,"rooms_lon":-123.25198,"rooms_name":"EOSM_135"},{"rooms_lat":49.26274,"rooms_lon":-123.25224,"rooms_name":"ESB_1012"},{"rooms_lat":49.26274,"rooms_lon":-123.25224,"rooms_name":"ESB_1013"},{"rooms_lat":49.26274,"rooms_lon":-123.25224,"rooms_name":"ESB_2012"},{"rooms_lat":49.26414,"rooms_lon":-123.24959,"rooms_name":"FNH_20"},{"rooms_lat":49.26414,"rooms_lon":-123.24959,"rooms_name":"FNH_30"},{"rooms_lat":49.26414,"rooms_lon":-123.24959,"rooms_name":"FNH_320"},{"rooms_lat":49.26414,"rooms_lon":-123.24959,"rooms_name":"FNH_40"},{"rooms_lat":49.26414,"rooms_lon":-123.24959,"rooms_name":"FNH_50"},{"rooms_lat":49.26414,"rooms_lon":-123.24959,"rooms_name":"FNH_60"},{"rooms_lat":49.26176,"rooms_lon":-123.25179,"rooms_name":"FORW_303"},{"rooms_lat":49.26176,"rooms_lon":-123.25179,"rooms_name":"FORW_317"},{"rooms_lat":49.26176,"rooms_lon":-123.25179,"rooms_name":"FORW_519"},{"rooms_lat":49.26541,"rooms_lon":-123.24608,"rooms_name":"FRDM_153"},{"rooms_lat":49.26044,"rooms_lon":-123.24886,"rooms_name":"FSC_1001"},{"rooms_lat":49.26044,"rooms_lon":-123.24886,"rooms_name":"FSC_1002"},{"rooms_lat":49.26044,"rooms_lon":-123.24886,"rooms_name":"FSC_1003"},{"rooms_lat":49.26044,"rooms_lon":-123.24886,"rooms_name":"FSC_1005"},{"rooms_lat":49.26044,"rooms_lon":-123.24886,"rooms_name":"FSC_1221"},{"rooms_lat":49.26044,"rooms_lon":-123.24886,"rooms_name":"FSC_1402"},{"rooms_lat":49.26044,"rooms_lon":-123.24886,"rooms_name":"FSC_1611"},{"rooms_lat":49.26044,"rooms_lon":-123.24886,"rooms_name":"FSC_1613"},{"rooms_lat":49.26044,"rooms_lon":-123.24886,"rooms_name":"FSC_1615"},{"rooms_lat":49.26044,"rooms_lon":-123.24886,"rooms_name":"FSC_1617"},{"rooms_lat":49.26605,"rooms_lon":-123.25623,"rooms_name":"GEOG_100"},{"rooms_lat":49.26605,"rooms_lon":-123.25623,"rooms_name":"GEOG_101"},{"rooms_lat":49.26605,"rooms_lon":-123.25623,"rooms_name":"GEOG_147"},{"rooms_lat":49.26605,"rooms_lon":-123.25623,"rooms_name":"GEOG_200"},{"rooms_lat":49.26605,"rooms_lon":-123.25623,"rooms_name":"GEOG_201"},{"rooms_lat":49.26605,"rooms_lon":-123.25623,"rooms_name":"GEOG_212"},{"rooms_lat":49.26605,"rooms_lon":-123.25623,"rooms_name":"GEOG_214"},{"rooms_lat":49.26605,"rooms_lon":-123.25623,"rooms_name":"GEOG_242"},{"rooms_lat":49.26627,"rooms_lon":-123.25374,"rooms_name":"HENN_200"},{"rooms_lat":49.26627,"rooms_lon":-123.25374,"rooms_name":"HENN_201"},{"rooms_lat":49.26627,"rooms_lon":-123.25374,"rooms_name":"HENN_202"},{"rooms_lat":49.26627,"rooms_lon":-123.25374,"rooms_name":"HENN_301"},{"rooms_lat":49.26627,"rooms_lon":-123.25374,"rooms_name":"HENN_302"},{"rooms_lat":49.26627,"rooms_lon":-123.25374,"rooms_name":"HENN_304"},{"rooms_lat":49.27106,"rooms_lon":-123.25042,"rooms_name":"IONA_301"},{"rooms_lat":49.27106,"rooms_lon":-123.25042,"rooms_name":"IONA_633"},{"rooms_lat":49.26767,"rooms_lon":-123.25583,"rooms_name":"LASR_102"},{"rooms_lat":49.26767,"rooms_lon":-123.25583,"rooms_name":"LASR_104"},{"rooms_lat":49.26767,"rooms_lon":-123.25583,"rooms_name":"LASR_105"},{"rooms_lat":49.26767,"rooms_lon":-123.25583,"rooms_name":"LASR_107"},{"rooms_lat":49.26767,"rooms_lon":-123.25583,"rooms_name":"LASR_211"},{"rooms_lat":49.26767,"rooms_lon":-123.25583,"rooms_name":"LASR_5C"},{"rooms_lat":49.26236,"rooms_lon":-123.24494,"rooms_name":"LSC_1001"},{"rooms_lat":49.26236,"rooms_lon":-123.24494,"rooms_name":"LSC_1002"},{"rooms_lat":49.26236,"rooms_lon":-123.24494,"rooms_name":"LSC_1003"},{"rooms_lat":49.26545,"rooms_lon":-123.25533,"rooms_name":"LSK_200"},{"rooms_lat":49.26545,"rooms_lon":-123.25533,"rooms_name":"LSK_201"},{"rooms_lat":49.26545,"rooms_lon":-123.25533,"rooms_name":"LSK_460"},{"rooms_lat":49.26545,"rooms_lon":-123.25533,"rooms_name":"LSK_462"},{"rooms_lat":49.266463,"rooms_lon":-123.255534,"rooms_name":"MATH_100"},{"rooms_lat":49.266463,"rooms_lon":-123.255534,"rooms_name":"MATH_102"},{"rooms_lat":49.266463,"rooms_lon":-123.255534,"rooms_name":"MATH_104"},{"rooms_lat":49.266463,"rooms_lon":-123.255534,"rooms_name":"MATH_105"},{"rooms_lat":49.266463,"rooms_lon":-123.255534,"rooms_name":"MATH_202"},{"rooms_lat":49.266463,"rooms_lon":-123.255534,"rooms_name":"MATH_203"},{"rooms_lat":49.266463,"rooms_lon":-123.255534,"rooms_name":"MATH_204"},{"rooms_lat":49.266463,"rooms_lon":-123.255534,"rooms_name":"MATH_225"},{"rooms_lat":49.266089,"rooms_lon":-123.254816,"rooms_name":"MATX_1100"},{"rooms_lat":49.26176,"rooms_lon":-123.24935,"rooms_name":"MCLD_202"},{"rooms_lat":49.26176,"rooms_lon":-123.24935,"rooms_name":"MCLD_214"},{"rooms_lat":49.26176,"rooms_lon":-123.24935,"rooms_name":"MCLD_220"},{"rooms_lat":49.26176,"rooms_lon":-123.24935,"rooms_name":"MCLD_228"},{"rooms_lat":49.26176,"rooms_lon":-123.24935,"rooms_name":"MCLD_242"},{"rooms_lat":49.26176,"rooms_lon":-123.24935,"rooms_name":"MCLD_254"},{"rooms_lat":49.26114,"rooms_lon":-123.25027,"rooms_name":"MCML_154"},{"rooms_lat":49.26114,"rooms_lon":-123.25027,"rooms_name":"MCML_158"},{"rooms_lat":49.26114,"rooms_lon":-123.25027,"rooms_name":"MCML_160"},{"rooms_lat":49.26114,"rooms_lon":-123.25027,"rooms_name":"MCML_166"},{"rooms_lat":49.26114,"rooms_lon":-123.25027,"rooms_name":"MCML_256"},{"rooms_lat":49.26114,"rooms_lon":-123.25027,"rooms_name":"MCML_260"},{"rooms_lat":49.26114,"rooms_lon":-123.25027,"rooms_name":"MCML_358"},{"rooms_lat":49.26114,"rooms_lon":-123.25027,"rooms_name":"MCML_360A"},{"rooms_lat":49.26114,"rooms_lon":-123.25027,"rooms_name":"MCML_360B"},{"rooms_lat":49.26114,"rooms_lon":-123.25027,"rooms_name":"MCML_360C"},{"rooms_lat":49.26114,"rooms_lon":-123.25027,"rooms_name":"MCML_360D"},{"rooms_lat":49.26114,"rooms_lon":-123.25027,"rooms_name":"MCML_360E"},{"rooms_lat":49.26114,"rooms_lon":-123.25027,"rooms_name":"MCML_360F"},{"rooms_lat":49.26114,"rooms_lon":-123.25027,"rooms_name":"MCML_360G"},{"rooms_lat":49.26114,"rooms_lon":-123.25027,"rooms_name":"MCML_360H"},{"rooms_lat":49.26114,"rooms_lon":-123.25027,"rooms_name":"MCML_360J"},{"rooms_lat":49.26114,"rooms_lon":-123.25027,"rooms_name":"MCML_360K"},{"rooms_lat":49.26114,"rooms_lon":-123.25027,"rooms_name":"MCML_360L"},{"rooms_lat":49.26114,"rooms_lon":-123.25027,"rooms_name":"MCML_360M"},{"rooms_lat":49.2663,"rooms_lon":-123.2466,"rooms_name":"MGYM_206"},{"rooms_lat":49.2663,"rooms_lon":-123.2466,"rooms_name":"MGYM_208"},{"rooms_lat":49.26048,"rooms_lon":-123.24944,"rooms_name":"ORCH_1001"},{"rooms_lat":49.26048,"rooms_lon":-123.24944,"rooms_name":"ORCH_3002"},{"rooms_lat":49.26048,"rooms_lon":-123.24944,"rooms_name":"ORCH_3004"},{"rooms_lat":49.26048,"rooms_lon":-123.24944,"rooms_name":"ORCH_3016"},{"rooms_lat":49.26048,"rooms_lon":-123.24944,"rooms_name":"ORCH_3018"},{"rooms_lat":49.26048,"rooms_lon":-123.24944,"rooms_name":"ORCH_3052"},{"rooms_lat":49.26048,"rooms_lon":-123.24944,"rooms_name":"ORCH_3058"},{"rooms_lat":49.26048,"rooms_lon":-123.24944,"rooms_name":"ORCH_3062"},{"rooms_lat":49.26048,"rooms_lon":-123.24944,"rooms_name":"ORCH_3068"},{"rooms_lat":49.26048,"rooms_lon":-123.24944,"rooms_name":"ORCH_3072"},{"rooms_lat":49.26048,"rooms_lon":-123.24944,"rooms_name":"ORCH_3074"},{"rooms_lat":49.26048,"rooms_lon":-123.24944,"rooms_name":"ORCH_4002"},{"rooms_lat":49.26048,"rooms_lon":-123.24944,"rooms_name":"ORCH_4004"},{"rooms_lat":49.26048,"rooms_lon":-123.24944,"rooms_name":"ORCH_4016"},{"rooms_lat":49.26048,"rooms_lon":-123.24944,"rooms_name":"ORCH_4018"},{"rooms_lat":49.26048,"rooms_lon":-123.24944,"rooms_name":"ORCH_4052"},{"rooms_lat":49.26048,"rooms_lon":-123.24944,"rooms_name":"ORCH_4058"},{"rooms_lat":49.26048,"rooms_lon":-123.24944,"rooms_name":"ORCH_4062"},{"rooms_lat":49.26048,"rooms_lon":-123.24944,"rooms_name":"ORCH_4068"},{"rooms_lat":49.26048,"rooms_lon":-123.24944,"rooms_name":"ORCH_4072"},{"rooms_lat":49.26048,"rooms_lon":-123.24944,"rooms_name":"ORCH_4074"},{"rooms_lat":49.26047,"rooms_lon":-123.24467,"rooms_name":"OSBO_203A"},{"rooms_lat":49.26047,"rooms_lon":-123.24467,"rooms_name":"OSBO_203B"},{"rooms_lat":49.26047,"rooms_lon":-123.24467,"rooms_name":"OSBO_A"},{"rooms_lat":49.264,"rooms_lon":-123.2559,"rooms_name":"PCOH_1001"},{"rooms_lat":49.264,"rooms_lon":-123.2559,"rooms_name":"PCOH_1002"},{"rooms_lat":49.264,"rooms_lon":-123.2559,"rooms_name":"PCOH_1003"},{"rooms_lat":49.264,"rooms_lon":-123.2559,"rooms_name":"PCOH_1008"},{"rooms_lat":49.264,"rooms_lon":-123.2559,"rooms_name":"PCOH_1009"},{"rooms_lat":49.264,"rooms_lon":-123.2559,"rooms_name":"PCOH_1011"},{"rooms_lat":49.264,"rooms_lon":-123.2559,"rooms_name":"PCOH_1215"},{"rooms_lat":49.264,"rooms_lon":-123.2559,"rooms_name":"PCOH_1302"},{"rooms_lat":49.26229,"rooms_lon":-123.24342,"rooms_name":"PHRM_1101"},{"rooms_lat":49.26229,"rooms_lon":-123.24342,"rooms_name":"PHRM_1201"},{"rooms_lat":49.26229,"rooms_lon":-123.24342,"rooms_name":"PHRM_3112"},{"rooms_lat":49.26229,"rooms_lon":-123.24342,"rooms_name":"PHRM_3114"},{"rooms_lat":49.26229,"rooms_lon":-123.24342,"rooms_name":"PHRM_3115"},{"rooms_lat":49.26229,"rooms_lon":-123.24342,"rooms_name":"PHRM_3116"},{"rooms_lat":49.26229,"rooms_lon":-123.24342,"rooms_name":"PHRM_3118"},{"rooms_lat":49.26229,"rooms_lon":-123.24342,"rooms_name":"PHRM_3120"},{"rooms_lat":49.26229,"rooms_lon":-123.24342,"rooms_name":"PHRM_3122"},{"rooms_lat":49.26229,"rooms_lon":-123.24342,"rooms_name":"PHRM_3124"},{"rooms_lat":49.26229,"rooms_lon":-123.24342,"rooms_name":"PHRM_3208"},{"rooms_lat":49.2643,"rooms_lon":-123.25505,"rooms_name":"SOWK_122"},{"rooms_lat":49.2643,"rooms_lon":-123.25505,"rooms_name":"SOWK_124"},{"rooms_lat":49.2643,"rooms_lon":-123.25505,"rooms_name":"SOWK_222"},{"rooms_lat":49.2643,"rooms_lon":-123.25505,"rooms_name":"SOWK_223"},{"rooms_lat":49.2643,"rooms_lon":-123.25505,"rooms_name":"SOWK_224"},{"rooms_lat":49.2643,"rooms_lon":-123.25505,"rooms_name":"SOWK_324"},{"rooms_lat":49.2643,"rooms_lon":-123.25505,"rooms_name":"SOWK_326"},{"rooms_lat":49.2642,"rooms_lon":-123.24842,"rooms_name":"SPPH_143"},{"rooms_lat":49.2642,"rooms_lon":-123.24842,"rooms_name":"SPPH_B108"},{"rooms_lat":49.2642,"rooms_lon":-123.24842,"rooms_name":"SPPH_B112"},{"rooms_lat":49.2642,"rooms_lon":-123.24842,"rooms_name":"SPPH_B136"},{"rooms_lat":49.2642,"rooms_lon":-123.24842,"rooms_name":"SPPH_B138"},{"rooms_lat":49.2642,"rooms_lon":-123.24842,"rooms_name":"SPPH_B151"},{"rooms_lat":49.2683,"rooms_lon":-123.24894,"rooms_name":"SRC_220A"},{"rooms_lat":49.2683,"rooms_lon":-123.24894,"rooms_name":"SRC_220B"},{"rooms_lat":49.2683,"rooms_lon":-123.24894,"rooms_name":"SRC_220C"},{"rooms_lat":49.26293,"rooms_lon":-123.25431,"rooms_name":"SWNG_105"},{"rooms_lat":49.26293,"rooms_lon":-123.25431,"rooms_name":"SWNG_106"},{"rooms_lat":49.26293,"rooms_lon":-123.25431,"rooms_name":"SWNG_107"},{"rooms_lat":49.26293,"rooms_lon":-123.25431,"rooms_name":"SWNG_108"},{"rooms_lat":49.26293,"rooms_lon":-123.25431,"rooms_name":"SWNG_109"},{"rooms_lat":49.26293,"rooms_lon":-123.25431,"rooms_name":"SWNG_110"},{"rooms_lat":49.26293,"rooms_lon":-123.25431,"rooms_name":"SWNG_121"},{"rooms_lat":49.26293,"rooms_lon":-123.25431,"rooms_name":"SWNG_122"},{"rooms_lat":49.26293,"rooms_lon":-123.25431,"rooms_name":"SWNG_221"},{"rooms_lat":49.26293,"rooms_lon":-123.25431,"rooms_name":"SWNG_222"},{"rooms_lat":49.26293,"rooms_lon":-123.25431,"rooms_name":"SWNG_305"},{"rooms_lat":49.26293,"rooms_lon":-123.25431,"rooms_name":"SWNG_306"},{"rooms_lat":49.26293,"rooms_lon":-123.25431,"rooms_name":"SWNG_307"},{"rooms_lat":49.26293,"rooms_lon":-123.25431,"rooms_name":"SWNG_308"},{"rooms_lat":49.26293,"rooms_lon":-123.25431,"rooms_name":"SWNG_309"},{"rooms_lat":49.26293,"rooms_lon":-123.25431,"rooms_name":"SWNG_310"},{"rooms_lat":49.26293,"rooms_lon":-123.25431,"rooms_name":"SWNG_405"},{"rooms_lat":49.26293,"rooms_lon":-123.25431,"rooms_name":"SWNG_406"},{"rooms_lat":49.26293,"rooms_lon":-123.25431,"rooms_name":"SWNG_407"},{"rooms_lat":49.26293,"rooms_lon":-123.25431,"rooms_name":"SWNG_408"},{"rooms_lat":49.26293,"rooms_lon":-123.25431,"rooms_name":"SWNG_409"},{"rooms_lat":49.26293,"rooms_lon":-123.25431,"rooms_name":"SWNG_410"},{"rooms_lat":49.26867,"rooms_lon":-123.25692,"rooms_name":"UCLL_101"},{"rooms_lat":49.26867,"rooms_lon":-123.25692,"rooms_name":"UCLL_103"},{"rooms_lat":49.26867,"rooms_lon":-123.25692,"rooms_name":"UCLL_107"},{"rooms_lat":49.26867,"rooms_lon":-123.25692,"rooms_name":"UCLL_109"},{"rooms_lat":49.26517,"rooms_lon":-123.24937,"rooms_name":"WESB_100"},{"rooms_lat":49.26517,"rooms_lon":-123.24937,"rooms_name":"WESB_201"},{"rooms_lat":49.26478,"rooms_lon":-123.24673,"rooms_name":"WOOD_1"},{"rooms_lat":49.26478,"rooms_lon":-123.24673,"rooms_name":"WOOD_2"},{"rooms_lat":49.26478,"rooms_lon":-123.24673,"rooms_name":"WOOD_3"},{"rooms_lat":49.26478,"rooms_lon":-123.24673,"rooms_name":"WOOD_4"},{"rooms_lat":49.26478,"rooms_lon":-123.24673,"rooms_name":"WOOD_5"},{"rooms_lat":49.26478,"rooms_lon":-123.24673,"rooms_name":"WOOD_6"},{"rooms_lat":49.26478,"rooms_lon":-123.24673,"rooms_name":"WOOD_B75"},{"rooms_lat":49.26478,"rooms_lon":-123.24673,"rooms_name":"WOOD_B79"},{"rooms_lat":49.26478,"rooms_lon":-123.24673,"rooms_name":"WOOD_G41"},{"rooms_lat":49.26478,"rooms_lon":-123.24673,"rooms_name":"WOOD_G44"},{"rooms_lat":49.26478,"rooms_lon":-123.24673,"rooms_name":"WOOD_G53"},{"rooms_lat":49.26478,"rooms_lon":-123.24673,"rooms_name":"WOOD_G55"},{"rooms_lat":49.26478,"rooms_lon":-123.24673,"rooms_name":"WOOD_G57"},{"rooms_lat":49.26478,"rooms_lon":-123.24673,"rooms_name":"WOOD_G59"},{"rooms_lat":49.26478,"rooms_lon":-123.24673,"rooms_name":"WOOD_G65"},{"rooms_lat":49.26478,"rooms_lon":-123.24673,"rooms_name":"WOOD_G66"}]};
                expect(response.body['result'].length).to.deep.equal(expected['result'].length);
                expect(response.body).to.deep.equal(expected);
            }).catch(function (err) {
                expect.fail();
            });
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        })
    });

    it("should find all rooms outside of a bounding box", function() {
        this.timeout(20000);
        contentString = fs.readFileSync('./rooms.zip').toString('base64');
        return insightFacade.addDataset("rooms", contentString).then (function (result) {
            return insightFacade.performQuery({
                "WHERE": {
                    "OR": [{ "GT" : {
                        "rooms_lat": 2
                    }
                    }, { "LT": {
                        "rooms_lat": 1
                    }
                    }, { "GT" : {
                        "rooms_lon": 2
                    }
                    }, { "LT" : {
                        "rooms_lon": 1
                    }}]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_lat", "rooms_lon", "rooms_name"
                    ],
                    "ORDER": "rooms_name"
                }
            })
                .then(function(response) {
                    expect(response.code).to.equal(200);
                    console.log(response.body);
                }).catch(function (err) {
                    expect.fail();
                });
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
        })
    });



    //==========================================================================//
    //=============================D3 TESTS=====================================//
    //==========================================================================//


});