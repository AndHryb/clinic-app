import * as httpMocks from 'node-mocks-http';
import SequelizeMock from 'sequelize-mock';
import { STATUSES, MESSAGES } from '../../../constants.js';
import UserController from '../controller/user-controller.js';
import UserService from '../service/user-service.js';
import UserSqlRepository from '../repository/user-sql-repository.js';
import PatientSqlRepository from '../../patient/repository/patient-sql-repository.js';
import ApiError from '../../../error_handling/ApiError.js';

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

  let resData;
  let req;
  let res;
  let next;
  let myError;
  let serverErr;

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
        cookie: '',
      },
      body: { docID: '111' },
    });
    res = httpMocks.createResponse();

    next = jest.fn();
    myError = ApiError.notFound('foo');
    serverErr = new Error('some error');
  });

  test('registration(all ok)', async () => {
    userService.registration.mockResolvedValue('--token--');
    await userController.registration(req, res, next);
    expect(res.statusCode)
      .toEqual(STATUSES.Created);
    expect(res._getJSONData())
      .toEqual({
        token: '--token--',
        message: MESSAGES.REGISTRATION_OK,
      });
  });

  test('registration(email is already busy)', async () => {
    userService.registration.mockResolvedValue(myError);
    await userController.registration(req, res, next);
    expect(next).toHaveBeenCalledWith(myError);
  });

  test('registration(some server error)', async () => {
    userService.registration = jest.fn(() => { throw serverErr; });
    await userController.registration(req, res, next);
    expect(userService.registration).toThrow(serverErr);
    expect(next).toHaveBeenCalledWith(serverErr);
  });

  test('login(all ok)', async () => {
    resData.token = '111';
    userService.login.mockResolvedValue(resData.token);
    await userController.login(req, res, next);
    expect(res.statusCode)
      .toEqual(STATUSES.OK);
    expect(res._getJSONData())
      .toEqual({
        message: MESSAGES.LOGIN_OK,
        token: '111',
      });
  });

  test('login(email not found)', async () => {
    userService.login.mockResolvedValue(myError);
    await userController.login(req, res, next);
    expect(next).toHaveBeenCalledWith(myError);
  });

  test('login(the passwords don\'t match)', async () => {
    userService.login.mockResolvedValue(myError);
    await userController.login(req, res, next);
    expect(next).toHaveBeenCalledWith(myError);
  });

  test('login(server err)', async () => {
    userService.login = jest.fn(() => { throw serverErr; });
    await userController.login(req, res, next);
    expect(userService.login).toThrow(serverErr);
    expect(next).toHaveBeenCalledWith(serverErr);
  });
});
