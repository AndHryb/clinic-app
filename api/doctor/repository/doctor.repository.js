import bcrypt from 'bcryptjs';

export default class DoctorRepository {
  constructor(sequelize, docModel, specModel, userModel) {
    this.sequelize = sequelize;
    this.docModel = docModel;
    this.specModel = specModel;
    this.userModel = userModel;
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
              name: elem,
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
    const result = await this.sequelize.transaction(async (t) => {
      const doctor = await this.docModel.findOne({
        where: {
          id: options.id,
        },
        transaction: t,
      });

      const user = await this.userModel.findByPk(doctor.userId);

      if (doctor.name !== options.name && options.name) {
        doctor.name = options.name;
      }
      if (doctor.email !== options.email && options.email) {
        doctor.email = options.email;
        user.email = options.email;
      }
      if (options.oldPassword && options.newPassword) {
        const resultPassword = bcrypt.compareSync(options.oldPassword, user.password);
        console.log(resultPassword);
        if (resultPassword) {
          const salt = bcrypt.genSaltSync(10);
          user.password = bcrypt.hashSync(options.newPassword, salt);
        }
      }
      if (options.specNames) {
        for (const elem of options.specNames) {
          await this.specModel.findOrCreate({
            where: {
              name: elem,
            },
            defaults: {
              name: elem,
            },
            transaction: t,
          });
        }
      }
      await doctor.save();
      await user.save();
      return doctor;
    });

    if (options.specNames) {
      for (const elem of options.specNames) {
        const spec = await this.specModel.findOne({
          where: {
            name: elem,
          },
        });
        const doc = await this.docModel.findOne({
          where: {
            id: options.id,
          },
        });
        await spec.addDoctor(doc);
      }
    }
    return result;
  }

  async deleteById(id) {
    const result = await this.sequelize.transaction(async (t) => {
      const doctor = await this.docModel.findOne({
        where: {
          id,
        },
        transaction: t,
      });

      const user = await this.userModel.findOne({
        where: {
          id: doctor.userId,
        },
        transaction: t,
      });
      await doctor.destroy();
      await user.destroy();

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

  async getById(id) {
    const res = await this.docModel.findByPk(id);
    return res;
  }
}
