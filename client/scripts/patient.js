import { authClient } from './auth-api.js';

authClient.getCookieToken('patient-token');
// if(!authClient.token){
//   window.location = './patient-login.html'
// }

const displayPatientName = document.getElementById('display_patient_name');
const accountName = document.getElementById('account_name');
const addBtnForPatientName = document.getElementById('add_patient_name');
const resolutionTable = document.getElementById('resolution_for_patient');
const dropDownSpec = document.getElementById('speciality-list');

addBtnForPatientName.addEventListener('click', async () => {
  const dropDownDoc = document.getElementById('doctors-list');
  try {
    const response = await authClient.client.post('/queue',
      { docID: dropDownDoc.value, spec: dropDownSpec.value });
    const data = await response.data;
    console.log(data);
  } catch (err) {
    console.log(err.response.data);
  }
});

window.addEventListener('load', async () => {
  try {
    const response = await authClient.client.get('/queue/all');
    const data = await response.data;

    const queueTable = document.createElement('table');
    queueTable.setAttribute('class', 'queue_table');

    const head = document.createElement('tr');

    const docName = document.createElement('th');
    docName.innerHTML = 'doctor\'s name';
    head.appendChild(docName);

    const length = document.createElement('th');
    length.innerHTML = 'length';
    head.appendChild(length);

    const next = document.createElement('th');
    next.innerHTML = 'next';
    head.appendChild(next);

    queueTable.appendChild(head);

    data.forEach((elem) => {
      const tr = document.createElement('tr');

      const docNameVal = document.createElement('th');
      docNameVal.innerHTML = elem.doctor;
      tr.appendChild(docNameVal);

      const lengthVal = document.createElement('th');
      lengthVal.innerHTML = elem.length;
      tr.appendChild(lengthVal);

      const nextVal = document.createElement('th');
      nextVal.innerHTML = elem.next;
      tr.appendChild(nextVal);

      queueTable.appendChild(tr);
    });
    displayPatientName.appendChild(queueTable);
  } catch (err) {
    console.log(err.response.data);
  }

  try {
    const UserResponse = await authClient.client.get('/auth/username');
    const userData = await UserResponse.data;
    accountName.textContent = userData.name;
  } catch (err) {
    console.log(err.response.data);
  }

  try {
    const response = await authClient.client.get('/resolution/me');
    const data = await response.data;

    if (data.resolution.length > 0) {
      data.resolution.forEach((elem) => {
        const arr = elem.createdat.split('T');
        const time = arr[1].substr(0, 8);

        const tr = document.createElement('tr');
        const contentTd = document.createElement('td');
        contentTd.innerHTML = elem.resolution;
        tr.appendChild(contentTd);

        const specialTd = document.createElement('td');
        specialTd.innerHTML = elem.speciality;
        tr.appendChild(specialTd);

        const createdAtTd = document.createElement('td');
        createdAtTd.innerHTML = `${arr[0]} | ${time}`;
        tr.appendChild(createdAtTd);

        const createdByTd = document.createElement('td');
        createdByTd.innerHTML = elem.doctor;
        tr.appendChild(createdByTd);

        resolutionTable.appendChild(tr);
      });
    }
  } catch (err) {
    console.log(err.response.data);
  }
});

window.addEventListener('load', async () => {
  try {
    const response = await authClient.client.get('/doctor/all');
    const doctors = await response.data;

    console.log(doctors);

    const spec = new Set();
    doctors.forEach((elem) => {
      spec.add(elem.specname);
    });

    for (const elem of spec) {
      const opt = document.createElement('option');
      opt.setAttribute('value', `${elem}`);
      opt.innerHTML = elem;
      dropDownSpec.appendChild(opt);
    }

    function createDoctors(event) {
      const dropDownDoc = document.getElementById('doctors-list');
      const spec = event.target.value;
      const docList = doctors.filter((elem) =>
        (elem.specname === spec));

      dropDownDoc.remove();
      const select = document.createElement('select');
      select.setAttribute('id', 'doctors-list');
      addBtnForPatientName.before(select);

      docList.forEach((elem) => {
        const opt = document.createElement('option');
        opt.setAttribute('value', `${elem.id}`);
        opt.innerHTML = elem.name;
        select.appendChild(opt);
      });
    }

    dropDownSpec.addEventListener('change', createDoctors);
  } catch (err) {
    console.log(err.response.data);
  }
});
