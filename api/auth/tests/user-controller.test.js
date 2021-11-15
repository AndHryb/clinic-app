import * as httpMocks from 'node-mocks-http';
import { STATUSES, MESSAGES } from '../../../constants.js';
import UserController from '../user-controller.js';
import UserService from '../user-service.js';
import UserRepository from '../user-pg-repository.js';
import PatientRepository from '../../patient/patient-pg-repository.js';
import ApiError from '../../../middleware/error-handling/ApiError.js';

const userRepository = new UserRepository();
const patientRepository = new PatientRepository();
const userService = new UserService(userRepository, patientRepository);
const userController = new UserController(userService);

jest.mock('../user-service.js');

describe('user controller unit test', () => {
  let regResData;
  let resData;
  let req;
  let res;
  let next;
  let myError;
  let serverErr;

  beforeEach(() => {
    regResData = {
      entity: 'aaa',
      doctor: 'bbb',
      token: '--token--',
    };

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
    userService.registration.mockResolvedValue(regResData);
    await userController.registration(req, res, next);
    expect(res.statusCode)
      .toEqual(STATUSES.Created);
    expect(res._getJSONData())
      .toEqual({
        entity: regResData.entity,
        token: regResData.token,
        message: MESSAGES.REGISTRATION_OK,
      });
  });

  test('registration(email is already busy)', async () => {
    userService.registration = jest.fn(() => { throw myError; });
    await userController.registration(req, res, next);
    expect(userService.registration).toThrow(myError);
    expect(next).toHaveBeenCalledWith(myError);
  });

  test('registration(some server error)', async () => {
    userService.registration = jest.fn(() => { throw serverErr; });
    await userController.registration(req, res, next);
    expect(userService.registration).toThrow(serverErr);
    expect(next).toHaveBeenCalledWith(serverErr);
  });

  test('login(all ok)', async () => {
    resData.token = { token: '111', role: 'patient' };
    userService.login.mockResolvedValue(resData.token);
    await userController.login(req, res, next);
    expect(res.statusCode)
      .toEqual(STATUSES.OK);
    expect(res._getJSONData())
      .toEqual({
        message: MESSAGES.LOGIN_OK,
        token: '111',
        role: 'patient',
      });
  });

  test('login(email not found)', async () => {
    userService.login = jest.fn(() => { throw myError; });
    await userController.login(req, res, next);
    expect(userService.login).toThrow(myError);
    expect(next).toHaveBeenCalledWith(myError);
  });

  test('login(the passwords don\'t match)', async () => {
    userService.login = jest.fn(() => { throw myError; });
    await userController.login(req, res, next);
    expect(userService.login).toThrow(myError);
    expect(next).toHaveBeenCalledWith(myError);
  });

  test('login(server err)', async () => {
    userService.login = jest.fn(() => { throw serverErr; });
    await userController.login(req, res, next);
    expect(userService.login).toThrow(serverErr);
    expect(next).toHaveBeenCalledWith(serverErr);
  });
});
