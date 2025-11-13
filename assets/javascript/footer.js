// Load footer component into pages
(function () {
  function insertFooter() {
    var placeholder = document.getElementById("footer-placeholder");
    if (!placeholder) return;

    fetch("/html/components/footer.html")
      .then(function (r) {
        return r.text();
      })
      .then(function (html) {
        placeholder.innerHTML = html;

        // dispatch event
        document.dispatchEvent(new CustomEvent("footer:loaded"));
      })
      .catch(function (err) {
        console.error("Load footer failed:", err);
      });
  }

  // run after DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", insertFooter);
  } else {
    insertFooter();
  }
})();
