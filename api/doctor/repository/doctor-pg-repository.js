import { v4 as uuidv4 } from 'uuid';

export default class DoctorPgRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async create(options) {
    const client = await this.pool.connect();
    const { specNames } = options;
    const doctorId = uuidv4();
    const userId = uuidv4();
    try {
      await client.query('BEGIN');
      const sqlUsers = `INSERT INTO users (id, email, password, role) VALUES 
                        ($1, $2, $3, $4);`;
      await client.query(sqlUsers, [userId, options.email, options.password, options.role]);

      const sqlDoctors = `INSERT INTO doctors(id, name, email, userID) VALUES 
                          ($1, $2, $3, $4);`;
      await client.query(sqlDoctors, [doctorId, options.name, options.email, userId]);
      for (const spec of specNames) {
        const sqlSpecs = `INSERT INTO doctors_specializations (doctorId, specializationId)
                        (SELECT $1 AS doctorid, s.id AS specializationid 
                         FROM specializations s
                         WHERE s.name = $2);`;
        await client.query(sqlSpecs, [doctorId, spec]);
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return {
      entity: {
        id: doctorId,
        name: options.name,
        userId,
      },
      user: {
        id: userId,
        email: options.email,
        role: options.role,
      },
    };
  }

  async deleteById(id) {
    const sql = `DELETE FROM users CASCADE
                  WHERE id =  (SELECT d.userid FROM doctors d WHERE d.id = $1);`;
    await this.pool.query(sql, [id]);
    return id;
  }

  async getDoctors() {
    const sql = `SELECT d.name, d.id, s.name as specName
                 FROM 
                 doctors d
                 JOIN doctors_specializations ds
                 ON d.id = ds.doctorId
                 JOIN specializations s
                 ON ds.specializationId = s.id`;
    const res = await this.pool.query(sql);
    return res.rows;
  }

  async getByUserId(userId) {
    const sql = `SELECT name, id
                 FROM doctors
                 WHERE userId = $1;`;
    const res = await this.pool.query(sql, [userId]);
    return res.rows[0];
  }

  async getSpecByUserId(userId) {
    const sql = `SELECT s.name, s.id
                 FROM specializations s
                 JOIN doctors_specializations ds
                 ON ds.specializationId = s.id
                 JOIN doctors d
                 ON ds.doctorId = d.id
                 AND d.userId = $1;`;
    const res = await this.pool.query(sql, [userId]);

    return res.rows;
  }

  async getSpec(docId) {
    const sql = `SELECT d.name, d.id, s.name
                 FROM 
                 doctors d
                 JOIN doctors_specializations ds
                 ON d.id = ds.doctorId
                 JOIN specializations s
                 ON ds.specializationId = s.id`;
    const res = await this.pool.query(sql, [docId]);

    return res.rows[0];
  }

  async setSpecsByName(id, newSpecsList, oldSpecsList) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      for (const spec of oldSpecsList) {
        const sqlDelOld = `DELETE FROM doctors_specializations ds
                           WHERE specializationId = (
                             SELECT s.id FROM specializations s
                             WHERE doctorid = $1
                             AND s.name = $2);`;
        await client.query(sqlDelOld, [id, spec]);
      }
      for (const spec of newSpecsList) {
        const sqlSpecs = `INSERT INTO doctors_specializations (doctorId, specializationId)
                          (SELECT $1 AS doctorid, s.id AS specializationid 
                           FROM specializations s
                           WHERE s.name = $2);`;
        await client.query(sqlSpecs, [id, spec]);
      }

      await client.query('COMMIT');
    } catch (err) {
      console.log(`set specs transaction err ${err}`);
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return newSpecsList;
  }

  async update(doc) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const sqlUserUpdate = `UPDATE users
                             SET email = $2, password = $3
                             WHERE id = $1;`;
      await client.query(sqlUserUpdate, [doc.userid, doc.email, doc.password]);

      const sqlDocUpdate = `UPDATE doctors
                            SET name = $2, email = $3
                            WHERE id = $1;`;
      await client.query(sqlDocUpdate, [doc.id, doc.name, doc.email]);

      await client.query('COMMIT');
    } catch (err) {
      console.log(`set specs transaction err ${err}`);
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return doc;
  }

  async getById(id) {
    const sql = `SELECT * FROM doctors
           WHERE id = $1;`;
    const res = await this.pool.query(sql, [id]);

    return res.rows[0];
  }

  async getAllDependencies(docId) {
    const docSql = `SELECT 
                  d.name,
                  d.userId,
                  u.email,
                  u.password
                  FROM doctors d
                  JOIN users u
                  ON u.id = d.userId
                  AND d.id = $1;`;
    const doctor = await this.pool.query(docSql, [docId]);

    const specsSQL = `SELECT s.name FROM
                      doctors_specializations ds
                      JOIN specializations s
                      ON ds.specializationid = s.id
                      AND $1 = ds.doctorId`;
    const specs = await this.pool.query(specsSQL, [docId]);

    return {
      id: docId,
      ...doctor.rows[0],
      specializations: specs.rows,
    };
  }
}