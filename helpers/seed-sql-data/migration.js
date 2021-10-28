import pkg from 'sequelize';
import dotenv from 'dotenv';
import userModel from '../../models/user-model.js';
import doctorModel from '../../models/doctor-model.js';
import specialityModel from '../../models/spec-model.js';
import { creator } from './dbSeed.js';

dotenv.config();

const { Sequelize, DataTypes } = pkg;

async function applyExtraSetupMigrations(sequelize) {
  const {
    users, doctors, specializations,
  } = sequelize.models;

  doctors.belongsTo(users, {
    foreignKey: {
      name: 'userId',
      type: DataTypes.UUID,
      allowNull: false,
    },
  });

  const doctorSpecModel = sequelize.define('doctorsSpecializations', {
    doctorId: {
      type: DataTypes.UUID,
      references: {
        model: doctors,
        key: 'id',
      },
    },

    specializationId: {
      type: DataTypes.UUID,
      references: {
        model: specializations,
        key: 'id',
      },
    },
  });

  doctors.belongsToMany(specializations, {
    through: doctorSpecModel,
    as: 'specialties',
  });

  specializations.belongsToMany(doctors, {
    through: doctorSpecModel,
    as: 'doctors',
  });

  sequelize.sync({ forse: true })
    .then(() => console.log('sync'))
    .then(() => creator(doctors, users, specializations))
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
