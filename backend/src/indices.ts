import * as express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello World3');
});


export {router as indicesRouter};
