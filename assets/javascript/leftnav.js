// Load left nav component into pages
(function () {
  var LEFTNAV_CACHE_KEY = "leftnav-component-v2";

  function insertLeftNav() {
    var placeholder = document.getElementById("sidebar-placeholder");
    if (!placeholder) return;

    // Check cache first
    var cached = sessionStorage.getItem(LEFTNAV_CACHE_KEY);

    if (cached) {
      placeholder.innerHTML = cached;
      requestAnimationFrame(function () {
        placeholder.classList.add("loaded");
      });
      setActiveTab(placeholder);
      loadLoginScript();
      document.dispatchEvent(new CustomEvent("leftnav:loaded"));
      return;
    }

    fetch("/html/components/LeftNavBar.html")
      .then(function (r) {
        return r.text();
      })
      .then(function (html) {
        placeholder.innerHTML = html;
        sessionStorage.setItem(LEFTNAV_CACHE_KEY, html);

        // Fade in after content is ready
        requestAnimationFrame(function () {
          placeholder.classList.add("loaded");
        });

        setActiveTab(placeholder);
        loadLoginScript();

        // Dispatch event
        document.dispatchEvent(new CustomEvent("leftnav:loaded"));
      })
      .catch(function (err) {
        console.error("Load leftnav failed:", err);
        placeholder.classList.add("loaded"); // Show anyway
      });
  }

  function setActiveTab(placeholder) {
    try {
      var items = placeholder.querySelectorAll(".leftnav__link");
      var currentPage =
        document.location.pathname.split("/").pop() || "Mainpage.html";

      items.forEach(function (a) {
        a.classList.remove("leftnav__link--active");

        var linkHref = a.getAttribute("href");

        if (linkHref === currentPage) {
          a.classList.add("leftnav__link--active");
        } else if (
          (currentPage.includes("news") ||
            currentPage === "news-detail.html") &&
          linkHref === "news.html"
        ) {
          a.classList.add("leftnav__link--active");
        } else if (
          currentPage === "Calories.html" &&
          linkHref === "Calories.html"
        ) {
          a.classList.add("leftnav__link--active");
        } else if (
          (currentPage.includes("CongDong") ||
            currentPage === "CongDong1.html" ||
            currentPage === "CongDong2.html") &&
          linkHref === "CongDong1.html"
        ) {
          a.classList.add("leftnav__link--active");
        }
      });
    } catch (e) {
      console.error("Error setting active tab:", e);
    }
  }

  function loadLoginScript() {
    // Load login script sau khi leftnav đã load
    var script = document.createElement("script");
    script.src = "/assets/javascript/login.js";
    document.body.appendChild(script);
  }

  // run after DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", insertLeftNav);
  } else {
    insertLeftNav();
  }
})();
