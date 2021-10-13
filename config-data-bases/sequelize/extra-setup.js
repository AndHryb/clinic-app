import pkg from 'sequelize';
import { creator } from '../../helpers/dbSeed.js';

const { DataTypes } = pkg;

export default function applyExtraSetup(sequelize) {
  const {
    resolutionsSQLDB, patientsSQLDB, usersSQLDB, doctorsSQLDB, specialtiesSQLDB,
  } = sequelize.models;

  patientsSQLDB.hasMany(resolutionsSQLDB, {
    foreignKey: {
      name: 'patientId',
      type: DataTypes.UUID,
      allowNull: false,
    },
  });

  doctorsSQLDB.hasMany(resolutionsSQLDB, {
    foreignKey: {
      name: 'doctorId',
      type: DataTypes.UUID,
      allowNull: false,
    },
  });

  resolutionsSQLDB.belongsTo(doctorsSQLDB, {
    as: 'doctor',
  });
  resolutionsSQLDB.belongsTo(patientsSQLDB, {
    as: 'patient',
  });

  patientsSQLDB.belongsTo(usersSQLDB, {
    foreignKey: {
      name: 'userId',
      type: DataTypes.UUID,
      allowNull: false,
    },
  });

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

  sequelize.sync({ force: true })
    .then(() => console.log('sync'))
    .then(() => creator(doctorsSQLDB, usersSQLDB, specialtiesSQLDB))
    .catch((error) => console.log('This error occurred', error));
}
