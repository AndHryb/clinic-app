import bcrypt from 'bcryptjs';
import SequelizeMock from 'sequelize-mock';
import jwt from 'jsonwebtoken';
import UserService from '../service/user-service.js';
import UserSqlRepository from '../repository/user-sql-repository.js';
import PatientSqlRepository from '../../patient/repository/patient-sql-repository.js';
import DoctorRepository from '../../doctor/repository/doctor.repository.js';
// import decodeToken from '../../../helpers/decode-token.js';
import checkJwtToken from '../../../helpers/decode-token.js';
import ApiError from '../../../error_handling/ApiError.js';
import { MESSAGES, STATUSES } from '../../../constants.js';

const patientsSQLDBMock = new SequelizeMock();
const usersSQLDBMock = new SequelizeMock();
const doctorSQLDBMock = new SequelizeMock();

const patientSqlRepository = new PatientSqlRepository(patientsSQLDBMock);
const userSqlRepository = new UserSqlRepository(usersSQLDBMock);
const doctorSqlRepository = new DoctorRepository(doctorSQLDBMock);
const userService = new UserService(userSqlRepository, patientSqlRepository, doctorSqlRepository);

jest.mock('../repository/user-sql-repository.js');
jest.mock('../../patient/repository/patient-sql-repository.js');
jest.mock('../../doctor/repository/doctor.repository.js');
jest.mock('../../../helpers/decode-token.js');
// jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('user service unit test', () => {
  let testTime;
  let regData;
  let userData;
  let patientData;
  let payload;
  let serverErr;

  beforeEach(() => {
    testTime = new Date().getTime();
    regData = {
      email: 'andryigr@gmail.com',
      password: '1111',
      name: 'Andrei',
      birthday: 730080000000,
      gender: 'male',
    };
    userData = {
      id: '333',
      email: 'aaa@list',
      password: '1111',
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
    serverErr = new Error('some error');
  });

  test('registration test', async () => {
    userSqlRepository.checkEmail.mockResolvedValue(false);
    userSqlRepository.add.mockResolvedValue(userData);
    patientSqlRepository.add.mockResolvedValue(patientData);
    userService.createPatientToken = jest.fn(() => 'valid_token_111');
    const res = await userService.registration(regData);
    expect(res).toEqual('valid_token_111');
  });

  test('registration test(email in base)', async () => {
    userSqlRepository.checkEmail.mockResolvedValue(true);
    const res = await userService.registration(regData);
    expect(res).toBeInstanceOf(ApiError);
    expect(res.message).toBe(MESSAGES.EMAIL_EXIST);
    expect(res.statusCode).toBe(STATUSES.Conflict);
  });

  test('registration test(some error)', async () => {
    userSqlRepository.checkEmail = jest.fn(() => { throw serverErr; });
    const res = await userService.registration(regData);
    expect(res).toBeInstanceOf(Error);
    expect(res.message).toBe('some error');
  });

  test('login', async () => {
    const salt = bcrypt.genSaltSync(10);
    userData.password = bcrypt.hashSync(userData.password, salt);
    userSqlRepository.checkEmail.mockResolvedValue(userData);
    userService.createPatientToken = jest.fn(() => 'valid_token_111');
    const res = await userService.login(regData);
    expect(res).toEqual('valid_token_111');
  });

  test('login, email doesn\'t match', async () => {
    userSqlRepository.checkEmail.mockResolvedValue(false);
    const res = await userService.login(regData);
    expect(res).toBeInstanceOf(ApiError);
    expect(res.message).toBe(MESSAGES.EMAIL_NOT_FOUND);
    expect(res.statusCode).toBe(STATUSES.Unauthorized);
  });

  test('login, password doesn\'t match', async () => {
    userSqlRepository.checkEmail.mockResolvedValue(userData);
    bcrypt.compareSync = jest.fn(() => false);
    const res = await userService.login(regData);
    expect(res).toBeInstanceOf(ApiError);
    expect(res.message).toBe(MESSAGES.PASSWORD_NOT_MATCH);
    expect(res.statusCode).toBe(STATUSES.Unauthorized);
  });

  test('get by token (patient)', async () => {
    await checkJwtToken.mockResolvedValue(payload);
    patientSqlRepository.getByUserId.mockResolvedValue(patientData);
    const res = await userService.getByToken('111fff');
    expect(res).toEqual(patientData);
  });

  test('get by token (doctor)', async () => {
    payload.role = 'doctor';
    await checkJwtToken.mockResolvedValue(payload);
    doctorSqlRepository.getByUserId.mockResolvedValue(patientData);
    const res = await userService.getByToken('111fff');
    expect(res).toEqual(patientData);
  });

  test('get by token, id doesn\'t match', async () => {
    await checkJwtToken.mockResolvedValue(payload);
    payload.role = 'patient';
    patientSqlRepository.getByUserId.mockResolvedValue(false);
    const res = await userService.getByToken('111fff');
    expect(res).toEqual(false);
  });

  test('get by token, some error', async () => {
    await checkJwtToken.mockResolvedValue(payload);
    payload.role = 'patient';
    patientSqlRepository.getByUserId = jest.fn(() => { throw serverErr; });
    const res = await userService.getByToken('111fff');
    expect(res).toBeInstanceOf(Error);
    expect(res.message).toBe('some error');
  });

  test('get by userId ', async () => {
    patientSqlRepository.getByUserId.mockResolvedValue(patientData);
    const res = await userService.getByUserId('111');
    expect(res).toEqual(patientData);
  });

  test('get by userId, doesn\'t match ', async () => {
    patientSqlRepository.getByUserId.mockResolvedValue(false);
    const res = await userService.getByUserId('111');
    expect(res).toEqual(false);
  });

  test('get by userId, some error ', async () => {
    patientSqlRepository.getByUserId = jest.fn(() => { throw serverErr; });
    const res = await userService.getByUserId('111');
    expect(res).toBeInstanceOf(Error);
    expect(res.message).toBe('some error');
  });

  test('doctor login', async () => {
    userSqlRepository.checkEmail.mockResolvedValue(userData);
    bcrypt.compare = jest.fn(() => true);
    userService.createDoctorToken = jest.fn(() => 'valid_token_111');
    const res = await userService.doctorLogin(regData.email, regData.password);
    expect(res).toEqual('valid_token_111');
  });

  test('doctor login, email doesn\'t match', async () => {
    userSqlRepository.checkEmail.mockResolvedValue(false);
    const res = await userService.doctorLogin(regData.email, regData.password);
    expect(res).toBeInstanceOf(ApiError);
    expect(res.message).toBe(MESSAGES.EMAIL_NOT_FOUND);
    expect(res.statusCode).toBe(STATUSES.Unauthorized);
  });

  test('doctor login, password doesn\'t match', async () => {
    userSqlRepository.checkEmail.mockResolvedValue(userData);
    bcrypt.compare = jest.fn(() => false);
    const res = await userService.doctorLogin(regData.email, regData.password);
    expect(res).toBeInstanceOf(ApiError);
    expect(res.message).toBe(MESSAGES.PASSWORD_NOT_MATCH);
    expect(res.statusCode).toBe(STATUSES.Unauthorized);
  });
});
