const formBtn = document.querySelector('.form-user-data');
const passwordBtn = document.querySelector('.form-user-settings');

const updateData = async (data, type) => {
  console.log(data);
  try {
    const url =
      type === 'password'
        ? 'http://localhost:3000/api/v1/users/updatePassword'
        : 'http://localhost:3000/api/v1/users/updateMyData';
    console.log(url);
    const res = await axios.patch(url, data);
    console.log(res);

    if (res.data.status === 'success') {
      showAlert('success', 'Updated successfully');
    }
  } catch (error) {
    showAlert('error', 'Something went wrong.. Try Again');
  }
};

if (formBtn) {
  formBtn.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateData(form, 'data');
  });
}

if (passwordBtn) {
  passwordBtn.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    updateData({ currentPassword, password, passwordConfirm }, 'password');
  });
}
