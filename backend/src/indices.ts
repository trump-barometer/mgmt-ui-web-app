import * as express from 'express';
import {Response, NextFunction} from 'express';
import { EnhancedRequest } from './lib/dbclient'

const router = express.Router();

router.get('/', async (req: EnhancedRequest, res: Response, next: NextFunction) => {
  const mongoClient = req.dbClient.mongoClient;
  try {
    const result = await mongoClient.db().collection('indizes').find({}).toArray();
    res.json(result);
    next();
  } catch (e) {
    res.json(e);
    next();
  }
});


export {router as indicesRouter};
