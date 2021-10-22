import * as httpMocks from 'node-mocks-http';
import DoctorController from '../controller/doctor.controller.js';
import DoctorService from '../service/doctor.service.js';
import { STATUSES } from '../../../constants.js';
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
    const payload = {
      email: 'aaa@aaa',
      userId: '111',
      role: 'patient',
    };
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
      payload: payload,
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
    doctorService.getDoctors = jest.fn(() => {throw myError});
    await doctorController.getDoctors(req, res, next);
    expect(doctorService.getDoctors).toThrow(myError);
    expect(next).toHaveBeenCalledWith(myError);
  });

  test('get all doctors (server error)', async () => {
    doctorService.getDoctors = jest.fn(() => {throw serverErr});
    await doctorController.getDoctors(req, res, next);
    expect(doctorService.getDoctors).toThrow(serverErr);
    expect(next).toHaveBeenCalledWith(serverErr);
  });

  test('get specializations by user id', async () => {
    doctorService.getSpecByUserId = jest.fn(() => (specs));
    await doctorController.getSpecByUserId(req, res, next);
    expect(doctorService.getSpecByUserId).toBeCalled();
    expect(res.statusCode).toEqual(STATUSES.OK);
    expect(res._getJSONData()).toEqual(specs);
  });

  test('failed with get specializations by user id', async () => {
    doctorService.getSpecByUserId = jest.fn(() => {throw myError});
    await doctorController.getSpecByUserId(req, res, next);
    expect(doctorService.getSpecByUserId).toThrow(myError);
    expect(next).toHaveBeenCalledWith(myError);
  });

  test(' get specializations by user id(server error)', async () => {
    doctorService.getSpecByUserId = jest.fn(() => {throw serverErr});
    await doctorController.getSpecByUserId(req, res, next);
    expect(doctorService.getSpecByUserId).toThrow(serverErr);
    expect(next).toHaveBeenCalledWith(serverErr);
  });
});
