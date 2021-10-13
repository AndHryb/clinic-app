export default class DoctorRepository {
  constructor(docModel, specModel) {
    this.docModel = docModel;
    this.specModel = specModel;
  }

  async getDoctors() {
    const res = await this.docModel.findAll({
      attributes: ['name', 'id'],
      include: [
        {
          model: this.specModel,
          as: 'specialties',
          attributes: ['name'],
        },
      ],
    });
    return res;
  }

  async getByUserId(userId) {
    const res = await this.docModel.findOne({
      attributes: ['name', 'id'],
      where: {
        userId,
      },
    });

    return res;
  }

  async getSpecByUserId(userId) {
    const res = await this.specModel.findAll({
      attributes: ['name', 'id'],
      include:  [
        {
          model: this.docModel,
          as: 'doctors',
          attributes: ['name'],
          where: {
                userId,
              },
        },
      ],

    });
  
    return res;
  }

  async getSpec(docId) {
    const res = await this.docModel.findOne({
      where: {
        id: docId,
      },
      include: [
        {
          model: this.specModel,
          as: 'specialties',
          attributes: ['name'],
        },
      ],
    });
    return res;
  }

  async getById(id) {
    const res = await this.docModel.findByPk(id);
    return res;
  }
}
