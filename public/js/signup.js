(async function(){
    const form = qs('#signupForm');
    const alertBox = qs('#alert');
    form.addEventListener('submit', async (e)=>{
        e.preventDefault();
        if (!form.checkValidity()){
            form.classList.add('was-validated');
            return;
        }
        const payload = {
            email: form.email.value.trim(),
            password: form.password.value,
            name: form.name.value.trim()
        };
        try{
            const res = await apiFetch('/api/auth/signup', { method:'POST', body: payload });
            showAlert(alertBox, 'success', 'Đăng ký thành công! Vui lòng kiểm tra email để nhận OTP.');
            setTimeout(()=> goto(`/verify-otp.html?email=${encodeURIComponent(payload.email)}`), 800);
        }catch(err){
            showAlert(alertBox, 'danger', err.message);
        }
    });
})();
