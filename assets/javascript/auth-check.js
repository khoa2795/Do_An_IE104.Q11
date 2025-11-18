(function () {
  function checkAuthentication() {
    const currentUser = sessionStorage.getItem("currentUser");
    return currentUser !== null;
  }

  function markProtectedContent() {
    const blocks = document.querySelectorAll(".main-content");
    blocks.forEach((block) => block.classList.add("auth-verified"));
  }

  function removeLoginOverlay() {
    const overlay = document.getElementById("auth-overlay");
    if (overlay) {
      overlay.remove();
    }
    const style = document.getElementById("auth-overlay-style");
    if (style) {
      style.remove();
    }
  }

  // ===== HIỂN THỊ THÔNG BÁO YÊU CẦU ĐĂNG NHẬP =====
  function showLoginRequired() {
    if (document.getElementById("auth-overlay")) {
      return;
    }

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
    style.id = "auth-overlay-style";
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
        padding: 24px;
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

      body.dark-mode #auth-overlay {
        background: radial-gradient(circle at 20% 20%, rgba(74, 222, 128, 0.06), transparent 30%),
                    radial-gradient(circle at 80% 0%, rgba(34, 197, 94, 0.1), transparent 26%),
                    linear-gradient(135deg, #0b1220 0%, #111827 100%);
      }

      body.dark-mode .auth-message {
        background: var(--surface-color, #111827);
        border: 1px solid var(--border-color, #1f2937);
        box-shadow: 0 12px 32px var(--shadow-color, rgba(0,0,0,0.5));
        color: var(--text-color, #e2e8f0);
      }

      body.dark-mode .auth-message h2 {
        color: var(--text-color, #e2e8f0);
      }

      body.dark-mode .auth-message p {
        color: var(--muted-text-color, #cbd5e1);
      }

      body.dark-mode .auth-message i {
        color: var(--primary-color, #4ade80);
      }

      body.dark-mode .btn-open-login {
        background: linear-gradient(135deg, var(--primary-color, #4ade80), #16a34a);
        box-shadow: 0 5px 15px var(--shadow-color, rgba(0,0,0,0.45));
      }

      body.dark-mode .btn-open-login:hover {
        box-shadow: 0 8px 20px var(--shadow-color, rgba(0,0,0,0.55));
      }

      @media (max-width: 900px) {
        #auth-overlay {
          left: 0;
          top: calc(var(--header-height, 80px) + 10px);
        }
      }

      @media (max-width: 768px) {
        #auth-overlay {
          bottom: 90px; /* leave space for bottom nav */
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

  // Khoi Tao kiem tra
  function init() {
    const isLoggedIn = checkAuthentication();

    if (!isLoggedIn) {
      showLoginRequired();
    } else {
      removeLoginOverlay();
      markProtectedContent();
    }
  }

  // Cho DOM load xong
  function waitForReady() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }

  function handleAuthStateChange(status) {
    if (status === "logged-in") {
      removeLoginOverlay();
      markProtectedContent();
    }
    if (status === "logged-out") {
      showLoginRequired();
    }
  }

  document.addEventListener("auth:state-changed", (event) => {
    if (!event || !event.detail) return;
    handleAuthStateChange(event.detail.status);
  });

  // Lắng nghe sự kiện đăng nhập từ tab khác
  window.addEventListener("storage", (e) => {
    if (e.key === "currentUser") {
      handleAuthStateChange(e.newValue ? "logged-in" : "logged-out");
    }
  });

  waitForReady();
})();
