// Lấy id bài viết từ URL
const params = new URLSearchParams(window.location.search);
const newsId = parseInt(params.get("id"));

if (!newsId) {
  document.querySelector(".news-container").innerHTML = "<h2>Không tìm thấy bài viết</h2>";
  throw new Error("ID bài viết không hợp lệ");
}

// Tải dữ liệu từ file JSON
fetch("../data/news.json")
  .then(res => {
    if (!res.ok) throw new Error("Không thể tải dữ liệu JSON");
    return res.json();
  })
  .then(data => {
    const article = data.find(item => item.id === newsId);
    if (!article) {
      document.querySelector(".news-container").innerHTML = "<h2>Không tìm thấy bài viết</h2>";
      return;
    }

    // Đổ dữ liệu bài viết
    document.title = article.title; // Thêm title cho trang
    document.getElementById("news-title").textContent = article.title;
    document.getElementById("news-meta").textContent = 
      `Đăng ngày: ${article.date} • Tác giả: ${article.author} • ${article.category}`;
  
    // Hiển thị nội dung bài viết (HTML)
    document.getElementById("news-content").innerHTML = article.content;

    // Hiển thị phần "Tin khác" - giới hạn số lượng tin liên quan
    const MAX_RELATED = 4;
    const relatedDiv = document.getElementById("related-grid");

    // Lọc và sắp xếp tin liên quan
    const relatedArticles = data
      .filter(item => item.id !== newsId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, MAX_RELATED);

    relatedArticles.forEach(r => {
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
  .catch(err => {
    console.error("Lỗi:", err);
    document.querySelector(".news-container").innerHTML = 
      "<h2>Có lỗi xảy ra khi tải bài viết</h2>";
  });
