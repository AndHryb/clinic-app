import redis from 'redis-mock';
import SequelizeMock from 'sequelize-mock';
import ResolutionService from '../service/resolution-service.js';
import ResolutionSqlRepository from '../repository/resolution-sql-repository.js';
import PatientSqlRepository from '../../patient/repository/patient-sql-repository.js';
import QueueRedisRepository from '../../queue/repository/queue-redis-repository.js';
import { MESSAGES, STATUSES, TTL } from '../../../constants.js';
import decodeToken from '../../../helpers/decode-token.js';
import ApiError from '../../../error_handling/ApiError.js';

const client = redis.createClient();
const patientsSQLDBMock = new SequelizeMock();
const resolutionsSQLDBMock = new SequelizeMock();

const resolutionSqlRepository = new ResolutionSqlRepository(resolutionsSQLDBMock);
const patientSqlRepository = new PatientSqlRepository(patientsSQLDBMock);
const queueRedisRepository = new QueueRedisRepository(client);
const resolutionService = new ResolutionService(queueRedisRepository, resolutionSqlRepository, patientSqlRepository, TTL);

jest.mock('../repository/resolution-sql-repository.js');
jest.mock('../../patient/repository/patient-sql-repository.js');
jest.mock('../../queue/repository/queue-redis-repository.js');
jest.mock('../../../helpers/decode-token.js');

