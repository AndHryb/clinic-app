import redis from 'redis-mock';
import { MESSAGES, STATUSES, TTL } from '../../../constants.js';
import ResolutionService from '../resolution-service.js';
import ResolutionRepository from '../resolution-pg-repository.js';
import PatientRepository from '../../patient/patient-pg-repository';
import QueueRedisRepository from '../../queue/queue-redis-repository.js';

import ApiError from '../../../middleware/error-handling/ApiError.js';

const client = redis.createClient();

const resolutionRepository = new ResolutionRepository();
const patientRepository = new PatientRepository();
const queueRedisRepository = new QueueRedisRepository(client);
const resolutionService = new ResolutionService(
  queueRedisRepository, resolutionRepository, patientRepository, TTL,
);

describe('resolution service unit test', () => {
  let patientData1;
  let patientList;
  const testRegTime2 = new Date().toString();
  const testRegTime3 = new Date(1000).toString();
  const resolutionId = '111';
  const docId = '222';
  let serverErr;
  let addResData;

  beforeEach(() => {
    serverErr = new Error('some error');
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
    addResData = {
      resolution: 'bla bla',
      docId: '222',
      specId: '333',
      patientId: '111',
    };
  });

  test('isTheRightDoctor check right', async () => {
    resolutionRepository.getById = jest.fn(() => ({ doctorId: docId }));
    const res = await resolutionService.isTheRightDoctor(resolutionId, docId);
    expect(res).toEqual(true);
    expect(resolutionRepository.getById).toBeCalled();
  });

  test('isTheRightDoctor check right(no right)', async () => {
    resolutionRepository.getById = jest.fn(() => ({ doctorid: '111' }));
    const res = await resolutionService.isTheRightDoctor(resolutionId, docId);
    expect(res).toEqual(false);
    expect(resolutionRepository.getById).toBeCalled();
  });

  test('isTheRightDoctor check right(some error)', async () => {
    try {
      resolutionRepository.getById = jest.fn(() => { throw serverErr; });
      await resolutionService.isTheRightDoctor(resolutionId, docId);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });

  test('get resolutions by name', async () => {
    resolutionRepository.getByName = jest.fn(() => patientList);
    const res = await resolutionService.getResolutionsByName('Andrei');
    expect(res[0].id).toBe('222');
    expect(res[0].name).toBe('Andrei');
    expect(res[0].gender).toBe('male');
    expect(res[0].birthday).toBe('1993-02-19');
    expect(res[0].userId).toBe('333');
  });

  test('get resolutions by name out ttl', async () => {
    try {
      patientList.createdat = testRegTime3;
      resolutionRepository.getByName = jest.fn(() => patientList);
      await resolutionService.getResolutionsByName('Andrei');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.message).toBe(MESSAGES.RESOLUTION_EXPIRED);
      expect(err.statusCode).toBe(STATUSES.NotFound);
    }
  });

  test('get resolutions by name (there is no match by name)', async () => {
    try {
      resolutionRepository.getByName = jest.fn(() => []);
      await resolutionService.getResolutionsByName('Andrei');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.message).toBe(MESSAGES.RESOLUTIONS_NOT_FOUND);
      expect(err.statusCode).toBe(STATUSES.NotFound);
    }
  });

  test('get resolutions by name (some err)', async () => {
    try {
      resolutionRepository.getByName = jest.fn((() => { throw serverErr; }));
      await resolutionService.getResolutionsByName('Andrei');
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });

  test('get resolution by userId', async () => {
    patientRepository.getByUserId = jest.fn(() => patientData1);
    resolutionRepository.getByPatientId = jest.fn(() => patientList);
    const res = await resolutionService.getResolutionByUserId('asd');
    expect(res[0].id).toBe('222');
    expect(res[0].name).toBe('Andrei');
    expect(res[0].gender).toBe('male');
    expect(res[0].birthday).toBe('1993-02-19');
    expect(res[0].userId).toBe('333');
  });

  test('get resolution by userId(some error)', async () => {
    try {
      patientRepository.getByUserId = jest.fn(() => patientData1);
      resolutionRepository.getByPatientId = jest.fn(() => { throw serverErr; });
      await resolutionService.getResolutionByUserId('asd');
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });

  test('add resolution(all ok)', async () => {
    queueRedisRepository.getLength = jest.fn(() => 1);
    queueRedisRepository.delete = jest.fn(() => ({ patientId: '111' }));
    resolutionRepository.add = jest.fn(() => '222');
    const res = await resolutionService.addResolution(addResData);
    expect(res).toBe('222');
    expect(queueRedisRepository.getLength).toBeCalled();
    expect(queueRedisRepository.delete).toBeCalled();
    expect(resolutionRepository.add).toBeCalled();
  });

  test('add resolution (queue empty)', async () => {
    try {
      queueRedisRepository.getLength = jest.fn(() => 0);
      await resolutionService.addResolution(addResData);
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.message).toBe(MESSAGES.QUEUE_EMPTY);
      expect(err.statusCode).toBe(STATUSES.Conflict);
    }
  });

  test('add resolution (patient id not match)', async () => {
    try {
      queueRedisRepository.getLength = jest.fn(() => 1);
      queueRedisRepository.delete = jest.fn(() => ({ patientId: '222' }));
      await resolutionService.addResolution(addResData);
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.message).toBe(MESSAGES.NO_PATIENT);
      expect(err.statusCode).toBe(STATUSES.NotFound);
    }
  });

  test('add resolution (some error)', async () => {
    try {
      queueRedisRepository.getLength = jest.fn(() => { throw serverErr; });
      await resolutionService.addResolution(addResData);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });

  test('delete resolution data(repository has data)', async () => {
    resolutionService.isTheRightDoctor = jest.fn(() => true);
    resolutionRepository.delete = jest.fn(() => true);
    const res = await resolutionService.delete(resolutionId, docId);
    expect(res).toEqual(true);
    expect(resolutionService.isTheRightDoctor).toBeCalled();
    expect(resolutionRepository.delete).toBeCalled();
  });

  test('delete resolution data(no right to delete)', async () => {
    try {
      resolutionService.isTheRightDoctor = jest.fn(() => false);
      await resolutionService.delete(resolutionId, docId);
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.message).toBe(MESSAGES.NO_RIGHT_TO_DELETE);
      expect(err.statusCode).toBe(STATUSES.Forbidden);
    }
  });

  test('delete resolution data(repository hasn\'t data)', async () => {
    try {
      resolutionService.isTheRightDoctor = jest.fn(() => true);
      resolutionRepository.delete = jest.fn(() => false);
      await resolutionService.delete(resolutionId, docId);
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.message).toBe(MESSAGES.RESOLUTIONS_NOT_FOUND);
      expect(err.statusCode).toBe(STATUSES.NotFound);
    }
  });

  test('delete resolution data(some error)', async () => {
    try {
      resolutionService.isTheRightDoctor = jest.fn(() => { throw serverErr; });
      await resolutionService.delete(resolutionId, docId);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });
});
