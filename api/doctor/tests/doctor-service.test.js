import DoctorService from '../service/doctor.service.js';
import DoctorRepository from '../repository/doctor.repository.js';
import { STATUSES, MESSAGES } from '../../../constants.js';
import ApiError from '../../../middleware/error_handling/ApiError.js';

const doctorService = new DoctorService(new DoctorRepository());
const { doctorRepository, userRepository } = doctorService;

describe('doctor service have to', () => {
  const serverErr = new Error('some error');
  let updateData;
  let docId;
  beforeEach(() => {
    updateData = {
      id: '5',
      name: 'Bob',
      email: 'doc@doc',
      oldPassword: '9876',
      newPassword: '1111',
      specNames: ['anaesthesiologist', 'cardiologist'],
    };
    docId = '5';
  });

  test('update doctor', async () => {
    doctorRepository.updateById = jest.fn(() => [{ name: 'joe', id: '4', userId: '10' }]);
    const res = await doctorService.updateById(updateData);

    expect(res[0].name).toBe('joe');
    expect(res[0].id).toBe('4');
    expect(res[0].userId).toBe('10');
  });

  test('failed wiht update by id(handled error)', async () => {
    try {
      doctorRepository.updateById = jest.fn(() => false);
      await doctorService.updateById(updateData);
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusCode).toBe(STATUSES.NotFound);
      expect(err.message).toBe(MESSAGES.NO_DOC);
    }
  });

  test('failed wiht update by id(unhandled error)', async () => {
    try {
      doctorRepository.updateById = jest.fn(() => { throw serverErr; });
      await doctorService.updateById(updateData);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });

  test('delete doctor', async () => {
    doctorRepository.deleteById = jest.fn(() => [{ name: 'joe', id: '5', userId: '10' }]);
    const res = await doctorService.deleteById(docId);
    expect(res[0].name).toBe('joe');
    expect(res[0].id).toBe('5');
    expect(res[0].userId).toBe('10');
  });

  test('failed wiht delete by id(handled error)', async () => {
    try {
      doctorRepository.deleteById = jest.fn(() => false);
      await doctorService.deleteById(docId);
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusCode).toBe(STATUSES.NotFound);
      expect(err.message).toBe(MESSAGES.NO_DOC);
    }
  });

  test('failed wiht delete by id(unhandled error)', async () => {
    try {
      doctorRepository.deleteById = jest.fn(() => { throw serverErr; });
      await doctorService.deleteById(docId);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });

  test('get all doctors', async () => {
    doctorRepository.getDoctors = jest.fn(() => [{ name: 'joe', id: '4', userId: '10' }]);
    const res = await doctorService.getDoctors();

    expect(res[0].name).toBe('joe');
    expect(res[0].id).toBe('4');
    expect(res[0].userId).toBe('10');
  });

  test('failed wiht get all doctors(handled error)', async () => {
    try {
      doctorRepository.getDoctors = jest.fn(() => false);
      await doctorService.getDoctors();
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusCode).toBe(STATUSES.NotFound);
      expect(err.message).toBe(MESSAGES.NO_DOC);
    }
  });

  test('failed wiht get all doctors(unhandled error)', async () => {
    try {
      doctorRepository.getDoctors = jest.fn(() => { throw serverErr; });
      await doctorService.getDoctors();
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });

  test('get doctor by userId', async () => {
    doctorRepository.getByUserId = jest.fn((userId) => ({ name: 'joe', id: '4', userId }));
    const res = await doctorService.getByUserId('10');
    expect(res.name).toBe('joe');
    expect(res.id).toBe('4');
    expect(res.userId).toBe('10');
  });

  test('failed wiht get doctor by userId', async () => {
    try {
      doctorRepository.getByUserId = jest.fn(() => false);
      await doctorService.getByUserId('10');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusCode).toBe(STATUSES.NotFound);
      expect(err.message).toBe(MESSAGES.NO_DOC);
    }
  });

  test('get doctor by userId(server error)', async () => {
    try {
      doctorRepository.getByUserId = jest.fn(() => { throw serverErr; });
      await doctorService.getByUserId('10');
    } catch (err) {
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
    try {
      doctorRepository.getSpecByUserId = jest.fn(() => false);
      await doctorService.getSpecByUserId('4');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusCode).toBe(STATUSES.NotFound);
      expect(err.message).toBe(MESSAGES.NO_DOC);
    }
  });

  test('get spec(server error)', async () => {
    try {
      doctorRepository.getSpecByUserId = jest.fn(() => { throw serverErr; });
      const res = await doctorService.getSpecByUserId('4');
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });
});
