export default class PatientSqlRepository {
  constructor(patients, resolutions) {
    this.patientsModel = patients;
    this.resolutionsModel = resolutions;
  }

  async add(options) {
    const patient = await this.patientsModel.create({
      ...options,
    });

    return patient;
  }

  async getByName(name) {
    const patientlist = await this.patientsModel.findAll({
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
    const patient = await this.patientsModel.findOne({
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
    const deleteValue = await this.patientsModel.destroy({
      where: {
        id: patientID,
      },
    });
    return deleteValue;
  }

  async getByUserId(userId) {
    const patient = await this.patientsModel.findOne({
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
