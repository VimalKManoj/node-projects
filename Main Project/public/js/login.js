const loginBtn = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');

const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

const showAlert = (type, msg) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 4000);
};

const login = async (email, password) => {
  try {
    const res = await axios.post('http://localhost:3000/api/v1/users/login', {
      email,
      password,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in sucessfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

const logout = async () => {
  try {
    location.assign('/');
    const res = await axios.get('http://localhost:3000/api/v1/users/logout');
    // console.log(res);
    if (res.data.status === 'success') location.reload(true);
  } catch (error) {
    console.log(error);
    showAlert('error', 'Error logging out.try again');
  }
};

if (loginBtn) {
  loginBtn.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}
if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}
