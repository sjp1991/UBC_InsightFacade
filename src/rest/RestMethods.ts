import restify = require('restify');

import Log from "../Util";
import InsightFacade from "../controller/InsightFacade";

var iFacade: InsightFacade = new InsightFacade();

export default class RestMethods {

    public static putDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        let dataStr = new Buffer(req.params.body).toString('base64');
        let datasetName = req.params.id;
        
        iFacade.addDataset(datasetName, dataStr).then(function (value) {
            // Write to response object the code you're returning
            res.status(value.code);
 
            // Write to response object the json data you're returning
            res.json(value);
            
        }).catch(function (err) {
            res.status(err.code);
            res.json(err);
        })
        return next();
    }

    public static deleteDataset(req: restify.Request,  res: restify.Response, next: restify.Next) {
        let datasetName = req.params.id;

        iFacade.removeDataset(datasetName).then(function (value) {
            res.status(value.code);
            res.json(value);

        }).catch(function (err) {
            res.status(err.code);
            res.json(err);
        })

        return next();
    }

    public static postQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
        let query = req.body;

        iFacade.performQuery(query).then(function (value) {
            res.status(value.code);
            res.json(value);

        }).catch(function (err) {
            res.status(err.code);
            res.json(err);
        })

        return next();
    }

}