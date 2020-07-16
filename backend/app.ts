import express from 'express';
import dotenv from 'dotenv'
import { tweetRouter } from './src/tweets'
import { indicesRouter } from './src/indices'
import { DbClient } from './src/lib/dbclient'

dotenv.config();
const app = express();
const port = 3001;

app.use('/tweets', DbClient.openDbConnection, tweetRouter, DbClient.closeDbConnection);
app.use('/indices', DbClient.openDbConnection, indicesRouter, DbClient.closeDbConnection);
app.get('/', (req, res, next) => {
  res.json('Hello World');
  next()
});

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});
