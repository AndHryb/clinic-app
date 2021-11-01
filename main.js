import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import doctorRouter from './routes/doctor-router.js';
import resolutionRouter from './routes/resolution-router.js';
import queueRouter from './routes/queue-router.js';
import { envConfig } from './config.js';
import userRouter from './routes/user-router.js';
import apiErrorHandler from './middleware/error-handling/api-error-handler.js'
import checkJWT from './middleware/checkJwt.js';



const app = express();
const __dirname = path.resolve();



app.use(express.static(path.resolve(__dirname, 'client')));
app.use(bodyParser.json({ strict: false }));



app.use('/auth', userRouter);


app.use('/doctor', checkJWT, doctorRouter);
app.use('/queue', checkJWT, queueRouter);
app.use('/resolution', checkJWT, resolutionRouter);


app.use(apiErrorHandler);


 
app.listen(envConfig.app.port, () => {
  console.log(`server starting on port ${envConfig.app.port}...`);
});


