USE clinic_db;

CREATE TABLE IF NOT EXISTS `doctorsSpecializations` (
  `doctorId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `specializationId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`doctorId`,`specializationId`),
  UNIQUE KEY `doctorsSpecializations_specializationId_doctorId_unique` (`doctorId`,`specializationId`),
  KEY `specializationId` (`specializationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;