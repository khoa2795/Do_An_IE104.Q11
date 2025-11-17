document.addEventListener("DOMContentLoaded", function () {
  var tabs = document.querySelectorAll(".news__tab");
  var newsGrid = document.getElementById("news-grid");

  if (!tabs.length || !newsGrid) return;

  // HÀM HIỂN THỊ TIN THEO DANH MỤC
  function showNewsByCategory(category) {
    fetch("/data/news-tabs.json")
      .then((res) => res.json())
      .then((data) => {
        var filtered = data.filter((item) => item.category === category);

        newsGrid.innerHTML = "";

        if (filtered.length === 0) {
          newsGrid.innerHTML =
            "<p class='news__no-data'>Không có tin trong mục này</p>";
          return;
        }

        filtered.forEach((news) => {
          var card = document.createElement("div");
          card.className = "news__card";

          card.innerHTML = `
            <a href="news-detail.html?id=${news.id}">
              <img src="${news.image}" alt="${news.title}" class="news__card-image" loading="lazy">
              <h3 class="news__card-title">${news.title}</h3>
            </a>
          `;

          newsGrid.appendChild(card);
        });
      })
      .catch((err) => {
        console.error("Lỗi:", err);
        newsGrid.innerHTML =
          "<p class='news__error'>Không thể tải dữ liệu.</p>";
      });
  }

  // SỰ KIỆN CLICK VÀO TABS
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      tabs.forEach((t) => t.classList.remove("news__tab--active"));

      this.classList.add("news__tab--active");

      showNewsByCategory(this.getAttribute("data-category"));
    });
  });

  // LOAD CATEGORY ĐẦU TIÊN KHI VÀO TRANG
  tabs[0].classList.add("news__tab--active");
  showNewsByCategory(tabs[0].getAttribute("data-category"));
});
