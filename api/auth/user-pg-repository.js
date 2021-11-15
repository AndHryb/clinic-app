import { v4 as uuidv4 } from 'uuid';

export default class UserPgRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async add(email, password, role) {
    const id = uuidv4();
    const sql = `INSERT INTO users (id, email, password, role) VALUES (
        $1, $2, $3, $4
        );`;
    await this.pool.query(sql, [id, email, password, role]);
    return {
      id, email, password, role,
    };
  }

  async getByEmail(email) {
    const sql = `SELECT * FROM users
    WHERE users.email = $1;`;
    const { rows } = await this.pool.query(sql, [email]);
    const [result] = rows;
    return result;
  }

  async getById(id) {
    const sql = `SELECT * FROM users
    WHERE users.id = $1;`;
    const { rows } = await this.pool.query(sql, [id]);
    const [result] = rows;
    return result;
  }
}
