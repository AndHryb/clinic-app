import { authClient } from './auth-api.js';

authClient.getCookieToken('doctor-token');
// if(!authClient.token){
//   window.location = './doctor-login.html'
// }

const displayPatientNameForDoctor = document.getElementById('display_patient_name_for_doctor');
const nextBtnForDoctor = document.getElementById('next_btn');

const doctorResolution = document.getElementById('resolution_text');
const addBtnForResolution = document.getElementById('btn_for_resolution');

const inputForSearchResolution = document.getElementById('show_resolution_input');
const showResolutionBtn = document.getElementById('show_resolution_btn');
let tableForResolution1 = document.getElementById('table_for_doctor_resolution');
const deleteResolutionBtn = document.getElementById('del_resolution_btn');
const deleteResolutionID = document.getElementById('del_resolution_id');
const patientSpec = document.getElementById('speciality');
let curPatientData;
let specialities;

nextBtnForDoctor.addEventListener('click', async () => {
  try {
    const response = await authClient.client.get('/queue/next');
    const data = await response.data;
    curPatientData = data;
    const specObj = specialities.find((elem) => curPatientData.specId === elem.id);
    patientSpec.textContent = specObj.name;
    const { name } = data;
    displayPatientNameForDoctor.textContent = name;
  } catch (err) {
    console.log(err.response.data || err);
  }
});

addBtnForResolution.addEventListener('click', async () => {
  if (doctorResolution.value === '') {
    console.log('Fill resolution');
    return;
  }
  if (doctorResolution.value === '' || !curPatientData) {
    console.log('Befor adding resolution call next patient');
    return;
  }
  try {
    const response = await authClient.client.post('/resolution', {
      value: doctorResolution.value,
      specId: curPatientData.specId,
      patientId: curPatientData.id,
    });
    const data = await response.data;
    console.log(data);
    if (data) {
      console.log(`Resolution ${data.id} added`);
    }
  } catch (err) {
    console.log(err.response.data || err);
  }
  curPatientData = null;
  doctorResolution.value = '';
  patientSpec.textContent = '';
  displayPatientNameForDoctor.textContent = '';
});

showResolutionBtn.addEventListener('click', async () => {
  try {
    const response = await authClient.client.get(`/resolution/?name=${inputForSearchResolution.value}`);
    const data = await response.data;
    console.log(data);

    tableForResolution1.remove();
    const tableForResolution = document.createElement('table');
    tableForResolution.setAttribute('class', 'resolution_table');
    tableForResolution.setAttribute('id', 'table_for_doctor_resolution');

    let tr = document.createElement('tr');

    const th1 = document.createElement('th');
    th1.innerHTML = 'Resolution ID';
    tr.appendChild(th1);

    const th2 = document.createElement('th');
    th2.innerHTML = 'Content';
    tr.appendChild(th2);

    const th3 = document.createElement('th');
    th3.innerHTML = 'Speciality';
    tr.appendChild(th3);

    const th5 = document.createElement('th');
    th5.innerHTML = 'Patient name';
    tr.appendChild(th5);

    const th6 = document.createElement('th');
    th6.innerHTML = 'Doctor name';
    tr.appendChild(th6);

    const th7 = document.createElement('th');
    th7.innerHTML = 'Created At';
    tr.appendChild(th7);

    tableForResolution.appendChild(tr);

    data.resolutions.forEach((elem) => {
      const arr = elem.createdAt.split('T');
      const time = arr[1].substr(0, 8);

      tr = document.createElement('tr');
      const idTd = document.createElement('td');
      idTd.innerHTML = elem.id;
      tr.appendChild(idTd);

      const contentTd = document.createElement('td');
      contentTd.innerHTML = elem.resolution;
      tr.appendChild(contentTd);

      const specTd = document.createElement('td');
      specTd.innerHTML = elem.specialization;
      tr.appendChild(specTd);

      const patientNameTd = document.createElement('td');
      patientNameTd.innerHTML = elem.name;
      tr.appendChild(patientNameTd);

      const createdByTd = document.createElement('td');
      createdByTd.innerHTML = elem.doctor;
      tr.appendChild(createdByTd);

      const createdAtTd = document.createElement('td');
      createdAtTd.innerHTML = `${arr[0]} ${time}`;
      tr.appendChild(createdAtTd);

      tableForResolution.appendChild(tr);
    });
    deleteResolutionBtn.before(tableForResolution);
    tableForResolution1 = tableForResolution;
  } catch (err) {
    console.log(err.response.data || err);
  }
});

deleteResolutionBtn.addEventListener('click', async () => {
  try {
    console.log(deleteResolutionID.value);
    const response = await authClient.client.delete(`/resolution/?id=${deleteResolutionID.value}`);
    const data = await response.data;
    console.log(data);
  } catch (err) {
    console.log(err.response.data || err);
  }
});

window.addEventListener('load', async () => {
  try {
    const response = await authClient.client('/doctor/specialities');
    specialities = await response.data;
  } catch (err) {
    console.log(err.response.data || err);
  }
});
