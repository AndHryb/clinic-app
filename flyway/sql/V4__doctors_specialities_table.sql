USE clinic_db;

CREATE TABLE IF NOT EXISTS `Doctors_Specialities` (
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `doctorsSQLDBId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `specialtiesSQLDBId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`doctorsSQLDBId`,`specialtiesSQLDBId`),
  KEY `specialtiesSQLDBId` (`specialtiesSQLDBId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;