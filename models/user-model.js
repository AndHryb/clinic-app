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
    },
    password: {
      type: DataTypes.STRING,
    },
  });
/*
  model.sync({ alter: true })
    .then(() => console.log('usersSQLDB table has been successfully created, if one doesn\'t exist'))
    .catch((error) => console.log('This error occurred', error));*/

  return model;
}
