// Load left nav component into pages
(function () {
  var LEFTNAV_CACHE_KEY = "leftnav-component-v3";

  function insertLeftNav() {
    var placeholder = document.getElementById("sidebar-placeholder");
    if (!placeholder) return;

    // Check cache first
    var cached = sessionStorage.getItem(LEFTNAV_CACHE_KEY);

    if (cached) {
      placeholder.innerHTML = cached;
      requestAnimationFrame(function () {
        placeholder.classList.add("loaded");
        pinSidebarIfNeeded(placeholder);
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
          pinSidebarIfNeeded(placeholder);
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

  function pinSidebarIfNeeded(placeholder) {
    var sidebar = placeholder.querySelector(".leftnav");
    if (!sidebar) return;

    var mediaQuery = window.matchMedia("(max-width: 768px)");
    var resizeObserver;

    function getHeaderHeight() {
      var value = getComputedStyle(document.documentElement).getPropertyValue(
        "--header-height"
      );
      var parsed = parseInt(value, 10);
      return Number.isNaN(parsed) ? 100 : parsed;
    }

    function getSidebarBaseWidth(rectWidth) {
      var widthToken = getComputedStyle(
        document.documentElement
      ).getPropertyValue("--sidebar-width");
      var cssWidth = parseInt(widthToken, 10);
      if (!Number.isNaN(cssWidth)) {
        return cssWidth;
      }
      var naturalWidth = sidebar.offsetWidth || rectWidth;
      return Math.max(200, Math.min(rectWidth, naturalWidth));
    }

    function applyFixedPosition() {
      var rect = placeholder.getBoundingClientRect();
      var headerHeight = getHeaderHeight();
      var topOffset = headerHeight + 16;
      var heightValue = "calc(100vh - " + (headerHeight + 32) + "px)";
      var baseWidth = getSidebarBaseWidth(rect.width);

      sidebar.dataset.fixed = "true";
      sidebar.style.position = "fixed";
      sidebar.style.top = topOffset + "px";
      sidebar.style.left = rect.left + window.scrollX + "px";
      sidebar.style.width = baseWidth + "px";
      sidebar.style.height = heightValue;
      sidebar.style.minHeight = heightValue;
      sidebar.style.maxHeight = heightValue;
      sidebar.style.overflow = "auto";

      placeholder.style.minHeight = heightValue;
      placeholder.style.width = baseWidth + "px";
    }

    function clearFixedPosition() {
      if (!sidebar.dataset.fixed) return;
      delete sidebar.dataset.fixed;
      sidebar.style.position = "";
      sidebar.style.top = "";
      sidebar.style.left = "";
      sidebar.style.width = "";
      sidebar.style.height = "";
      sidebar.style.minHeight = "";
      sidebar.style.maxHeight = "";
      sidebar.style.overflow = "";

      placeholder.style.minHeight = "";
      placeholder.style.width = "";
    }

    function updateSidebarPosition() {
      if (mediaQuery.matches) {
        clearFixedPosition();
        return;
      }
      applyFixedPosition();
    }

    updateSidebarPosition();

    function handleResize() {
      updateSidebarPosition();
    }

    window.addEventListener("resize", handleResize);
    mediaQuery.addEventListener("change", handleResize);

    resizeObserver = new ResizeObserver(function () {
      updateSidebarPosition();
    });
    resizeObserver.observe(placeholder);

    placeholder.addEventListener("leftnav:destroy", function () {
      window.removeEventListener("resize", handleResize);
      mediaQuery.removeEventListener("change", handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      clearFixedPosition();
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
