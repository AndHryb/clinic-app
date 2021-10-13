import QueueController from './api/queue/controllers/queue-controller.js';
import ResolutionController from './api/resolution/controllers/resolution-controller.js';
import UserController from './api/auth/controller/user-controller.js';
import DoctorController from './api/doctor/controller/doctor.controller.js';
import QueueService from './api/queue/service/queue-service.js';
import ResolutionService from './api/resolution/service/resolution-service.js';
import UserService from './api/auth/service/user-service.js';
import DoctorService from './api/doctor/service/doctor.service.js';
import QueueRedisRepository from './api/queue/repository/queue-redis-repository.js';
import ResolutionSqlRepository from './api/resolution/repository/resolution-sql-repository.js';
import PatientSqlRepository from './api/patient/repository/patient-sql-repository.js';
import UserSqlRepository from './api/auth/repository/user-sql-repository.js';
import DoctorRepository from './api/doctor/repository/doctor.repository.js';
import sequelizeInit from './config-data-bases/sequelize/sequelize-init.js';
import redisInit from './config-data-bases/redis/redis-init.js';
import { TTL } from './constants.js';

class Injector {
  constructor(mode) {
    if (mode === 'test') {
      this.resolutionRepository = new ResolutionSqlRepository();
      this.patientRepository = new PatientSqlRepository();
      this.userRepository = new UserSqlRepository();
      this.doctorRepository = new DoctorRepository();
      this.queueRepository = new QueueRedisRepository();
    } else {
      const sequelize = sequelizeInit();
      const {
        resolutionsSQLDB, patientsSQLDB, usersSQLDB, doctorsSQLDB, specialtiesSQLDB,
      } = sequelize.models;
      this.resolutionRepository = new ResolutionSqlRepository(
        resolutionsSQLDB, patientsSQLDB, doctorsSQLDB,
      );
      this.patientRepository = new PatientSqlRepository(patientsSQLDB, resolutionsSQLDB);
      this.userRepository = new UserSqlRepository(usersSQLDB);
      this.doctorRepository = new DoctorRepository(doctorsSQLDB, specialtiesSQLDB);
      const client = redisInit();
      this.queueRepository = new QueueRedisRepository(client);
    }

    this.queueService = new QueueService(
      this.patientRepository, this.queueRepository, this.doctorRepository
    );
    this.resolutionServise = new ResolutionService(
      this.queueRepository, this.resolutionRepository, this.patientRepository, TTL,
    );
    this.userService = new UserService(
      this.userRepository, this.patientRepository, this.doctorRepository,
    );
    this.doctorService = new DoctorService(this.doctorRepository);
    this.queueController = new QueueController(
      this.queueService, this.userService, this.doctorService,
    );
    this.resolutionController = new ResolutionController(
      this.resolutionServise, this.doctorService,
    );
    this.userController = new UserController(this.userService);
    this.doctorController = new DoctorController(this.doctorService);
  }

  getQueueController() {
    return this.queueController;
  }

  getResolutionController() {
    return this.resolutionController;
  }

  getUserController() {
    return this.userController;
  }

  getDoctorController() {
    return this.doctorController;
  }
}
const injector = new Injector(process.env.NODE_ENV);
export { injector };
