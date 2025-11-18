// Lấy id bài viết từ URL
const params = new URLSearchParams(window.location.search);
const newsId = parseInt(params.get("id"), 10);

if (!newsId) {
  document.querySelector(".article__container").innerHTML =
    "<h2>Không tìm thấy bài viết</h2>";
  throw new Error("ID bài viết không hợp lệ");
}

// Hàm parse ngày dạng dd-mm-yyyy → Date
function parseVNDate(dateStr) {
  if (!dateStr) return new Date(0);
  const [d, m, y] = dateStr.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d));
}

var dataLoaders;

if (window.DataCache && typeof window.DataCache.fetchJSON === "function") {
  dataLoaders = [
    window.DataCache.fetchJSON("../data/news.json", {
      cacheKey: "news-list",
      ttl: 1000 * 60 * 30,
    }),
    window.DataCache.fetchJSON("../data/news-tabs.json", {
      cacheKey: "news-tabs-detail",
      ttl: 1000 * 60 * 30,
    }),
  ];
} else {
  dataLoaders = [
    fetch("../data/news.json").then(function (res) {
      if (!res.ok) throw new Error("Không thể tải dữ liệu JSON");
      return res.json();
    }),
    fetch("../data/news-tabs.json").then(function (res) {
      if (!res.ok) throw new Error("Không thể tải dữ liệu JSON");
      return res.json();
    }),
  ];
}

Promise.all(dataLoaders)
  .then(([newsMain, newsTabs]) => {
    // Gộp tất cả bài viết lại thành 1 mảng
    const allArticles = [...newsMain, ...newsTabs];

    // Tìm bài đang xem theo id
    const article = allArticles.find((item) => item.id === newsId);

    if (!article) {
      document.querySelector(".article__container").innerHTML =
        "<h2>Không tìm thấy bài viết</h2>";
      return;
    }

    // ===== ĐỔ DỮ LIỆU BÀI VIẾT CHÍNH =====
    document.title = article.title;

    document.getElementById("news-title").textContent = article.title;

    const authorText = article.author ? ` • Tác giả: ${article.author}` : "";
    const metaText = `Đăng ngày: ${article.date}${authorText} • ${article.category}`;

    document.getElementById("news-meta").textContent = metaText;

    // Nội dung HTML của bài
    document.getElementById("news-content").innerHTML = article.content;

    // ===== PHẦN "CÁC TIN KHÁC" CÙNG CHUYÊN MỤC =====
    const MAX_RELATED = 4;
    const relatedDiv = document.getElementById("related-grid");

    // Lọc bài cùng category, khác id hiện tại
    let relatedArticles = allArticles.filter(
      (item) => item.id !== newsId && item.category === article.category
    );

    // Sắp xếp theo ngày mới nhất (dd-mm-yyyy)
    relatedArticles.sort((a, b) => parseVNDate(b.date) - parseVNDate(a.date));

    // Giới hạn số lượng
    relatedArticles = relatedArticles.slice(0, MAX_RELATED);

    // Nếu không có bài liên quan
    if (relatedArticles.length === 0) {
      relatedDiv.innerHTML =
        "<p class='article__no-related'>Chưa có bài viết nào khác trong chuyên mục này.</p>";
      return;
    }

    if (
      window.DataCache &&
      typeof window.DataCache.preloadImages === "function"
    ) {
      window.DataCache.preloadImages(
        [article.image].concat(
          relatedArticles.map(function (item) {
            return item.image;
          })
        )
      );
    }

    // Render HTML
    relatedArticles.forEach((r) => {
      const link = document.createElement("a");
      link.href = `news-detail.html?id=${r.id}`;
      link.classList.add("article__related-card");
      link.innerHTML = `
        <img src="${r.image}" alt="${r.title}" class="article__related-image" loading="lazy">
        <p class="article__related-card-title">${r.title}</p>
        <span class="article__related-meta">${r.date}</span>
      `;
      relatedDiv.appendChild(link);
    });
  })
  .catch((err) => {
    console.error("Lỗi:", err);
    document.querySelector(".article__container").innerHTML =
      "<h2>Có lỗi xảy ra khi tải bài viết</h2>";
  });

