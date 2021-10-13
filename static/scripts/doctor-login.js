const btn = document.getElementById('submit_btn');
const emailInput = document.getElementById('patient_email');
const passwordInput = document.getElementById('patient_password');

btn.addEventListener('click', submitForm);

async function submitForm(event) {
    if (event.type === 'keydown' && event.keyCode !== 13) return;

    const email = emailInput.value;
    const password = passwordInput.value;

    const response = await fetch('/auth/login/doctor', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({ email, password }),
    });
    
    if (response.ok) {
        const res = await response.json();
        window.location.href = 'http://localhost:3000/doctor';
    } else {
        const res = await response.json();
        console.log(res);
    }
}