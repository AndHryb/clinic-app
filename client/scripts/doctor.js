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
const dropDownSpec = document.getElementById('speciality-list');
const spec = null;

async function gettCurrent() {
  try {
    const response = await authClient.client.get('/queue/next');
    const data = await response.data;
    return data;
  } catch (err) {
    console.log(err.response.data);
  }
}

nextBtnForDoctor.addEventListener('click', async () => {
  try {
    const response = await authClient.client.get('/queue/next');
    const data = await response.data;
    displayPatientNameForDoctor.textContent = data;
  } catch (err) {
    console.log(err.response.data);
  }
});

addBtnForResolution.addEventListener('click', async () => {
  if (doctorResolution.value === '' || await gettCurrent() !== displayPatientNameForDoctor.textContent) {
    return false;
  }
  try {
    const response = await authClient.client.post('/resolution', {
      value: doctorResolution.value,
      spec: spec || dropDownSpec.value,
    });
    const data = await response.data;
    if (data.name) {
      console.log(`Resolution for ${data.name} added`);
    } else { console.log(data); }
  } catch (err) {
    console.log(err.response.data);
  }

  doctorResolution.value = '';
});

showResolutionBtn.addEventListener('click', async () => {
  try {
    const response = await authClient.client.get(`/resolution/?name=${inputForSearchResolution.value}`);
    const data = await response.data;

    tableForResolution1.remove();
    const tableForResolution = document.createElement('table');
    tableForResolution.setAttribute('class', 'resolution_table');
    tableForResolution.setAttribute('id', 'table_for_doctor_resolution');

    const tr = document.createElement('tr');

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

      const tr = document.createElement('tr');
      const idTd = document.createElement('td');
      idTd.innerHTML = elem.id;
      tr.appendChild(idTd);

      const contentTd = document.createElement('td');
      contentTd.innerHTML = elem.resolution;
      tr.appendChild(contentTd);

      const specTd = document.createElement('td');
      specTd.innerHTML = elem.speciality;
      tr.appendChild(specTd);

      const patientNameTd = document.createElement('td');
      patientNameTd.innerHTML = elem.patient.name;
      tr.appendChild(patientNameTd);

      const createdByTd = document.createElement('td');
      createdByTd.innerHTML = elem.doctor.name;
      tr.appendChild(createdByTd);

      const createdAtTd = document.createElement('td');
      createdAtTd.innerHTML = `${arr[0]} ${time}`;
      tr.appendChild(createdAtTd);

      tableForResolution.appendChild(tr);
    });
    deleteResolutionBtn.before(tableForResolution);
    tableForResolution1 = tableForResolution;
  } catch (err) {
    console.log(err.response.data);
  }
});
deleteResolutionBtn.addEventListener('click', async () => {
  try {
    const response = await authClient.client.delete('/resolution', { data: { value: deleteResolutionID.value } });
    const data = await response.data;
  } catch (err) {
    console.log(err.response.data);
  }
});

window.addEventListener('load', async () => {
  try {
    const response = await authClient.client('/doctor/specialities');
    const specialities = await response.data;//await response.json();
    if (specialities.length > 1) {
      specialities.forEach((elem) => {
        const opt = document.createElement('option');
        opt.innerHTML = elem.name;
        dropDownSpec.appendChild(opt);
      });
      dropDownSpec.hidden = false;
    } else {
      spec = specialities[0].name;
    }
  } catch (err) {
    console.log(err.response.data);
  }
});
