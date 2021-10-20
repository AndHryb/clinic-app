import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import passport from 'passport';
import doctorRouter from './routes/doctor-router.js';
import resolutionRouter from './routes/resolution-router.js';
//import patientRouter from './routes/patient-router.js';
import queueRouter from './routes/queue-router.js';
import { envConfig } from './config.js';
import userRouter from './routes/user-router.js';
import apiErrorHandler from './error_handling/api-error-handler.js';
import checkToken from './helpers/pssport.js';

const app = express();
const __dirname = path.resolve();

app.use(express.static(path.resolve(__dirname, 'client')));
app.use(bodyParser.json({ strict: false }));

app.use(passport.initialize());
checkToken(passport);

app.use('/doctor', passport.authenticate('jwt', { session: false}), doctorRouter);
app.use('/queue', passport.authenticate('jwt', { session: false}), queueRouter);
app.use('/resolution', passport.authenticate('jwt', { session: false}), resolutionRouter);
app.use('/auth', userRouter);

app.use(apiErrorHandler);

app.listen(envConfig.app.port, () => {
  console.log(`server starting on port ${envConfig.app.port}...`);
});

//export { __dirname };
