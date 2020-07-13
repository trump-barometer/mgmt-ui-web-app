import * as express from 'express'
import { Response, NextFunction } from 'express'
import { EnhancedRequest } from './lib/dbclient'

const router = express.Router()

router.get('/', async (req: EnhancedRequest, res: Response, next: NextFunction) => {
  const mongoClient = req.dbClient.mongoClient
  try {
    const result = await mongoClient.db().collection('tweets').find({
      'tweet.entities.media': null
    }, {
      projection: {
        'tweet.created_at': 1,
        'tweet.full_text': 1,
        'tweet.id': 1,
      },
    }).toArray()
    res.json(result)
    next()
  } catch (e) {
    res.json(e)
    next()
  }
})

export { router as tweetRouter }
