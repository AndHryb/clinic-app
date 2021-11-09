import { authClient } from './auth-api.js';

const formObj = document.reg_form;

function emailValid(focusWhenError) {
  const elem = formObj.elements.patient_email;
  const { value } = elem;
  const displayErr = document.getElementById('email_err');
  if (value) {
    displayErr.textContent = '';
    elem.style.borderColor = '';
    return true;
  }
  displayErr.textContent = 'fill this field';
  elem.style.borderColor = 'red';

  if (focusWhenError) {
    elem.focus();
  }

  return false;
}

document.reg_form.elements.patient_password.addEventListener('change', () => emailValid(false));

function passwordValid(focusWhenError) {
  const elem = formObj.elements.patient_password;
  const { value } = elem;
  const displayErr = document.getElementById('password_err');
  if (value) {
    displayErr.textContent = '';
    elem.style.borderColor = '';
    return true;
  }
  displayErr.textContent = 'fill this field';
  elem.style.borderColor = 'red';

  if (focusWhenError) {
    elem.focus();
  }

  return false;
}

document.reg_form.elements.patient_password.addEventListener('change', () => emailValid(false));

document.reg_form.onsubmit = async function (EO) {
  EO.preventDefault();
  let okValid = true;

  okValid = emailValid(okValid) && okValid;
  okValid = passwordValid(okValid) && okValid;
  if (!okValid) {
    return false;
  }

  const formData = {
    email: formObj.elements.patient_email.value,
    password: formObj.elements.patient_password.value,
  };

  try {
    const result = await authClient.login(formData);
    if (result.role === 'patient') {
      document.cookie = `patient-token=${authClient.token};path=/;`;
      window.location = './patient.html';
    }else if (result.role === 'doctor'){
      document.cookie = `doctor-token=${authClient.token};path=/;`;
      window.location = './doctor.html';
    }

  } catch (err) {
    console.log(err.response.data);
  }
};
