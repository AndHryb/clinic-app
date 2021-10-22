import bcrypt from 'bcryptjs';
import SequelizeMock from 'sequelize-mock';
import jwt from 'jsonwebtoken';
import UserService from '../service/user-service.js';
import UserSqlRepository from '../repository/user-sql-repository.js';
import PatientSqlRepository from '../../patient/repository/patient-sql-repository.js';
import DoctorRepository from '../../doctor/repository/doctor.repository.js';
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
jest.mock('jsonwebtoken');

describe('user service unit test', () => {
  let testTime;
  let regData;
  let userData;
  let patientData;
  let payload;
  let serverErr;
  let myError;

  beforeEach(() => {
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
    serverErr = new Error('some error');
    myError = ApiError.forbidden('foo');
  });

  
  test('create token ', async () => {
    jwt.sign = jest.fn(() => '111');
    const res = userService.createToken(userData)
    expect(res).toEqual('111');
  });

  test('create token(some error) ', async () => {
    try{
      jwt.sign = jest.fn(() => {throw serverErr});
      const res = userService.createToken(userData)
      expect(res).toEqual('111');
    }catch(err){
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });


  test('registration test', async () => {
    userSqlRepository.getByEmail.mockResolvedValue(false);
    userSqlRepository.add.mockResolvedValue(userData);
    patientSqlRepository.add.mockResolvedValue(patientData);
    userService.createToken = jest.fn(() => 'valid_token_111');
    const res = await userService.registration(regData);
    expect(res).toEqual('valid_token_111');
  });

  test('registration test(email in base)', async () => {
    try{
      userSqlRepository.getByEmail = jest.fn(() => { throw myError; });
      await userService.registration(regData);
    }catch(err){
      expect(err).toBeInstanceOf(ApiError);
      expect(err.message).toBe('foo');
      expect(err.statusCode).toBe(STATUSES.Forbidden);
    }
  });

  test('registration test(some error)', async () => {
    try{
      userSqlRepository.getByEmail = jest.fn(() => { throw serverErr; });
      await userService.registration(regData);
    }catch(err){
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
    
  });

  test('login', async () => {
    const salt = bcrypt.genSaltSync(10);
    userData.password = bcrypt.hashSync(userData.password, salt);
    userSqlRepository.getByEmail.mockResolvedValue(userData);
    userService.createToken = jest.fn(() => 'valid_token_111');
    const res = await userService.login(regData);
    expect(res).toEqual({"role": "patient", "token": "valid_token_111"});
  });

  test('login, email doesn\'t match', async () => {
    try{
      userSqlRepository.getByEmail = jest.fn(() => { throw myError; });
      await userService.login(regData);
    }catch(err){
      expect(err).toBeInstanceOf(ApiError);
      expect(err.message).toBe('foo');
      expect(err.statusCode).toBe(STATUSES.Forbidden);
    }
  });

  test('login, password doesn\'t match', async () => {
    try{
      userSqlRepository.getByEmail = jest.fn(() => { throw myError; });
      bcrypt.compareSync = jest.fn(() => false);
      await userService.login(regData);
    }catch(err){
      expect(err).toBeInstanceOf(ApiError);
      expect(err.message).toBe('foo');
      expect(err.statusCode).toBe(STATUSES.Forbidden);
    }
  });

  test('login,(some error)', async () => {
    try{
      userSqlRepository.getByEmail.mockResolvedValue(userData);
      bcrypt.compareSync = jest.fn(() => {throw serverErr;});
      const res = await userService.login(regData);
    }catch(err){
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }  
  });

  // test('get by token (patient)', async () => {
  //   await checkJwtToken.mockResolvedValue(payload);
  //   patientSqlRepository.getByUserId.mockResolvedValue(patientData);
  //   const res = await userService.getByToken('111fff');
  //   expect(res).toEqual(patientData);
  // });

  // test('get by token (doctor)', async () => {
  //   try{
  //     userSqlRepository.getByEmail = jest.fn(() => { throw myError; });
  //     bcrypt.compareSync = jest.fn(() => false);
  //     await userService.login(regData);
  //   }catch(err){
  //     expect(err).toBeInstanceOf(ApiError);
  //     expect(err.message).toBe('foo');
  //     expect(err.statusCode).toBe(STATUSES.Forbidden);
  //   }
  //   payload.role = 'doctor';
  //   await checkJwtToken.mockResolvedValue(payload);
  //   doctorSqlRepository.getByUserId.mockResolvedValue(patientData);
  //   const res = await userService.getByToken('111fff');
  //   expect(res).toEqual(patientData);
  // });

  // test('get by token, id doesn\'t match', async () => {
  //   await checkJwtToken.mockResolvedValue(payload);
  //   payload.role = 'patient';
  //   patientSqlRepository.getByUserId.mockResolvedValue(false);
  //   const res = await userService.getByToken('111fff');
  //   expect(res).toEqual(false);
  // });

  // test('get by token, some error', async () => {
  //   try{
  //     await checkJwtToken.mockResolvedValue(payload);
  //     payload.role = 'patient';
  //     patientSqlRepository.getByUserId = jest.fn(() => { throw serverErr; });
  //     await userService.getByToken('111fff');
  //   }catch(err){
  //     expect(err).toBeInstanceOf(Error);
  //     expect(err.message).toBe('some error');
  //   }
  // });

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
    try{
      patientSqlRepository.getByUserId = jest.fn(() => { throw serverErr; });
      await userService.getByUserId(payload);
    }catch(err){
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });

  test('get by userId, handled error ', async () => {
    try{
      patientSqlRepository.getByUserId = jest.fn(() => { throw myError; });
      await userService.getByUserId(payload);
    }catch(err){
      expect(err).toBeInstanceOf(ApiError);
      expect(err.message).toBe('foo');
    }
  });

});
