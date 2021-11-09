import bcrypt from 'bcryptjs';
import DoctorService from '../service/doctor-service.js';
import DoctorRepository from '../repository/doctor-repository.js';
import DoctorRedisRepository from '../repository/doctor-redis-repository.js';
import UserSqlRepository from '../../auth/repository/user-sql-repository.js';
import { STATUSES, MESSAGES } from '../../../constants.js';
import ApiError from '../../../middleware/error-handling/ApiError.js';

const doctorService = new DoctorService(
  new DoctorRepository(),
  new DoctorRedisRepository(),
  new UserSqlRepository(),
);
const { doctorRepository, doctorRedisRepository} = doctorService;

describe('doctor service have to', () => {
  const serverErr = new Error('some error');
  let updateData;
  let docId;
  let docData;
  const oldSpecs = ['pediatrician', 'surgery'];
  const newSpecs = ['anaesthesiologist', 'cardiologist'];
  const salt = bcrypt.genSaltSync(10);
  beforeEach(() => {
    updateData = {
      id: '5',
      name: 'Bobbi',
      email: 'd@d',
      oldPassword: '9876',
      newPassword: '1111',
      specNames: ['anaesthesiologist', 'cardiologist'],
    };
    docId = '5';
    docData = {
      id: '1',
      name: 'Bob',
      email: 'doc@doc',
      userId: '2',
      specialties: [
        {
          id: '2',
          name: 'pediatrician',
          doctorsSpecializations: {
            doctorId: '1',
            specializationId: '2',
          },
        },
        {
          id: '1',
          name: 'surgery',
          doctorsSpecializations: {
            doctorId: '1',
            specializationId: '1',
          },
        },
      ],
      user: {
        id: '2',
        email: 'doc@doc',
        password: bcrypt.hashSync('9876', salt),
        role: 'doctor',
        save: jest.fn(),
      },
      save: jest.fn(),
    };
  });

  test('update doctor(all fields)', async () => {
    doctorRepository.getAllDependencies = jest.fn(() => docData);
    doctorRepository.setSpecsByName = jest.fn((docData) => {
      docData.specialties[0].name = newSpecs[0];
      docData.specialties[1].name = newSpecs[1];
      return docData;
    });
    doctorRedisRepository.update = jest.fn(() => true);
    const res = await doctorService.updateById(updateData);

    expect(res.name).toEqual('Bobbi');
    expect(res.email).toEqual('d@d');
    expect(res.user.email).toEqual('d@d');
    expect(bcrypt.compareSync('1111', res.user.password)).toBeTruthy();
    expect(res.specialties[0].name).toEqual(newSpecs[0]);
    expect(res.specialties[1].name).toEqual(newSpecs[1]);
    expect(doctorRepository.setSpecsByName).toHaveBeenCalled();
    expect(doctorRedisRepository.update).toHaveBeenCalled();
    expect(res.save).toHaveBeenCalled();
    expect(res.user.save).toHaveBeenCalled();
  });

  test('update doctor(without email)', async () => {
    updateData.email = false;
    doctorRepository.getAllDependencies = jest.fn(() => docData);
    doctorRepository.setSpecsByName = jest.fn((docData) => {
      docData.specialties[0].name = newSpecs[0];
      docData.specialties[1].name = newSpecs[1];
      return docData;
    });
    doctorRedisRepository.update = jest.fn(() => true);
    const res = await doctorService.updateById(updateData);

    expect(res.name).toEqual('Bobbi');
    expect(res.email).toEqual('doc@doc');
    expect(res.user.email).toEqual('doc@doc');
    expect(bcrypt.compareSync('1111', res.user.password)).toBeTruthy();
    expect(res.specialties[0].name).toEqual(newSpecs[0]);
    expect(res.specialties[1].name).toEqual(newSpecs[1]);
    expect(doctorRepository.setSpecsByName).toHaveBeenCalled();
    expect(doctorRedisRepository.update).toHaveBeenCalled();
    expect(res.save).toHaveBeenCalled();
    expect(res.user.save).toHaveBeenCalled();
  });

  test('update doctor(without name)', async () => {
    updateData.name = false;
    doctorRepository.getAllDependencies = jest.fn(() => docData);
    doctorRepository.setSpecsByName = jest.fn((docData) => {
      docData.specialties[0].name = newSpecs[0];
      docData.specialties[1].name = newSpecs[1];
      return docData;
    });
    doctorRedisRepository.update = jest.fn(() => true);
    const res = await doctorService.updateById(updateData);

    expect(res.name).toEqual('Bob');
    expect(res.email).toEqual('d@d');
    expect(res.user.email).toEqual('d@d');
    expect(bcrypt.compareSync('1111', res.user.password)).toBeTruthy();
    expect(res.specialties[0].name).toEqual(newSpecs[0]);
    expect(res.specialties[1].name).toEqual(newSpecs[1]);
    expect(doctorRepository.setSpecsByName).toHaveBeenCalled();
    expect(doctorRedisRepository.update).toHaveBeenCalled();
    expect(res.save).toHaveBeenCalled();
    expect(res.user.save).toHaveBeenCalled();
  });

  test('update doctor(without spec list)', async () => {
    updateData.specNames = false;
    doctorRepository.getAllDependencies = jest.fn(() => docData);
    doctorRedisRepository.update = jest.fn(() => true);
    const res = await doctorService.updateById(updateData);

    expect(res.name).toEqual('Bobbi');
    expect(res.email).toEqual('d@d');
    expect(res.user.email).toEqual('d@d');
    expect(bcrypt.compareSync('1111', res.user.password)).toBeTruthy();
    expect(res.specialties[0].name).toEqual(oldSpecs[0]);
    expect(res.specialties[1].name).toEqual(oldSpecs[1]);
    expect(doctorRedisRepository.update).toHaveBeenCalled();
    expect(res.save).toHaveBeenCalled();
    expect(res.user.save).toHaveBeenCalled();
  });

  test('failed wiht update (the passwords not match)', async () => {
    try {
      updateData.oldPassword = '9877';
      doctorRepository.getAllDependencies = jest.fn(() => docData);
      doctorRepository.setSpecsByName = jest.fn();
      doctorRedisRepository.update = jest.fn(() => true);
      await doctorService.updateById(updateData);
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusCode).toBe(STATUSES.Forbidden);
      expect(err.message).toBe(MESSAGES.PASSWORD_NOT_MATCH);
      expect(doctorRepository.setSpecsByName).not.toHaveBeenCalled();
      expect(doctorRedisRepository.update).not.toHaveBeenCalled();
    }
  });

  test('failed wiht update (the specNames match to specList in database)', async () => {
    updateData.specNames = oldSpecs;
    try {
      doctorRepository.getAllDependencies = jest.fn(() => docData);
      doctorRepository.setSpecsByName = jest.fn();
      doctorRedisRepository.update = jest.fn(() => true);
      await doctorService.updateById(updateData);
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusCode).toBe(STATUSES.BadRequest);
      expect(err.message).toBe(MESSAGES.SPECS_NOT_CHANGED);
      expect(doctorRepository.setSpecsByName).not.toHaveBeenCalled();
      expect(doctorRedisRepository.update).not.toHaveBeenCalled();
    }
  });

  test('failed wiht update (object contains only id)', async () => {
    updateData = {
      id: '5',
    };
    doctorRepository.getAllDependencies = jest.fn(() => docData);
    doctorRepository.setSpecsByName = jest.fn();
    doctorRedisRepository.update = jest.fn(() => true);
    const res = await doctorService.updateById(updateData);

    expect(res.name).toEqual('Bob');
    expect(res.email).toEqual('doc@doc');
    expect(res.user.email).toEqual('doc@doc');
    expect(bcrypt.compareSync('9876', res.user.password)).toBeTruthy();
    expect(res.specialties[0].name).toEqual(oldSpecs[0]);
    expect(res.specialties[1].name).toEqual(oldSpecs[1]);
    expect(doctorRepository.setSpecsByName).not.toHaveBeenCalled();
    expect(doctorRedisRepository.update).toHaveBeenCalled();
    expect(res.save).toHaveBeenCalled();
    expect(res.user.save).toHaveBeenCalled();
  });

  test('failed wiht update by id(unhandled error)', async () => {
    try {
      doctorRepository.getAllDependencies = jest.fn(() => { throw serverErr; });
      await doctorService.updateById(updateData);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });

  test('delete doctor', async () => {
    doctorRepository.deleteById = jest.fn(() => [{ name: 'joe', id: '5', userId: '10' }]);
    doctorRedisRepository.delete = jest.fn(() => true);
    const res = await doctorService.deleteById(docId);
    expect(res[0].name).toBe('joe');
    expect(res[0].id).toBe('5');
    expect(res[0].userId).toBe('10');
    expect(doctorRedisRepository.delete).toHaveBeenCalled();
  });

  test('failed wiht delete by id(handled error)', async () => {
    try {
      doctorRepository.deleteById = jest.fn(() => false);
      doctorRedisRepository.delete = jest.fn(() => false);
      await doctorService.deleteById(docId);
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusCode).toBe(STATUSES.NotFound);
      expect(err.message).toBe(MESSAGES.NO_DOC);
      expect(doctorRedisRepository.delete).not.toHaveBeenCalled();
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

  test('get all doctors(cache empty)', async () => {
    doctorRedisRepository.getAll = jest.fn(() => false);
    doctorRepository.getDoctors = jest.fn(
      () => [{ name: 'joe', id: '4', userId: '10' }],
    );
    doctorRedisRepository.setData = jest.fn(() => true);
    const res = await doctorService.getDoctors();

    expect(res[0].name).toBe('joe');
    expect(res[0].id).toBe('4');
    expect(res[0].userId).toBe('10');

    expect(doctorRedisRepository.getAll).toHaveBeenCalled();
    expect(doctorRepository.getDoctors).toHaveBeenCalled();
    expect(doctorRedisRepository.setData).toHaveBeenCalled();
  });

  test('get all doctors(data cached)', async () => {
    doctorRedisRepository.getAll = jest.fn(() => (
      [{ name: 'joe', id: '4', userId: '10' }]));
    doctorRepository.getDoctors = jest.fn();
    doctorRedisRepository.setData = jest.fn();
    const res = await doctorService.getDoctors();

    expect(res[0].name).toBe('joe');
    expect(res[0].id).toBe('4');
    expect(res[0].userId).toBe('10');

    expect(doctorRedisRepository.getAll).toHaveBeenCalled();
    expect(doctorRepository.getDoctors).not.toHaveBeenCalled();
    expect(doctorRedisRepository.setData).not.toHaveBeenCalled();
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
      await doctorService.getSpecByUserId('4');
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('some error');
    }
  });
});
