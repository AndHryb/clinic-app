import * as httpMocks from 'node-mocks-http';
import DoctorController from '../controller/doctor.controller.js';
import DoctorService from '../service/doctor.service.js';
import { STATUSES } from '../../../constants.js';
import ApiError from '../../../middleware/error-handling/ApiError.js';

const doctorController = new DoctorController(new DoctorService());
const { doctorService } = doctorController;

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
      payload,
    });
    res = httpMocks.createResponse();
  });

  test('update doctor by id', async () => {
    req.body = {
      id: '4',
      name: 'Bob',
      email: 'doctor@doc',
      oldPassword: '9876',
      newPassword: '1111',
      specNames: ['anaesthesiologist', 'cardiologist'],
    };
    doctorService.updateById = jest.fn(() => [{ name: 'Bob', id: '4', userId: '10' }]);
    await doctorController.updateById(req, res, next);
    expect(doctorService.updateById).toBeCalled();
    expect(res.statusCode).toEqual(STATUSES.OK);
    expect(res._getJSONData()).toEqual([{
      name: 'Bob',
      id: '4',
      userId: '10',
    }]);
  });

  test('failed with update by id', async () => {
    doctorService.updateById = jest.fn(() => { throw myError; });
    await doctorController.updateById(req, res, next);
    expect(doctorService.updateById).toThrow(myError);
    expect(next).toHaveBeenCalledWith(myError);
  });

  test('update doctor by id (server error)', async () => {
    doctorService.updateById = jest.fn(() => { throw serverErr; });
    await doctorController.updateById(req, res, next);
    expect(doctorService.updateById).toThrow(serverErr);
    expect(next).toHaveBeenCalledWith(serverErr);
  });

  test('delete doctor by id', async () => {
    req.body = { id: '4' };
    doctorService.deleteById = jest.fn(() => [{ name: 'joe', id: '4', userId: '10' }]);
    await doctorController.deleteById(req, res, next);
    expect(doctorService.deleteById).toBeCalled();
    expect(res.statusCode).toEqual(STATUSES.OK);
    expect(res._getJSONData()).toEqual([{
      name: 'joe',
      id: '4',
      userId: '10',
    }]);
  });

  test('failed with delete doctors by id', async () => {
    doctorService.deleteById = jest.fn(() => { throw myError; });
    await doctorController.deleteById(req, res, next);
    expect(doctorService.deleteById).toThrow(myError);
    expect(next).toHaveBeenCalledWith(myError);
  });

  test('delete  doctors by id (server error)', async () => {
    doctorService.deleteById = jest.fn(() => { throw serverErr; });
    await doctorController.deleteById(req, res, next);
    expect(doctorService.deleteById).toThrow(serverErr);
    expect(next).toHaveBeenCalledWith(serverErr);
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
    doctorService.getDoctors = jest.fn(() => { throw myError; });
    await doctorController.getDoctors(req, res, next);
    expect(doctorService.getDoctors).toThrow(myError);
    expect(next).toHaveBeenCalledWith(myError);
  });

  test('get all doctors (server error)', async () => {
    doctorService.getDoctors = jest.fn(() => { throw serverErr; });
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
    doctorService.getSpecByUserId = jest.fn(() => { throw myError; });
    await doctorController.getSpecByUserId(req, res, next);
    expect(doctorService.getSpecByUserId).toThrow(myError);
    expect(next).toHaveBeenCalledWith(myError);
  });

  test(' get specializations by user id(server error)', async () => {
    doctorService.getSpecByUserId = jest.fn(() => { throw serverErr; });
    await doctorController.getSpecByUserId(req, res, next);
    expect(doctorService.getSpecByUserId).toThrow(serverErr);
    expect(next).toHaveBeenCalledWith(serverErr);
  });
});
