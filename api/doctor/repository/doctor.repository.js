export default class DoctorRepository {
  constructor(sequelize, docModel, specModel) {
    this.sequelize = sequelize;
    this.docModel = docModel;
    this.specModel = specModel;
  }

  async create(options) {
    try {
      const result = await this.sequelize.transaction(async (t) => {
        const doctor = await this.docModel.create({
          name: options.name,
          email: options.email,
          userId: options.userId,
        }, { transaction: t });

        for (const elem of options.specNames) {
          await this.specModel.findOrCreate({
            where: {
              name: elem,
            },
            defaults: {
              name: options.elem,
            },
            transaction: t,
          });
        }
        return doctor;
      });

      for (const elem of options.specNames) {
        const spec = await this.specModel.findOne({
          where: {
            name: elem,
          },
        });
        const doc = await this.docModel.findOne({
          where: {
            name: options.name,
          },
        });
        await spec.addDoctor(doc);
      }
      return result;
    } catch (err) {
      console.log(`Doctor repository create tranzaction ${err.message}`);
      throw err;
    }
  }

  async updateById(options) {
    const { id, name, email } = options;
    const doctor = await this.docModel.findOne({
      where: {
        id,
      },
    });
    if (doctor.name !== name && name) {
      doctor.name = name;
    }
    if (doctor.email !== email && email) {
      doctor.email = email;
    }
    await doctor.save();

    return doctor;
  }

  async deleteById(id) {
    const doctor = await this.docModel.findOne({
      where: {
        id,
      },
    });
    await doctor.destroy();

    return doctor;
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
      include: [
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
