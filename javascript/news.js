// Tải dữ liệu từ file JSON
fetch("../data/news.json")
  .then(res => {
    if (!res.ok) throw new Error("Không thể tải dữ liệu JSON");
    return res.json();
  })
  .then(data => {
    if (!Array.isArray(data)) throw new Error("Dữ liệu JSON không phải là mảng");

    const grid = document.getElementById("news-grid");
    grid.innerHTML = ""; // Xóa nội dung cũ

    // Sắp xếp tin tức theo ngày giảm dần
    const sortedNews = data.sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedNews.forEach((news, index) => {
      const item = document.createElement("a");
      item.href = `news-detail.html?id=${news.id}`;
      item.classList.add("news-item");

      // Tin đầu tiên sẽ lớn hơn
      if (index === 0) item.classList.add("big");

      // Sử dụng loading="lazy" cho hình ảnh để tối ưu hiệu năng
      item.innerHTML = `
        <div class="news-image">
          <img src="${news.image}" alt="${news.title}" loading="lazy">
        </div>
        <h3>${news.title}</h3>
        <div class="news-meta">
          <span class="date">${news.date}</span>
          <span class="category">${news.category}</span>
        </div>
      `;

      grid.appendChild(item);
    });
  })
  .catch(err => {
    console.error("Lỗi khi tải tin tức:", err);
    document.getElementById("news-grid").innerHTML =
      "<p class='error-message'>Không thể tải danh sách tin tức. Vui lòng thử lại sau.</p>";
  });
