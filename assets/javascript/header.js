fetch("/html/components/header.html")
  .then(function (response) {
    return response.text();
  })
  .then(function (html) {
    document.getElementById("header-placeholder").innerHTML = html;

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
  })
  .catch(function (error) {
    console.error("Không thể load header:", error);
  });
