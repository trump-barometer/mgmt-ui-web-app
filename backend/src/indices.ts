import * as express from 'express'
import { Response, NextFunction } from 'express'
import { EnhancedRequest } from './lib/dbclient'

const router = express.Router()

router.get('/', async (req: EnhancedRequest, res: Response, next: NextFunction) => {
  const mongoClient = req.dbClient.mongoClient
  try {
    const result = (await mongoClient.db()
      .collection('indizes')
      .find({}, {
        projection: {
          'indize.timestamp': 1,
          'indize.symbol': 1,
          'indize.high': 1,
          'indize.low': 1,
        },
      })
      .sort({ 'indize.timestamp': 1, 'indize.symbol': 1 })
      .toArray())
    res.json(
      result.map(element => {
        return {
          index: element.indize.symbol.replace('^', ''),
          timestamp: element.indize.timestamp,
          value: Math.round((element.indize.high + element.indize.low) / 2 * 1000) / 1000,
        }
      }))
    next()
  } catch (e) {
    res.json(e)
    next()
  }
})


export { router as indicesRouter }
