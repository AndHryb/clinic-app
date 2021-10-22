import SequelizeMock from 'sequelize-mock';
import redis from 'redis-mock';
import QueueService from '../service/queue-service.js';
import PatientSqlRepository from '../../patient/repository/patient-sql-repository.js';
import QueueRedisRepository from '../repository/queue-redis-repository.js';
import ApiError from '../../../error_handling/ApiError.js';
import { STATUSES } from '../../../constants.js';

const client = redis.createClient();
const patientsSQLDBMock = new SequelizeMock();
const patientSqlRepository = new PatientSqlRepository(patientsSQLDBMock);
const queueRedisRepository = new QueueRedisRepository(client);
const queueService = new QueueService(patientSqlRepository, queueRedisRepository);

jest.mock('../../patient/repository/patient-sql-repository.js');
jest.mock('../repository/queue-redis-repository.js');

describe('queue service unit tests', () => {
  const patientName = 'Andrei';
  const patientID = '0e84252b-6af5-417f-aedd-90e50d5682cb';
  const patientData = {
    name: 'Andrei',
    regTime: 1630189224236,
  };
  const myError = ApiError.notFound('foo');
  const serverErr = new Error('some error');

  test('method get', async () => {
    queueRedisRepository.get.mockResolvedValue(patientID);
    patientSqlRepository.getById.mockResolvedValue(patientData);
    const res = await queueService.get();
    expect(res).toEqual('Andrei');
  });

  test('method get(queueRepository is empty)', async () => {
    try{
      queueRedisRepository.get = jest.fn(() => { throw myError; });
      patientSqlRepository.getById.mockResolvedValue(false);
      await queueService.get();
    }catch(err){
      expect(err).toBeInstanceOf(ApiError);
      expect(err.message).toBe('foo');
      expect(err.statusCode).toBe(STATUSES.NotFound);
    }
  });

  test('method get(some err)', async () => {
    try{
      queueRedisRepository.get = jest.fn(() => { throw serverErr; });
      patientSqlRepository.getById.mockResolvedValue(false);
      await queueService.get();
    }catch(err){
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });

  test('method add', async () => {
    queueRedisRepository.add.mockResolvedValue(patientID);
    const res = await queueService.add(patientName);
    expect(res).toEqual(patientID);
  });

  test('method add(some error)', async () => {
    try{
      queueRedisRepository.add = jest.fn(() => { throw serverErr; });
      await queueService.add(patientName);
    }catch(err){
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });

  test('method delete', async () => {
    queueRedisRepository.delete.mockResolvedValue(patientID);
    const res = await queueService.delete();
    expect(res).toEqual(patientID);
  });

  test('method delete(queueRepository is empty)', async () => {
    queueRedisRepository.delete.mockResolvedValue(false);
    const res = await queueService.delete(patientName);
    expect(res).toEqual(false);
  });

  test('method delete(some error)', async () => {
    try{
      queueRedisRepository.delete = jest.fn(() => { throw serverErr; });
      await queueService.delete(patientName);
    }catch(err){
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });

  test('method getLength', async () => {
    queueRedisRepository.getLength.mockResolvedValue(3);
    const res = await queueService.getLength();
    expect(res).toEqual(3);
  });

  test('method getLength(queueRepository is empty)', async () => {
    queueRedisRepository.getLength.mockResolvedValue(0); // empty
    const res = await queueService.getLength();
    expect(res).toEqual(0);
  });

  test('method getLength(some error)', async () => {
    try{
      queueRedisRepository.getLength = jest.fn(() => { throw serverErr; });
      await queueService.getLength();
    }catch(err){
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });
});
