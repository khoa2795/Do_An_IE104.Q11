// Hiển thị tin tức theo từng danh mục (category)

document.addEventListener("DOMContentLoaded", function () {
  var tabs = document.querySelectorAll(".category-tabs .tab");
  var newsGrid = document.getElementById("news-grid");
  if (!tabs.length || !newsGrid) return;

  // Hàm hiển thị tin theo danh mục
  function showNewsByCategory(category) {
    fetch("/data/news-tabs.json")
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        // Lọc tin theo category
        var filtered = data.filter(function (item) {
          return item.category === category;
        });

        // Xóa nội dung cũ
        newsGrid.innerHTML = "";

        // Nếu không có tin
        if (filtered.length === 0) {
          newsGrid.innerHTML =
            "<p class='no-news'>Không có tin trong mục này</p>";
          return;
        }

        // Hiển thị tin theo danh mục
        for (var i = 0; i < filtered.length; i++) {
          var news = filtered[i];
          var card = document.createElement("div");
          card.className = "news-card";
          card.innerHTML =
            '<a href="news-detail.html?id=' +
            news.id +
            '">' +
            '<img src="' +
            news.image +
            '" alt="' +
            news.title +
            '" class="news-thumb" loading="lazy">' +
            "<h3 class='news-title'>" +
            news.title +
            "</h3>" +
            "</a>";
          newsGrid.appendChild(card);
        }
      })
      .catch(function (err) {
        console.error("Lỗi:", err);
        newsGrid.innerHTML =
          "<p class='error-message'>Không thể tải dữ liệu.</p>";
      });
  }

  // Khi click vào tab
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener("click", function () {
      // Xóa class active ở tất cả tab
      for (var j = 0; j < tabs.length; j++) {
        tabs[j].classList.remove("active");
      }

      // Thêm class active cho tab hiện tại
      this.classList.add("active");

      // Hiển thị tin của category tương ứng
      var category = this.getAttribute("data-category");
      showNewsByCategory(category);
    });
  }
  // Khi vừa load trang → hiển thị tab đầu tiên
  if (tabs.length > 0) {
    tabs[0].classList.add("active");
    showNewsByCategory(tabs[0].getAttribute("data-category"));
  }
});
