import express from 'express';
import dotenv from 'dotenv'
import { tweetRouter } from './src/tweets'
import { indicesRouter } from './src/indices'

dotenv.config();
const app = express();
const port = 3000;

app.use('/tweets', tweetRouter);
app.use('/indices', indicesRouter);
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});
