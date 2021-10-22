import pkg from 'sequelize';

const { DataTypes, UUIDV4 } = pkg;

export default function userModel(sequelize) {
  const model = sequelize.define('usersSQLDB', {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return model;
}
