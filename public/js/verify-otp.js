(function(){
    const form = qs('#otpForm');
    const alertBox = qs('#alert');
    const emailInput = qs('#email');
    const btnResend = qs('#btnResend');
    const params = new URLSearchParams(location.search);
    const qEmail = params.get('email');
    if (qEmail) emailInput.value = qEmail;
    form.addEventListener('submit', async (e)=>{
        e.preventDefault();
        if (!form.checkValidity()){
            form.classList.add('was-validated');
            return;
        }
        try{
            await apiFetch('/api/auth/verify-otp', { method:'POST', body:{
                    email: form.email.value.trim(),
                    otp: form.otp.value.trim()
                }});
            showAlert(alertBox, 'success', 'Xác minh thành công! Đang chuyển tới đăng nhập…');
            setTimeout(()=> goto('/login.html'), 800);
        }catch(err){
            showAlert(alertBox, 'danger', err.message);
        }
    });
    btnResend.addEventListener('click', async ()=>{
        const email = emailInput.value.trim();
        if (!email) { showAlert(alertBox, 'warning', 'Nhập email trước khi gửi lại OTP'); return; }
        btnResend.disabled = true;
        try{
            await apiFetch('/api/auth/resend-otp', { method:'POST', body:{ email }});
            showAlert(alertBox, 'success', 'OTP mới đã được gửi. Vui lòng kiểm tra email.');
        }catch(err){
            showAlert(alertBox, 'danger', err.message);
        }finally{
            let left = 30;
            const t = setInterval(()=>{
                btnResend.textContent = `Gửi lại OTP (${left--}s)`;
                if (left < 0) {
                    clearInterval(t);
                    btnResend.textContent = 'Gửi lại OTP';
                    btnResend.disabled = false;
                }
            }, 1000);
        }
    });
})();
