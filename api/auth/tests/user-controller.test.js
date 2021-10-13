import * as httpMocks from 'node-mocks-http';
import SequelizeMock from 'sequelize-mock';
import { STATUSES } from '../../../constants.js';
import UserController from '../controller/user-controller.js';
import UserService from '../service/user-service.js';
import UserSqlRepository from '../repository/user-sql-repository.js';
import PatientSqlRepository from '../../patient/repository/patient-sql-repository.js';

const { usersSQLDB, patientsSQLDB } = new SequelizeMock();

const userSqlRepository = new UserSqlRepository(usersSQLDB);
const patientSqlRepository = new PatientSqlRepository(patientsSQLDB);
const userService = new UserService(userSqlRepository, patientSqlRepository);
const userController = new UserController(userService);

jest.mock('../service/user-service.js');

describe('user controller unit test', () => {
  const registrationData = {
    email: 'andryigr@gmail.com',
    password: '1111',
    name: 'Andrei Hrybouski',
    birthday: 635385600000,
    gender: 'male',
  };
  const loginData = {
    email: 'andryigr@gmail.com',
    password: '1111',
  };
  const next = jest.fn();
  let resData,
      req, 
      res;
 

  beforeEach(() => {
    resData = {
      email: true,
      password: true,
      token: undefined,
    };

    req = httpMocks.createRequest({
      method: 'GET',
      url: '/some_url',
      headers: {
        cookie: ''
      },
      body:{docID: '111'}
    });
    res = httpMocks.createResponse();
  });

  test('registration(all ok)', async () => {
    userService.registration.mockResolvedValue('--token--');
    await userController.registration(req, res);
    expect(res.statusCode)
      .toEqual(STATUSES.Created);
    expect(res._getJSONData())
      .toEqual({
        token: '--token--', 
        message: 'The user has been successfully registered'});
  });

  test('registration(email is already busy)', async () => {
    userService.registration.mockResolvedValue(false);
    await userController.registration(req, res);
    expect(res.statusCode)
      .toEqual(STATUSES.Conflict);
    expect(res._getJSONData())
      .toEqual({
        message: 'Email address is exist'});
  });  
  

  test('login(all ok)', async () => {
    resData.token = '111';
    userService.login.mockResolvedValue(resData);
    await userController.login(req, res);
    expect(res.statusCode)
      .toEqual(STATUSES.OK);
    expect(res._getJSONData())
      .toEqual({
        message: 'login successful',
        token: resData.token,});
  });


  test('login(email not found)', async () => {
    resData.email = false;
    userService.login.mockResolvedValue(resData);
    await userController.login(req, res);
    expect(res.statusCode)
      .toEqual(STATUSES.Unauthorized);
    expect(res._getJSONData())
      .toEqual({
        message: `the email ${req.body.email} was not found in the database`,});
  });

  test('login(the passwords don\'t match)', async () => {
    resData.email = true;
    resData.password = false;
    userService.login.mockResolvedValue(resData);
    await userController.login(req, res);
    expect(res.statusCode)
      .toEqual(STATUSES.Unauthorized);
    expect(res._getJSONData())
      .toEqual({
        message:  `the password for ${req.body.email}  don't match`});
  });
});
