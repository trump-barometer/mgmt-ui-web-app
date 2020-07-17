import express from 'express';
import dotenv from 'dotenv';
import https from 'https';
import { tweetRouter } from './src/tweets'
import { indicesRouter } from './src/indices'
import { DbClient } from './src/lib/dbclient'
import * as path from 'path'
import * as fs from 'fs'

dotenv.config({path: './../.env'});
const app = express();
const port = parseInt(process.env.port) || 3001;

app.use(express.static(path.join(__dirname,
  __dirname.includes('dist') ? './../../frontend/dist' : './../frontend/dist')));

app.use('/tweets', DbClient.openDbConnection, tweetRouter, DbClient.closeDbConnection);
app.use('/indices', DbClient.openDbConnection, indicesRouter, DbClient.closeDbConnection);
app.get('/', (req, res) => {
  return res.sendFile(path.join(__dirname+
  __dirname.includes('dist') ? './../../frontend/dist/index.html' : './../frontend/dist/index.html'));
});

if (port === 443 && process.env.keypath && process.env.certpath) {
  const privateKey = fs.readFileSync(process.env.keypath , 'utf8');
  const cert = fs.readFileSync(process.env.certpath, 'utf8');
  const credentials = {key: privateKey, cert: cert};

  const httpsServer = https.createServer(credentials, app);
  httpsServer.listen(port);
} else {
  app.listen(port);
}

console.log(`server started at http://localhost:${port}`);
