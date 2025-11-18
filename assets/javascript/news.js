// Hiển thị danh sách tin tổng hợp từ file news.json

document.addEventListener("DOMContentLoaded", function () {
  var grid = document.getElementById("news-grid");
  if (!grid) return;

  var dataPromise;

  if (window.DataCache && typeof window.DataCache.fetchJSON === "function") {
    dataPromise = window.DataCache.fetchJSON("../data/news.json", {
      cacheKey: "news-list",
      ttl: 1000 * 60 * 30,
    });
  } else {
    dataPromise = fetch("../data/news.json").then(function (res) {
      return res.json();
    });
  }

  dataPromise
    .then(function (data) {
      // Sắp xếp tin theo ngày giảm dần (mới nhất lên đầu)
      data.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      });

      // Xóa nội dung cũ
      grid.innerHTML = "";

      if (
        window.DataCache &&
        typeof window.DataCache.preloadImages === "function"
      ) {
        window.DataCache.preloadImages(
          data.map(function (item) {
            return item.image;
          })
        );
      }

      // Duyệt từng tin trong danh sách
      for (var i = 0; i < data.length; i++) {
        var news = data[i];

        // Tạo thẻ <a> cho mỗi tin
        var item = document.createElement("a");
        item.href = "news-detail.html?id=" + news.id;

        // Tin đầu tiên to hơn
        if (i === 0) {
          item.className = "main-news";
        } else {
          item.className = "small-news";
        }

        // Tạo nội dung HTML cho tin
        item.innerHTML =
          '<div class="news-img">' +
          '<img src="' +
          news.image +
          '" alt="' +
          news.title +
          '" loading="lazy">' +
          "</div>" +
          (i === 0
            ? "<h3>" + news.title + "</h3>"
            : "<h4>" + news.title + "</h4>") +
          '<div class="news-meta">' +
          "<span class='date'>" +
          news.date +
          "</span>" +
          "<span class='category'>" +
          news.category +
          "</span>" +
          "</div>";

        // Thêm tin vào grid
        grid.appendChild(item);
      }
    })
    .catch(function (err) {
      console.error("Lỗi:", err);
      grid.innerHTML = "<p class='error-message'>Không thể tải tin tức.</p>";
    });
});
