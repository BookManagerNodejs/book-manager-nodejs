(function(){
    const form = qs('#loginForm');
    const alertBox = qs('#alert');
    const remember = qs('#rememberEmail');
    const savedEmail = getCookie('remember_email');
    if (savedEmail) form.email.value = savedEmail, remember.checked = true;

    form.addEventListener('submit', async (e)=>{
        e.preventDefault();
        if (!form.checkValidity()){
            form.classList.add('was-validated');
            return;
        }
        const payload = {
            email: form.email.value.trim(),
            password: form.password.value,
            rememberEmail: !!remember.checked
        };
        try{
            await apiFetch('/api/auth/login', { method:'POST', body: payload });
            showAlert(alertBox, 'success', 'Đăng nhập thành công! Đang chuyển tới trang quản lý…');
            setTimeout(()=> goto('/admin.html'), 500);
        }catch(err){
            showAlert(alertBox, 'danger', err.message);
        }
    });
})();
