document.addEventListener("DOMContentLoaded", function () {
  var tabs = document.querySelectorAll(".category-tabs .tab");
  var newsGrid = document.getElementById("news-grid");

  if (!tabs.length || !newsGrid) return;

  // ============================
  // HÀM HIỂN THỊ TIN THEO DANH MỤC
  // ============================
  function showNewsByCategory(category) {
    fetch("/data/news-tabs.json")
      .then((res) => res.json())
      .then((data) => {
        var filtered = data.filter((item) => item.category === category);

        newsGrid.innerHTML = "";

        if (filtered.length === 0) {
          newsGrid.innerHTML =
            "<p class='no-news'>Không có tin trong mục này</p>";
          return;
        }

        filtered.forEach((news) => {
          var card = document.createElement("div");
          card.className = "news-card";

          card.innerHTML = `
            <a href="news-detail.html?id=${news.id}">
              <img src="${news.image}" alt="${news.title}" class="news-thumb" loading="lazy">
              <h3 class="news-title">${news.title}</h3>
            </a>
          `;

          newsGrid.appendChild(card);
        });
      })
      .catch((err) => {
        console.error("Lỗi:", err);
        newsGrid.innerHTML =
          "<p class='error-message'>Không thể tải dữ liệu.</p>";
      });
  }

  // ============================
  // SỰ KIỆN CLICK VÀO TABS
  // ============================
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      tabs.forEach((t) => t.classList.remove("active"));

      this.classList.add("active");

      showNewsByCategory(this.getAttribute("data-category"));
    });
  });

  // ============================
  // LOAD CATEGORY ĐẦU TIÊN KHI VÀO TRANG
  // ============================
  tabs[0].classList.add("active");
  showNewsByCategory(tabs[0].getAttribute("data-category"));
});
