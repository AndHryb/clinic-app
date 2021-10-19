import pkg from 'sequelize';
import dotenv from 'dotenv';
import userModel from '../../models/user-model.js';
import doctorModel from '../../models/doctor-model.js';
import specialityModel from '../../models/speciality-model.js';
import { creator } from './dbSeed.js';

dotenv.config();

const { Sequelize, DataTypes } = pkg;

async function applyExtraSetupMigrations(sequelize) {
  const {
    usersSQLDB, doctorsSQLDB, specialtiesSQLDB,
  } = sequelize.models;

  doctorsSQLDB.belongsTo(usersSQLDB, {
    foreignKey: {
      name: 'userId',
      type: DataTypes.UUID,
      allowNull: false,
    },
  });

  doctorsSQLDB.belongsToMany(specialtiesSQLDB, {
    through: 'Doctors_Specialities',
    as: 'specialties',
  });

  specialtiesSQLDB.belongsToMany(doctorsSQLDB, {
    through: 'Doctors_Specialities',
    as: 'doctors',
  });

  sequelize.sync({ forse: true })
    .then(() => console.log('sync'))
    .then(() => creator(doctorsSQLDB, usersSQLDB, specialtiesSQLDB))
    .catch((error) => console.log('This error occurred', error));
}

async function sequelizeInitMigration() {
  const sequelize = new Sequelize(
    process.env.SQL_DB, process.env.SQL_USER, process.env.SQL_PASSWORD, {
      dialect: 'mysql',
      host: process.env.SQL_HOST,
      port: process.env.SQL_PORT,
      database: process.env.SQL_DB,
    },
  );

  try {
    sequelize.authenticate();
    console.log('Connection to mySQL has been established successfully....');
  } catch (error) {
    console.error('Unable to connect to the database --->check sequelizeInit and config file', error);
  }

  const modelDefiners = [
    userModel,
    doctorModel,
    specialityModel,
  ];

  for (const modelDefiner of modelDefiners) {
    await modelDefiner(sequelize);
  }

  await applyExtraSetupMigrations(sequelize);
}

sequelizeInitMigration();
