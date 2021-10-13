import redis from 'redis-mock';
import SequelizeMock from 'sequelize-mock';
import ResolutionService from '../service/resolution-service.js';
import ResolutionSqlRepository from '../repository/resolution-sql-repository.js';
import PatientSqlRepository from '../../patient/repository/patient-sql-repository.js';
import QueueRedisRepository from '../../queue/repository/queue-redis-repository.js';
import { TTL } from '../../../constants.js';
import decodeToken from '../../../helpers/decode-token.js';

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
  let patientList = [];
  let patientList1 = [];
  const testRegTime = (new Date()).getTime();
  const testRegTime2 = new Date();
  const testRegTime3 = new Date(1000);
  const userID = '333';
  const resolutionId = '111';
  const patientId = '222';

  beforeEach(() => {
    dataValues = {
      id: '111',
      resolution: '1111',
      createdAt: testRegTime,
      updatedAt: testRegTime,
      patientId: '222',
    };

    patientData1 = {
      name: 'Andrei',
      regTime: testRegTime,
    };

    patientList = [
      {
        dataValues: {
          id: '222',
          name: 'Andrei',
          gender: 'male',
          birthday: '1993-02-19',
          createdAt: testRegTime,
          updatedAt: testRegTime,
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
        },
      }];
    patientList1 = [
      {
        dataValues: {
          id: '222',
          name: 'Andrei',
          gender: 'male',
          birthday: '1993-02-19',
          createdAt: testRegTime,
          updatedAt: testRegTime,
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
        },
      }];
  });

  /*
  test('get resolutions by name', async () => {
    resolutionSqlRepository.getByName.mockResolvedValue(patientList);

    const res = await resolutionService.getResolutionsByName('Andrei');
    console.log(res);

    expect(res[0].dataValues.id).toBe('222');
    expect(res[0].dataValues.name).toBe('Andrei');
    expect(res[0].dataValues.gender).toBe('male');
    expect(res[0].dataValues.birthday).toBe('1993-02-19');
    expect(res[0].dataValues.userId).toBe('333');
  }); */
  /*
  test('get resolutions by name out ttl', async () => {
    resolutionSqlRepository.getByName.mockResolvedValue(patientList1);

    const res = await resolutionService.getResolutionsByName('Andrei');
    expect(res).toEqual([{
      name: 'Andrei',
      regTime: testRegTime,
      resolutions: [{
        id: '111',
        resolution: 'The resolution for patient Andrei has expired',
      }],
    },
    ]);
  }); */

  test('get resolutions by name (there is no match by name)', async () => {
    resolutionSqlRepository.getByName.mockResolvedValue([]);

    const res = await resolutionService.getResolutionsByName('Andrei');
    expect(res).toEqual([]);
  });

  test('get resolution token', async () => {
    decodeToken.mockResolvedValue(userID);
    patientSqlRepository.getByUserId.mockResolvedValue(patientData1);
    resolutionSqlRepository.getByPatientId.mockResolvedValue(dataValues);
    const res = await resolutionService.getResolutionByToken('asd');
    expect(res).toEqual(dataValues);
  });

  test('get resolution token(token invalid)', async () => {
    decodeToken.mockResolvedValue(userID);
    patientSqlRepository.getByUserId.mockResolvedValue(false);
    resolutionSqlRepository.getByPatientId.mockResolvedValue(false);
    const res = await resolutionService.getResolutionByToken('asd');
    expect(res).toBeFalsy();
  });

  test('get resolution data by resolution id(repository has data)', async () => {
    resolutionSqlRepository.getById.mockResolvedValue(dataValues);
    const res = await resolutionService.getById(resolutionId);
    expect(res).toEqual(dataValues);
  });

  test('get resolution data by resolution id(repository hasn\'t data)', async () => {
    resolutionSqlRepository.getById.mockResolvedValue(false);
    const res = await resolutionService.getById(resolutionId);
    expect(res).toEqual(false);
  });

  test('get resolution data by patient id(repository has data)', async () => {
    resolutionSqlRepository.getByPatientId.mockResolvedValue(dataValues);
    const res = await resolutionService.getByPatientId(patientId);
    expect(res).toEqual(dataValues);
  });

  test('get resolution data by patient id(repository hasn\'t data)', async () => {
    resolutionSqlRepository.getByPatientId.mockResolvedValue(false);
    const res = await resolutionService.getByPatientId(resolutionId);
    expect(res).toEqual(false);
  });

  /*
  test('delete resolution data(repository has data)', async () => {
    resolutionSqlRepository.delete.mockResolvedValue(true);
    const res = await resolutionService.delete(resolutionId);
    expect(res).toEqual(true);
  }); */

  test('delete resolution data(repository hasn\'t data)', async () => {
    resolutionSqlRepository.delete.mockResolvedValue(false);
    const res = await resolutionService.delete(resolutionId);
    expect(res).toBeInstanceOf(Error);
  });

  test('add resolution ', async () => {
    queueRedisRepository.getLength.mockResolvedValue(1);
    queueRedisRepository.delete.mockResolvedValue('222');
    const res = await resolutionService.addResolution('bla bla');
    expect(res).toEqual('222');
  });

  test('add resolution (queue empty)', async () => {
    queueRedisRepository.getLength.mockResolvedValue(0);
    queueRedisRepository.delete.mockResolvedValue('222');
    const res = await resolutionService.addResolution('bla bla');
    expect(res).toEqual(false);
  });
});
