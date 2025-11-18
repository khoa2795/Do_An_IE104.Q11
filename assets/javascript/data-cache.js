(function (window) {
  "use strict";

  var CACHE_PREFIX = "vh-cache::";
  var DEFAULT_TTL = 1000 * 60 * 10; // 10 minutes
  var memoryCache = {};

  function now() {
    return Date.now();
  }

  function getStore() {
    try {
      var testKey = CACHE_PREFIX + "__test__";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    } catch (err) {
      return null;
    }
  }

  var storage = getStore();

  function saveCache(key, payload) {
    if (storage) {
      try {
        storage.setItem(key, JSON.stringify(payload));
        return;
      } catch (err) {
        // If quota exceeded, fall back to in-memory cache only
      }
    }
    memoryCache[key] = payload;
  }

  function readCache(key) {
    if (storage) {
      try {
        var raw = storage.getItem(key);
        if (raw) {
          return JSON.parse(raw);
        }
      } catch (err) {
        return null;
      }
    }
    return memoryCache[key] || null;
  }

  function fetchJSON(url, options) {
    options = options || {};
    var cacheKey = CACHE_PREFIX + (options.cacheKey || url);
    var ttl = typeof options.ttl === "number" ? options.ttl : DEFAULT_TTL;
    var cached = readCache(cacheKey);

    if (cached && now() - cached.timestamp < ttl) {
      return Promise.resolve(cached.data);
    }

    return fetch(url)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Request failed: " + response.status);
        }
        return response.json();
      })
      .then(function (json) {
        saveCache(cacheKey, {
          timestamp: now(),
          data: json,
        });
        return json;
      })
      .catch(function (error) {
        if (cached) {
          console.warn("Using cached data for", url, error);
          return cached.data;
        }
        throw error;
      });
  }

  function preloadImages(urls) {
    if (!Array.isArray(urls) || urls.length === 0) {
      return Promise.resolve();
    }

    var uniqueUrls = Array.from(
      new Set(
        urls.filter(function (src) {
          return typeof src === "string" && src.trim().length > 0;
        })
      )
    );

    if (!uniqueUrls.length) {
      return Promise.resolve();
    }

    return Promise.all(
      uniqueUrls.map(function (src) {
        return new Promise(function (resolve) {
          var img = new Image();
          img.loading = "lazy";
          img.onload = img.onerror = function () {
            resolve();
          };
          img.src = src;
        });
      })
    );
  }

  window.DataCache = {
    fetchJSON: fetchJSON,
    preloadImages: preloadImages,
    clear: function (key) {
      var targetKey = CACHE_PREFIX + key;
      if (storage) {
        storage.removeItem(targetKey);
      }
      delete memoryCache[targetKey];
    },
  };
})(window);
