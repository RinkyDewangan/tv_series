import * as express from 'express';
import { Request, Response } from 'express';
import base from '../../interfaces/base.interface';
import axios from 'axios';

import {Config} from '../../config'
let config: Config = require('../../config.json');

class SerialsController implements base {
    public router = express.Router()
    
    constructor() {
        this.initRoutes()
    }

    public initRoutes() {
        this.router.get('/topEpisodes' + '/:SeriesId',this.getTopEpisodes)
        this.router.get('/analytics/popularSeries', this.getTopFiveSerials)
        this.router.get('/loadData', this.gatherSerials)
    }

    public highestRatings(mainArray:any) {
        return mainArray
            .map((o:any)=> { return {"episodeName":o.name,"averageVotes":o.vote_average} })
            .sort((x:any,y:any)=> x.averageVotes - y.averageVotes)
        }

    getTopEpisodes= (req: Request, res: Response) => {
        if(req.params.SeriesId && req.params.SeriesId !== undefined && parseInt(req.params.SeriesId) > 0){
            let url = `${config.uriPath}/tv/${req.params.SeriesId}?api_key=${config.api_key}&language=en-US`
            axios.get(url)
            .then((response:any) => {
                if(!response || response["status_code"] === 34) return res.status(404).send("No Tv Serial found with that Id")
                else{
                    let linksArr = response.data.seasons.map((val:any)=> `${config.uriPath}/tv/${response.data.id}/season/${val.season_number}?api_key=${config.api_key}&language=en-US`);
                    let promiseArray = linksArr.map( (url:string)=> axios.get(url) );
                    axios.all(promiseArray)
                    .then(axios.spread((...results) => {
                        if(!results || results.length < 1) return res.status(404).send("No Episodes found for the TV Serial")
                        else{
                            let nestedArr = results.map((e:any) => {
                                if(e.data && e.data.episodes) return e.data.episodes;
                            });
                            let flatArr = this.highestRatings(nestedArr.reduce((acc, it) => [...acc, ...it])).reverse()
                            let topArr = flatArr.slice(0,20)
                            return res.status(200).send(topArr);
                        }
                    }))
                    .catch(error => {
                        return res.status(500).send(error)
                    });
                }
            })
            .catch((error:any) => {
            return res.status(500).send(error)
            });
        } else return res.status(400).send("Series Id cannot be zero or negative value")
    }
    getTopFiveSerials = (req: Request, res: Response) => {
        let db = req.app.get('db')
        let k = db.collection('tvShows').aggregate([
            {$project:{_id:0,seriesName:"$name",accessCount:"$vote_count"}},
            {$sort:{accessCount:-1}},
            {$limit:5}
        ]).toArray();
        k.then((results:any)=>{
            if(!results || results.length < 1) return res.status(400).send("No records found")
            else return res.status(200).send(results);
        }).catch((error:any)=>{
            return res.status(500).send(error)
        })
    }
    
    // To be executed only once , data duplicacy is not handled...//
    gatherSerials = (req: Request, res: Response) => {
        let db = req.app.get('db')
        let [start, limit] = [1,20];
        let linksArr = [];
        for(let i:number = start; i <= limit ; i++){
            linksArr.push(`${config.uriPath}/tv/${i}?api_key=${config.api_key}&language=en-US`)
        }
        let promiseArray = linksArr.map( (url:string)=> axios.get(url) );
        axios.all(promiseArray)
        .then(axios.spread((...results) => {
            if(!results || results.length < 1) return res.send("No Data found")
            else{
                let responseArr = results.map((e:any) => {
                    if(e.data) return e.data;
                });
                db.collection('tvShows').insert(responseArr).then((results:any)=>{
                    return res.send("Successfully created records");
                }).catch((error:any)=>{
                    return res.send(error)
                })
            }
        }))
    }
  
}

export default SerialsController