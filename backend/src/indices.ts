import * as express from 'express'
import { Response, NextFunction } from 'express'
import { EnhancedRequest } from './lib/dbclient'
import * as moment from 'moment'
import assert = require('assert')

const router = express.Router()

router.get('/', async (req: EnhancedRequest, res: Response, next: NextFunction) => {
  const mongoClient = req.dbClient.mongoClient
  try {
    assert(!req.query.from || !Array.isArray(req.query.from), 'only give 1 from parameter')
    assert(!req.query.to || !Array.isArray(req.query.to), 'only give 1 to parameter')

    if (!req.query.indexnames) {
      req.query.indexnames = <string[]>[]
    } else {
      assert(Array.isArray(req.query.indexnames), 'only give arrays as indexnames filter')
      req.query.indexnames = <string[]>req.query.indexnames
    }


    const result = (await mongoClient.db()
      .collection('indizes')
      .find({
        '$and': [
          req.query.from ? { 'indize.timestamp': { '$gte': moment.utc(<string>req.query.from).format('YYYY-MM-DD HH:mm:ss') } } : {},
          req.query.to ? { 'indize.timestamp': { '$lt': moment.utc(<string>req.query.to).format('YYYY-MM-DD HH:mm:ss') } } : {},
          req.query.indexnames.length > 0 ?
          {
            '$or': req.query.indexnames.map(indexname => { return {'indize.symbol': '^'+indexname}}),
          }: {}
        ],
      }, {
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
    res.json(e.message)
    next()
  }
})


router.get('/indexnames', async (req: EnhancedRequest, res: Response, next: NextFunction) => {
  const mongoClient = req.dbClient.mongoClient
  try {
    const result = (await mongoClient.db()
      .collection('indizes')
      .distinct('indize.symbol'))
    res.json(result.map(element => element.replace('^', '')))
    next()
  } catch (e) {
    res.json(e)
    next()
  }
})

export { router as indicesRouter }
