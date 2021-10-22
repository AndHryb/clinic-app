import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
//import passport from 'passport';
import doctorRouter from './routes/doctor-router.js';
import resolutionRouter from './routes/resolution-router.js';
import queueRouter from './routes/queue-router.js';
import { envConfig } from './config.js';
import userRouter from './routes/user-router.js';
import apiErrorHandler from './middleware/error_handling/api-error-handler.js';
import checkJWT from './middleware/checkJwt.js';
//import checkToken from './helpers/pssport.js';


const app = express();
const __dirname = path.resolve();

//app.use(checkJWT);

app.use(express.static(path.resolve(__dirname, 'client')));
app.use(bodyParser.json({ strict: false }));

// app.use(passport.initialize());
// checkToken(passport);
//passport.authenticate('jwt', { session: false})


app.use('/auth', userRouter);

app.use(checkJWT);

app.use('/doctor', doctorRouter);
app.use('/queue', queueRouter);
app.use('/resolution', resolutionRouter);


app.use(apiErrorHandler);


 
app.listen(envConfig.app.port, () => {
  console.log(`server starting on port ${envConfig.app.port}...`);
});


