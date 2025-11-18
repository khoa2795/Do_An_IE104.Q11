(function () {
  var STORAGE_KEY = "preferred-theme";

  function shouldEnableDark() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "dark") return true;
      if (saved === "light") return false;
    } catch (err) {
      // ignore access errors, fall back to media query
    }

    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }

  function applyTheme(enableDark) {
    var method = enableDark ? "add" : "remove";
    document.documentElement.classList[method]("dark-mode");

    if (document.body) {
      document.body.classList[method]("dark-mode");
    } else {
      document.addEventListener("DOMContentLoaded", function () {
        document.body && document.body.classList[method]("dark-mode");
      });
    }
  }

  applyTheme(shouldEnableDark());
})();
