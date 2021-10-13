import * as httpMocks from 'node-mocks-http';
import DoctorController from '../controller/doctor.controller.js';
import DoctorService from '../service/doctor.service.js';
import { STATUSES, NO_DOC_MSG } from '../../../constants.js';
import checkJwtToken from '../../../helpers/decode-token.js';

const doctorController = new DoctorController(new DoctorService());
const doctorService = doctorController.service;

jest.mock('../../../helpers/decode-token.js');

describe('doctor controller have to', () => {
  let req,
      res;
  const specs = [{spec: 'spec1'}, {spec: 'spec2'}, {spec: 'spec3'}]    

  beforeEach(() => {
    req = httpMocks.createRequest({
      method: 'GET',
      url: '/some_url',
      headers: {
        cookie: 'doctorToken=111'
      },
      body:{docID: '111'}
    });
    res = httpMocks.createResponse();
  })

  test('get all doctors', async () => {
    doctorService.getDoctors = jest.fn(() => [{ name: 'joe', id: '4', userId: '10' }]);
    await doctorController.getDoctors(req, res);
    expect(doctorService.getDoctors).toBeCalled();
    expect(res.statusCode).toEqual(STATUSES.OK);
    expect(res._getJSONData()).toEqual([{
      name: 'joe',
      id: '4',
      userId: '10'
    }]);
  });

  test('failed with get all doctors', async () => {
    doctorService.getDoctors = jest.fn(() => { throw new Error(NO_DOC_MSG); });
    await doctorController.getDoctors(req, res);
    expect(doctorService.getDoctors).toBeCalled();
    expect(res.statusCode).toEqual(STATUSES.NotFound);
  });

  test('get specializations by user id', async () => {
    checkJwtToken.mockResolvedValue({ userID: '222' })
    doctorService.getSpecByUserId = jest.fn(() => (specs));
    await doctorController.getSpecByUserId(req, res);
    expect(doctorService.getSpecByUserId).toBeCalled();
    expect(res.statusCode).toEqual(STATUSES.OK);
    expect(res._getJSONData()).toEqual(specs);
  });

  test('failed with get specializations by user id', async () => {
    checkJwtToken.mockResolvedValue({ userID: '222' })
    doctorService.getSpecByUserId = jest.fn(() => { throw new Error(NO_DOC_MSG)});
    await doctorController.getSpecByUserId(req, res);
    expect(doctorService.getSpecByUserId).toBeCalled();
    expect(res.statusCode).toEqual(STATUSES.NotFound);
  });
});
