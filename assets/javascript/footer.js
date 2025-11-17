// Load footer component into pages
(function () {
  var FOOTER_CACHE_KEY = "footer-component-v2";

  function insertFooter() {
    var placeholder = document.getElementById("footer-placeholder");
    if (!placeholder) return;

    // Check cache first
    var cached = sessionStorage.getItem(FOOTER_CACHE_KEY);

    if (cached) {
      placeholder.innerHTML = cached;
      requestAnimationFrame(function () {
        placeholder.classList.add("loaded");
      });
      document.dispatchEvent(new CustomEvent("footer:loaded"));
      return;
    }

    fetch("/html/components/footer.html")
      .then(function (r) {
        return r.text();
      })
      .then(function (html) {
        placeholder.innerHTML = html;
        sessionStorage.setItem(FOOTER_CACHE_KEY, html);

        // Fade in after content is ready
        requestAnimationFrame(function () {
          placeholder.classList.add("loaded");
        });

        // dispatch event
        document.dispatchEvent(new CustomEvent("footer:loaded"));
      })
      .catch(function (err) {
        console.error("Load footer failed:", err);
        placeholder.classList.add("loaded"); // Show anyway
      });
  }

  // run after DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", insertFooter);
  } else {
    insertFooter();
  }
})();
