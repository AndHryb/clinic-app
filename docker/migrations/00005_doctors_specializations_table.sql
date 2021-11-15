CREATE TABLE IF NOT EXISTS doctors_specializations (
  doctor_id varchar(255) NOT NULL,
  specialization_id varchar(255) NOT NULL,
  PRIMARY KEY (doctor_id,specialization_id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
  ON UPDATE CASCADE
  ON DELETE CASCADE,
  FOREIGN KEY (specialization_id) REFERENCES specializations(id)
  ON UPDATE CASCADE
  ON DELETE CASCADE
);