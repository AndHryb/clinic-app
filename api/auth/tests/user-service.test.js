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

jest.mock('../repository/user-sql-repository.js');
jest.mock('../../patient/repository/patient-sql-repository.js');
jest.mock('../../doctor/repository/doctor-repository.js');
jest.mock('../../doctor/repository/doctor-redis-repository.js');

describe('user service unit test', () => {
  let testTime;
  let regData;
  let userData;
  let patientData;
  let payload;
  let regResPatient;
  let regResDoctor;
  let serverErr;
  let myError;

  beforeEach(() => {
    dotenv.config();
    testTime = new Date().getTime();
    regData = {
      email: 'andryigr@mail.com',
      password: '1111',
      name: 'Andrei',
      birthday: 730080000000,
      gender: 'male',
    };
    userData = {
      id: '333',
      email: 'aaa@list',
      password: '1111',
      role: 'patient',
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
    payload = {
      userId: '222',
      role: 'patient',
    };
    regResPatient = {
      patient: patientData,
      user: userData,
    };

    regResDoctor = {
      doctor: patientData,
      user: userData,
    };
    serverErr = new Error('some error');
    myError = ApiError.forbidden('foo');
  });

  test('registration test', async () => {
    userSqlRepository.getByEmail.mockResolvedValue(false);
    patientSqlRepository.create.mockResolvedValue(regResPatient);
    const res = await userService.registration(regData);
    expect(res.patient).toEqual(patientData);
    expect(jwt.verify(res.token, process.env.JWT_KEY, (err, decoded) => decoded))
      .toMatchObject({
        email: 'aaa@list',
        role: 'patient',
        userId: '333',
      });
  });

  test('registration test(email in base)', async () => {
    try {
      userSqlRepository.getByEmail = jest.fn(() => { throw myError; });
      await userService.registration(regData);
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.message).toBe('foo');
      expect(err.statusCode).toBe(STATUSES.Forbidden);
    }
  });

  test('registration test(some error)', async () => {
    try {
      userSqlRepository.getByEmail = jest.fn(() => { throw serverErr; });
      await userService.registration(regData);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });

  test('registration doctor test', async () => {
    userSqlRepository.getByEmail.mockResolvedValue(false);
    doctorSqlRepository.create.mockResolvedValue(regResDoctor);
    doctorRedisRepository.add.mockResolvedValue(true);
    const res = await userService.registrationDoctor(regData);
    expect(doctorRedisRepository.add).toBeCalled();
    expect(res.doctor).toEqual(patientData);
    expect(jwt.verify(res.token, process.env.JWT_KEY, (err, decoded) => decoded))
      .toMatchObject({
        email: 'aaa@list',
        role: 'patient',
        userId: '333',
      });
  });

  test('registration doctor test(email in base)', async () => {
    try {
      userSqlRepository.getByEmail = jest.fn(() => true);
      await userService.registrationDoctor(regData);
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.message).toBe(MESSAGES.EMAIL_EXIST);
      expect(err.statusCode).toBe(STATUSES.Conflict);
    }
  });

  test('registration doctor test(some error)', async () => {
    try {
      userSqlRepository.getByEmail = jest.fn(() => { throw serverErr; });
      await userService.registrationDoctor(regData);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });

  test('login', async () => {
    const salt = bcrypt.genSaltSync(10);
    userData.password = bcrypt.hashSync(userData.password, salt);
    userSqlRepository.getByEmail.mockResolvedValue(userData);
    const res = await userService.login(regData);
    expect(res.role).toEqual('patient');
    expect(jwt.verify(res.token, process.env.JWT_KEY, (err, decoded) => decoded))
      .toMatchObject({
        email: 'aaa@list',
        role: 'patient',
        userId: '333',
      });
  });

  test('login, email doesn\'t match', async () => {
    try {
      userSqlRepository.getByEmail = jest.fn(() => { throw myError; });
      await userService.login(regData);
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.message).toBe('foo');
      expect(err.statusCode).toBe(STATUSES.Forbidden);
    }
  });

  test('login, password doesn\'t match', async () => {
    try {
      userSqlRepository.getByEmail = jest.fn(() => { throw myError; });
      bcrypt.compareSync = jest.fn(() => false);
      await userService.login(regData);
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.message).toBe('foo');
      expect(err.statusCode).toBe(STATUSES.Forbidden);
    }
  });

  test('login,(some error)', async () => {
    try {
      userSqlRepository.getByEmail.mockResolvedValue(userData);
      bcrypt.compareSync = jest.fn(() => { throw serverErr; });
      const res = await userService.login(regData);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });

  test('get by userId ', async () => {
    patientSqlRepository.getByUserId.mockResolvedValue(patientData);
    const res = await userService.getByUserId(payload);
    expect(res).toEqual(patientData);
  });

  test('get by userId, doesn\'t match ', async () => {
    patientSqlRepository.getByUserId.mockResolvedValue(false);
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
    const res = UserService.createToken(userData);
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
      const res = UserService.createToken(userData);
      expect(res).toEqual('111');
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });
});
