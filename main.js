import express from 'express';
import path from 'path';

import doctorRouter from './api/doctor/doctor-router.js';
import resolutionRouter from './api/resolution/resolution-router.js';
import queueRouter from './api/queue/queue-router.js';
import envConfig from './config.js';
import userRouter from './api/auth/user-router.js';
import apiErrorHandler from './middleware/error-handling/api-error-handler.js';
import checkJWT from './middleware/checkJwt.js';

const app = express();
const dirname = path.resolve();

app.use(express.static(path.resolve(dirname, 'client')));
app.use(express.json());

app.use('/auth', userRouter);

app.use('/doctor', checkJWT, doctorRouter);
app.use('/queue', checkJWT, queueRouter);
app.use('/resolution', checkJWT, resolutionRouter);

app.use(apiErrorHandler);

app.listen(envConfig.app.port, () => {
  console.log(`server starting on port ${envConfig.app.port}...`);
});
