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
        },
    });

/*
    model.sync({ alter: true })
        .then(() => console.log('doctorsSQLDB table has been successfully created, if one doesn\'t exist'))
      //  .then(() => model.bulkCreate(doctors))
        .catch((error) => console.log('This error occurred', error));*/

    return model;
}
