CREATE TABLE IF NOT EXISTS doctors_specializations (
  doctorId varchar(255) NOT NULL,
  specializationId varchar(255) NOT NULL,
  PRIMARY KEY (doctorId,specializationId),
  FOREIGN KEY (doctorId) REFERENCES doctors(id)
  ON UPDATE CASCADE
  ON DELETE CASCADE,
  FOREIGN KEY (specializationId) REFERENCES specializations(id)
  ON UPDATE CASCADE
  ON DELETE CASCADE
);