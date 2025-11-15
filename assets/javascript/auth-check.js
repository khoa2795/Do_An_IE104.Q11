// auth-check.js - Kiểm tra đăng nhập cho các trang yêu cầu xác thực

(function () {
  // ===== KIỂM TRA XÁC THỰC =====
  function checkAuthentication() {
    // ✅ ĐỌC TỪ sessionStorage THAY VÌ localStorage
    const currentUser = sessionStorage.getItem("currentUser");
    return currentUser !== null;
  }

  // ===== HIỂN THỊ THÔNG BÁO YÊU CẦU ĐĂNG NHẬP =====
  function showLoginRequired() {
    const overlay = document.createElement("div");
    overlay.id = "auth-overlay";
    overlay.innerHTML = `
      <div class="auth-message">
        <i class="fas fa-lock"></i>
        <h2>Yêu cầu đăng nhập</h2>
        <p>Vui lòng đăng nhập để xem nội dung này</p>
        <button class="btn-open-login">Đăng nhập ngay</button>
      </div>
    `;

    const style = document.createElement("style");
    style.textContent = `
      #auth-overlay {
        position: fixed;
        top: var(--header-height, 100px);
        left: var(--sidebar-width, 250px);
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999;
      }

      .auth-message {
        background: white;
        padding: 60px 40px;
        border-radius: 16px;
        text-align: center;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        max-width: 400px;
      }

      .auth-message i {
        font-size: 80px;
        color: #4f9b50;
        margin-bottom: 20px;
        display: block;
      }

      .auth-message h2 {
        color: #333;
        margin-bottom: 15px;
        font-size: 28px;
      }

      .auth-message p {
        color: #666;
        margin-bottom: 30px;
        font-size: 16px;
      }

      .btn-open-login {
        background: linear-gradient(135deg, #4f9b50, #2f8f46);
        color: white;
        border: none;
        padding: 14px 40px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
      }

      .btn-open-login:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(47, 143, 70, 0.3);
      }

      @media (max-width: 900px) {
        #auth-overlay {
          left: 0;
          top: 60px;
        }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(overlay);

    function attachLoginEvent() {
      const btnOpenLogin = document.querySelector(".btn-open-login");
      const loginModal = document.getElementById("loginModal");

      if (btnOpenLogin && loginModal) {
        btnOpenLogin.addEventListener("click", () => {
          loginModal.style.display = "block";
        });
      } else {
        setTimeout(attachLoginEvent, 100);
      }
    }

    attachLoginEvent();
  }

  // ===== KHỞI TẠO KIỂM TRA =====
  function init() {
    const isLoggedIn = checkAuthentication();

    if (!isLoggedIn) {
      showLoginRequired();
    } else {
    }
  }

  // ===== CHỜ DOM LOAD =====
  function waitForReady() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }

  // ===== LẮNG NGHE SỰ KIỆN ĐĂNG NHẬP =====
  window.addEventListener("storage", (e) => {
    if (e.key === "currentUser" && e.newValue) {
      location.reload();
    }
  });

  waitForReady();
})();
