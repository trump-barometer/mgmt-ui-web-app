import express from 'express';
import dotenv from 'dotenv'
import { tweetRouter } from './src/tweets'
import { indicesRouter } from './src/indices'
import { DbClient } from './src/lib/dbclient'
import * as path from 'path'

dotenv.config();
const app = express();
const port = process.env.port || 3000;

app.use(express.static(path.join(__dirname,
  __dirname.includes('dist') ? './../../frontend/dist' : './../frontend/dist')));

app.use('/tweets', DbClient.openDbConnection, tweetRouter, DbClient.closeDbConnection);
app.use('/indices', DbClient.openDbConnection, indicesRouter, DbClient.closeDbConnection);
app.get('/', (req, res) => {
  return res.sendFile(path.join(__dirname+
  __dirname.includes('dist') ? './../../frontend/dist/index.html' : './../frontend/dist/index.html'));
});

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});
