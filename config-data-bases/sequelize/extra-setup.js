import pkg from 'sequelize';

const { DataTypes } = pkg;

export default function applyExtraSetup(sequelize) {
  const {
    resolutions, patients, users, doctors, specializations,
  } = sequelize.models;

  patients.hasMany(resolutions, {
    foreignKey: {
      name: 'patientId',
      type: DataTypes.UUID,
      allowNull: false,
    },
  });

  doctors.hasMany(resolutions, {
    foreignKey: {
      name: 'doctorId',
      type: DataTypes.UUID,
      allowNull: false,
    },
  });

  resolutions.belongsTo(doctors, {
    as: 'doctor',
  });
  resolutions.belongsTo(patients, {
    as: 'patient',
  });

  patients.belongsTo(users, {
    foreignKey: {
      name: 'userId',
      type: DataTypes.UUID,
      allowNull: false,
    },
  });

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

  sequelize.sync({/*force: true*/ })
    .then(() => console.log('sync'))
    .catch((error) => console.log('This error occurred', error));
}
