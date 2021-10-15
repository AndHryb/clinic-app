import DoctorService from '../service/doctor.service.js';
import DoctorRepository from '../repository/doctor.repository.js';
import { STATUSES, MESSAGES } from '../../../constants.js';
import ApiError from '../../../error_handling/ApiError.js';

const doctorService = new DoctorService(new DoctorRepository());
const doctorRepository = doctorService.repository;

describe('doctor service have to', () => {
  const serverErr = new Error('some error');

  test('get all doctors', async () => {
    doctorRepository.getDoctors = jest.fn(() => [{ name: 'joe', id: '4', userId: '10' }]);
    const res = await doctorService.getDoctors();

    expect(res[0].name).toBe('joe');
    expect(res[0].id).toBe('4');
    expect(res[0].userId).toBe('10');
  });

  test('failed wiht get all doctors', async () => {
    doctorRepository.getDoctors = jest.fn(() => false);
    const res = await doctorService.getDoctors();
    expect(res).toBeInstanceOf(ApiError);
    expect(res.message).toBe(MESSAGES.NO_DOC);
    expect(res.statusCode).toBe(STATUSES.NotFound);
  });

  test('failed wiht get all doctors', async () => {
    doctorRepository.getDoctors = jest.fn(() => {throw serverErr});
    const res = await doctorService.getDoctors();
    expect(res).toBeInstanceOf(Error);
    expect(res.message).toBe('some error');
  });

  test('get doctor by userId', async () => {
    doctorRepository.getByUserId = jest.fn((userId) => ({ name: 'joe', id: '4', userId }));
    const res = await doctorService.getByUserId('10');

    expect(res.name).toBe('joe');
    expect(res.id).toBe('4');
    expect(res.userId).toBe('10');
  });

  test('failed wiht get doctor by userId', async () => {
    doctorRepository.getByUserId = jest.fn(() => false);
    const res = await doctorService.getByUserId('10');
    expect(res).toBeInstanceOf(ApiError);
    expect(res.message).toBe(MESSAGES.NO_DOC);
    expect(res.statusCode).toBe(STATUSES.NotFound);
  });

  test('get doctor by userId(server error)', async () => {
    doctorRepository.getByUserId = jest.fn(() => {throw serverErr});
    const res = await doctorService.getByUserId('10');
    expect(res).toBeInstanceOf(Error);
    expect(res.message).toBe('some error');
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
    doctorRepository.getSpecByUserId = jest.fn(() => false);
    const res = await doctorService.getSpecByUserId('4');
    expect(res).toBeInstanceOf(ApiError);
    expect(res.message).toBe(MESSAGES.NO_DOC);
    expect(res.statusCode).toBe(STATUSES.NotFound);
  });

  test('get spec(server error)', async () => {
    doctorRepository.getSpecByUserId = jest.fn(() => {throw serverErr});
    const res = await doctorService.getSpecByUserId('4');
    expect(res).toBeInstanceOf(Error);
    expect(res.message).toBe('some error');
  });
});
