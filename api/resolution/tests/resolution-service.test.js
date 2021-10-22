import redis from 'redis-mock';
import SequelizeMock from 'sequelize-mock';
import ResolutionService from '../service/resolution-service.js';
import ResolutionSqlRepository from '../repository/resolution-sql-repository.js';
import PatientSqlRepository from '../../patient/repository/patient-sql-repository.js';
import QueueRedisRepository from '../../queue/repository/queue-redis-repository.js';
import { STATUSES, TTL } from '../../../constants.js';
import ApiError from '../../../middleware/error_handling/ApiError.js';

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
  let myError;

  beforeEach(() => {
    myError = ApiError.notFound('foo');
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

 
  test('isTheRightDoctor check right', async () => {
    resolutionSqlRepository.getById.mockResolvedValue({doctorId: docId});
    const res = await resolutionService.isTheRightDoctor(resolutionId, docId);
    expect(res).toEqual(true);
    expect(resolutionSqlRepository.getById).toBeCalled();
  });

  test('isTheRightDoctor check right(no right)', async () => {
    resolutionSqlRepository.getById.mockResolvedValue({doctorId: '111'});
    const res = await resolutionService.isTheRightDoctor(resolutionId, docId);
    expect(res).toEqual(false);
    expect(resolutionSqlRepository.getById).toBeCalled();
  });

  test('isTheRightDoctor check right(some error)', async () => {
    try{
      resolutionSqlRepository.getById.mockResolvedValue(() =>{throw serverErr});
    const res = await resolutionService.isTheRightDoctor(resolutionId, docId);
    }catch(err){
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
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
    try{
      resolutionSqlRepository.getByName = jest.fn((() => { throw myError; }));
      const res = await resolutionService.getResolutionsByName('Andrei');
    }catch(err){
      expect(err).toBeInstanceOf(ApiError);
      expect(err.message).toBe('foo');
      expect(err.statusCode).toBe(STATUSES.NotFound);
    }
  });

  test('get resolutions by name (there is no match by name)', async () => {
    try{
      resolutionSqlRepository.getByName = jest.fn((() => { throw myError; }));
      const res = await resolutionService.getResolutionsByName('Andrei');
    }catch(err){
      expect(err).toBeInstanceOf(ApiError);
      expect(err.message).toBe('foo');
      expect(err.statusCode).toBe(STATUSES.NotFound);
    }
  });

  test('get resolutions by name (some err)', async () => {
    try{
      resolutionSqlRepository.getByName = jest.fn((() => { throw serverErr; }));
      const res = await resolutionService.getResolutionsByName('Andrei');
    }catch(err){
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });

  test('get resolution by userId', async () => {
    patientSqlRepository.getByUserId.mockResolvedValue(patientData1);
    resolutionSqlRepository.getByPatientId.mockResolvedValue(patientList);
    const res = await resolutionService.getResolutionByUserId('asd');
    expect(res[0].id).toBe('222');
    expect(res[0].name).toBe('Andrei');
    expect(res[0].gender).toBe('male');
    expect(res[0].birthday).toBe('1993-02-19');
    expect(res[0].userId).toBe('333');
  });

  test('get resolution by userId(not found)', async () => {
    try{
      patientSqlRepository.getByUserId.mockResolvedValue(patientData1);
      resolutionSqlRepository.getByPatientId = jest.fn(() => { throw myError; });
      await resolutionService.getResolutionByUserId('asd');
    }catch(err){
      expect(err).toBeInstanceOf(ApiError);
      expect(err.message).toBe('foo');
      expect(err.statusCode).toBe(STATUSES.NotFound);
    }
  });

  test('get resolution by userId(some error)', async () => {
    try{
      patientSqlRepository.getByUserId.mockResolvedValue(patientData1);
      resolutionSqlRepository.getByPatientId = jest.fn(() => { throw serverErr; });
      await resolutionService.getResolutionByUserId('asd');
    }catch(err){
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
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
    try{
      queueRedisRepository.getLength = jest.fn(() => { throw myError; });
      const res = await resolutionService.addResolution('bla bla');
    }catch(err){
      expect(err).toBeInstanceOf(ApiError);
      expect(err.message).toBe('foo');
      expect(err.statusCode).toBe(STATUSES.NotFound);
    }
  });

  test('add resolution (some error)', async () => {
    try{
      queueRedisRepository.getLength = jest.fn(() => { throw serverErr; });
      const res = await resolutionService.addResolution('bla bla');
    }catch(err){
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });

  test('delete resolution data(repository has data)', async () => {
    resolutionService.isTheRightDoctor = jest.fn(() => true);
    resolutionSqlRepository.delete.mockResolvedValue(true);
    const res = await resolutionService.delete(resolutionId, docId);
    expect(res).toEqual(true);
    expect(resolutionService.isTheRightDoctor).toBeCalled();
    expect(resolutionSqlRepository.delete).toBeCalled();
  });

  test('delete resolution data(no right to delete)', async () => {
    try{
      resolutionService.isTheRightDoctor = jest.fn(() => { throw myError; });
      resolutionSqlRepository.delete.mockResolvedValue(false);
      await resolutionService.delete(resolutionId, docId);
    }catch(err){
      expect(err).toBeInstanceOf(ApiError);
      expect(err.message).toBe('foo');
      expect(err.statusCode).toBe(STATUSES.NotFound);
    }
  });

  test('delete resolution data(repository hasn\'t data)', async () => {
    try{
      resolutionService.isTheRightDoctor = jest.fn(() =>  true );
      resolutionSqlRepository.delete  = jest.fn(() => { throw myError; });
      await resolutionService.delete(resolutionId, docId);
    }catch(err){
      expect(err).toBeInstanceOf(ApiError);
      expect(err.message).toBe('foo');
      expect(err.statusCode).toBe(STATUSES.NotFound);
    }
  });

   
  test('delete resolution data(some error)', async () => {
    try{
      resolutionService.isTheRightDoctor = jest.fn(() => { throw serverErr; });
      resolutionSqlRepository.delete.mockResolvedValue(false);
      await resolutionService.delete(resolutionId, docId);
    }catch(err){
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });

});
