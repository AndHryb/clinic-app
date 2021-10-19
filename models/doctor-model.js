import pkg from 'sequelize';

const { DataTypes, UUIDV4 } = pkg;

export default function doctorModel(sequelize) {
  const model = sequelize.define('doctorsSQLDB', {
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

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  });

  return model;
}
