import * as httpMocks from 'node-mocks-http';
import DoctorController from '../controller/doctor.controller.js';
import DoctorService from '../service/doctor.service.js';
import { STATUSES, NO_DOC_MSG } from '../../../constants.js';
import checkJwtToken from '../../../helpers/decode-token.js';
import ApiError from '../../../error_handling/ApiError.js';

const doctorController = new DoctorController(new DoctorService());
const doctorService = doctorController.service;

jest.mock('../../../helpers/decode-token.js');

describe('doctor controller have to', () => {
  let req;
  let res;
  let serverErr;
  let myError;
  let next;
  const specs = [{ spec: 'spec1' }, { spec: 'spec2' }, { spec: 'spec3' }];

  beforeEach(() => {
    next = jest.fn();
    myError = ApiError.notFound('foo');
    serverErr = new Error('some error');
    req = httpMocks.createRequest({
      method: 'GET',
      url: '/some_url',
      headers: {
        cookie: 'doctorToken=111',
      },
      body: { docID: '111' },
    });
    res = httpMocks.createResponse();
  });

  test('get all doctors', async () => {
    doctorService.getDoctors = jest.fn(() => [{ name: 'joe', id: '4', userId: '10' }]);
    await doctorController.getDoctors(req, res, next);
    expect(doctorService.getDoctors).toBeCalled();
    expect(res.statusCode).toEqual(STATUSES.OK);
    expect(res._getJSONData()).toEqual([{
      name: 'joe',
      id: '4',
      userId: '10',
    }]);
  });

  test('failed with get all doctors', async () => {
    doctorService.getDoctors = jest.fn(() => myError);
    await doctorController.getDoctors(req, res, next);
    expect(next).toHaveBeenCalledWith(myError);
  });

  test('get all doctors (server error)', async () => {
    doctorService.getDoctors = jest.fn(() => {throw serverErr});
    await doctorController.getDoctors(req, res, next);
    expect(doctorService.getDoctors).toThrow(serverErr);
    expect(next).toHaveBeenCalledWith(serverErr);
  });

  test('get specializations by user id', async () => {
    checkJwtToken.mockResolvedValue({ userID: '222' });
    doctorService.getSpecByUserId = jest.fn(() => (specs));
    await doctorController.getSpecByUserId(req, res, next);
    expect(doctorService.getSpecByUserId).toBeCalled();
    expect(res.statusCode).toEqual(STATUSES.OK);
    expect(res._getJSONData()).toEqual(specs);
  });

  test('failed with get specializations by user id', async () => {
    checkJwtToken.mockResolvedValue({ userID: '222' });
    doctorService.getSpecByUserId = jest.fn(() => myError);
    await doctorController.getSpecByUserId(req, res, next);
    expect(next).toHaveBeenCalledWith(myError);
  });

  test(' get specializations by user id(server error)', async () => {
    checkJwtToken.mockResolvedValue({ userID: '222' });
    doctorService.getSpecByUserId = jest.fn(() => {throw serverErr});
    await doctorController.getSpecByUserId(req, res, next);
    expect(doctorService.getSpecByUserId).toThrow(serverErr);
    expect(next).toHaveBeenCalledWith(serverErr);
  });
});
