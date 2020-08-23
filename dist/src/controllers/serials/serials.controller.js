"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const axios_1 = __importDefault(require("axios"));
let config = require('../../config.json');
class SerialsController {
    constructor() {
        this.router = express.Router();
        this.getTopEpisodes = (req, res) => {
            if (req.params.SeriesId && parseInt(req.params.SeriesId)) {
                let url = `${config.uriPath}/tv/${req.params.SeriesId}?api_key=${config.api_key}&language=en-US`;
                axios_1.default.get(url)
                    .then((response) => {
                    if (!response)
                        return res.status(404).send("No Tv Serial found with that Id");
                    else {
                        let linksArr = response.data.seasons.map((val) => `${config.uriPath}/tv/${response.data.id}/season/${val.season_number}?api_key=${config.api_key}&language=en-US`);
                        let promiseArray = linksArr.map((url) => axios_1.default.get(url));
                        axios_1.default.all(promiseArray)
                            .then(axios_1.default.spread((...results) => {
                            if (!results || results.length < 1)
                                return res.status(404).send("No Episodes found for the TV Serial");
                            else {
                                let nestedArr = results.map((e) => {
                                    if (e.data && e.data.episodes)
                                        return e.data.episodes;
                                });
                                let flatArr = this.highestRatings(nestedArr.reduce((acc, it) => [...acc, ...it])).reverse();
                                let topArr = flatArr.slice(0, 20);
                                return res.status(200).send(topArr);
                            }
                        }))
                            .catch(error => {
                            return res.status(500).send(error);
                        });
                    }
                })
                    .catch((error) => {
                    return res.status(500).send(error);
                });
            }
            else
                return res.status(400).send("No Series Id found in query params");
        };
        this.getTopFiveSerials = (req, res) => {
            let db = req.app.get('db');
            let k = db.collection('tvShows').aggregate([
                { $project: { _id: 0, seriesName: "$name", accessCount: "$vote_count" } },
                { $sort: { accessCount: -1 } },
                { $limit: 5 }
            ]).toArray();
            k.then((results) => {
                if (!results || results.length < 1)
                    return res.status(400).send("No records found");
                else
                    return res.status(200).send(results);
            }).catch((error) => {
                return res.status(500).send(error);
            });
        };
        // To be executed only once , data duplicacy is not handled...//
        this.gatherSerials = (req, res) => {
            let db = req.app.get('db');
            let [start, limit] = [1, 20];
            let linksArr = [];
            for (let i = start; i <= limit; i++) {
                linksArr.push(`${config.uriPath}/tv/${i}?api_key=${config.api_key}&language=en-US`);
            }
            let promiseArray = linksArr.map((url) => axios_1.default.get(url));
            axios_1.default.all(promiseArray)
                .then(axios_1.default.spread((...results) => {
                if (!results || results.length < 1)
                    return res.send("No Data found");
                else {
                    let responseArr = results.map((e) => {
                        if (e.data)
                            return e.data;
                    });
                    db.collection('tvShows').insert(responseArr).then((results) => {
                        return res.send("Successfully created records");
                    }).catch((error) => {
                        return res.send(error);
                    });
                }
            }));
        };
        this.initRoutes();
    }
    initRoutes() {
        this.router.get('/topEpisodes' + '/:SeriesId', this.getTopEpisodes);
        this.router.get('/analytics/popularSeries', this.getTopFiveSerials);
        this.router.get('/loadData', this.gatherSerials);
    }
    highestRatings(mainArray) {
        return mainArray
            .map((o) => { return { "episodeName": o.name, "averageVotes": o.vote_average }; })
            .sort((x, y) => x.averageVotes - y.averageVotes);
    }
}
exports.default = SerialsController;
//# sourceMappingURL=serials.controller.js.map