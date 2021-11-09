import pkg from 'sequelize';

const { DataTypes, UUIDV4 } = pkg;

export default function patientModel(sequelize) {
  const model = sequelize.define('patients', {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
    },
    gender: {
      type: DataTypes.STRING,
    },
    birthday: {
      type: DataTypes.DATEONLY,
    },
  });

  return model;
}
