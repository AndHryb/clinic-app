import pkg from 'sequelize';

const { Op } = pkg;

export default class DoctorRepository {
  constructor(sequelize, docModel, specModel, userModel, docSpecModel) {
    this.sequelize = sequelize;
    this.docModel = docModel;
    this.specModel = specModel;
    this.userModel = userModel;
    this.docSpecModel = docSpecModel;
  }

  async create(options) {
    try {
      const result = await this.sequelize.transaction(async (t) => {
        const user = await this.userModel.create({
          email: options.email,
          password: options.password,
          role: options.role,
        }, { transaction: t });

        const doctor = await this.docModel.create({
          name: options.name,
          email: options.email,
          userId: user.id,
        }, { transaction: t });

        const specs = await this.specModel.findAll({
          where: {
            name: {
              [Op.or]: options.specNames,
            },
          },
          transaction: t,
        });

        for (const spec of specs) {
          spec.addDoctor(doctor);
        }
        return { entity: doctor, user };
      });
      return result;
    } catch (err) {
      console.log(`Doctor repository create error ${err.message}`);
      throw err;
    }
  }

  async deleteById(id) {
    const result = await this.sequelize.transaction(async (t) => {
      const doctor = await this.docModel.findOne({
        where: {
          id,
        },
        transaction: t,
      });

      if (!doctor) return false;

      await doctor.destroy();

      await this.userModel.destroy({
        where: {
          id: doctor.userId,
        },
        transaction: t,
      });

      return doctor;
    });

    return result;
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

  async setSpecsByName(doc, newSpecsList, oldSpecsList) {
    const result = await this.sequelize.transaction(async (t) => {
      const specs = await this.specModel.findAll({
        where: {
          name: {
            [Op.or]: newSpecsList,
          },
        },
        transaction: t,
      });

      for (const spec of specs) {
        await spec.addDoctor(doc);
      }

      const brokenBindings = await this.specModel.findAll({
        where: {
          name: {
            [Op.or]: oldSpecsList,
          },
        },
        transaction: t,
      });

      for (const spec of brokenBindings) {
        await spec.removeDoctor(doc);
      }
      await doc.update();

      return doc;
    });

    return result;
  }

  async getById(id) {
    const res = await this.docModel.findByPk(id);
    return res;
  }

  async getAllDependencies(docId) {
    const docData = await this.docModel.findOne({
      where: {
        id: docId,
      },
      include: [
        {
          model: this.specModel,
          as: 'specialties',
        },
        { model: this.userModel },
      ],
    });

    return docData;
  }
}
