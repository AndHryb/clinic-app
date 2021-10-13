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

import checkJwtToken from '../../../helpers/decode-token.js';

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
jest.mock('../../../helpers/decode-token.js');// checkJwtToken


const docData = { id: '444', name: 'Sergei' };

describe('queue controller unit tests', () => {

  test('first in queueRepository patient(queueRepository not empty)', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/next-in-queue',
      headers: {
        cookie: 'doctorToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
      },
    });
    const res = httpMocks.createResponse();
    checkJwtToken.mockResolvedValue({ userID: '222' });
    doctorService.getByUserId.mockResolvedValue(docData);
    queueService.get.mockResolvedValue('Andrei');
    await queueController.getNext(req,res);
    expect(res.statusCode).toEqual(STATUSES.OK)
    expect(res._getJSONData()).toEqual('Andrei')
  });

  test('first in queueRepository patient(queueRepository is empty)', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/next-in-queue',
      headers: {
        cookie: 'doctorToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
      },
    });
    const res = httpMocks.createResponse();
    checkJwtToken.mockResolvedValue({ userID: '222' });
    doctorService.getByUserId.mockResolvedValue(docData);
    queueService.get.mockResolvedValue(false);
    await queueController.getNext(req,res);
    expect(res.statusCode).toEqual(STATUSES.NotFound)
    expect(res._getJSONData()).toEqual('The queue is empty')
  });

  test('add in queueRepository', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/next-in-queue',
      headers: {
        cookie: 'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
      },
      body:{docID: '111'}
    });
    const res = httpMocks.createResponse();
    checkJwtToken.mockResolvedValue({ userID: '222' });
    userService.getByUserId.mockResolvedValue(docData);
    queueService.add.mockResolvedValue('111', '222');
    await queueController.addToQueue(req,res);
    expect(res.statusCode).toEqual(STATUSES.Created);
    expect(res._getJSONData()).toEqual('111');
  });

  test('add in queueRepository (token undefind)', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/next-in-queue',
      headers: {
      },
      body:{docID: '111'}
    });
    const res = httpMocks.createResponse();
    await queueController.addToQueue(req,res);
    expect(res.statusCode).toEqual(STATUSES.NotFound);
  });

  test('get all queues ', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/get-all',
      headers: {
      },
    });
    const res = httpMocks.createResponse();
    queueService.getAll.mockResolvedValue([{objQueue1:[]}, {objQueue2:[]}]);
    await queueController.getAllQueues(req,res);
    expect(res.statusCode).toEqual(STATUSES.OK);
    expect(res._getJSONData()).toEqual([{objQueue1:[]}, {objQueue2:[]}]);
  });

  test('get all queues(all queues unsefind) ', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/get-all',
      headers: {
      },
    });
    const res = httpMocks.createResponse();
    queueService.getAll.mockResolvedValue([]);
    await queueController.getAllQueues(req,res);
    expect(res.statusCode).toEqual(STATUSES.NotFound);
    expect(res._getJSONData()).toEqual('The all queues is empty');
  });
});


