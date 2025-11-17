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
    var searchResults = document.querySelector(
      "#header-placeholder .search-results"
    );

    if (searchBtn) searchBtn.type = "button";

    // Initialize search functionality
    if (searchInput && searchResults) {
      initSearchFunction(searchInput, searchResults, searchBtn);
    }
  }

  // search function
  function initSearchFunction(searchInput, searchResults, searchBtn) {
    var allArticles = [];
    var searchTimeout = null;
    function removeVietnameseTones(str) {
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
    }

    // Load all articles from both news sources
    Promise.all([
      fetch("/data/news.json").then(function (r) {
        return r.json();
      }),
      fetch("/data/news-tabs.json").then(function (r) {
        return r.json();
      }),
    ])
      .then(function (results) {
        var newsArticles = results[0] || [];
        var tabsArticles = results[1] || [];

        // Normalize articles structure
        allArticles = newsArticles.concat(
          tabsArticles.map(function (article) {
            return {
              id: article.id,
              title: article.title,
              category: article.category,
              date: article.date,
              author: article.author,
              image: article.image,
              tags: article.tags || [],
            };
          })
        );
      })
      .catch(function (err) {
        console.error("Error loading articles:", err);
      });

    // Search on input
    searchInput.addEventListener("input", function (e) {
      clearTimeout(searchTimeout);
      var query = e.target.value.trim();

      if (query.length < 2) {
        searchResults.style.display = "none";
        return;
      }

      searchTimeout = setTimeout(function () {
        performSearch(query);
      }, 300);
    });

    // Search on button click
    if (searchBtn) {
      searchBtn.addEventListener("click", function (e) {
        e.preventDefault();
        var query = searchInput.value.trim();
        if (query.length >= 2) {
          performSearch(query);
        } else {
          searchInput.focus();
        }
      });
    }

    // Search on Enter key
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        var query = searchInput.value.trim();
        if (query.length >= 2) {
          performSearch(query);
        }
      }
    });

    // Close search results when clicking outside
    document.addEventListener("click", function (e) {
      if (
        !searchInput.contains(e.target) &&
        !searchResults.contains(e.target) &&
        !searchBtn.contains(e.target)
      ) {
        searchResults.style.display = "none";
      }
    });

    function performSearch(query) {
      var results = longestPrefixMatch(query, allArticles);
      displaySearchResults(results, query);
    }

    function getLongestCommonPrefix(query, title) {
      var minLen = Math.min(query.length, title.length);
      var prefix = "";

      for (var i = 0; i < minLen; i++) {
        if (query[i] === title[i]) {
          prefix += query[i];
        } else {
          break;
        }
      }

      return prefix;
    }

    function longestPrefixMatch(query, articles) {
      var queryLower = removeVietnameseTones(query.toLowerCase());
      var matches = [];

      articles.forEach(function (article) {
        var titleLower = removeVietnameseTones(article.title.toLowerCase());
        var prefixLength = 0;

        // Method 1: Check if query is substring of title
        if (titleLower.indexOf(queryLower) !== -1) {
          prefixLength = queryLower.length;
        }
        // Method 2: Check longest common prefix from start
        else {
          prefixLength = getLongestCommonPrefix(queryLower, titleLower).length;
        }

        // Method 3: Word-by-word prefix matching
        if (prefixLength === 0) {
          var queryWords = queryLower.split(/\s+/);
          var titleWords = titleLower.split(/\s+/);

          queryWords.forEach(function (qWord) {
            if (qWord.length < 2) return;
            titleWords.forEach(function (tWord) {
              // Check if query word is prefix of title word
              if (tWord.indexOf(qWord) === 0) {
                prefixLength = Math.max(prefixLength, qWord.length);
              }
              // Or query word is substring of title word
              else if (tWord.indexOf(qWord) !== -1) {
                prefixLength = Math.max(prefixLength, qWord.length);
              }
            });
          });
        }

        // Only include if prefix length >= 2
        if (prefixLength >= 2) {
          matches.push({
            article: article,
            prefixLength: prefixLength,
          });
        }
      });

      // Sort by prefix length (longest first)
      matches.sort(function (a, b) {
        return b.prefixLength - a.prefixLength;
      });

      // Return top 10 results
      return matches.slice(0, 10).map(function (m) {
        return m.article;
      });
    }

    function displaySearchResults(results, query) {
      if (results.length === 0) {
        searchResults.innerHTML =
          '<div class="search-no-results">Không tìm thấy kết quả cho "' +
          escapeHtml(query) +
          '"</div>';
        searchResults.style.display = "block";
        return;
      }

      var html =
        '<div class="search-results-header">Kết quả tìm kiếm (' +
        results.length +
        ")</div>";

      results.forEach(function (article) {
        var imageUrl = article.image || "/assets/images/icons/placeholder.png";
        var category = article.category || "Chưa phân loại";
        var date = article.date || "";

        html +=
          '<a href="/html/news-detail.html?id=' +
          article.id +
          '" class="search-result-item">' +
          '<img src="' +
          imageUrl +
          '" alt="' +
          escapeHtml(article.title) +
          '" class="search-result-image">' +
          '<div class="search-result-content">' +
          '<div class="search-result-title">' +
          highlightMatch(article.title, query) +
          "</div>" +
          '<div class="search-result-meta">' +
          '<span class="search-result-category">' +
          escapeHtml(category) +
          "</span>" +
          (date
            ? '<span class="search-result-date">' + escapeHtml(date) + "</span>"
            : "") +
          "</div>" +
          "</div>" +
          "</a>";
      });

      searchResults.innerHTML = html;
      searchResults.style.display = "block";
    }

    function highlightMatch(text, query) {
      var textNorm = removeVietnameseTones(text.toLowerCase());
      var queryNorm = removeVietnameseTones(query.toLowerCase());

      var index = textNorm.indexOf(queryNorm);
      if (index !== -1) {
        return (
          escapeHtml(text.substring(0, index)) +
          "<mark>" +
          escapeHtml(text.substring(index, index + query.length)) +
          "</mark>" +
          escapeHtml(text.substring(index + query.length))
        );
      }

      return escapeHtml(text);
    }

    function escapeHtml(text) {
      var div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }
  }
})();
