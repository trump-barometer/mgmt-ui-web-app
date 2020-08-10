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

    if (!req.query.predictionmodels) {
      req.query.predictionmodels = <string[]>[]
    } else {
      assert(Array.isArray(req.query.predictionmodels), 'only give arrays as predictionmodels filter')
      req.query.predictionmodels = <string[]>req.query.predictionmodels
    }

    const backtestingprojection: any = {}
    if (req.query.predictionmodels.length > 0) {
      req.query.predictionmodels.forEach(model => backtestingprojection['backtesting.' + model] = 1)
    } else {
      backtestingprojection['backtesting'] = 1
    }


    const result = (await mongoClient.db()
      .collection('indizes')
      .find(
        {
          '$and': [
            req.query.from ? { 'indize.timestamp_date': { '$gte': moment.utc(<string>req.query.from).toDate() } } : {},
            req.query.to ? { 'indize.timestamp_date': { '$lt': moment.utc(<string>req.query.to).toDate() } } : {},
            req.query.indexnames.length > 0 ?
              {
                '$or': req.query.indexnames.map(indexname => {
                  return { 'indize.symbol': '^' + indexname }
                }),
              } : {},
          ],
        }
        , {
          projection: {
            'indize.timestamp_date': 1,
            'indize.symbol': 1,
            'indize.high': 1,
            'indize.low': 1,
            ...backtestingprojection,
          },
        })
      .sort({ 'indize.timestamp_date': -1, 'indize.symbol': 1 })
      .toArray())
    res.json(
      result.map(element => {
        if (element.backtesting) {
          Object.keys(element.backtesting).forEach(group => {
            Object.keys(element.backtesting[group]).forEach(model => {
              element.backtesting[group][model] = Math.round(element.backtesting[group][model] * 1000) / 1000
            })
          })
        }
        return {
          index: element.indize.symbol.replace('^', ''),
          timestamp: element.indize.timestamp_date,
          value: Math.round((parseFloat(element.indize.high) + parseFloat(element.indize.low)) / 2 * 1000) / 1000,
          backtesting: element.backtesting,
        }
      })
    )
    next()
  } catch (e) {
        res.json(e.message)
        next()
  }
})


router.get('/indexnames', async (req: EnhancedRequest, res: Response, next: NextFunction) => {
  const mongoClient = req.dbClient.mongoClient
  try {
    const result = await mongoClient.db()
      .collection('indizes')
      .distinct('indize.symbol')

    res.json(result
      .map(element => element.replace('^', ''))
      .sort())
    next()
  } catch (e) {
    res.json(e)
    next()
  }
})

export { router as indicesRouter }
