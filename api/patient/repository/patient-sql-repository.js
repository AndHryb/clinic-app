export default class PatientSqlRepository {
  constructor(sequelize, patientModel, resolutionModel, userModel) {
    this.sequelize = sequelize;
    this.patientModel = patientModel;
    this.resolutionModel = resolutionModel;
    this.userModel = userModel;
  }

  async create(options) {
    try {
      const result = await this.sequelize.transaction(async (t) => {
        const user = await this.userModel.create({
          email: options.email,
          password: options.password,
          role: options.role,
        }, { transaction: t });

        const patient = await this.patientModel.create({
          name: options.name,
          email: options.email,
          gender: options.gender,
          birthday: options.birthday,
          userId: user.id,
        }, { transaction: t });

        return { entity: patient, user };
      });
      return result;
    } catch (err) {
      console.log(`Patient repository create error ${err.message}`);
      throw err;
    }
  }

  async getByName(name) {
    const patientlist = await this.patientModel.findAll({
      where: {
        name,
      },
      include: {
        model: this.resolutionsModel,
        required: true,
      },
    });
    return patientlist;
  }

  async getById(patientId) {
    const patient = await this.patientModel.findOne({
      where: {
        id: patientId,
      },
    });

    if (!patient) {
      return false;
    }
    return patient;
  }

  async delete(patientID) {
    const deleteValue = await this.patientModel.destroy({
      where: {
        id: patientID,
      },
    });
    return deleteValue;
  }

  async getByUserId(userId) {
    const patient = await this.patientModel.findOne({
      where: {
        userId,
      },
    });

    if (!patient) {
      return false;
    }

    return patient;
  }
}
