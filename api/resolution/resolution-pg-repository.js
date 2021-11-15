import { v4 as uuidv4 } from 'uuid';

export default class ResolutionPgRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async add(options) {
    const id = uuidv4();
    const date = new Date();
    const sql = `INSERT INTO resolutions 
                (id, resolution, specialization_id, created_at, updated_at, patient_id, doctor_id)
                VALUES($1, $2, $3, $4, $4, $5, $6)
                RETURNING 
                id,
                resolution,
                specialization_id "specializationId",
                created_at "createdAt",
                updated_at "updatedAt",
                patient_id "patientId",
                doctor_id "doctorId"
                ;`;

    const res = await this.pool.query(sql, [
      id, options.resolution, options.specId,
      date, options.patientId, options.docId]);
    return res.rows[0];
  }

  async getById(id) {
    const sql = `SELECT 
                  id,
                  resolution,
                  specialization_id "specializationId",
                  created_at "createdAt",
                  updated_at "updatedAt",
                  patient_id "patientId",
                  doctor_id "doctorId" 
                  FROM resolutions
                  WHERE id = $1;`;
    const res = await this.pool.query(sql, [id]);

    return res.rows[0];
  }

  async getByPatientId(userId) {
    const sql = `SELECT 
                 r.resolution,
                 r.created_at "createdAt",
                 s.name speciality,
                 d.name doctor
                 FROM resolutions r
                 JOIN patients p
                 ON r.patient_id = p.id
                 AND p.user_id = $1
                 JOIN specializations s
                 ON r.specialization_id = s.id
                 JOIN doctors d
                 ON r.doctor_id = d.id;`;
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
                 r.created_at  "createdAt",
                 p.name,
                 p.gender,
                 d.name doctor
                 FROM resolutions r
                 JOIN patients p
                 ON p.name = $1
                 JOIN specializations s
                 ON s.id = r.specialization_id
                 JOIN doctors d
                 ON d.id = r.doctor_id;`;
    const res = await this.pool.query(sql, [name]);

    return res.rows;
  }
}
