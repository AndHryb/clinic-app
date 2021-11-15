CREATE TABLE IF NOT EXISTS resolutions (
  id varchar(255),
  resolution varchar(255) NOT NULL,
  specialization_id varchar(255) NOT NULL,
  created_at timestamp NOT NULL,
  updated_at timestamp NOT NULL,
  patient_id varchar(255),
  doctor_id varchar(255),
  PRIMARY KEY (id),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
  ON UPDATE CASCADE
  ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
  ON UPDATE CASCADE
  ON DELETE CASCADE,
  FOREIGN KEY (specialization_id) REFERENCES specializations(id)
  ON UPDATE CASCADE
  ON DELETE CASCADE
);