export default class UserSqlRepository {
  constructor(model) {
    this.model = model;
  }

  async add(email, password) {
    const user = await this.model.create({
      email,
      password,
    });
    return user;
  }

  async checkEmail(email) {
    const result = await this.model.findOne({
      where: {
        email,
      },
    });

    return result;
  }
}
