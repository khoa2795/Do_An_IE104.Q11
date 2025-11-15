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

        // Set active tab
        try {
          var items = placeholder.querySelectorAll(".menu-item a");
          var currentPage =
            document.location.pathname.split("/").pop() || "Mainpage.html";

          items.forEach(function (a) {
            a.classList.remove("active");

            var linkHref = a.getAttribute("href");

            if (linkHref === currentPage) {
              a.classList.add("active");
            } else if (
              (currentPage.includes("news") ||
                currentPage === "news-detail.html") &&
              linkHref === "news.html"
            ) {
              a.classList.add("active");
            } else if (
              currentPage === "Calories.html" &&
              linkHref === "Calories.html"
            ) {
              a.classList.add("active");
            } else if (
              (currentPage.includes("CongDong") ||
                currentPage === "CongDong1.html" ||
                currentPage === "CongDong2.html") &&
              linkHref === "CongDong1.html"
            ) {
              a.classList.add("active");
            }
          });
        } catch (e) {
          console.error("Error setting active tab:", e);
        }

        // Load login script sau khi leftnav đã load
        var script = document.createElement("script");
        script.src = "/assets/javascript/login.js";
        document.body.appendChild(script);

        // Dispatch event
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
