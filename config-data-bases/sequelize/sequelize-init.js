import pkg from 'sequelize';
import applyExtraSetup from './extra-setup.js';
import patientModel from '../../models/patient-model.js';
import resolutionModel from '../../models/resolution-model.js';
import userModel from '../../models/user-model.js';
import doctorModel from '../../models/doctor-model.js';
import specialityModel from '../../models/speciality-model.js';
import { envConfig } from '../../config.js';

const { Sequelize } = pkg;

export default function sequelizeInit() {
  const sequelize = new Sequelize(process.env.SQL_DB, process.env.SQL_USER, ''/* process.env.SQL_PASSWORD */, {
    dialect: 'mysql',
    host: envConfig.storage.SQLHost,
    port: envConfig.storage.SQLPort,
    database: process.env.SQL_DB,
  });

  try {
    sequelize.authenticate();
    console.log('Connection to mySQL has been established successfully....');
  } catch (error) {
    console.error('Unable to connect to the database --->check sequelizeInit and config file', error);
  }

  const modelDefiners = [
    patientModel,
    resolutionModel,
    userModel,
    doctorModel,
    specialityModel,
  ];

  for (const modelDefiner of modelDefiners) {
    modelDefiner(sequelize);
  }

  applyExtraSetup(sequelize);

  return sequelize;
}
