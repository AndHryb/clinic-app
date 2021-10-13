import DoctorService from '../service/doctor.service.js';
import DoctorRepository from '../repository/doctor.repository.js';
import { STATUSES, NO_DOC_MSG } from '../../../constants.js';

const doctorService = new DoctorService(new DoctorRepository());
const doctorRepository = doctorService.repository;

describe('doctor service have to', () => {
  test('get all doctors', async () => {
    doctorRepository.getDoctors = jest.fn(() => [{ name: 'joe', id: '4', userId: '10' }]);
    const res = await doctorService.getDoctors();

    expect(res[0].name).toBe('joe');
    expect(res[0].id).toBe('4');
    expect(res[0].userId).toBe('10');
  });

  test('get doctor by userId', async () => {
    doctorRepository.getByUserId = jest.fn((userId) => ({ name: 'joe', id: '4', userId }));
    const res = await doctorService.getByUserId('10');

    expect(res.name).toBe('joe');
    expect(res.id).toBe('4');
    expect(res.userId).toBe('10');
  });

  test('get doctor by id', async () => {
    doctorRepository.getById = jest.fn((id) => ({ name: 'joe', id, userId: '10' }));
    const res = await doctorService.getById('4');

    expect(res.name).toBe('joe');
    expect(res.id).toBe('4');
    expect(res.userId).toBe('10');
  });

  test('get spec', async () => {
    doctorRepository.getSpec = jest.fn((id) => ({
      name: 'joe', id, userId: '10', specialties: { name: 'surgery' },
    }));
    const res = await doctorService.getSpec('4');

    expect(res.specialties.name).toBe('surgery');
    expect(res.id).toBe('4');
    expect(res.userId).toBe('10');
    expect(res.name).toBe('joe');
  });
});
