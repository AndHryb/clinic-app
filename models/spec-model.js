import pkg from 'sequelize';

const { DataTypes, UUIDV4 } = pkg;

export default function specModel(sequelize) {
  const model = sequelize.define('specializations', {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
      unique: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  });

  return model;
}
