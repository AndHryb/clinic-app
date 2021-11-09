export default class UserSqlRepository {
  constructor(model) {
    this.model = model;
  }

  async add(email, password, role) {
    const user = await this.model.create({
      email,
      password,
      role,
    });
    return user;
  }

  async getByEmail(email) {
    const result = await this.model.findOne({
      where: {
        email,
      },
    });

    return result;
  }

  async getById(id) {
    const result = await this.model.findByPk(id);
    return result;
  }
}
