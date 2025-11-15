// login.js
const loginBtn = document.getElementById("loginBtn");
const userDropdown = document.getElementById("userDropdown");
const logoutDropdownBtn = document.getElementById("logoutDropdownBtn");
const loginModal = document.getElementById("loginModal");
const closeButtons = document.querySelectorAll(".close");

// Biến lưu trạng thái đăng nhập
let isLoggedIn = false;
let currentUser = null;

// ===== ĐỌC FILE JSON VÀ XÁC THỰC ĐĂNG NHẬP =====
async function authenticateUser(username, password) {
  try {
    // Đọc file JSON
    const response = await fetch("/data/users.json");
    const users = await response.json();

    // Tìm user khớp với username và password
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      // Lưu thông tin user (không lưu password)
      const userSession = {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
      };

      localStorage.setItem("currentUser", JSON.stringify(userSession));
      return { success: true, user: userSession };
    } else {
      return {
        success: false,
        message: "Tên đăng nhập hoặc mật khẩu không đúng",
      };
    }
  } catch (error) {
    console.error("Lỗi khi đọc file users.json:", error);
    return { success: false, message: "Lỗi hệ thống, vui lòng thử lại sau" };
  }
}

// ===== KIỂM TRA SESSION KHI LOAD TRANG =====
function checkUserSession() {
  const userSession = localStorage.getItem("currentUser");
  if (userSession) {
    currentUser = JSON.parse(userSession);
    isLoggedIn = true;
    updateLoginButton();
    console.log("✅ Đã đăng nhập:", currentUser.username);
  }
}

// ===== HÀM CẬP NHẬT TRẠNG THÁI NÚT ĐĂNG NHẬP =====
function updateLoginButton() {
  if (isLoggedIn && currentUser) {
    loginBtn.textContent = currentUser.username;
    loginBtn.classList.add("logged-in");
  } else {
    loginBtn.textContent = "Đăng Nhập";
    loginBtn.classList.remove("logged-in");
    userDropdown.style.display = "none";
  }
}

// ===== XỬ LÝ CLICK NÚT ĐĂNG NHẬP =====
loginBtn.addEventListener("click", (e) => {
  e.stopPropagation();

  if (isLoggedIn) {
    // Nếu đã đăng nhập -> Toggle dropdown
    if (userDropdown.style.display === "block") {
      userDropdown.style.display = "none";
    } else {
      userDropdown.style.display = "block";
    }
  } else {
    // Nếu chưa đăng nhập -> Hiển thị modal đăng nhập
    loginModal.style.display = "block";
  }
});

// ===== XỬ LÝ NÚT ĐĂNG XUẤT TRONG DROPDOWN =====
logoutDropdownBtn.addEventListener("click", (e) => {
  e.preventDefault();

  // Xóa session
  localStorage.removeItem("currentUser");

  isLoggedIn = false;
  currentUser = null;
  updateLoginButton();

  // Reset form đăng nhập
  document.querySelector(".login-form").reset();

  console.log("🔓 Đã đăng xuất");
});

// ===== ĐÓNG DROPDOWN KHI CLICK NGOÀI =====
document.addEventListener("click", (e) => {
  if (
    userDropdown &&
    !userDropdown.contains(e.target) &&
    e.target !== loginBtn
  ) {
    userDropdown.style.display = "none";
  }
});

// ===== ĐÓNG MODAL KHI CLICK DẤU X =====
closeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    loginModal.style.display = "none";
  });
});

// ===== XỬ LÝ FORM ĐĂNG NHẬP =====
document.querySelector(".login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!username || !password) {
    alert("Vui lòng điền đầy đủ thông tin");
    return;
  }

  const submitBtn = document.querySelector(".submit-btn");
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Đang đăng nhập...";
  submitBtn.disabled = true;

  const result = await authenticateUser(username, password);

  submitBtn.textContent = originalText;
  submitBtn.disabled = false;

  if (result.success) {
    isLoggedIn = true;
    currentUser = result.user;
    updateLoginButton();
    loginModal.style.display = "none";

    document.querySelector(".login-form").reset();

    console.log("✅ Đăng nhập thành công:", currentUser);

    // Kiểm tra xem có đang ở trang yêu cầu đăng nhập không
    const currentPage = window.location.pathname.split("/").pop();
    if (currentPage === "Health.html" || currentPage === "Calories.html") {
      // Reload trang để hiển thị nội dung
      location.reload();
    } else {
      alert(`Chào mừng ${currentUser.fullname}!`);
    }
  } else {
    alert(result.message);
  }
});

// ===== ĐÓNG MODAL KHI CLICK OUTSIDE =====
window.addEventListener("click", (e) => {
  if (e.target === loginModal) {
    loginModal.style.display = "none";
  }
});

// ===== KHỞI TẠO =====
checkUserSession();
updateLoginButton();

console.log('💡 Tài khoản test: username="admin", password="admin123"');
