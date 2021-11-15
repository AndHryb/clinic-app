import { v4 as uuidv4 } from 'uuid';

export default class PatienPgRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async create(options) {
    const patientId = uuidv4();
    const userId = uuidv4();
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const sqlUsers = `INSERT INTO users (id, email, password, role) VALUES 
                        ($1, $2, $3, $4);`;
      await client.query(sqlUsers, [userId, options.email, options.password, options.role]);

      const sqlPatients = `INSERT INTO patients(id, name, gender, birthday, user_id) VALUES 
                            ($1, $2, $3, $4, $5);`;
      await client.query(sqlPatients, [
        patientId, options.name, options.gender, options.birthday, userId]);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return {
      id: patientId,
      name: options.name,
      gender: options.gender,
      birthday: options.birthday,
      userId,
      user: {
        id: userId,
        email: options.email,
        role: options.role,
      },
    };
  }

  async getByName(name) {
    const sql = `SELECT * FROM patients
                 WHERE name = $1;`;
    const res = await this.pool.query(sql, [name]);
    return res.rows[0];
  }

  async getById(id) {
    const sql = `SELECT * FROM patients
                 WHERE id = $1;`;
    const res = await this.pool.query(sql, [id]);
    return res.rows[0];
  }

  async delete(id) {
    const sql = `DELETE * FROM patients
                 WHERE id = $1;`;
    const res = await this.pool.query(sql, [id]);
    return res.rows[0];
  }

  async getByUserId(userId) {
    const sql = `SELECT * FROM patients
                 WHERE user_id = $1;`;
    const res = await this.pool.query(sql, [userId]);
    return res.rows[0];
  }
}
