import pkg from 'sequelize';
import applyExtraSetup from './extra-setup.js';
import patientModel from '../../models/patient-model.js';
import resolutionModel from '../../models/resolution-model.js';
import userModel from '../../models/user-model.js';
import doctorModel from '../../models/doctor-model.js';
import specModel from '../../models/spec-model.js';
import { envConfig } from '../../config.js';

const { Sequelize } = pkg;

export default function sequelizeInit() {
  const sequelize = new Sequelize(
    envConfig.sql.database, envConfig.sql.user, envConfig.sql.password, {
      dialect: 'mysql',
      host: envConfig.sql.host,
      port: envConfig.sql.port,
      database: envConfig.sql.database,
    },
  );

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
    specModel,
  ];

  for (const modelDefiner of modelDefiners) {
    modelDefiner(sequelize);
  }

  applyExtraSetup(sequelize);

  return sequelize;
}
