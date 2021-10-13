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

    /*
    model.sync({ alter: true })
        .then(() => console.log('specialitiesSQLDB table has been successfully created, if one doesn\'t exist'))
        .catch((error) => console.log('This error occurred', error));*/

    return model;
}