// Lấy id bài viết từ URL
const params = new URLSearchParams(window.location.search);
const newsId = parseInt(params.get("id"), 10);

if (!newsId) {
  document.querySelector(".news-container").innerHTML =
    "<h2>Không tìm thấy bài viết</h2>";
  throw new Error("ID bài viết không hợp lệ");
}

// Hàm parse ngày dạng dd-mm-yyyy → Date
function parseVNDate(dateStr) {
  if (!dateStr) return new Date(0);
  const [d, m, y] = dateStr.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d));
}

// Tải dữ liệu từ 2 file JSON và gộp lại
Promise.all([fetch("../data/news.json"), fetch("../data/news-tabs.json")])
  .then(([res1, res2]) => {
    if (!res1.ok || !res2.ok) {
      throw new Error("Không thể tải dữ liệu JSON");
    }
    return Promise.all([res1.json(), res2.json()]);
  })
  .then(([newsMain, newsTabs]) => {
    // Gộp tất cả bài viết lại thành 1 mảng
    const allArticles = [...newsMain, ...newsTabs];

    // Tìm bài đang xem theo id
    const article = allArticles.find((item) => item.id === newsId);

    if (!article) {
      document.querySelector(".news-container").innerHTML =
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
        "<p class='no-related'>Chưa có bài viết nào khác trong chuyên mục này.</p>";
      return;
    }

    // Render HTML
    relatedArticles.forEach((r) => {
      const link = document.createElement("a");
      link.href = `news-detail.html?id=${r.id}`;
      link.classList.add("related-item");
      link.innerHTML = `
        <div class="related-card">
          <img src="${r.image}" alt="${r.title}" class="related-thumb" loading="lazy">
          <p class="related-title">${r.title}</p>
          <span class="related-meta">${r.date}</span>
        </div>
      `;
      relatedDiv.appendChild(link);
    });
  })
  .catch((err) => {
    console.error("Lỗi:", err);
    document.querySelector(".news-container").innerHTML =
      "<h2>Có lỗi xảy ra khi tải bài viết</h2>";
  });
