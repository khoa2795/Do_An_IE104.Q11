document.addEventListener('DOMContentLoaded', () => {
  // Khởi tạo hiển thị tab đầu tiên
  const firstTab = document.querySelector('.category-tabs .tab');
  if (firstTab) {
    firstTab.classList.add('active');
    showNewsByCategory(firstTab.dataset.category);
  }

  // Xử lý sự kiện click tab
  document.querySelectorAll('.category-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      // Xóa active class từ tất cả tabs
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      
      // Thêm active class cho tab được click
      tab.classList.add('active');
      
      // Hiển thị tin tức theo category
      const category = tab.dataset.category;
      showNewsByCategory(category);
    });
  });
});

function showNewsByCategory(category) {
  fetch("../data/news.json")
    .then(res => res.json())
    .then(data => {
      const newsGrid = document.getElementById('news-grid');
      newsGrid.innerHTML = '';

      // Chỉ lấy tin tức có category khác "Y tế" và trùng với category được chọn
      const filteredNews = data.filter(news => 
        news.category === category && 
        news.category !== "Y tế"
      );

      if (filteredNews.length === 0) {
        newsGrid.innerHTML = '<p class="no-news">Không có tin tức trong mục này</p>';
        return;
      }

      // Sắp xếp tin tức theo ngày giảm dần nếu có ngày
      const sortedNews = filteredNews
        .sort((a, b) => {
          if (a.date && b.date) {
            return new Date(b.date) - new Date(a.date);
          }
          return 0;
        });

      // Hiển thị tin tức đã lọc
      sortedNews.forEach(news => {
        const newsCard = document.createElement('div');
        newsCard.className = 'news-card';
        newsCard.innerHTML = `
          <a href="news-detail.html?id=${news.id}">
            <img src="${news.image}" alt="${news.title}" class="news-thumb" loading="lazy">
            <h3 class="news-title">${news.title}</h3>
            ${news.date ? `<div class="news-meta">${news.date}</div>` : ''}
          </a>
        `;
        newsGrid.appendChild(newsCard);
      });
    })
    .catch(err => {
      console.error('Lỗi:', err);
      document.getElementById('news-grid').innerHTML = 
        '<p class="error-message">Không thể tải tin tức. Vui lòng thử lại sau.</p>';
    });
}
