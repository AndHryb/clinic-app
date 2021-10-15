import SequelizeMock from 'sequelize-mock';
import redis from 'redis-mock';
import QueueService from '../service/queue-service.js';
import PatientSqlRepository from '../../patient/repository/patient-sql-repository.js';
import QueueRedisRepository from '../repository/queue-redis-repository.js';
import ApiError from '../../../error_handling/ApiError.js';
import { MESSAGES, STATUSES } from '../../../constants.js';

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
    queueRedisRepository.get.mockResolvedValue(false);
    patientSqlRepository.getById.mockResolvedValue(false);
    const res = await queueService.get();
    expect(res).toBeInstanceOf(ApiError);
    expect(res.message).toBe(MESSAGES.QUEUE_EMPTY);
    expect(res.statusCode).toBe(STATUSES.NotFound);
  });

  test('method get(some err)', async () => {
    queueRedisRepository.get = jest.fn(() => { throw serverErr; });
    patientSqlRepository.getById.mockResolvedValue(false);
    const res = await queueService.get();
    expect(res).toBeInstanceOf(Error);
    expect(res.message).toBe('some error');
  });

  test('method add', async () => {
    queueRedisRepository.add.mockResolvedValue(patientID);
    const res = await queueService.add(patientName);
    expect(res).toEqual(patientID);
  });

  test('method add(some error)', async () => {
    queueRedisRepository.add = jest.fn(() => { throw serverErr; });
    const res = await queueService.add(patientName);
    expect(res).toBeInstanceOf(Error);
    expect(res.message).toBe('some error');
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
});