describe('resolution service unit test', () => {
  let dataValues;
  let patientData1;
  let patientList;
  let patientList1;
  const testRegTime = (new Date()).getTime();
  const testRegTime2 = new Date().toString();
  const testRegTime3 = new Date(1000).toString();
  const userID = '333';
  const resolutionId = '111';
  const docId = '222';
  let serverErr;

  beforeEach(() => {
    serverErr = new Error('some error');
    dataValues = {
      id: '111',
      resolution: '1111',
      createdAt: testRegTime2,
      updatedAt: testRegTime2,
      patientId: '222',
    };

    patientData1 = {
      name: 'Andrei',
      regTime: testRegTime2,
    };

    patientList = [
      {
        id: '222',
        name: 'Andrei',
        gender: 'male',
        birthday: '1993-02-19',
        createdAt: testRegTime2,
        updatedAt: testRegTime2,
        userId: '333',
        resolutionsSQLDBs: [{
          dataValues: {
            id: '111',
            resolution: '1111',
            createdAt: testRegTime2,
            updatedAt: testRegTime2,
            patientId: '222',
          },
        }],

      }];
    patientList1 = [
      {
        id: '222',
        name: 'Andrei',
        gender: 'male',
        birthday: '1993-02-19',
        createdAt: testRegTime3,
        updatedAt: testRegTime3,
        userId: '333',
        resolutionsSQLDBs: [{
          dataValues: {
            id: '111',
            resolution: '1111',
            createdAt: testRegTime3,
            updatedAt: testRegTime3,
            patientId: '222',
          },
        }],

      }];
  });

  test('get resolutions by name', async () => {
    resolutionSqlRepository.getByName.mockResolvedValue(patientList);
    const res = await resolutionService.getResolutionsByName('Andrei');
    expect(res[0].id).toBe('222');
    expect(res[0].name).toBe('Andrei');
    expect(res[0].gender).toBe('male');
    expect(res[0].birthday).toBe('1993-02-19');
    expect(res[0].userId).toBe('333');
  });

  test('get resolutions by name out ttl', async () => {
    resolutionSqlRepository.getByName.mockResolvedValue(patientList1);
    const res = await resolutionService.getResolutionsByName('Andrei');
    expect(res).toBeInstanceOf(ApiError);
    expect(res.message).toBe(MESSAGES.RESOLUTION_EXPIRED);
    expect(res.statusCode).toBe(STATUSES.NotFound);
  });

  test('get resolutions by name (there is no match by name)', async () => {
    resolutionSqlRepository.getByName.mockResolvedValue([]);
    const res = await resolutionService.getResolutionsByName('Andrei');
    expect(res).toBeInstanceOf(ApiError);
    expect(res.message).toBe(MESSAGES.RESOLUTIONS_NOT_FOUND);
    expect(res.statusCode).toBe(STATUSES.NotFound);
  });

  test('get resolutions by name (some err)', async () => {
    resolutionSqlRepository.getByName = jest.fn((() => { throw serverErr; }));
    const res = await resolutionService.getResolutionsByName('Andrei');
    expect(res).toBeInstanceOf(Error);
    expect(res.message).toBe('some error');
  });

  test('get resolution by token', async () => {
    decodeToken.mockResolvedValue(userID);
    patientSqlRepository.getByUserId.mockResolvedValue(patientData1);
    resolutionSqlRepository.getByPatientId.mockResolvedValue(dataValues);
    const res = await resolutionService.getResolutionByToken('asd');
    expect(res).toEqual(dataValues);
  });

  test('get resolution by token(token invalid)', async () => {
    decodeToken.mockResolvedValue(userID);
    patientSqlRepository.getByUserId.mockResolvedValue(patientData1);
    resolutionSqlRepository.getByPatientId.mockResolvedValue(false);
    const res = await resolutionService.getResolutionByToken('asd');
    expect(res).toBeInstanceOf(ApiError);
    expect(res.message).toBe(MESSAGES.RESOLUTIONS_NOT_FOUND);
    expect(res.statusCode).toBe(STATUSES.NotFound);
  });

  test('get resolution by token(some error)', async () => {
    decodeToken.mockResolvedValue(userID);
    patientSqlRepository.getByUserId.mockResolvedValue(patientData1);
    resolutionSqlRepository.getByPatientId = jest.fn(() => { throw serverErr; });
    const res = await resolutionService.getResolutionByToken('asd');
    expect(res).toBeInstanceOf(Error);
    expect(res.message).toBe('some error');
  });

  test('add resolution(all ok)', async () => {
    queueRedisRepository.getLength.mockResolvedValue(1);
    queueRedisRepository.delete.mockResolvedValue('222');
    const res = await resolutionService.addResolution('bla bla');
    expect(res).toBe('222');
    expect(queueRedisRepository.getLength).toBeCalled();
    expect(queueRedisRepository.delete).toBeCalled();
    expect(resolutionSqlRepository.add).toBeCalled();
  });

  test('add resolution (queue empty)', async () => {
    queueRedisRepository.getLength.mockResolvedValue(0);
    const res = await resolutionService.addResolution('bla bla');
    expect(res).toBeInstanceOf(ApiError);
    expect(res.message).toBe(MESSAGES.QUEUE_EMPTY);
    expect(res.statusCode).toBe(STATUSES.Conflict);
  });

  test('add resolution (some error)', async () => {
    queueRedisRepository.getLength = jest.fn(() => { throw serverErr; });
    const res = await resolutionService.addResolution('bla bla');
    expect(res).toBeInstanceOf(Error);
    expect(res.message).toBe('some error');
  });

  // test('get resolution data by resolution id(repository has data)', async () => {
  //   resolutionSqlRepository.getById.mockResolvedValue(dataValues);
  //   const res = await resolutionService.getById(resolutionId);
  //   expect(res).toEqual(dataValues);
  // });

  // test('get resolution data by resolution id(repository hasn\'t data)', async () => {
  //   resolutionSqlRepository.getById.mockResolvedValue(false);
  //   const res = await resolutionService.getById(resolutionId);
  //   expect(res).toEqual(false);
  // });

  // test('get resolution data by patient id(repository has data)', async () => {
  //   resolutionSqlRepository.getByPatientId.mockResolvedValue(dataValues);
  //   const res = await resolutionService.getByPatientId(patientId);
  //   expect(res).toEqual(dataValues);
  // });

  // test('get resolution data by patient id(repository hasn\'t data)', async () => {
  //   resolutionSqlRepository.getByPatientId.mockResolvedValue(false);
  //   const res = await resolutionService.getByPatientId(resolutionId);
  //   expect(res).toEqual(false);
  // });

  test('delete resolution data(repository has data)', async () => {
    resolutionService.isTheRightDoctor = jest.fn(() => true);
    resolutionSqlRepository.delete.mockResolvedValue(true);
    const res = await resolutionService.delete(resolutionId, docId);
    expect(res).toEqual(true);
    expect(resolutionService.isTheRightDoctor).toBeCalled();
    expect(resolutionSqlRepository.delete).toBeCalled();
  });

  test('delete resolution data(no right to delete)', async () => {
    resolutionService.isTheRightDoctor = jest.fn(() => false);
    // resolutionSqlRepository.delete.mockResolvedValue(false);
    const res = await resolutionService.delete(resolutionId, docId);
    expect(res).toBeInstanceOf(ApiError);
    expect(res.message).toBe(MESSAGES.NO_RIGHT_TO_DELETE);
    expect(res.statusCode).toBe(STATUSES.Forbidden);
  });

  test('delete resolution data(repository hasn\'t data)', async () => {
    resolutionService.isTheRightDoctor = jest.fn(() => true);
    resolutionSqlRepository.delete.mockResolvedValue(false);
    const res = await resolutionService.delete(resolutionId, docId);
    expect(res).toBeInstanceOf(ApiError);
    expect(res.message).toBe(MESSAGES.RESOLUTIONS_NOT_FOUND);
    expect(res.statusCode).toBe(STATUSES.NotFound);
  });

  test('delete resolution data(some error)', async () => {
    resolutionService.isTheRightDoctor = jest.fn(() => { throw serverErr; });
    resolutionSqlRepository.delete.mockResolvedValue(false);
    const res = await resolutionService.delete(resolutionId, docId);
    expect(res).toBeInstanceOf(Error);
    expect(res.message).toBe('some error');
  });
});
