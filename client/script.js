"use strict";

let email;

const token = localStorage.getItem('token');

const btnLogin = globalThis.document.querySelector('.btn-login');
const btnSignUp = globalThis.document.querySelector('.btn-signup');

const signUpContainer = globalThis.document.querySelector('.signup');
const loginContainer = globalThis.document.querySelector('.login');
const verifyContainer = globalThis.document.querySelector('.verify');
const chatContainer = globalThis.document.querySelector('.chat');

const form = globalThis.document.getElementById('form');
const signUp = globalThis.document.getElementById('signUp');
const login = globalThis.document.getElementById('login');
const verify = globalThis.document.getElementById('verify');
const input = globalThis.document.getElementById('input');

const workerSignUp = new Worker('workerSignUp.js');
const workerLogin = new Worker('workerLogin.js');
const workerVerify = new Worker('workerVerify.js');

function showToast(message, state = true, duration = 3000) {
    const toastContainer = document.getElementById('toast-container');
    const toastMessage = document.createElement('div');
    toastMessage.classList.add('toast-message');
    toastMessage.textContent = message;
    toastContainer.appendChild(toastMessage);
  
    setTimeout(() => {
      toastMessage.classList.add('show');
      toastMessage.classList.add((state) ? 'green' : 'red');
    }, 10);
  
    setTimeout(() => {
      toastMessage.classList.remove('show');
      toastMessage.classList.remove((state) ? 'green' : 'red');
      setTimeout(() => {
        toastMessage.remove();
      }, 1500);
    }, duration);
}

btnLogin.addEventListener('click', (e) => {
    loginContainer.classList.remove('none');
    signUpContainer.classList.add('none');
});

btnSignUp.addEventListener('click', (e) => {
    signUpContainer.classList.remove('none');
    loginContainer.classList.add('none');
});

signUp.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(signUp);

    email = formData.get('email');
    
    const data = { 
        username: formData.get('username'),
        email,
        password: formData.get('password')
    }

    workerSignUp.postMessage(data)
});

login.addEventListener("submit", (e) => {
    e.preventDefault();

    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const formData = new FormData(login);

    let data; 

    if(regex.test(formData.get('user'))) {
        data = {
            email: formData.get('user'),
            password: formData.get('password')
        };
    } else {
        data = {
            username: formData.get('user'),
            password: formData.get('password')
        };
    }   

    workerLogin.postMessage(data);
});

verify.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(verify);

    if(!email) {
        email = localStorage.getItem('email');
    } 

    const data = {
        code: Number(formData.get('code')),
        email
    };

    workerVerify.postMessage(data);
});

form.addEventListener("submit", (e)=> {
    e.preventDefault();
});


workerSignUp.onmessage = function(event) {
    const { error, message } = event.data;

    if(error) {
        showToast(error, false);
    } else {
        localStorage.setItem('email', email);

        verifyContainer.classList.remove('none');
        signUpContainer.classList.add('none');
        showToast(message);
    }
}

workerVerify.onmessage = function(event) {
    const { error, message } = event.data;

    if(error) {
        showToast(error, false);
    } else {
        loginContainer.classList.remove('none');
        verifyContainer.classList.add('none');
        showToast(message);
    }
}

workerLogin.onmessage = function(event) {
    const { token, error } = event.data;

    if(error) {
        showToast(error, false)
    } else {
        localStorage.setItem('token', token);

        chatContainer.classList.remove('none');
        loginContainer.classList.add('none');
    }
}

if(token) {
    signUpContainer.classList.add('none');
    chatContainer.classList.remove('none');
}