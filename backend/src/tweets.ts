import * as express from 'express';

const router = express.Router();


router.get('/', (req, res) => {
  res.send('Hello World123');
});

export {router as tweetRouter};
