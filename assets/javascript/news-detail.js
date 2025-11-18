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
