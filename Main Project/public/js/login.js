const login = async (email, password) => {
  try {
    const res = await axios.post('http://localhost:3000/api/v1/users/login', {
      email,
      password,
    });

    if (res.data.status === 'success') {
      alert('Logged in sucessfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (error) {
    alert(error.response.data.message);
  }
};

document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
