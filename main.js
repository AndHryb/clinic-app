import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import doctorRouter from './routes/doctor-router.js';
import patientRouter from './routes/patient-router.js';
import { envConfig } from './config.js';
import userRouter from './routes/user-router.js';
import apiErrorHandler from './error_handling/api-error-handler.js';

const app = express();
const __dirname = path.resolve();

app.use(express.static(path.resolve(__dirname, 'static')));
app.use(bodyParser.json({ strict: false }));

app.use('/doctor', doctorRouter);
app.use('/patient', patientRouter);
app.use('/auth', userRouter);

app.use(apiErrorHandler);

app.listen(envConfig.app.port, () => {
  console.log(`server starting on port ${envConfig.app.port}...`);
});

export { __dirname };
