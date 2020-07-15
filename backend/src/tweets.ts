import * as express from 'express'
import { Response, NextFunction } from 'express'
import { EnhancedRequest } from './lib/dbclient'
import * as moment from 'moment'

const router = express.Router()

router.get('/', async (req: EnhancedRequest, res: Response, next: NextFunction) => {
  const mongoClient = req.dbClient.mongoClient
  try {
    const result = await mongoClient.db().collection('tweets')
      .find({
        '$or': [
          { 'tweet.entities.media': null },
          { 'tweet.full_text': { '$not': /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/ } },
        ],
      }, {
        projection: {
          'tweet.created_at': 1,
          'tweet.full_text': 1,
          'tweet.id': 1,
          'tweet.favorite_count': 1,
          'tweet.retweet_count': 1,
        },
      })
      .toArray()
    res.json(
      result
        .map(element => {
          return {
            timestamp: moment.utc(element.tweet.created_at, 'ddd MMM DD HH:mm:ss Z YYYY'),
            id: element.tweet.id,
            text: element.tweet.full_text,
            favoriteCount: element.tweet.favorite_count,
            retweetCount: element.tweet.retweet_count,
          }
        })
        .sort((a, b) => a.timestamp.isBefore(b.timestamp) ? -1 : 1),
    )
    next()
  } catch (e) {
    res.json(e)
    next()
  }
})

router.get('/predictionmodels', async (req: EnhancedRequest, res: Response, next: NextFunction) => {
  const mongoClient = req.dbClient.mongoClient
  try {
    const result = await mongoClient.db().collection('tweets')
      .find({},{projection: {
        'predictions': 1
        }})
      .toArray()
    res.json(result
      .map(element => element.predictions ? Object.keys(element.predictions) : [])
      .reduce((prev, cur) => prev.concat(cur), [])
      .filter((value, index, array) => array.indexOf(value) === index && value.length !== 0)

    );
    next()
  } catch (e) {
    res.json(e)
    next()
  }
})

export { router as tweetRouter }
