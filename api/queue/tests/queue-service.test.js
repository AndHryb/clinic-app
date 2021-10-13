import QueueService from '../service/queue-service.js';
import PatientSqlRepository from '../../patient/repository/patient-sql-repository.js';
import QueueRedisRepository from '../repository/queue-redis-repository.js';
import SequelizeMock from 'sequelize-mock';
import redis from 'redis-mock';

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
    expect(res).toBeFalsy();
  });

  test('method add', async () => {
    queueRedisRepository.add.mockResolvedValue(patientID);
    const res = await queueService.add(patientName);
    expect(res).toEqual(patientID);
  });

  test('method add(redis disconnect)', async () => {
    queueRedisRepository.add.mockResolvedValue(undefined);
    const res = await queueService.add(patientName);
    expect(res).toEqual(false);
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
