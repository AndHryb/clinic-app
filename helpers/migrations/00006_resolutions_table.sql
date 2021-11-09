CREATE TABLE IF NOT EXISTS resolutions (
  id varchar(255),
  resolution varchar(255) NOT NULL,
  specializationId varchar(255) NOT NULL,
  createdAt timestamp NOT NULL,
  updatedAt timestamp NOT NULL,
  patientId varchar(255),
  doctorId varchar(255),
  PRIMARY KEY (id),
  FOREIGN KEY (patientId) REFERENCES patients(id)
  ON UPDATE CASCADE
  ON DELETE CASCADE,
  FOREIGN KEY (doctorId) REFERENCES doctors(id)
  ON UPDATE CASCADE
  ON DELETE CASCADE,
  FOREIGN KEY (specializationId) REFERENCES specializations(id)
  ON UPDATE CASCADE
  ON DELETE CASCADE
);