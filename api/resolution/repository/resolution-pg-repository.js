import { v4 as uuidv4 } from 'uuid';

export default class ResolutionPgRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async add(options) {
    const id = uuidv4();
    const date = new Date();
    const sql = `INSERT INTO resolutions 
                (id, resolution, specializationId, createdAt, updatedAt, patientId, doctorId)
                VALUES($1, $2, $3, $4, $4, $5, $6);`;

    await this.pool.query(sql, [
      id, options.resolution, options.spec,
      date, options.patientId, options.docId]);
    return options;
  }

  async getById(id) {
    const sql = `SELECT * FROM resolutions
                  WHERE id = $1;`;
    const res = await this.pool.query(sql, [id]);

    return res.rows[0];
  }

  async getByPatientId(userId) {
    const sql = `SELECT 
                 r.resolution,
                 r.createdat,
                 s.name speciality,
                 d.name doctor
                 FROM resolutions r
                 JOIN patients p
                 ON r.patientid = p.id
                 AND p.userId = $1
                 JOIN specializations s
                 ON r.specializationId = s.id
                 JOIN doctors d
                 ON r.doctorId = d.id;`;
    const res = await this.pool.query(sql, [userId]);
    return res.rows;
  }

  async delete(id) {
    const sql = `DELETE FROM resolutions
                  WHERE id = $1;`;
    await this.pool.query(sql, [id]);
    return id;
  }

  async getByName(name) {
    const sql = `SELECT DISTINCT
                 r.id,
                 r.resolution,
                 s.name specialization,
                 r.createdAt,
                 p.name,
                 p.gender,
                 d.name doctor
                 FROM resolutions r
                 JOIN patients p
                 ON p.name = $1
                 JOIN specializations s
                 ON s.id = r.specializationId
                 JOIN doctors d
                 ON d.id = r.doctorId;`;
    const res = await this.pool.query(sql, [name]);

    return res.rows;
  }
}
