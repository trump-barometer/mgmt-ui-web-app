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

    const result = await mongoClient.db().collection('tweets')
      .find({
        '$and': [
          req.query.from ? { 'tweet.created_at_date': { '$gte': moment.utc(<string>req.query.from).toDate() } } : {},
          req.query.to ? { 'tweet.created_at_date': { '$lt': moment.utc(<string>req.query.to).toDate() } } : {},
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
          'tweet.created_at_date': 1,
          'tweet.full_text': 1,
          'tweet.id': 1,
          'tweet.favorite_count': 1,
          'tweet.retweet_count': 1,
          ...predictionprojection
        },
      })
      .sort({ 'tweet.created_at_date': -1})
      .toArray();
    res.json(
      result
        .map(element => {
          if (element.predictions) {
          Object.keys(element.predictions)
            .forEach(modelClass => Object.keys(element.predictions[modelClass])
              .forEach(modelName => Object.keys(element.predictions[modelClass][modelName])
                .forEach(index => {
                  element.predictions[modelClass][modelName][index.replace('^','')] =
                    element.predictions[modelClass][modelName][index];
                  delete element.predictions[modelClass][modelName][index];
                })))
          }
          return {
            timestamp: element.tweet.created_at_date,
            id: element.tweet.id,
            text: element.tweet.full_text,
            favoriteCount: element.tweet.favorite_count,
            retweetCount: element.tweet.retweet_count,
            predictions: element.predictions
          }
        })
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
      .filter((value, index, array) => array.indexOf(value) === index && value.length !== 0)
      .sort()
    )
    next()
  } catch (e) {
    res.json(e)
    next()
  }
})

router.get('/timestamps', async (req: EnhancedRequest, res: Response, next: NextFunction) => {
  const mongoClient = req.dbClient.mongoClient
  try {
    const result = await mongoClient.db().collection('tweets')
      .distinct('tweet.created_at_date')
    res.json(result
      .map(element => moment.utc(element))
      .sort((a, b) => a.isSameOrBefore(b) ? 1 : -1)
      .map(element => element.toISOString()))
    next()
  } catch (e) {
    res.json(e)
    next()
  }
})

export { router as tweetRouter }
