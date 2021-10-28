import pkg from 'sequelize';

const { DataTypes, UUIDV4 } = pkg;

export default function resolutionModel(sequelize) {
  const model = sequelize.define('resolutions', {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    resolution: {
      type: DataTypes.STRING,
    },

    speciality: {
      type: DataTypes.STRING,
    },
  });

  return model;
}
