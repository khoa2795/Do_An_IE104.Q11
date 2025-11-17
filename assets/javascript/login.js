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
    const response = await fetch("/data/users.json");
    const users = await response.json();

    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      const userSession = {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
      };

      // ✅ SỬ DỤNG sessionStorage THAY VÌ localStorage
      sessionStorage.setItem("currentUser", JSON.stringify(userSession));
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
  // ✅ ĐỌC TỪ sessionStorage
  const userSession = sessionStorage.getItem("currentUser");
  if (userSession) {
    currentUser = JSON.parse(userSession);
    isLoggedIn = true;
    updateLoginButton();
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
    if (userDropdown.style.display === "block") {
      userDropdown.style.display = "none";
    } else {
      userDropdown.style.display = "block";
    }
  } else {
    loginModal.style.display = "block";
  }
});

// ===== XỬ LÝ NÚT ĐĂNG XUẤT TRONG DROPDOWN =====
logoutDropdownBtn.addEventListener("click", (e) => {
  e.preventDefault();

  //  XÓA TỪ sessionStorage
  sessionStorage.removeItem("currentUser");

  isLoggedIn = false;
  currentUser = null;
  updateLoginButton();

  document.querySelector(".login-form").reset();

  // RELOAD TRANG để hiển thị overlay yêu cầu đăng nhập
  location.reload();
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

    const currentPage = window.location.pathname.split("/").pop();
    if (currentPage === "Health.html" || currentPage === "Calories.html") {
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
