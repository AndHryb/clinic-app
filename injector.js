import QueueController from './api/queue/queue-controller.js';
import ResolutionController from './api/resolution/resolution-controller.js';
import UserController from './api/auth/user-controller.js';
import DoctorController from './api/doctor/doctor-controller.js';

import QueueService from './api/queue/queue-service.js';
import ResolutionService from './api/resolution/resolution-service.js';
import UserService from './api/auth/user-service.js';
import DoctorService from './api/doctor/doctor-service.js';

import UserPgRepository from './api/auth/user-pg-repository.js';
import DoctorPgRepository from './api/doctor/doctor-pg-repository.js';
import PatienPgRepository from './api/patient/patient-pg-repository.js';
import ResolutionPgRepository from './api/resolution/resolution-pg-repository.js';

import QueueRedisRepository from './api/queue/queue-redis-repository.js';
import DoctorRedisRepository from './api/doctor/doctor-redis-repository.js';
import redisInit from './config-data-bases/redis/redis-init.js';
import { TTL } from './constants.js';

import pool from './config-data-bases/postgres/postgres-init.js';
import envConfig from './config.js';

class Injector {
  constructor(mode) {
    if (mode === 'test') {
      this.resolutionRepository = new ResolutionPgRepository();
      this.patientRepository = new PatienPgRepository();
      this.userRepository = new UserPgRepository();
      this.doctorRepository = new DoctorPgRepository();
      this.doctorRedisRepository = new DoctorRedisRepository();
      this.queueRepository = new QueueRedisRepository();
    } else {
      const redisClient = redisInit(envConfig.redis.port, envConfig.redis.host);
      this.resolutionRepository = new ResolutionPgRepository(pool);
      this.patientRepository = new PatienPgRepository(pool);
      this.userRepository = new UserPgRepository(pool);
      this.doctorRepository = new DoctorPgRepository(pool);
      this.queueRepository = new QueueRedisRepository(redisClient);
      this.doctorRedisRepository = new DoctorRedisRepository(redisClient);
    }

    this.queueService = new QueueService(
      this.patientRepository,
      this.queueRepository,
      this.doctorRepository,
    );
    this.resolutionServise = new ResolutionService(
      this.queueRepository,
      this.resolutionRepository,
      this.patientRepository,
      TTL,
    );
    this.userService = new UserService(
      this.userRepository,
      this.patientRepository,
      this.doctorRepository,
      this.doctorRedisRepository,
    );
    this.doctorService = new DoctorService(
      this.doctorRepository,
      this.doctorRedisRepository,
    );
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
export { injector as default };
