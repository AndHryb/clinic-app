import bcrypt from 'bcryptjs';
import SequelizeMock from 'sequelize-mock';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import UserService from '../service/user-service.js';
import UserSqlRepository from '../repository/user-sql-repository.js';
import PatientSqlRepository from '../../patient/repository/patient-sql-repository.js';
import DoctorRepository from '../../doctor/repository/doctor-repository.js';
import DoctorRedisRepository from '../../doctor/repository/doctor-redis-repository.js';
import ApiError from '../../../middleware/error-handling/ApiError.js';
import { MESSAGES, STATUSES } from '../../../constants.js';

const patientsSQLDBMock = new SequelizeMock();
const usersSQLDBMock = new SequelizeMock();
const doctorSQLDBMock = new SequelizeMock();

const patientSqlRepository = new PatientSqlRepository(patientsSQLDBMock);
const userSqlRepository = new UserSqlRepository(usersSQLDBMock);
const doctorSqlRepository = new DoctorRepository(doctorSQLDBMock);
const doctorRedisRepository = new DoctorRedisRepository();
const userService = new UserService(
  userSqlRepository,
  patientSqlRepository,
  doctorSqlRepository,
  doctorRedisRepository,
);

describe('user service unit test', () => {
  let testTime;
  let regDataPatient;
  let regDataDoctor;
  let userDataPatient;
  let userDataDoctor;
  let patientData;
  let doctorData;
  let payload;
  let regResPatient;
  let regResDoctor;
  let serverErr;
  let myError;

  beforeEach(() => {
    dotenv.config();
    testTime = new Date().getTime();
    regDataPatient = {
      email: 'aaa@list',
      password: '1111',
      name: 'Andrei',
      birthday: 730080000000,
      gender: 'male',
      role: 'patient',
    };
    regDataDoctor = {
      email: 'aaa@list',
      password: '1111',
      name: 'Andrei',
      role: 'doctor',
      specNames: ['surgery', 'gynecology'],
    };

    userDataPatient = {
      id: '333',
      email: 'aaa@list',
      password: '1111',
      role: 'patient',
      createdAt: testTime,
      updatedAt: testTime,
    };
    userDataDoctor = {
      id: '333',
      email: 'aaa@list',
      password: '1111',
      role: 'doctor',
      createdAt: testTime,
      updatedAt: testTime,
    };
    patientData = {
      id: '111',
      name: 'Andrei',
      birthday: 730080000000,
      gender: 'male',
      userId: '333',
      createdAt: testTime,
      updatedAt: testTime,
    };
    doctorData = {
      id: '111',
      name: 'Andrei',
      userId: '333',
      createdAt: testTime,
      updatedAt: testTime,
    };
    payload = {
      userId: '222',
      role: 'patient',
    };
    regResPatient = {
      entity: patientData,
      user: userDataPatient,
    };

    regResDoctor = {
      entity: doctorData,
      user: userDataDoctor,
    };
    serverErr = new Error('some error');
    myError = ApiError.forbidden('foo');
  });

  test('registration test(patient role)', async () => {
    userSqlRepository.getByEmail = jest.fn(() => false);
    patientSqlRepository.create = jest.fn(() => regResPatient);
    doctorSqlRepository.create = jest.fn();
    doctorRedisRepository.add = jest.fn();
    const res = await userService.registration(regDataPatient);
    expect(res.entity).toEqual(patientData);
    expect(jwt.verify(res.token, process.env.JWT_KEY, (err, decoded) => decoded))
      .toMatchObject({
        email: 'aaa@list',
        role: 'patient',
        userId: '333',
      });
    expect(doctorSqlRepository.create).not.toHaveBeenCalled();
    expect(doctorRedisRepository.add).not.toHaveBeenCalled();
  });

  test('registration test (doctor role)', async () => {
    userSqlRepository.getByEmail = jest.fn(() => false);
    doctorSqlRepository.create = jest.fn(() => regResDoctor);
    doctorRedisRepository.add = jest.fn(() => true);
    patientSqlRepository.create = jest.fn();
    const res = await userService.registration(regDataDoctor);
    expect(res.entity).toEqual(doctorData);
    expect(jwt.verify(res.token, process.env.JWT_KEY, (err, decoded) => decoded))
      .toMatchObject({
        email: 'aaa@list',
        role: 'doctor',
        userId: '333',
      });
    expect(patientSqlRepository.create).not.toHaveBeenCalled();
  });

  test('registration test(email in base doctor case)', async () => {
    try {
      userSqlRepository.getByEmail = jest.fn(() => true);
      doctorSqlRepository.create = jest.fn();
      doctorRedisRepository.add = jest.fn();
      await userService.registration(regDataDoctor);
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.message).toBe(MESSAGES.EMAIL_EXIST);
      expect(err.statusCode).toBe(STATUSES.Conflict);
      expect(doctorSqlRepository.create).not.toHaveBeenCalled();
      expect(doctorRedisRepository.add).not.toHaveBeenCalled();
    }
  });

  test('registration test(email in base patient case)', async () => {
    try {
      userSqlRepository.getByEmail = jest.fn(() => true);
      patientSqlRepository.create = jest.fn();
      await userService.registration(regDataPatient);
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.message).toBe(MESSAGES.EMAIL_EXIST);
      expect(err.statusCode).toBe(STATUSES.Conflict);
      expect(patientSqlRepository.create).not.toHaveBeenCalled();
    }
  });

  test('registration test(some error)', async () => {
    try {
      userSqlRepository.getByEmail = jest.fn(() => { throw serverErr; });
      await userService.registration(regDataPatient);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });

  test('login (patient case)', async () => {
    const salt = bcrypt.genSaltSync(10);
    userDataPatient.password = bcrypt.hashSync(userDataPatient.password, salt);
    userSqlRepository.getByEmail = jest.fn(() => userDataPatient);
    const res = await userService.login(regDataPatient);
    expect(res.role).toEqual('patient');
    expect(jwt.verify(res.token, process.env.JWT_KEY, (err, decoded) => decoded))
      .toMatchObject({
        email: 'aaa@list',
        role: 'patient',
        userId: '333',
      });
  });

  test('login (doctor case)', async () => {
    const salt = bcrypt.genSaltSync(10);
    userDataDoctor.password = bcrypt.hashSync(userDataDoctor.password, salt);
    userSqlRepository.getByEmail = jest.fn(() => userDataDoctor);
    const res = await userService.login(regDataDoctor);
    expect(res.role).toEqual('doctor');
    expect(jwt.verify(res.token, process.env.JWT_KEY, (err, decoded) => decoded))
      .toMatchObject({
        email: 'aaa@list',
        role: 'doctor',
        userId: '333',
      });
  });

  test('login, email doesn\'t match', async () => {
    try {
      userSqlRepository.getByEmail = jest.fn(() => false);
      await userService.login(regDataPatient);
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.message).toBe(MESSAGES.EMAIL_NOT_FOUND);
      expect(err.statusCode).toBe(STATUSES.Unauthorized);
    }
  });

  test('login, password doesn\'t match', async () => {
    try {
      userSqlRepository.getByEmail = jest.fn(() => userDataPatient);
      bcrypt.compareSync = jest.fn(() => false);
      await userService.login(regDataPatient);
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.message).toBe(MESSAGES.PASSWORD_NOT_MATCH);
      expect(err.statusCode).toBe(STATUSES.Unauthorized);
    }
  });

  test('login,(some error)', async () => {
    try {
      userSqlRepository.getByEmail = jest.fn(() => userDataPatient);
      bcrypt.compareSync = jest.fn(() => { throw serverErr; });
      await userService.login(regDataPatient);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });

  test('get by userId ', async () => {
    patientSqlRepository.getByUserId = jest.fn(() => patientData);
    const res = await userService.getByUserId(payload);
    expect(res).toEqual(patientData);
  });

  test('get by userId, doesn\'t match ', async () => {
    patientSqlRepository.getByUserId = jest.fn(() => false);
    const res = await userService.getByUserId(payload);
    expect(res).toEqual(false);
  });

  test('get by userId, some error ', async () => {
    try {
      patientSqlRepository.getByUserId = jest.fn(() => { throw serverErr; });
      await userService.getByUserId(payload);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });

  test('get by userId, handled error ', async () => {
    try {
      patientSqlRepository.getByUserId = jest.fn(() => { throw myError; });
      await userService.getByUserId(payload);
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.message).toBe('foo');
    }
  });

  test('create token ', async () => {
    const res = UserService.createToken(userDataPatient);
    expect(jwt.verify(res, process.env.JWT_KEY, (err, decoded) => decoded))
      .toMatchObject({
        email: 'aaa@list',
        role: 'patient',
        userId: '333',
      });
  });

  test('create token(some error) ', async () => {
    try {
      jwt.sign = jest.fn(() => { throw serverErr; });
      UserService.createToken(userDataPatient);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });

  test('create patient ', async () => {
    patientSqlRepository.create = jest.fn(() => regResPatient);
    const res = await userService.createPatient(regDataPatient);
    expect(res.entity).toEqual(patientData);
    expect(res.user).toEqual(userDataPatient);
  });

  test('create patient (some error)', async () => {
    try {
      patientSqlRepository.create = jest.fn(() => { throw serverErr; });
      await userService.createPatient(regDataPatient);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });

  test('create doctor ', async () => {
    doctorSqlRepository.create = jest.fn(() => regResDoctor);
    const res = await userService.createDoctor(regDataDoctor);
    expect(res.entity).toEqual(doctorData);
    expect(res.user).toEqual(userDataDoctor);
  });

  test('create doctor (some error)', async () => {
    try {
      doctorSqlRepository.create = jest.fn(() => { throw serverErr; });
      await userService.createDoctor(regDataDoctor);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });
});
