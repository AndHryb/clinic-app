import pkg from 'sequelize';

const { DataTypes, UUIDV4 } = pkg;

export default function specialityModel(sequelize) {
  const model = sequelize.define('specialtiesSQLDB', {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
      unique: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return model;
}
