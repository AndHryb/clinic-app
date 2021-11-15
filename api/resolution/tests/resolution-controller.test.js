import * as httpMocks from 'node-mocks-http';
import { STATUSES, MESSAGES } from '../../../constants.js';
import ResolutionController from '../resolution-controller.js';
import ResolutionService from '../resolution-service.js';
import DoctorService from '../../doctor/doctor-service.js';
import ResolutionRepository from '../resolution-pg-repository.js';
import DoctorRepository from '../../doctor/doctor-pg-repository.js';
import ApiError from '../../../middleware/error-handling/ApiError.js';

const doctorSQLRepository = new DoctorRepository();
const resolutionSqlRepository = new ResolutionRepository();

const resolutionService = new ResolutionService(resolutionSqlRepository);
const doctorService = new DoctorService(doctorSQLRepository);
const resolutionController = new ResolutionController(resolutionService, doctorService);

jest.mock('../resolution-service.js');
jest.mock('../../doctor/doctor-service.js');

describe('resolution controller unit test', () => {
  let resolutionData1;
  let patientData1;
  let patientData2;
  let docData;
  let req;
  let res;
  let patientList = [];
  let serverErr;
  let myError;
  let next;
  const testRegTime = (new Date()).getTime();

  beforeEach(() => {
    next = jest.fn();
    const payload = {
      email: 'aaa@aaa',
      userId: '111',
      role: 'patient',
    };
    myError = ApiError.notFound('foo');
    serverErr = new Error('some error');
    resolutionData1 = {
      resolutionId: '111',
      patienId: '222',
      resolution: 'schizophrenia',
      regTime: testRegTime,
    };
    patientData1 = {
      name: 'Andrei',
      regTime: testRegTime,
    };
    patientData2 = {
      name: 'Bob',
      regTime: testRegTime,
    };
    patientList = [
      {
        patientId: '222',
        name: 'Andrei',
        regTime: testRegTime,
      },
      {
        patientId: '232',
        name: 'Andrei',
        regTime: testRegTime,
      },
    ];
    docData = { id: '444', name: 'Sergei' };
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

  test('get resolutions by name', async () => {
    resolutionService.getResolutionsByName.mockResolvedValue(patientList);
    await resolutionController.getResolutionsByName(req, res, next);
    expect(res.statusCode).toEqual(STATUSES.OK);
    expect(res._getJSONData()).toEqual({
      resolutions: patientList,
    });
  });

  test('get resolution by name(patient storage hasn\'t this name)', async () => {
    resolutionService.getResolutionsByName = jest.fn(() => { throw myError; });
    await resolutionController.getResolutionsByName(req, res, next);
    expect(resolutionService.getResolutionsByName).toThrow(myError);
    expect(next).toHaveBeenCalledWith(myError);
  });

  test('get resolution by name(server error)', async () => {
    resolutionService.getResolutionsByName = jest.fn(() => { throw serverErr; });
    await resolutionController.getResolutionsByName(req, res, next);
    expect(resolutionService.getResolutionsByName).toThrow(serverErr);
    expect(next).toHaveBeenCalledWith(serverErr);
  });

  test('add resolution data(queueRepository has patient)', async () => {
    doctorService.getByUserId.mockResolvedValue(docData);
    resolutionService.addResolution.mockResolvedValue(patientData1);
    await resolutionController.addResolution(req, res, next);
    expect(res.statusCode).toEqual(STATUSES.Created);
    expect(res._getJSONData()).toEqual(
      patientData1,
    );
  });

  test('add resolution data(queue empty)', async () => {
    doctorService.getByUserId = jest.fn(() => { throw myError; });
    await resolutionController.addResolution(req, res, next);
    expect(doctorService.getByUserId).toThrow(myError);
    expect(next).toHaveBeenCalledWith(myError);
  });

  test('add resolution data(server error)', async () => {
    doctorService.getByUserId = jest.fn(() => { throw serverErr; });
    await resolutionController.addResolution(req, res, next);
    expect(doctorService.getByUserId).toThrow(serverErr);
    expect(next).toHaveBeenCalledWith(serverErr);
  });

  test('delete resolution data(storage has key)', async () => {
    doctorService.getByUserId.mockResolvedValue(docData);
    resolutionService.delete.mockResolvedValue(patientData2);
    await resolutionController.deleteResolution(req, res, next);
    expect(res.statusCode).toEqual(STATUSES.NoContent);
    expect(res._getJSONData()).toEqual({
      message: MESSAGES.RESOLUTION_DELETED,
      resolution: {
        name: 'Bob',
        regTime: testRegTime,
      },
    });
  });

  test('delete resolution data(not found in dstabase or no right to delete)', async () => {
    doctorService.getByUserId.mockResolvedValue(docData);
    resolutionService.delete = jest.fn(() => { throw myError; });
    await resolutionController.deleteResolution(req, res, next);
    expect(resolutionService.delete).toThrow(myError);
    expect(next).toHaveBeenCalledWith(myError);
  });

  test('delete resolution data(server error)', async () => {
    doctorService.getByUserId.mockResolvedValue(docData);
    resolutionService.delete = jest.fn(() => { throw serverErr; });
    await resolutionController.deleteResolution(req, res, next);
    expect(resolutionService.delete).toThrow(serverErr);
    expect(next).toHaveBeenCalledWith(serverErr);
  });

  test('get resolution by token (token valid)', async () => {
    resolutionService.getResolutionByUserId.mockResolvedValue(resolutionData1);
    await resolutionController.getResolutionByToken(req, res, next);
    expect(res.statusCode).toEqual(STATUSES.OK);
    expect(res._getJSONData()).toEqual({ resolution: resolutionData1 });
  });

  test('get resolution by token (token invalid)', async () => {
    resolutionService.getResolutionByUserId = jest.fn(() => { throw myError; });
    await resolutionController.getResolutionByToken(req, res, next);
    expect(resolutionService.getResolutionByUserId).toThrow(myError);
    expect(next).toHaveBeenCalledWith(myError);
  });

  test('get resolution by token (server error)', async () => {
    resolutionService.getResolutionByUserId = jest.fn(() => { throw serverErr; });
    await resolutionController.getResolutionByToken(req, res, next);
    expect(resolutionService.getResolutionByUserId).toThrow(serverErr);
    expect(next).toHaveBeenCalledWith(serverErr);
  });
});
