import * as httpMocks from 'node-mocks-http';
import redis from 'redis-mock';
import SequelizeMock from 'sequelize-mock';
import { STATUSES } from '../../../constants.js';
import QueueController from '../controllers/queue-controller.js';
import QueueService from '../service/queue-service.js';
import UserService from '../../auth/service/user-service.js';
import DoctorService from '../../doctor/service/doctor.service.js';
import QueueRedisRepository from '../repository/queue-redis-repository.js';
import UserSqlRepository from '../../auth/repository/user-sql-repository.js';
import DoctorRepository from '../../doctor/repository/doctor.repository.js';

import ApiError from '../../../middleware/error-handling/ApiError.js';

const usersSQLDB = new SequelizeMock();
const doctorSQLDB = new SequelizeMock();
const specialtiesSQLDB = new SequelizeMock();
const client = redis.createClient();

const queueRedisRepository = new QueueRedisRepository(client);
const userSqlRepository = new UserSqlRepository(usersSQLDB);
const doctorRepository = new DoctorRepository(doctorSQLDB, specialtiesSQLDB);

const queueService = new QueueService(queueRedisRepository);
const doctorService = new DoctorService(doctorRepository);
const userService = new UserService(userSqlRepository);
const queueController = new QueueController(queueService, userService, doctorService);

jest.mock('../../auth/service/user-service.js');// UserService
jest.mock('../service/queue-service.js');// QueueService
jest.mock('../../doctor/service/doctor.service.js');// DoctorService

const docData = { id: '444', name: 'Sergei' };

describe('queue controller unit tests', () => {
  let req;
  let res;
  let serverErr;
  let myError;
  let next;
  beforeEach(() => {
    next = jest.fn();
    const payload = {
      email: 'aaa@aaa',
      userId: '111',
      role: 'patient',
    };
    myError = ApiError.notFound('foo');
    serverErr = new Error('some error');
    req = httpMocks.createRequest({
      method: 'GET',
      url: '/next-in-queue',
      headers: {
        cookie: 'doctorToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      },
      payload: payload,
    });
    res = httpMocks.createResponse();
  });
  test('first in queueRepository patient(queueRepository not empty)', async () => {
    doctorService.getByUserId.mockResolvedValue(docData);
    queueService.get.mockResolvedValue('Andrei');
    await queueController.getNext(req, res, next);
    expect(res.statusCode).toEqual(STATUSES.OK);
    expect(res._getJSONData()).toEqual('Andrei');
  });

  test('first in queueRepository patient(queueRepository is empty)', async () => {
    doctorService.getByUserId.mockResolvedValue(docData);
    queueService.get = jest.fn(() => { throw myError; });
    await queueController.getNext(req, res, next);
    expect(queueService.get).toThrow(myError);
    expect(next).toHaveBeenCalledWith(myError);
  });

  test('first in queueRepository patient(server error)', async () => {
    doctorService.getByUserId.mockResolvedValue(docData);
    queueService.get = jest.fn(() => { throw serverErr; });
    await queueController.getNext(req, res, next);
    expect(queueService.get).toThrow(serverErr);
    expect(next).toHaveBeenCalledWith(serverErr);
  });

  test('add in queueRepository', async () => {
    userService.getByUserId.mockResolvedValue(docData);
    queueService.add.mockResolvedValue('111');
    await queueController.addToQueue(req, res, next);
    expect(res.statusCode).toEqual(STATUSES.Created);
    expect(res._getJSONData()).toEqual('111');
  });

  test('add in queueRepository (payload undefind)', async () => {
    req.body = { docID: '111' };
    userService.getByUserId.mockResolvedValue(docData);
    queueService.add = jest.fn(() => { throw myError; });
    await queueController.addToQueue(req, res, next);
    expect(queueService.add).toThrow(myError);
    expect(next).toHaveBeenCalledWith(myError);
  });

  test('add in queueRepository (server error)', async () => {
    req.body = { docID: '111' };
    userService.getByUserId.mockResolvedValue(docData);
    queueService.add = jest.fn(() => { throw serverErr; });
    await queueController.addToQueue(req, res, next);
    expect(queueService.add).toThrow(serverErr);
    expect(next).toHaveBeenCalledWith(serverErr);
  });

  test('get all queues ', async () => {
    queueService.getAll.mockResolvedValue([{ objQueue1: [] }, { objQueue2: [] }]);
    await queueController.getAllQueues(req, res, next);
    expect(res.statusCode).toEqual(STATUSES.OK);
    expect(res._getJSONData()).toEqual([{ objQueue1: [] }, { objQueue2: [] }]);
  });

  test('get all queues(all queues empty) ', async () => {
    queueService.getAll = jest.fn(() => { throw myError; });
    await queueController.getAllQueues(req, res, next);
    expect(queueService.getAll).toThrow(myError);
    expect(next).toHaveBeenCalledWith(myError);
  });

  test('get all queues(server error) ', async () => {
    queueService.getAll = jest.fn(() => { throw serverErr; });
    await queueController.getAllQueues(req, res, next);
    expect(queueService.getAll).toThrow(serverErr);
    expect(next).toHaveBeenCalledWith(serverErr);
  });
});
