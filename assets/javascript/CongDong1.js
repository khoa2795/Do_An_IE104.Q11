// ../assets/javascript/CongDong1.js
(function () {
  const STORAGE_KEY_POSTS = "community_posts";
  const STORAGE_KEY_SAVED = "community_saved_posts";

  document.addEventListener("DOMContentLoaded", function () {
    const postsContainer = document.querySelector(".posts");
    if (!postsContainer) return;

    // 1. Render các bài viết do user tạo (lưu trong localStorage)
    renderUserPosts(postsContainer);

    // 2. Khôi phục trạng thái "Lưu" cho các bài viết
    restoreSavedState(postsContainer);

    // 3. Xử lý nút "Tạo bài"
    const btnCreate = document.querySelector(".btn-create");
    if (btnCreate) {
      btnCreate.addEventListener("click", function () {
        // Giả định CongDong1.html và CongDong2.html cùng thư mục
        window.location.href = "CongDong2.html";
      });
    }

    // 4. Xử lý tabs "Mới nhất / Mới hoạt động"
    setupTabs();

    // 5. Xử lý phân trang (UI)
    setupPager();

    // 6. Event delegation cho các nút trong bài viết: Phản hồi / Lưu / Chia sẻ
    postsContainer.addEventListener("click", function (event) {
      const btn = event.target.closest(".btn-action");
      if (!btn) return;

      const action = btn.dataset.action;
      const postEl = btn.closest(".post");
      if (!postEl) return;

      switch (action) {
        case "reply":
          handleReply(postEl);
          break;
        case "save":
          handleSave(postEl, btn, postsContainer);
          break;
        case "share":
          handleShare(postEl);
          break;
        default:
          break;
      }
    });
  });

  /* ==================== HÀM HỖ TRỢ CHUNG ==================== */

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function loadFromStorage(key, defaultValue) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return defaultValue;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : defaultValue;
    } catch (e) {
      console.error("Lỗi đọc localStorage:", e);
      return defaultValue;
    }
  }

  function saveToStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Lỗi ghi localStorage:", e);
    }
  }

  function getPostUniqueId(postEl, fallbackIndex) {
    // Nếu là bài user tạo thì đã có data-post-id
    if (postEl.dataset.postId) return postEl.dataset.postId;

    // Tạo id tĩnh cho bài viết static (dựa trên index)
    if (!postEl.dataset.staticId) {
      postEl.dataset.staticId = "static-" + fallbackIndex;
    }
    return postEl.dataset.staticId;
  }

  function formatTimeAgo(isoString) {
    if (!isoString) return "Vừa xong";
    const created = new Date(isoString);
    const now = new Date();
    const diffMs = now - created;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / (3600 * 1000));
    const diffDay = Math.floor(diffMs / (24 * 3600 * 1000));

    if (diffMin < 1) return "Vừa xong";
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay < 7) return `${diffDay} ngày trước`;
    return created.toLocaleDateString("vi-VN");
  }

  /* ==================== RENDER BÀI USER TẠO ==================== */

  function renderUserPosts(postsContainer) {
    const userPosts = loadFromStorage(STORAGE_KEY_POSTS, []);
    if (!userPosts.length) return;

    // sort: mới nhất lên trên
    userPosts.sort((a, b) => {
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      return tb - ta;
    });

    userPosts.forEach((post) => {
      const article = document.createElement("article");
      article.className = "post post--user";
      article.dataset.postId = post.id;

      const safeTitle = escapeHtml(post.title || "");
      const safeContent = escapeHtml(post.content || "");
      const timeText = formatTimeAgo(post.createdAt);

      article.innerHTML = `
        <header class="post-hd">
          <img class="avt" src="https://i.pravatar.cc/48?img=12" alt="avatar"/>
          <div class="meta">
            <div class="name">Bạn</div>
            <div class="time">${timeText}</div>
          </div>
        </header>
        <h2 class="post-title">${safeTitle}</h2>
        <p class="post-text">${safeContent}</p>
        <footer class="post-ft">
          <button class="btn-action" data-action="reply">Phản hồi</button>
          <button class="btn-action" data-action="save">Lưu</button>
          <button class="btn-action" data-action="share">Chia sẻ</button>
        </footer>
      `;

      // Chèn lên trên cùng danh sách bài
      postsContainer.prepend(article);
    });
  }

  /* ==================== KHÔI PHỤC TRẠNG THÁI LƯU ==================== */

  function restoreSavedState(postsContainer) {
    const savedIds = loadFromStorage(STORAGE_KEY_SAVED, []);
    if (!savedIds.length) return;

    const allPosts = Array.from(postsContainer.querySelectorAll(".post"));
    allPosts.forEach((postEl, index) => {
      const id = getPostUniqueId(postEl, index);
      if (savedIds.includes(id)) {
        const btnSave = postEl.querySelector('.btn-action[data-action="save"]');
        if (btnSave) {
          btnSave.classList.add("saved");
        }
      }
    });
  }

  /* ==================== XỬ LÝ TABS ==================== */

  function setupTabs() {
    const tabs = document.querySelectorAll(".ch-tabs .tab");
    if (!tabs.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        // Ở đây chỉ thay đổi UI. Nếu sau này có API/Sort thực tế thì gắn thêm logic.
      });
    });
  }

  /* ==================== XỬ LÝ PHÂN TRANG (UI) ==================== */

  function setupPager() {
    const pager = document.querySelector(".pager");
    if (!pager) return;

    const prevBtn = pager.querySelector(".page.prev");
    const nextBtn = pager.querySelector(".page.next");
    const pageButtons = Array.from(
      pager.querySelectorAll(".page:not(.prev):not(.next)")
    );

    if (!pageButtons.length) return;

    let currentIndex =
      pageButtons.findIndex((btn) => btn.classList.contains("is-active")) || 0;

    function updatePagerState() {
      pageButtons.forEach((btn, idx) => {
        if (idx === currentIndex) {
          btn.classList.add("is-active");
          btn.setAttribute("aria-current", "page");
        } else {
          btn.classList.remove("is-active");
          btn.removeAttribute("aria-current");
        }
      });

      if (prevBtn) prevBtn.disabled = currentIndex === 0;
      if (nextBtn) nextBtn.disabled = currentIndex === pageButtons.length - 1;
    }

    updatePagerState();

    pageButtons.forEach((btn, idx) => {
      btn.addEventListener("click", function () {
        currentIndex = idx;
        updatePagerState();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        if (currentIndex > 0) {
          currentIndex--;
          updatePagerState();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        if (currentIndex < pageButtons.length - 1) {
          currentIndex++;
          updatePagerState();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    }
  }

  /* ==================== XỬ LÝ PHẢN HỒI (COMMENT) ==================== */

  function handleReply(postEl) {
    // Nếu đã có form thì chỉ focus lại, không tạo thêm
    let form = postEl.querySelector(".comment-form");
    if (form) {
      const textarea = form.querySelector(".comment-input");
      if (textarea) textarea.focus();
      return;
    }

    form = document.createElement("div");
    form.className = "comment-form";
    form.innerHTML = `
      <div class="comment-title">Thêm phản hồi của bạn</div>
      <textarea class="comment-input" placeholder="Nhập phản hồi..."></textarea>
      <div class="comment-actions">
        <button type="button" class="btn-comment-cancel">Hủy</button>
        <button type="button" class="btn-comment-submit">Gửi</button>
      </div>
    `;

    postEl.appendChild(form);

    form.addEventListener("click", function (event) {
      if (event.target.classList.contains("btn-comment-cancel")) {
        form.remove();
      } else if (event.target.classList.contains("btn-comment-submit")) {
        const textarea = form.querySelector(".comment-input");
        const value = (textarea.value || "").trim();
        if (!value) {
          alert("Vui lòng nhập nội dung phản hồi.");
          textarea.focus();
          return;
        }

        let list = postEl.querySelector(".comment-list");
        if (!list) {
          list = document.createElement("div");
          list.className = "comment-list";
          postEl.appendChild(list);
        }

        const item = document.createElement("div");
        item.className = "comment-item";
        item.innerHTML = `
          <div class="comment-author">Bạn</div>
          <div class="comment-text">${escapeHtml(value)}</div>
        `;
        list.appendChild(item);

        textarea.value = "";
      }
    });
  }

  /* ==================== XỬ LÝ LƯU BÀI ==================== */

  function handleSave(postEl, btn, postsContainer) {
    const allPosts = Array.from(postsContainer.querySelectorAll(".post"));
    const index = allPosts.indexOf(postEl);
    const id = getPostUniqueId(postEl, index);

    let savedIds = loadFromStorage(STORAGE_KEY_SAVED, []);

    if (savedIds.includes(id)) {
      // Bỏ lưu
      savedIds = savedIds.filter((x) => x !== id);
      btn.classList.remove("saved");
    } else {
      // Lưu
      savedIds.push(id);
      btn.classList.add("saved");
    }

    saveToStorage(STORAGE_KEY_SAVED, savedIds);
  }

  /* ==================== XỬ LÝ CHIA SẺ ==================== */

  function handleShare(postEl) {
    const titleEl = postEl.querySelector(".post-title");
    const textEl = postEl.querySelector(".post-text");
    const title = titleEl ? titleEl.textContent.trim() : "Bài viết cộng đồng";
    const text = textEl ? textEl.textContent.trim() : "";

    const shareText = `${title}\n\n${text}`;

    if (navigator.share) {
      navigator
        .share({
          title,
          text: shareText,
        })
        .catch(() => {
          // người dùng hủy share, không cần báo lỗi
        });
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(shareText)
        .then(() => {
          alert("Đã sao chép nội dung bài đăng vào clipboard.");
        })
        .catch(() => {
          alert("Không thể sao chép tự động. Bạn có thể copy nội dung thủ công.");
        });
    } else {
      alert("Chia sẻ bài:\n\n" + shareText);
    }
  }
})();
