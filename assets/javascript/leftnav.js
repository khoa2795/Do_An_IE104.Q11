// Load left nav component into pages
(function () {
  function insertLeftNav() {
    var placeholder = document.getElementById("sidebar-placeholder");
    if (!placeholder) return;
    fetch("/html/components/LeftNavBar.html")
      .then(function (r) {
        return r.text();
      })
      .then(function (html) {
        placeholder.innerHTML = html;

        // Xác định trang hiện tại và highlight đúng menu item
        try {
          var items = placeholder.querySelectorAll(".menu-item a");
          var currentPage =
            document.location.pathname.split("/").pop() || "Mainpage.html";

          items.forEach(function (a) {
            // Xóa tất cả class active trước
            a.classList.remove("active");

            var linkHref = a.getAttribute("href");

            // Kiểm tra khớp chính xác tên file
            if (linkHref === currentPage) {
              a.classList.add("active");
            }
            // Nếu đang ở news-detail.html hoặc URL chứa "news", active tab Tin Tức
            else if (
              (currentPage.includes("news") ||
                currentPage === "news-detail.html") &&
              linkHref === "news.html"
            ) {
              a.classList.add("active");
            }
          });
        } catch (e) {
          console.error("Error setting active menu:", e);
        }

        // dispatch event so other scripts know leftnav is ready
        document.dispatchEvent(new CustomEvent("leftnav:loaded"));
      })
      .catch(function (err) {
        console.error("Load leftnav failed:", err);
      });
  }

  // run after DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", insertLeftNav);
  } else {
    insertLeftNav();
  }
})();
