document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.login-tab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const regError = document.getElementById('reg-error');

    // Khởi tạo tài khoản demo
    UserManager.initDemoUser();

    function showForm(id){
        tabs.forEach(t => t.classList.toggle('active', t.dataset.target === id));
        if (id === 'loginForm'){ loginForm.classList.remove('hidden'); registerForm.classList.add('hidden'); }
        else { registerForm.classList.remove('hidden'); loginForm.classList.add('hidden'); }
        if (regError) regError.classList.add('hidden');
    }

    tabs.forEach(tab => tab.addEventListener('click', ()=> showForm(tab.dataset.target)));

    const toLogin = document.getElementById('to-login');
    if (toLogin) toLogin.addEventListener('click', (e)=>{ e.preventDefault(); showForm('loginForm'); });

    // toggle password for all icons
    document.querySelectorAll('.toggle-password').forEach(icon=>{
        icon.addEventListener('click', ()=>{
            const tid = icon.dataset.target;
            const input = document.getElementById(tid);
            if (!input) return;
            input.type = input.type === 'password' ? 'text' : 'password';
            icon.classList.toggle('fa-eye'); icon.classList.toggle('fa-eye-slash');
        });
    });

    // login submit
    loginForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        const username = (document.getElementById('username')?.value||'').trim();
        const password = (document.getElementById('password')?.value||'');
        
        if (UserManager.checkLogin(username, password)){
            UserManager.setLoggedInUser(username);
            alert('Đăng nhập thành công: '+username);
            window.location.href = 'index.html';
        } else {
            alert('Đăng nhập thất bại: tên đăng nhập hoặc mật khẩu không đúng.');
        }
    });

    // register submit
    registerForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        const username = (document.getElementById('reg-username')?.value||'').trim();
        const pw = document.getElementById('reg-password').value;
        const pwc = document.getElementById('reg-password-confirm').value;

        if (!username){ 
            regError.textContent = 'Vui lòng nhập tên đăng nhập.'; 
            regError.classList.remove('hidden'); 
            return; 
        }
        if (UserManager.userExists(username)){ 
            regError.textContent = 'Tên đăng nhập đã tồn tại.'; 
            regError.classList.remove('hidden'); 
            return; 
        }
        if (pw !== pwc){ 
            regError.textContent = 'Mật khẩu và xác nhận mật khẩu không khớp.'; 
            regError.classList.remove('hidden'); 
            return; 
        }

        UserManager.addUser(username, pw);
        alert('Đăng ký thành công. Bạn có thể đăng nhập bây giờ.');
        showForm('loginForm');
    });
});