(function () {
  var placeholder = document.getElementById("header-placeholder");
  if (!placeholder) return;

  // Check if already loaded from cache
  var cached = sessionStorage.getItem("header-component");

  if (cached) {
    placeholder.innerHTML = cached;
    placeholder.classList.add("loaded");
    initHeaderInteractions();
    return;
  }

  fetch("/html/components/header.html")
    .then(function (response) {
      return response.text();
    })
    .then(function (html) {
      placeholder.innerHTML = html;
      sessionStorage.setItem("header-component", html);

      // Fade in after content is ready
      requestAnimationFrame(function () {
        placeholder.classList.add("loaded");
      });

      initHeaderInteractions();
    })
    .catch(function (error) {
      console.error("Không thể load header:", error);
      placeholder.classList.add("loaded"); // Show anyway to prevent indefinite hiding
    });

  function initHeaderInteractions() {
    var searchBtn = document.querySelector(
      "#header-placeholder .search-button"
    );
    var searchInput = document.querySelector("#header-placeholder .search-bar");

    if (searchBtn) searchBtn.type = "button";
    if (searchBtn && searchInput) {
      searchBtn.addEventListener("click", function (e) {
        e.preventDefault();
        searchInput.focus();
      });
    }
  }
})();
