// login.js
const loginBtn = document.querySelector('.login-btn');
const loginModal = document.getElementById('loginModal');
const registerModalOld = document.getElementById('registerModalOld');
const registerModalNew = document.getElementById('registerModalNew');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const googleAccountModal = document.getElementById('googleAccountModal');
const closeButtons = document.querySelectorAll('.close');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const showForgotPassword = document.getElementById('showForgotPassword');
const cancelForgotPassword = document.getElementById('cancelForgotPassword');

// Biến cho đăng ký theo bước
let currentStep = 1;
const totalSteps = 3;

// Mở modal đăng nhập khi click nút Đăng Nhập
loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'block';
});

// Chuyển sang đăng ký
showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'none';
    registerModalOld.style.display = 'block';
});

// Chuyển về đăng nhập
showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerModalOld.style.display = 'none';
    registerModalNew.style.display = 'none';
    loginModal.style.display = 'block';
});

// Chuyển sang quên mật khẩu
showForgotPassword.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'none';
    forgotPasswordModal.style.display = 'block';
});

// Quay lại đăng nhập từ quên mật khẩu
cancelForgotPassword.addEventListener('click', (e) => {
    e.preventDefault();
    forgotPasswordModal.style.display = 'none';
    loginModal.style.display = 'block';
});

// Đóng modal
closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        loginModal.style.display = 'none';
        registerModalOld.style.display = 'none';
        registerModalNew.style.display = 'none';
        forgotPasswordModal.style.display = 'none';
        googleAccountModal.style.display = 'none';
    });
});

// Xử lý đăng nhập
document.querySelector('.login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
    }
    
    alert('Đăng nhập thành công!');
    loginModal.style.display = 'none';
    loginBtn.textContent = username;
});

// Xử lý social login
document.querySelectorAll('.google-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'none';
        registerModalOld.style.display = 'none';
        registerModalNew.style.display = 'none';
        googleAccountModal.style.display = 'block';
    });
});

document.querySelectorAll('.facebook-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        alert('Chuyển hướng đến Facebook Login');
    });
});

// Xử lý quên mật khẩu
document.querySelector('.forgot-password-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const phoneNumber = document.getElementById('phoneNumber').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    if (!phoneNumber || !newPassword || !confirmNewPassword) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        alert('Mật khẩu xác nhận không khớp');
        return;
    }
    
    alert('Đổi mật khẩu thành công!');
    forgotPasswordModal.style.display = 'none';
    loginModal.style.display = 'block';
});

// Xử lý nút gửi mã
document.querySelector('.send-code-btn').addEventListener('click', () => {
    const phoneNumber = document.getElementById('phoneNumber').value;
    
    if (!phoneNumber) {
        alert('Vui lòng nhập số điện thoại');
        return;
    }
    
    alert('Mã xác nhận đã được gửi đến số điện thoại của bạn');
});

// Xử lý chuyển từ đăng ký cũ sang đăng ký mới
document.querySelector('.register-form-old').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('usernameOld').value;
    const password = document.getElementById('passwordOld').value;
    const confirmPassword = document.getElementById('confirmPasswordOld').value;
    
    if (!username || !password || !confirmPassword) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Mật khẩu xác nhận không khớp');
        return;
    }
    
    // Lưu thông tin từ form cũ và chuyển sang form mới
    document.getElementById('username').value = username;
    
    // Chuyển modal
    registerModalOld.style.display = 'none';
    registerModalNew.style.display = 'block';
    showStep(1); // Bắt đầu từ bước 1
});

// Hiển thị bước hiện tại và cập nhật thanh tiến trình
function showStep(step) {
    // Ẩn tất cả các bước
    document.querySelectorAll('.register-form-new').forEach(form => {
        form.classList.remove('active');
    });
    
    // Hiển thị bước được chọn
    const stepElement = document.querySelector(`.step-${step}`);
    if (stepElement) {
        stepElement.classList.add('active');
    }
    
    // Cập nhật indicator
    const stepIndicator = document.querySelector('.step-indicator');
    if (stepIndicator) {
        stepIndicator.textContent = `${step}/${totalSteps}`;
    }
    
    // Cập nhật thanh tiến trình
    updateProgressBar(step);
    
    currentStep = step;
}

