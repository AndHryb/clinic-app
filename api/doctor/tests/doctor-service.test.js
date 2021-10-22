import DoctorService from '../service/doctor.service.js';
import DoctorRepository from '../repository/doctor.repository.js';
import { STATUSES } from '../../../constants.js';
import ApiError from '../../../middleware/error_handling/ApiError.js';

const doctorService = new DoctorService(new DoctorRepository());
const doctorRepository = doctorService.repository;

describe('doctor service have to', () => {
  const serverErr = new Error('some error');
  const myError = ApiError.forbidden('foo');

  test('get all doctors', async () => {
    doctorRepository.getDoctors = jest.fn(() => [{ name: 'joe', id: '4', userId: '10' }]);
    const res = await doctorService.getDoctors();

    expect(res[0].name).toBe('joe');
    expect(res[0].id).toBe('4');
    expect(res[0].userId).toBe('10');
  });

  test('failed wiht get all doctors(handled error)', async () => {
    try{
      doctorRepository.getDoctors = jest.fn(() => {throw myError});
      await doctorService.getDoctors();
    }catch(err){
      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusCode).toBe(STATUSES.Forbidden);
      expect(err.message).toBe('foo');
    };
  });

  test('failed wiht get all doctors(unhandled error)', async () => {
    try{
      doctorRepository.getDoctors = jest.fn(() => {throw serverErr});
      await doctorService.getDoctors();
    }catch(err){
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    };
  });

  test('get doctor by userId', async () => {
    doctorRepository.getByUserId = jest.fn((userId) => ({ name: 'joe', id: '4', userId }));
    const res = await doctorService.getByUserId('10');
    expect(res.name).toBe('joe');
    expect(res.id).toBe('4');
    expect(res.userId).toBe('10');
  });

  test('failed wiht get doctor by userId', async () => {
    try{
      doctorRepository.getByUserId = jest.fn(() => {throw myError});
      await doctorService.getByUserId('10');
    }catch(err){
      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusCode).toBe(STATUSES.Forbidden);
      expect(err.message).toBe('foo');
    };
  });

  test('get doctor by userId(server error)', async () => {
    try{
      doctorRepository.getByUserId = jest.fn(() => {throw serverErr});
      await doctorService.getByUserId('10');
    }catch(err){
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });


  test('get spec', async () => {
    doctorRepository.getSpecByUserId = jest.fn((id) => ({
      name: 'joe', id, userId: '10', specialties: { name: 'surgery' },
    }));
   
    const res = await doctorService.getSpecByUserId('4');
    expect(res.specialties.name).toBe('surgery');
    expect(res.id).toBe('4');
    expect(res.userId).toBe('10');
    expect(res.name).toBe('joe');
  });

  test('failed with get spec', async () => {
    try{
      doctorRepository.getSpecByUserId = jest.fn(() => {throw myError});
      await doctorService.getSpecByUserId('4');
    }catch(err){
      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusCode).toBe(STATUSES.Forbidden);
      expect(err.message).toBe('foo');
    };
  });

  test('get spec(server error)', async () => {
    try{
      doctorRepository.getSpecByUserId = jest.fn(() => {throw serverErr});
      const res = await doctorService.getSpecByUserId('4');
    }catch(err){
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });
});