// ===== BÌNH LUẬN =====
(function () {
  var form = document.getElementById("comment-form");
  var textInput = document.getElementById("comment-text");
  var list = document.getElementById("comment-list");
  if (!form || !list || !textInput) return;

  var STORAGE_KEY = "news-comments-" + newsId;
  var toastTimer;

  function createLocalToast(message) {
    var toast = document.getElementById("global-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "global-toast";
      toast.className = "global-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("global-toast--visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("global-toast--visible");
    }, 2500);
  }

  var showToast = window.showGlobalToast || createLocalToast;
  if (!window.showGlobalToast) {
    window.showGlobalToast = createLocalToast;
  }

  function getCurrentUser() {
    try {
      var rawUser = sessionStorage.getItem("currentUser");
      return rawUser ? JSON.parse(rawUser) : null;
    } catch (e) {
      return null;
    }
  }

  function ensureLoggedIn() {
    var user = getCurrentUser();
    if (!user) {
      showToast("Bạn cần đăng nhập để bình luận.");
      return false;
    }
    return true;
  }

  function loadComments() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveComments(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function formatTime(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    return (
      d.toLocaleDateString("vi-VN") +
      " " +
      d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    );
  }

  function renderReplies(replies) {
    if (!replies || !replies.length) return "";
    return `
      <div class="article__comment-replies-list">
        ${replies
          .map(function (r) {
            return `
              <div class="article__comment-reply">
                <div class="article__comment-header">
                  <strong>${escapeHtml(r.author)}</strong>
                  <span class="article__comment-time">${formatTime(
                    r.createdAt
                  )}</span>
                </div>
                <p class="article__comment-text">${escapeHtml(r.content)}</p>
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderComments() {
    var data = loadComments();
    list.innerHTML = "";
    if (!data.length) {
      list.innerHTML =
        "<p class='article__comment-empty'>Chưa có bình luận nào.</p>";
      return;
    }

    data.forEach(function (c) {
      var wrap = document.createElement("div");
      wrap.className = "article__comment";
      wrap.id = "comment-" + c.id;
      wrap.dataset.id = c.id;

      wrap.innerHTML = `
        <div class="article__comment-header">
          <strong>${escapeHtml(c.author)}</strong>
          <span class="article__comment-time">${formatTime(c.createdAt)}</span>
        </div>
        <p class="article__comment-text">${escapeHtml(c.content)}</p>
        <div class="article__comment-actions">
          <button type="button" data-action="reply">Phản hồi</button>
        </div>
        <div class="article__reply-form">
          <input type="text" class="article__reply-input" placeholder="Viết phản hồi..." />
          <div class="article__reply-actions">
            <button type="button" data-action="submit-reply">Gửi phản hồi</button>
            <button type="button" data-action="cancel-reply">Hủy</button>
          </div>
        </div>
        ${renderReplies(c.replies)}
      `;
      list.appendChild(wrap);
    });
  }

  function addComment(content) {
    var user = getCurrentUser();
    var comments = loadComments();
    var newComment = {
      id: Date.now().toString(36),
      author: (user && (user.fullname || user.username)) || "Người dùng",
      content: content,
      createdAt: new Date().toISOString(),
      replies: [],
    };
    comments.unshift(newComment);
    saveComments(comments);
    renderComments();
  }

  function addReply(parentId, content) {
    var comments = loadComments();
    var user = getCurrentUser();
    comments = comments.map(function (c) {
      if (c.id === parentId) {
        var replies = c.replies || [];
        replies.push({
          id: Date.now().toString(36),
          author: (user && (user.fullname || user.username)) || "Người dùng",
          content: content,
          createdAt: new Date().toISOString(),
        });
        c.replies = replies;
      }
      return c;
    });
    saveComments(comments);
    renderComments();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!ensureLoggedIn()) return;

    var content = (textInput.value || "").trim();
    if (!content) {
      textInput.focus();
      return;
    }

    addComment(content);
    textInput.value = "";
  });

  textInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });
  function hideReplyForm(el) {
    el.classList.remove("article__reply-form--visible");
    var input = el.querySelector(".article__reply-input");
    if (input) input.value = "";
  }

  function submitReplyFromForm(formEl, parentId) {
    if (!formEl) return;
    if (!ensureLoggedIn()) return;
    var input = formEl.querySelector(".article__reply-input");
    var reply = (input && input.value ? input.value : "").trim();
    if (!reply) {
      if (input) input.focus();
      return;
    }
    addReply(parentId, reply);
    hideReplyForm(formEl);
  }

  list.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-action]");
    if (!btn) return;

    var commentEl = btn.closest(".article__comment");
    if (!commentEl) return;
    var id = commentEl.dataset.id;
    var action = btn.getAttribute("data-action");

    if (action === "reply") {
      if (!ensureLoggedIn()) return;
      var formEl = commentEl.querySelector(".article__reply-form");
      if (formEl) {
        formEl.classList.add("article__reply-form--visible");
        var input = formEl.querySelector(".article__reply-input");
        if (input) input.focus();
      }
    } else if (action === "submit-reply") {
      submitReplyFromForm(btn.closest(".article__reply-form"), id);
    } else if (action === "cancel-reply") {
      var formEl = btn.closest(".article__reply-form");
      if (formEl) hideReplyForm(formEl);
    }
  });

  list.addEventListener("keydown", function (e) {
    var input = e.target.closest(".article__reply-input");
    if (!input) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      var formEl = input.closest(".article__reply-form");
      var commentEl = input.closest(".article__comment");
      if (formEl && commentEl) {
        submitReplyFromForm(formEl, commentEl.dataset.id);
      }
    }
  });

  renderComments();
})();