// Cập nhật thanh tiến trình
function updateProgressBar(step) {
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressFill = document.getElementById('progressFill');
    
    // Cập nhật trạng thái các bước
    progressSteps.forEach((progressStep, index) => {
        const stepNumber = parseInt(progressStep.getAttribute('data-step'));
        
        progressStep.classList.remove('active', 'completed');
        
        if (stepNumber < step) {
            progressStep.classList.add('completed');
        } else if (stepNumber === step) {
            progressStep.classList.add('active');
        }
    });
    
    // Cập nhật thanh tiến trình
    if (progressFill) {
        const progressPercentage = ((step - 1) / (totalSteps - 1)) * 100;
        progressFill.style.width = `${progressPercentage}%`;
    }
}

// Xử lý nút tiếp tục
document.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            if (currentStep === totalSteps) {
                // Xử lý submit form đăng ký ở bước cuối
                document.querySelector('.step-3').dispatchEvent(new Event('submit'));
            } else {
                showStep(currentStep + 1);
            }
        }
    });
});

// Xử lý nút quay lại
document.querySelectorAll('.prev-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (currentStep > 1) {
            showStep(currentStep - 1);
        }
    });
});

// Validate từng bước
function validateStep(step) {
    let isValid = true;
    
    switch(step) {
        case 1:
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            
            if (!username || !email || !phone) {
                alert('Vui lòng điền đầy đủ thông tin tài khoản');
                isValid = false;
            }
            break;
            
        case 2:
            const fullname = document.getElementById('fullname').value;
            if (!fullname) {
                alert('Vui lòng nhập họ và tên');
                isValid = false;
            }
            break;
            
        case 3:
            // Có thể thêm validation cho bước 3 nếu cần
            break;
    }
    
    return isValid;
}

// Xử lý gửi OTP trong form đăng ký mới
document.querySelector('.send-otp-btn').addEventListener('click', () => {
    const phone = document.getElementById('phone').value;
    if (!phone) {
        alert('Vui lòng nhập số điện thoại');
        return;
    }
    alert(`Mã OTP đã được gửi đến số điện thoại ${phone}`);
});

// Xử lý submit form đăng ký mới (bước 3)
document.querySelector('.step-3').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Đăng ký thành công!');
    registerModalNew.style.display = 'none';
    loginModal.style.display = 'block';
    // Reset form
    showStep(1);
    document.querySelector('.register-form-new').reset();
});

// Xử lý nút quay lại form đơn giản
document.querySelector('.back-to-simple-btn').addEventListener('click', () => {
    registerModalNew.style.display = 'none';
    registerModalOld.style.display = 'block';
    showStep(1);
    document.querySelector('.register-form-new').reset();
});

// Thêm sự kiện chọn tài khoản Google
document.querySelectorAll('.account-item').forEach(item => {
    item.addEventListener('click', () => {
        const email = item.querySelector('.account-email').textContent;
        alert(`Đã chọn tài khoản: ${email}`);
        googleAccountModal.style.display = 'none';
        loginBtn.textContent = email.split('@')[0];
    });
});

// Sự kiện cho nút "Sử dụng tài khoản khác"
document.querySelector('.other-account-btn').addEventListener('click', () => {
    alert('Chuyển hướng đến trang đăng nhập Google');
});

// Đóng modal khi click outside
window.addEventListener('click', (e) => {
    if (e.target === loginModal) loginModal.style.display = 'none';
    if (e.target === registerModalOld) registerModalOld.style.display = 'none';
    if (e.target === registerModalNew) registerModalNew.style.display = 'none';
    if (e.target === forgotPasswordModal) forgotPasswordModal.style.display = 'none';
    if (e.target === googleAccountModal) googleAccountModal.style.display = 'none';
});