export default class ResolutionSqlRepository {
  constructor(resolutions, patients, doctor) {
    this.resolutionsModel = resolutions;
    this.patientsModel = patients;
    this.doctorModel = doctor;
  }

  async add({
    patientId, resolution, docId, spec,
  }) {
    const createdResolution = await this.resolutionsModel.create({
      patientId,
      resolution,
      doctorId: docId,
      speciality: spec,
    });
    return createdResolution.id;
  }

  async getById(resolutionId) {
    const resolution = await this.resolutionsModel.findOne({
      where: {
        id: resolutionId,
      },
    });
    return resolution;
  }

  async getByPatientId(patientId) {
    const reqResolution = await this.resolutionsModel.findAll({
      attributes: ['resolution', 'speciality', 'createdAt'],
      where: {
        patientId,
      },
      include: [{
        model: this.doctorModel,
        as: 'doctor',
        attributes: ['name', 'id'],
      }],
    });
    if (!reqResolution) {
      return false;
    }
    return reqResolution;
  }

  async delete(resolutionId) {
    const deleteValue = await this.resolutionsModel.destroy({
      where: {
        id: resolutionId,
      },
    });
    return deleteValue;
  }

  async getByName(name) {
    const patientlist = await this.resolutionsModel.findAll({
      attributes: ['id', 'resolution', 'speciality', 'createdAt'],
      include: [{
        model: this.patientsModel,
        as: 'patient',
        where: {
          name,
        },
        attributes: ['name', 'gender', 'birthday'],
      },
      {
        model: this.doctorModel,
        as: 'doctor',
        attributes: ['name'],
      }],
    });

    return patientlist;
  }
}
