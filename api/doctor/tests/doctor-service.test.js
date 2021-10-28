import bcrypt from 'bcryptjs';
import DoctorService from '../service/doctor.service.js';
import DoctorRepository from '../repository/doctor.repository.js';
import UserSqlRepository from '../../auth/repository/user-sql-repository.js';
import { STATUSES, MESSAGES } from '../../../constants.js';
import ApiError from '../../../middleware/error_handling/ApiError.js';

const doctorService = new DoctorService(new DoctorRepository(), new UserSqlRepository());
const { doctorRepository, userRepository } = doctorService;

describe('doctor service have to', () => {
  const serverErr = new Error('some error');
  let updateData;
  let docId;
  let userData;
  let specData;
  let docData;
  const salt = bcrypt.genSaltSync(10);
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
    userData = {
      email: 'd@d',
      password: bcrypt.hashSync('9876', salt),
      id: '2',
    };
    specData = {
      specialties: [
        { name: 'surgery' },
        { name: 'gynecology' },
      ],
    };
    docData = {
      name: 'joe',
      id: '4',
      userId: '10',
      email: 'd@d',
    };
  });

  test('update doctor(all fields)', async () => {
    doctorRepository.getById = jest.fn(() => docData);
    userRepository.getById = jest.fn(() => userData);
    doctorRepository.getSpec = jest.fn(() => specData);
    doctorRepository.updateById = jest.fn(() => ({
      doctor: docData,
      user: userData,
      oldSpecs: ['surgery', 'gynecology'],
      newSpecs: ['anaesthesiologist', 'cardiologist'],
    }));
    const res = await doctorService.updateById(updateData);

    expect(res.doctor).toEqual({
      name: 'Bob',
      id: '4',
      userId: '10',
      email: 'doc@doc',
    });
    expect(res.user.email).toEqual('doc@doc');
    expect(res.user.id).toEqual('2');
    expect(bcrypt.compareSync('1111', res.user.password)).toBeTruthy();
    expect(res.oldSpecs).toEqual(['surgery', 'gynecology']);
    expect(res.newSpecs).toEqual(['anaesthesiologist', 'cardiologist']);
    expect(doctorRepository.getById).toHaveBeenCalled();
    expect(userRepository.getById).toHaveBeenCalled();
    expect(doctorRepository.getSpec).toHaveBeenCalled();
    expect(doctorRepository.updateById).toHaveBeenCalled();
  });

  test('update doctor(without email)', async () => {
    updateData.email = false;
    doctorRepository.getById = jest.fn(() => docData);
    userRepository.getById = jest.fn(() => userData);
    doctorRepository.getSpec = jest.fn(() => specData);
    doctorRepository.updateById = jest.fn(() => ({
      doctor: docData,
      user: userData,
      oldSpecs: ['surgery', 'gynecology'],
      newSpecs: ['anaesthesiologist', 'cardiologist'],
    }));
    const res = await doctorService.updateById(updateData);

    expect(res.doctor).toEqual({
      name: 'Bob',
      id: '4',
      userId: '10',
      email: 'd@d',
    });
    expect(res.user.email).toEqual('d@d');
    expect(res.user.id).toEqual('2');
    expect(bcrypt.compareSync('1111', res.user.password)).toBeTruthy();
    expect(res.oldSpecs).toEqual(['surgery', 'gynecology']);
    expect(res.newSpecs).toEqual(['anaesthesiologist', 'cardiologist']);
    expect(doctorRepository.getById).toHaveBeenCalled();
    expect(userRepository.getById).toHaveBeenCalled();
    expect(doctorRepository.getSpec).toHaveBeenCalled();
    expect(doctorRepository.updateById).toHaveBeenCalled();
  });

  test('update doctor(without name)', async () => {
    updateData.name = false;
    doctorRepository.getById = jest.fn(() => docData);
    userRepository.getById = jest.fn(() => userData);
    doctorRepository.getSpec = jest.fn(() => specData);
    doctorRepository.updateById = jest.fn(() => ({
      doctor: docData,
      user: userData,
      oldSpecs: ['surgery', 'gynecology'],
      newSpecs: ['anaesthesiologist', 'cardiologist'],
    }));
    const res = await doctorService.updateById(updateData);

    expect(res.doctor).toEqual({
      name: 'joe',
      id: '4',
      userId: '10',
      email: 'doc@doc',
    });
    expect(res.user.email).toEqual('doc@doc');
    expect(res.user.id).toEqual('2');
    expect(bcrypt.compareSync('1111', res.user.password)).toBeTruthy();
    expect(res.oldSpecs).toEqual(['surgery', 'gynecology']);
    expect(res.newSpecs).toEqual(['anaesthesiologist', 'cardiologist']);
    expect(doctorRepository.getById).toHaveBeenCalled();
    expect(userRepository.getById).toHaveBeenCalled();
    expect(doctorRepository.getSpec).toHaveBeenCalled();
    expect(doctorRepository.updateById).toHaveBeenCalled();
  });

  test('update doctor(without spec list)', async () => {
    updateData.specNames = false;
    doctorRepository.getById = jest.fn(() => docData);
    userRepository.getById = jest.fn(() => userData);
    doctorRepository.getSpec = jest.fn(() => specData);
    doctorRepository.updateById = jest.fn(() => ({
      doctor: docData,
      user: userData,
      oldSpecs: undefined,
      newSpecs: undefined,
    }));
    const res = await doctorService.updateById(updateData);

    expect(res.doctor).toEqual({
      name: 'Bob',
      id: '4',
      userId: '10',
      email: 'doc@doc',
    });
    expect(res.user.email).toEqual('doc@doc');
    expect(res.user.id).toEqual('2');
    expect(bcrypt.compareSync('1111', res.user.password)).toBeTruthy();
    expect(res.oldSpecs).toBeFalsy();
    expect(res.newSpecs).toBeFalsy();
    expect(doctorRepository.getById).toHaveBeenCalled();
    expect(userRepository.getById).toHaveBeenCalled();
    expect(doctorRepository.getSpec).not.toHaveBeenCalled();
    expect(doctorRepository.updateById).toHaveBeenCalled();
  });

  test('failed wiht update (the emails match)', async () => {
    try {
      updateData.email = 'd@d';
      doctorRepository.getById = jest.fn(() => docData);
      userRepository.getById = jest.fn(() => userData);
      doctorRepository.getSpec = jest.fn(() => specData);
      doctorRepository.updateById = jest.fn(() => 1);
      await doctorService.updateById(updateData);
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusCode).toBe(STATUSES.BadRequest);
      expect(err.message).toBe(MESSAGES.EMAL_NOT_CHANGED);
      expect(doctorRepository.getById).toHaveBeenCalled();
      expect(userRepository.getById).toHaveBeenCalled();
      expect(doctorRepository.getSpec).not.toHaveBeenCalled();
      expect(doctorRepository.updateById).not.toHaveBeenCalled();
    }
  });

  test('failed wiht update (the names match)', async () => {
    try {
      updateData.name = 'joe';
      doctorRepository.getById = jest.fn(() => docData);
      userRepository.getById = jest.fn(() => userData);
      doctorRepository.getSpec = jest.fn(() => specData);
      doctorRepository.updateById = jest.fn(() => 1);
      await doctorService.updateById(updateData);
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusCode).toBe(STATUSES.BadRequest);
      expect(err.message).toBe(MESSAGES.NAME_NOT_CHANGED);
      expect(doctorRepository.getById).toHaveBeenCalled();
      expect(userRepository.getById).not.toHaveBeenCalled();
      expect(doctorRepository.getSpec).not.toHaveBeenCalled();
      expect(doctorRepository.updateById).not.toHaveBeenCalled();
    }
  });

  test('failed wiht update (the passwords not match)', async () => {
    try {
      updateData.oldPassword = '9877';
      doctorRepository.getById = jest.fn(() => docData);
      userRepository.getById = jest.fn(() => userData);
      doctorRepository.getSpec = jest.fn(() => specData);
      doctorRepository.updateById = jest.fn(() => 1);
      await doctorService.updateById(updateData);
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusCode).toBe(STATUSES.Forbidden);
      expect(err.message).toBe(MESSAGES.PASSWORD_NOT_MATCH);
      expect(doctorRepository.getById).toHaveBeenCalled();
      expect(userRepository.getById).toHaveBeenCalled();
      expect(doctorRepository.getSpec).not.toHaveBeenCalled();
      expect(doctorRepository.updateById).not.toHaveBeenCalled();
    }
  });

  test('failed wiht update (the specNames match to specList in database)', async () => {
    try {
      updateData.specNames = ['surgery', 'gynecology'];
      doctorRepository.getById = jest.fn(() => docData);
      userRepository.getById = jest.fn(() => userData);
      doctorRepository.getSpec = jest.fn(() => specData);
      doctorRepository.updateById = jest.fn(() => 1);
      await doctorService.updateById(updateData);
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusCode).toBe(STATUSES.BadRequest);
      expect(err.message).toBe(MESSAGES.SPECS_NOT_CHANGED);
      expect(doctorRepository.getById).toHaveBeenCalled();
      expect(userRepository.getById).toHaveBeenCalled();
      expect(doctorRepository.getSpec).toHaveBeenCalled();
      expect(doctorRepository.updateById).not.toHaveBeenCalled();
    }
  });

  test('failed wiht update (object contains only id)', async () => {
    try {
      updateData = {
        id: '5',
      };
      doctorRepository.getById = jest.fn(() => docData);
      userRepository.getById = jest.fn(() => userData);
      doctorRepository.getSpec = jest.fn(() => specData);
      doctorRepository.updateById = jest.fn(() => 1);
      await doctorService.updateById(updateData);
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusCode).toBe(STATUSES.BadRequest);
      expect(err.message).toBe(MESSAGES.UPDATE_FAIL);
      expect(doctorRepository.getById).toHaveBeenCalled();
      expect(userRepository.getById).not.toHaveBeenCalled();
      expect(doctorRepository.getSpec).not.toHaveBeenCalled();
      expect(doctorRepository.updateById).not.toHaveBeenCalled();
    }
  });

  test('failed wiht update by id(unhandled error)', async () => {
    try {
      doctorRepository.getById = jest.fn(() => { throw serverErr; });
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
