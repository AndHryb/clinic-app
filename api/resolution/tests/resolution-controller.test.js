import * as httpMocks from 'node-mocks-http';
import SequelizeMock from 'sequelize-mock';
import { STATUSES, NO_RIGHT_TO_DELETE_MSG} from '../../../constants.js';
import ResolutionController from '../controllers/resolution-controller.js';
import ResolutionService from '../service/resolution-service.js';
import DoctorService from '../../doctor/service/doctor.service.js';
import ResolutionSqlRepository from '../repository/resolution-sql-repository.js';
import DoctorRepository from '../../doctor/repository/doctor.repository.js';
import checkJwtToken from '../../../helpers/decode-token.js';

const resolutionsSQLDB = new SequelizeMock();
const doctorSQLDB = new SequelizeMock();

const doctorSQLRepository = new DoctorRepository(doctorSQLDB);
const resolutionSqlRepository = new ResolutionSqlRepository(resolutionsSQLDB);

const resolutionService = new ResolutionService(resolutionSqlRepository);
const doctorService = new DoctorService(doctorSQLRepository);
const resolutionController = new ResolutionController(resolutionService, doctorService);

jest.mock('../service/resolution-service.js');
jest.mock('../../doctor/service/doctor.service.js');
jest.mock('../../../helpers/decode-token.js');

describe('resolution controller unit test', () => {
  let resolutionData1, 
      patientData1, 
      patientData2,
      docData,
      req,
      res,
      patientList = [];
  const testRegTime = (new Date()).getTime();
  const resolutionId = '111';
  const resolutionVal = 'schizophrenia';
  const myErr1 = new Error('not found');
  const myErr2 = new Error(NO_RIGHT_TO_DELETE_MSG);
  

  beforeEach(() => {
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
        cookie: 'doctorToken=111'
      },
      body:{docID: '111'}
    });
    res = httpMocks.createResponse();
  });

  test('get resolutions by name', async () => {
    resolutionService.getResolutionsByName.mockResolvedValue(patientList);
    await resolutionController.getResolutionsByName(req,res);
    expect(res.statusCode).toEqual(STATUSES.OK);
    expect(res._getJSONData()).toEqual({
      resolutions: patientList,
      message: `${patientList.length} patient(s) were found`,
    });
  });

  test('get resolution by name(patient storage hasn\'t this name)', async () => {
    resolutionService.getResolutionsByName.mockResolvedValue(false);
    await resolutionController.getResolutionsByName(req,res);
    expect(res.statusCode).toEqual(STATUSES.NotFound);
    expect(res._getJSONData()).toEqual({
      message: `The patient ${req.query.name} not found in the database`,
    });
  });

  test('add resolution data(queueRepository has patient)', async () => {
    checkJwtToken.mockResolvedValue({ userID: '222' });
    doctorService.getByUserId.mockResolvedValue(docData);
    resolutionService.addResolution.mockResolvedValue(patientData1);
    await resolutionController.addResolution(req,res);
    expect(res.statusCode).toEqual(STATUSES.Created);
    expect(res._getJSONData()).toEqual(
      patientData1
    );
  });

  test('add resolution data(queue empty hasn\'t patient)', async () => {
    checkJwtToken.mockResolvedValue({ userID: '222' });
    doctorService.getByUserId.mockResolvedValue(docData);
    resolutionService.addResolution.mockResolvedValue(false);
    await resolutionController.addResolution(req,res);
    expect(res.statusCode).toEqual(STATUSES.Conflict);
    expect(res._getJSONData()).toEqual({
      message: 'Can\'t added resolution. There is no one in the queueRepository'
    });
  });

  test('delete resolution data(storage has key)', async () => {
    checkJwtToken.mockResolvedValue({ userID: '222' });
    doctorService.getByUserId.mockResolvedValue(docData);
    resolutionService.delete.mockResolvedValue(patientData2);
    await resolutionController.deleteResolution(req, res);
    expect(res.statusCode).toEqual(STATUSES.NoContent);
    expect(res._getJSONData()).toEqual({
      message: `The resolution  ${req.body.value} deleted`
    });
  });

  test('delete resolution data(not found in dstabase)', async () => {
    checkJwtToken.mockResolvedValue({ userID: '222' });
    doctorService.getByUserId.mockResolvedValue(docData);
    resolutionService.delete.mockResolvedValue(myErr1);
    await resolutionController.deleteResolution(req, res);
    expect(res.statusCode).toEqual(STATUSES.NotFound);
    expect(res._getJSONData()).toEqual({
      message: `The resolution ${req.body.value} not found in the database`
    });
  });

  test('delete resolution data(no right to delete)', async () => {
    checkJwtToken.mockResolvedValue({ userID: '222' });
    doctorService.getByUserId.mockResolvedValue(docData);
    resolutionService.delete.mockResolvedValue(myErr2);
    await resolutionController.deleteResolution(req, res);
    expect(res.statusCode).toEqual(STATUSES.Forbidden);
    expect(res._getJSONData()).toEqual({
      message: NO_RIGHT_TO_DELETE_MSG,
    });
  });

  test('get resolution by token (token valid)', async () => {
    req.headers.cookie = 'token=111';
    resolutionService.getResolutionByToken.mockResolvedValue(resolutionData1);
    await resolutionController.getResolutionByToken(req, res);
    expect(res.statusCode).toEqual(STATUSES.OK);
    expect(res._getJSONData()).toEqual({resolution: resolutionData1});
  });

  test('get resolution by token (token invalid)', async () => {
    req.headers.cookie = 'token=111';
    resolutionService.getResolutionByToken.mockResolvedValue(false);
    await resolutionController.getResolutionByToken(req, res);
    expect(res.statusCode).toEqual(STATUSES.NotFound);
    expect(res._getJSONData()).toEqual({
      message: 'The resolution not found in the database.Make an appointment with a doctor.'
    });
  });
});
