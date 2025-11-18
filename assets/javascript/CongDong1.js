// ../assets/javascript/CongDong1.js
(function () {
  let currentPage = 1;
  const postsPerPage = 4;

  document.addEventListener("DOMContentLoaded", function () {
    const postsContainer = document.querySelector(".posts");
    if (!postsContainer) return;

    adjustCommunityOffset();
    window.addEventListener("resize", adjustCommunityOffset);
    window.addEventListener("load", adjustCommunityOffset, { once: true });

    // 1. Render bài viết theo trang hiện tại
    renderPostsByPage(currentPage);

    // 2. Khôi phục trạng thái "Lưu" cho các bài viết
    restoreSavedState(postsContainer);

    // 3. Xử lý nút "Tạo bài"
    const btnCreate = document.querySelector(".btn-create");
    if (btnCreate) {
      btnCreate.addEventListener("click", function () {
        window.location.href = "CongDong2.html";
      });
    }

    // 4. Xử lý tabs "Mới nhất / Mới hoạt động"
    setupTabs();

    // 5. Xử lý phân trang
    setupPager();

    // 6. Event delegation cho các nút trong bài viết
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
          handleSave(postEl, btn);
          break;
        case "share":
          handleShare(postEl);
          break;
        default:
          break;
      }
    });
  });

  /* ==================== RENDER BÀI VIẾT THEO TRANG ==================== */
  function renderPostsByPage(page) {
    const postsContainer = document.querySelector(".posts");
    if (!postsContainer) return;

    const pageData = CommunityData.getPostsByPage(page, postsPerPage);

    // Xóa nội dung cũ
    postsContainer.innerHTML = "";

    if (!pageData.posts.length) {
      postsContainer.innerHTML =
        '<div class="no-posts">Chưa có bài viết nào. Hãy là người đầu tiên đăng bài!</div>';
      updatePagerUI(pageData);
      return;
    }

    // Render bài viết
    pageData.posts.forEach((post) => {
      const article = document.createElement("article");
      article.className =
        "post" + (post.id.startsWith("user-") ? " post--user" : "");
      article.dataset.postId = post.id;

      const safeTitle = CommunityData.escapeHtml(post.title || "");
      const safeContent = CommunityData.escapeHtml(post.content || "");
      const timeText = CommunityData.formatTimeAgo(post.createdAt);

      article.innerHTML = `
        <header class="post-hd">
          <img class="avt" src="${post.avatar}" alt="avatar"/>
          <div class="meta">
            <div class="name">${post.author}</div>
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

      postsContainer.appendChild(article);
    });

    restoreSavedState(postsContainer);

    // Cập nhật UI phân trang
    updatePagerUI(pageData);
    currentPage = page;
  }

  /* ==================== CẬP NHẬT UI PHÂN TRANG ==================== */
  function updatePagerUI(pageData) {
    const pager = document.querySelector(".pager");
    if (!pager) return;

    // Xóa nút trang cũ (giữ lại nút prev/next)
    const prevBtn = pager.querySelector(".page.prev");
    const nextBtn = pager.querySelector(".page.next");
    const oldPageButtons = pager.querySelectorAll(
      ".page:not(.prev):not(.next)"
    );
    oldPageButtons.forEach((btn) => btn.remove());

    // Tạo nút trang mới
    const pageButtonsContainer =
      pager.querySelector(".page-buttons") || document.createElement("div");
    if (!pager.querySelector(".page-buttons")) {
      pageButtonsContainer.className = "page-buttons";
      prevBtn.after(pageButtonsContainer);
    }
    pageButtonsContainer.innerHTML = "";

    // Tạo nút cho mỗi trang
    for (let i = 1; i <= pageData.totalPages; i++) {
      const pageBtn = document.createElement("button");
      pageBtn.className =
        "page" + (i === pageData.currentPage ? " is-active" : "");
      pageBtn.textContent = i;
      if (i === pageData.currentPage) {
        pageBtn.setAttribute("aria-current", "page");
      }

      pageBtn.addEventListener("click", function () {
        renderPostsByPage(i);
        scrollToPostsSection();
      });

      pageButtonsContainer.appendChild(pageBtn);
    }

    // Cập nhật trạng thái nút prev/next
    if (prevBtn) {
      prevBtn.disabled = !pageData.hasPrev;
      prevBtn.onclick = pageData.hasPrev
        ? function () {
            renderPostsByPage(pageData.currentPage - 1);
            scrollToPostsSection();
          }
        : null;
    }

    if (nextBtn) {
      nextBtn.disabled = !pageData.hasNext;
      nextBtn.onclick = pageData.hasNext
        ? function () {
            renderPostsByPage(pageData.currentPage + 1);
            scrollToPostsSection();
          }
        : null;
    }
  }

  /* ==================== KHÔI PHỤC TRẠNG THÁI LƯU ==================== */
  function restoreSavedState(postsContainer) {
    const savedIds = CommunityData.getSavedPosts();
    if (!savedIds.length) return;

    savedIds.forEach((savedId) => {
      const postEl = postsContainer.querySelector(
        `[data-post-id="${savedId}"]`
      );
      if (postEl) {
        const btnSave = postEl.querySelector('.btn-action[data-action="save"]');
        if (btnSave) {
          btnSave.classList.add("saved");
        }
      }
    });
  }

  /* ==================== XỬ LÝ LƯU BÀI ==================== */
  function handleSave(postEl, btn) {
    const postId = postEl.dataset.postId;
    const isNowSaved = CommunityData.toggleSavePost(postId);

    if (isNowSaved) {
      btn.classList.add("saved");
    } else {
      btn.classList.remove("saved");
    }
  }

  /* ==================== XỬ LÝ TABS ==================== */
  function setupTabs() {
    const tabs = document.querySelectorAll(".ch-tabs .tab");
    if (!tabs.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        // Có thể thêm logic sort/filter ở đây
        if (tab.textContent.includes("Mới hoạt động")) {
          // Logic cho tab "Mới hoạt động"
          console.log("Chuyển sang tab Mới hoạt động");
        } else {
          // Logic cho tab "Mới nhất"
          console.log("Chuyển sang tab Mới nhất");
        }

        // Render lại trang đầu tiên khi chuyển tab
        renderPostsByPage(1);
      });
    });
  }

  /* ==================== THIẾT LẬP PHÂN TRANG ==================== */
  function setupPager() {
    const pager = document.querySelector(".pager");
    if (!pager) return;

    // Đảm bảo có container cho nút trang
    if (!pager.querySelector(".page-buttons")) {
      const prevBtn = pager.querySelector(".page.prev");
      const nextBtn = pager.querySelector(".page.next");
      const pageButtons = document.createElement("div");
      pageButtons.className = "page-buttons";

      // Chèn container giữa prev và next
      if (prevBtn && nextBtn) {
        prevBtn.after(pageButtons);
      }
    }
  }

  /* ==================== XỬ LÝ PHẢN HỒI (COMMENT) ==================== */
  function handleReply(postEl) {
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
          <div class="comment-text">${CommunityData.escapeHtml(value)}</div>
        `;
        list.appendChild(item);

        textarea.value = "";
        form.remove();
      }
    });
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
          alert(
            "Không thể sao chép tự động. Bạn có thể copy nội dung thủ công."
          );
        });
    } else {
      alert("Chia sẻ bài:\n\n" + shareText);
    }
  }

  function adjustCommunityOffset() {
    const fixedTop = document.querySelector(".fixed-top");
    if (!fixedTop) return;

    const root = document.documentElement;
    const height = fixedTop.offsetHeight;
    if (root && height > 0) {
      root.style.setProperty("--community-top-height", `${height}px`);
    }
  }

  function scrollToPostsSection() {
    const bodySection = document.querySelector(".community-body");
    if (!bodySection) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const fixedTop = document.querySelector(".fixed-top");
    const offset = fixedTop ? fixedTop.offsetHeight : 0;
    const target =
      bodySection.getBoundingClientRect().top +
      window.pageYOffset -
      offset -
      12;
    window.scrollTo({ top: Math.max(target, 0), behavior: "smooth" });
  }
})();
