(function () {
  let sharedProfilesPromise = null;

  function fetchSharedProfiles() {
    if (sharedProfilesPromise) return sharedProfilesPromise;

    let loader;
    if (window.DataCache && typeof window.DataCache.fetchJSON === "function") {
      loader = window.DataCache.fetchJSON("/data/user-profiles.json", {
        cacheKey: "user-profiles",
        ttl: 1000 * 60 * 5,
      });
    } else {
      loader = fetch("/data/user-profiles.json").then((response) => {
        if (!response.ok) {
          throw new Error("Không thể tải user profiles");
        }
        return response.json();
      });
    }

    sharedProfilesPromise = loader
      .then((data) => (Array.isArray(data) ? data : []))
      .catch((error) => {
        console.warn("Không thể tải user profiles:", error);
        return [];
      });

    return sharedProfilesPromise;
  }

  function findSharedProfileEntry(userData, profiles) {
    if (!userData || !Array.isArray(profiles)) return null;
    const byId = profiles.find((profile) => profile.userId === userData.userId);
    if (byId) return byId;
    if (!userData.username) return null;
    const normalized = userData.username.toLowerCase();
    return (
      profiles.find(
        (profile) =>
          profile.username && profile.username.toLowerCase() === normalized
      ) || null
    );
  }

  function enrichCaloriesProfile(userData, profiles) {
    if (!userData) return null;
    const profile = findSharedProfileEntry(userData, profiles);
    const baseInfo =
      profile && profile.personalInfo ? profile.personalInfo : {};
    const inlineInfo = userData.userInfo || {};
    const nutritionProfile = userData.nutritionProfile || {};

    const mergedUserInfo = {
      ...baseInfo,
      ...inlineInfo,
    };

    if (nutritionProfile.diet) {
      mergedUserInfo.diet = nutritionProfile.diet;
    }
    if (
      typeof nutritionProfile.activityLevel !== "undefined" &&
      nutritionProfile.activityLevel !== null
    ) {
      mergedUserInfo.activityLevel = nutritionProfile.activityLevel;
    }
    if (nutritionProfile.goal) {
      mergedUserInfo.goal = nutritionProfile.goal;
    }

    if (!mergedUserInfo.diet && baseInfo.diet) {
      mergedUserInfo.diet = baseInfo.diet;
    }

    userData.userInfo = mergedUserInfo;

    if (!userData.fullname && profile && profile.fullname) {
      userData.fullname = profile.fullname;
    }
    if (!userData.username && profile && profile.username) {
      userData.username = profile.username;
    }

    return userData;
  }

  function getCustomCaloriesProfiles() {
    try {
      const stored = localStorage.getItem("customCaloriesProfiles");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn("Không thể đọc customCaloriesProfiles", error);
      return [];
    }
  }

  function mergeCaloriesProfiles(seedProfiles, customProfiles) {
    const base = Array.isArray(seedProfiles) ? [...seedProfiles] : [];
    if (!Array.isArray(customProfiles) || customProfiles.length === 0) {
      return base;
    }

    customProfiles.forEach((profile) => {
      if (!profile) return;
      const idx = base.findIndex((item) => {
        if (!item) return false;
        if (profile.userId && item.userId === profile.userId) return true;
        if (
          profile.username &&
          item.username &&
          profile.username.toLowerCase() === item.username.toLowerCase()
        ) {
          return true;
        }
        return false;
      });

      if (idx >= 0) {
        base[idx] = {
          ...base[idx],
          ...profile,
          userInfo: {
            ...(base[idx].userInfo || {}),
            ...(profile.userInfo || {}),
          },
          dailyTarget: {
            ...(base[idx].dailyTarget || {}),
            ...(profile.dailyTarget || {}),
          },
        };
      } else {
        base.push(profile);
      }
    });

    return base;
  }

  // ===== HÀM LẤY THÔNG TIN USER HIỆN TẠI =====
  function getCurrentUser() {
    const userSession = sessionStorage.getItem("currentUser");
    if (!userSession) return null;
    return JSON.parse(userSession);
  }

  // ===== HÀM FETCH DỮ LIỆU CALORIES TỪ JSON =====
  async function fetchCaloriesData(userId) {
    try {
      var loader;

      if (
        window.DataCache &&
        typeof window.DataCache.fetchJSON === "function"
      ) {
        loader = window.DataCache.fetchJSON("/data/calories-data.json", {
          cacheKey: "calories-data",
          ttl: 1000 * 60 * 5,
        });
      } else {
        loader = fetch("/data/calories-data.json").then(function (response) {
          if (!response.ok) {
            throw new Error("Không thể tải dữ liệu calories");
          }
          return response.json();
        });
      }

      const seedData = (await loader) || [];
      const customProfiles = getCustomCaloriesProfiles();
      const allCaloriesData = mergeCaloriesProfiles(seedData, customProfiles);
      const userData = allCaloriesData.find((data) => data.userId === userId);

      if (!userData) {
        console.warn(`Không tìm thấy dữ liệu calories cho userId: ${userId}`);
        return null;
      }

      const sharedProfiles = await fetchSharedProfiles();
      const enriched = enrichCaloriesProfile({ ...userData }, sharedProfiles);
      return enriched || userData;
    } catch (error) {
      console.error("Lỗi khi load dữ liệu calories:", error);
      return null;
    }
  }

  // ===== CẬP NHẬT THÔNG TIN NGƯỜI DÙNG =====
  function displayUserInfo(data) {
    const { userInfo, fullname } = data;
    const safeInfo = userInfo || {};
    const displayName = fullname || data.username || "Người dùng";

    const formatValue = (value, suffix = "") => {
      if (value === null || value === undefined || value === "") {
        return "--";
      }
      return suffix ? `${value}${suffix}` : `${value}`;
    };

    // Cập nhật thông tin cơ bản
    const updateField = (selector, value) => {
      const element = document.querySelector(selector);
      if (!element) return;
      element.textContent = value;
      element.classList.remove("loading-placeholder");
    };

    updateField(".calories__info-value--name", displayName);
    updateField(".calories__info-value--age", formatValue(safeInfo.age));
    updateField(
      ".calories__info-value--height",
      formatValue(safeInfo.height, "cm")
    );
    updateField(
      ".calories__info-value--weight",
      formatValue(safeInfo.weight, "kg")
    );
    updateField(
      ".calories__info-value--goal",
      safeInfo.goal || "Đang cập nhật"
    );

    // Cập nhật cường độ luyện tập
    const intensityText = document.getElementById("intensityText");
    if (intensityText) {
      const level = safeInfo.activityLevel || "--";
      intensityText.textContent = `mức ${level} ▼`;
    }

    // Cập nhật chế độ ăn
    const dietSelect = document.querySelector(".calories__diet-select");
    if (dietSelect) {
      dietSelect.value = safeInfo.diet || dietSelect.value;
    }
  }

  // ===== CẬP NHẬT BIỂU ĐỒ TỔNG QUAN - PHIÊN BẢN ĐẦY ĐỦ =====
  function updateOverviewCalories(data) {
    const circleText = document.querySelector(
      ".calories__overview-content .calories__circle .calories__circle-inner p"
    );

    if (circleText) {
      const currentIntake = calculateCurrentIntake();
      const target = data.dailyTarget;

      const totalCalories = currentIntake.calories;
      if (totalCalories > 0) {
        circleText.innerHTML = `${totalCalories}<br><span>/${target.calories} calo</span>`;
        updateCircleProgress(totalCalories, target.calories);
      } else {
        circleText.innerHTML = `0<br><span>/${target.calories} calo</span>`;
        updateCircleProgress(0, target.calories);
      }

      circleText.classList.remove("loading-placeholder");
    }

    // Cập nhật dashboard circle
    const dashboardCircleText = document.querySelector(
      ".calories__stats .calories__stats-circle-inner p"
    );
    if (dashboardCircleText) {
      const currentIntake = calculateCurrentIntake();
      const target = data.dailyTarget;
      const totalCalories = currentIntake.calories;

      dashboardCircleText.innerHTML = `${totalCalories}<br><span>/${target.calories} calo</span>`;
      dashboardCircleText.classList.remove("loading-placeholder");

      // Gọi hàm update dashboard circle
      if (typeof updateDashboardCircleProgress === "function") {
        updateDashboardCircleProgress(totalCalories, target.calories);
      }
    }

    // CẬP NHẬT CÁC CHỈ SỐ DINH DƯỠNG
    updateNutrientBars(data.dailyTarget, calculateCurrentIntake());
    updateDashboardNutrition(data.dailyTarget, calculateCurrentIntake());
  }

  //  HÀM TÍNH TOÁN INTAKE HIỆN TẠI
  function calculateCurrentIntake() {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    if (!currentUser)
      return { calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0 };

    const storageKey = `mealFoods_${currentUser.id}`;
    const saved = localStorage.getItem(storageKey);

    if (!saved) return { calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0 };

    try {
      const mealFoods = JSON.parse(saved);
      let totalIntake = {
        calories: 0,
        carbs: 0,
        protein: 0,
        fat: 0,
        fiber: 0,
      };

      Object.keys(mealFoods).forEach((mealType) => {
        mealFoods[mealType].forEach((food) => {
          totalIntake.calories += parseInt(food.calories || 0);
          totalIntake.carbs += parseInt(food.carbs || 0);
          totalIntake.protein += parseInt(food.protein || 0);
          totalIntake.fat += parseInt(food.fat || 0);
          totalIntake.fiber += parseInt(food.fiber || 0);
        });
      });

      return totalIntake;
    } catch (e) {
      console.error("Lỗi khi tính intake:", e);
      return { calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0 };
    }
  }

  //  CẬP NHẬT THANH TIẾN ĐỘ DINH DƯỠNG (OVERVIEW)
  function updateNutrientBars(target, current) {
    const nutrients = [
      {
        name: "carbs",
        selector:
          ".calories__overview-content .calories__nutrients .calories__nutrient:nth-child(1)",
      },
      {
        name: "protein",
        selector:
          ".calories__overview-content .calories__nutrients .calories__nutrient:nth-child(2)",
      },
      {
        name: "fat",
        selector:
          ".calories__overview-content .calories__nutrients .calories__nutrient:nth-child(3)",
      },
      {
        name: "fiber",
        selector:
          ".calories__overview-content .calories__nutrients .calories__nutrient:nth-child(4)",
      },
    ];

    nutrients.forEach((nutrient) => {
      const element = document.querySelector(nutrient.selector);
      if (!element) return;

      const currentValue = current[nutrient.name];
      const targetValue = target[nutrient.name];
      const percentage =
        targetValue > 0 ? Math.min((currentValue / targetValue) * 100, 100) : 0;

      const bar = element.querySelector(".calories__nutrient-bar");
      if (bar) {
        bar.style.width = `${percentage}%`;

        bar.classList.remove("low", "medium", "high", "over");
        if (percentage >= 100) {
          bar.classList.add("over");
        } else if (percentage >= 80) {
          bar.classList.add("high");
        } else if (percentage >= 50) {
          bar.classList.add("medium");
        } else {
          bar.classList.add("low");
        }
      }

      const text = element.querySelector("p");
      if (text) {
        text.textContent = `${currentValue} / ${targetValue} g`;
        text.classList.remove("loading-placeholder");
      }
    });
  }

  //  CẬP NHẬT DASHBOARD NUTRITION
  function updateDashboardNutrition(target, current) {
    const dashboardNutrients = document.querySelectorAll(
      ".calories__nutrition .calories__nutrient"
    );

    const nutrients = [
      { name: "carbs", index: 0 },
      { name: "protein", index: 1 },
      { name: "fat", index: 2 },
      { name: "fiber", index: 3 },
    ];

    nutrients.forEach((nutrient) => {
      const element = dashboardNutrients[nutrient.index];
      if (!element) return;

      const currentValue = current[nutrient.name];
      const targetValue = target[nutrient.name];
      const percentage =
        targetValue > 0 ? Math.min((currentValue / targetValue) * 100, 100) : 0;

      const bar = element.querySelector(".calories__nutrient-bar");
      if (bar) {
        bar.style.width = `${percentage}%`;
      }

      const text = element.querySelector("p");
      if (text) {
        text.textContent = `${currentValue} / ${targetValue} g`;
        text.classList.remove("loading-placeholder");
      }
    });
  }

  //  CẬP NHẬT CIRCLE PROGRESS
  function updateCircleProgress(current, target) {
    const circle = document.querySelector(
      ".calories__overview-content .calories__circle"
    );
    if (!circle) return;

    const percentage = Math.min((current / target) * 100, 100);

    let gradientColor;
    if (current === 0) {
      gradientColor = "#e0e0e0";
    } else if (percentage >= 100) {
      gradientColor = "#4CAF50";
    } else if (percentage >= 80) {
      gradientColor = "#FFA500";
    } else {
      gradientColor = "#FF6B6B";
    }

    circle.style.background = `conic-gradient(${gradientColor} ${percentage}%, #e0e0e0 ${percentage}%)`;
  }
  // ===== HIỂN THỊ WEEKLY DATA =====
  function displayWeeklyData(weeklyData) {
    const bars = document.querySelectorAll(
      ".calories__stats-bars .calories__stats-bar .calories__stats-bar-fill"
    );
    weeklyData.forEach((day, index) => {
      if (bars[index]) {
        const percentage = Math.min((day.calories / day.target) * 100, 100);
        bars[index].style.height = `${percentage}%`;

        if (day.status === "ok") {
          bars[index].style.background = "#4CAF50";
        } else if (day.status === "under") {
          bars[index].style.background = "#FFA500";
        } else if (day.status === "over") {
          bars[index].style.background = "#FF6B6B";
        } else {
          bars[index].style.background =
            "linear-gradient(180deg, #4CAF50, #2f8f46)";
        }
      }
    });
  }

  // ===== HIỂN THỊ FOOD CATEGORIES =====
  function displayFoodCategories(userData) {
    const { recentFoods, favoriteFoods, myFoods } = userData;

    displayFoodColumn(
      ".calories__food-column:nth-child(1) ul",
      recentFoods || []
    );
    displayFoodColumn(
      ".calories__food-column:nth-child(2) ul",
      favoriteFoods || []
    );
    displayFoodColumn(".calories__food-column:nth-child(3) ul", myFoods || []);
  }

  // ===== HIỂN THỊ CỘT THỰC PHẨM =====
  function displayFoodColumn(selector, foods) {
    const container = document.querySelector(selector);
    if (!container) return;

    container.innerHTML = "";

    if (foods.length === 0) {
      container.innerHTML =
        '<li class="calories__food-empty">Chưa có dữ liệu</li>';
      return;
    }

    foods.forEach((food) => {
      const li = createFoodItem(food);
      container.appendChild(li);
    });
  }

  // ===== TẠO PHẦN TỬ THỰC PHẨM =====
  function createFoodItem(food) {
    const li = document.createElement("li");

    // THÊM DATA ATTRIBUTES - ĐẢM BẢO CÓ ĐỦ
    li.setAttribute("data-id", food.id);
    li.setAttribute("data-calories", food.calories);
    li.setAttribute("data-carbs", food.carbs || 0);
    li.setAttribute("data-protein", food.protein || 0);
    li.setAttribute("data-fat", food.fat || 0);
    li.setAttribute("data-fiber", food.fiber || 0);
    li.setAttribute("data-weight", food.weight || 100);

    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    let isFavorite = false;

    if (currentUser) {
      const storageKey = `favoriteFoods_${currentUser.id}`;
      const favoriteFoods = JSON.parse(localStorage.getItem(storageKey)) || [];
      isFavorite = favoriteFoods.some((fav) => fav.id == food.id);
    }

    const heartClass = isFavorite ? "fas fa-heart favorite" : "far fa-heart";

    li.innerHTML = `
        <img src="${food.image}" alt="${food.name}" onerror="this.src='../assets/images/Calories/placeholder-food.png'">
        <div class="calories__food-info">
            <p>${food.name}</p>
            <span>${food.weight}g, ${food.calories}kcal</span>
        </div>
        <i class="${heartClass}"></i>
        <button class="calories__add-btn">+</button>
    `;

    return li;
  }

  // ===== HÀM KHỞI TẠO =====
  async function init() {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      return;
    }

    const caloriesData = await fetchCaloriesData(currentUser.id);

    if (!caloriesData) {
      console.warn("⚠️ Không có dữ liệu calories cho người dùng hiện tại");
      return;
    }

    // Lưu data vào window
    window.currentCaloriesData = caloriesData;

    // Cập nhật tất cả các phần
    displayUserInfo(caloriesData);
    updateOverviewCalories(caloriesData);
    displayWeeklyData(caloriesData.weeklyData);
    displayFoodCategories(caloriesData);

    // Đồng bộ tim SAU KHI đã hiển thị danh sách món ăn
    setTimeout(() => {
      window.syncFavoriteIcons();
      if (typeof updateFavoriteFoodsDisplay === "function") {
        updateFavoriteFoodsDisplay();
      }
    }, 500);
  }

  // ===== HIỂN THỊ DANH SÁCH MÓN ĂN THEO BUỔI =====
  function displayMealFoods(mealType, data) {
    const meals = data.meals[mealType] || [];
    const container = document.getElementById("mealFoodsContainer");

    if (!container) return;

    container.innerHTML = "";

    if (meals.length === 0) {
      container.innerHTML =
        '<p class="empty-meal-message">Chưa có món ăn nào. Hãy thêm món từ danh sách bên dưới!</p>';
      return;
    }

    meals.forEach((food, index) => {
      const foodElement = createMealFoodElement(food, index, mealType);
      container.appendChild(foodElement);
    });
  }

  // ===== TẠO PHẦN TỬ MÓN ĂN =====
  function createMealFoodElement(food, index, mealType) {
    const div = document.createElement("div");
    div.className = "calories__meal-food-item";
    div.innerHTML = `
      <img src="${food.image}" alt="${food.name}" onerror="this.src='../assets/images/Calories/placeholder-food.png'">
      <div class="calories__meal-food-info">
        <p class="calories__meal-food-name">${food.name}</p>
        <span class="calories__meal-food-details">${food.weight}g, ${food.calories}kcal</span>
      </div>
      <div class="calories__meal-food-calories">${food.calories} cal</div>
      <button class="calories__remove-food-btn" data-meal="${mealType}" data-index="${index}">×</button>
    `;
    return div;
  }

  // ===== CHỜ DOM LOAD =====
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  document.addEventListener("auth:state-changed", (event) => {
    if (event && event.detail && event.detail.status === "logged-in") {
      init();
    }
  });

  // EXPORT FUNCTIONS
  window.CaloriesDataLoader = {
    displayUserInfo,
    displayMealFoods,
    displayWeeklyData,
    displayFoodCategories,
    updateOverviewCalories,
    calculateCurrentIntake,
    updateNutrientBars,
    updateDashboardNutrition,
    updateCircleProgress,
  };
})();
