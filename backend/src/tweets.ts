import * as express from 'express'
import { Response, NextFunction } from 'express'
import { EnhancedRequest } from './lib/dbclient'
import * as moment from 'moment'
import assert = require('assert')

const router = express.Router()

router.get('/', async (req: EnhancedRequest, res: Response, next: NextFunction) => {
  const mongoClient = req.dbClient.mongoClient
  try {
    if (!req.query.predictionmodels){
      req.query.predictionmodels = <string[]> [];
    } else {
      assert(Array.isArray(req.query.predictionmodels),'only give arrays as predictionmodels filter' )
      req.query.predictionmodels = <string[]> req.query.predictionmodels;
    }

    assert(!req.query.from || !Array.isArray(req.query.from), 'only give 1 from parameter')
    assert(!req.query.to|| !Array.isArray(req.query.to), 'only give 1 to parameter')

    const predictionprojection: any = {};
    if (req.query.predictionmodels.length > 0) {
      req.query.predictionmodels.forEach(model => predictionprojection['predictions.'+model] = 1)
    } else {
      predictionprojection['predictions']= 1;
    }

console.log(moment.utc().toISOString())
    const result = await mongoClient.db().collection('tweets')
      .find({
        '$and': [
          {
            '$or': [
              { 'tweet.entities.media': null },
              { 'tweet.full_text': { '$not': /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/ } },
            ],
          },
          req.query.predictionmodels.length > 0 ? {
            '$or':  req.query.predictionmodels.map(predictionmodel => {
              const newFilter: any = {}
              newFilter['predictions.'+predictionmodel] =  {'$exists': true}
              return newFilter
            })
          }: {}
        ],
      }, {
        projection: {
          'tweet.created_at': 1,
          'tweet.full_text': 1,
          'tweet.id': 1,
          'tweet.favorite_count': 1,
          'tweet.retweet_count': 1,
          ...predictionprojection
        },
      })
      .toArray();
    console.log(moment.utc().toISOString())
    res.json(
      result
        .map(element => {
          return {
            timestamp: moment.utc(element.tweet.created_at, 'ddd MMM DD HH:mm:ss Z YYYY'),
            id: element.tweet.id,
            text: element.tweet.full_text,
            favoriteCount: element.tweet.favorite_count,
            retweetCount: element.tweet.retweet_count,
            predictions: element.predictions
          }
        })
        .filter(element =>
            (!req.query.from || moment.utc(<string> req.query.from).isSameOrBefore(element.timestamp))
              && (!req.query.to || moment.utc(<string> req.query.to).isAfter(element.timestamp))
        )
        .sort((a, b) => a.timestamp.isBefore(b.timestamp) ? -1 : 1),
    )
    next()
  } catch (e) {
    res.json(e.message)
    next()
  }
})

router.get('/predictionmodels', async (req: EnhancedRequest, res: Response, next: NextFunction) => {
  const mongoClient = req.dbClient.mongoClient
  try {
    const result = await mongoClient.db().collection('tweets')
      .find({}, {
        projection: {
          'predictions': 1,
        },
      })
      .toArray()
    res.json(result
      .map(element => element.predictions ?
        Object.keys(element.predictions)
          .map((key: string) => Object.keys(element.predictions[key])
            .map(innerKey => key+'.'+innerKey))
          .reduce((prev, cur) => prev.concat(cur), []):
        [])
      .reduce((prev, cur) => prev.concat(cur), [])
      .filter((value, index, array) => array.indexOf(value) === index && value.length !== 0),
    )
    next()
  } catch (e) {
    res.json(e)
    next()
  }
})

export { router as tweetRouter }
