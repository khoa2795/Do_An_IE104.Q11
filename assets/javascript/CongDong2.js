// ../assets/javascript/CongDong2.js
(function () {
  const STORAGE_KEY_POSTS = "community_posts";

  document.addEventListener("DOMContentLoaded", function () {
    const titleInput = document.getElementById("post-title");
    const contentInput = document.getElementById("post-content");
    const btnCancel = document.querySelector(".btn-cancel");
    const btnSubmit = document.querySelector(".btn-submit");

    if (!titleInput || !contentInput) return;

    if (btnCancel) {
      btnCancel.addEventListener("click", function () {
        const title = (titleInput.value || "").trim();
        const content = (contentInput.value || "").trim();

        if (!title && !content) {
          goBackToList();
          return;
        }

        const confirmCancel = confirm(
          "Bạn có chắc muốn hủy tạo bài đăng? Nội dung hiện tại sẽ không được lưu."
        );
        if (confirmCancel) {
          goBackToList();
        }
      });
    }

    if (btnSubmit) {
      btnSubmit.addEventListener("click", function () {
        const title = (titleInput.value || "").trim();
        const content = (contentInput.value || "").trim();

        if (!title) {
          alert("Vui lòng nhập tiêu đề.");
          titleInput.focus();
          return;
        }
        if (!content) {
          alert("Vui lòng nhập nội dung.");
          contentInput.focus();
          return;
        }

        savePost(title, content);
        alert("Tạo bài đăng thành công! Bài của bạn sẽ xuất hiện trong mục Cộng đồng.");
        goBackToList();
      });
    }
  });

  /* ==================== HÀM LƯU BÀI VÀO localStorage ==================== */

  function savePost(title, content) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_POSTS);
      const posts = raw ? JSON.parse(raw) : [];
      const now = new Date();

      posts.push({
        id: "user-" + now.getTime(),
        title,
        content,
        createdAt: now.toISOString(),
      });

      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
    } catch (e) {
      console.error("Không thể lưu bài đăng:", e);
    }
  }

  /* ==================== QUAY VỀ TRANG DANH SÁCH ==================== */

  function goBackToList() {
    // Nếu vừa từ CongDong1.html qua, ưu tiên back để giữ lịch sử
    if (document.referrer && document.referrer.includes("CongDong1")) {
      history.back();
    } else {
      // fallback: điều hướng trực tiếp
      window.location.href = "CongDong1.html";
    }
  }
})();
