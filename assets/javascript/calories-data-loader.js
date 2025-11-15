// calories-data-loader.js - Load dữ liệu calories theo user

(function () {
  // ===== HÀM LẤY THÔNG TIN USER HIỆN TẠI =====
  function getCurrentUser() {
    const userSession = sessionStorage.getItem("currentUser");
    if (!userSession) return null;
    return JSON.parse(userSession);
  }

  // ===== HÀM FETCH DỮ LIỆU CALORIES TỪ JSON =====
  async function fetchCaloriesData(userId) {
    try {
      const response = await fetch("/data/calories-data.json");
      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu calories");
      }
      const allCaloriesData = await response.json();
      const userData = allCaloriesData.find((data) => data.userId === userId);

      if (!userData) {
        console.warn(`Không tìm thấy dữ liệu calories cho userId: ${userId}`);
        return null;
      }

      return userData;
    } catch (error) {
      console.error("Lỗi khi load dữ liệu calories:", error);
      return null;
    }
  }

  // ===== CẬP NHẬT THÔNG TIN NGƯỜI DÙNG =====
  function displayUserInfo(data) {
    const { userInfo, fullname } = data;

    // Cập nhật avatar và tên
    const avatarName = document.querySelector(
      ".user-details .info-left p:first-child span"
    );
    if (avatarName) avatarName.textContent = fullname;

    // Cập nhật thông tin cơ bản
    const ageEl = document.querySelector(".info-left p:nth-child(1) span");
    const heightEl = document.querySelector(".info-left p:nth-child(2) span");
    const weightEl = document.querySelector(".info-center p:nth-child(1) span");
    const goalEl = document.querySelector(".info-right p span");

    if (ageEl) ageEl.textContent = userInfo.age;
    if (heightEl) heightEl.textContent = `${userInfo.height}cm`;
    if (weightEl) weightEl.textContent = `${userInfo.weight}kg`;
    if (goalEl) goalEl.textContent = userInfo.goal;

    // Cập nhật cường độ luyện tập
    const intensityText = document.getElementById("intensityText");
    if (intensityText) {
      intensityText.textContent = `mức ${userInfo.activityLevel} ▼`;
    }

    // Cập nhật chế độ ăn
    const dietSelect = document.querySelector(".diet-select");
    if (dietSelect) {
      dietSelect.value = userInfo.diet;
    }
  }

  // ===== CẬP NHẬT BIỂU ĐỒ TỔNG QUAN - PHIÊN BẢN ĐẦY ĐỦ =====
  function updateOverviewCalories(data) {
    const circleText = document.querySelector(
      ".overview-content .circle .inner-text p"
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

    // ✅ CẬP NHẬT CÁC CHỈ SỐ DINH DƯỠNG
    updateNutrientBars(data.dailyTarget, calculateCurrentIntake());
    updateDashboardNutrition(data.dailyTarget, calculateCurrentIntake());
  }

  // ✅ HÀM TÍNH TOÁN INTAKE HIỆN TẠI
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

  // ✅ CẬP NHẬT THANH TIẾN ĐỘ DINH DƯỠNG (OVERVIEW)
  function updateNutrientBars(target, current) {
    const nutrients = [
      {
        name: "carbs",
        selector: ".overview-content .nutrients .nutrient:nth-child(1)",
      },
      {
        name: "protein",
        selector: ".overview-content .nutrients .nutrient:nth-child(2)",
      },
      {
        name: "fat",
        selector: ".overview-content .nutrients .nutrient:nth-child(3)",
      },
      {
        name: "fiber",
        selector: ".overview-content .nutrients .nutrient:nth-child(4)",
      },
    ];

    nutrients.forEach((nutrient) => {
      const element = document.querySelector(nutrient.selector);
      if (!element) return;

      const currentValue = current[nutrient.name];
      const targetValue = target[nutrient.name];
      const percentage =
        targetValue > 0 ? Math.min((currentValue / targetValue) * 100, 100) : 0;

      const bar = element.querySelector(".bar");
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

  // ✅ CẬP NHẬT DASHBOARD NUTRITION (Phần dashboard bên dưới)
  function updateDashboardNutrition(target, current) {
    const dashboardNutrients = document.querySelectorAll(
      ".nutrition-box .nutrient"
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

      const bar = element.querySelector(".bar");
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

  // ✅ CẬP NHẬT CIRCLE PROGRESS
  function updateCircleProgress(current, target) {
    const circle = document.querySelector(".overview-content .circle");
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
    const bars = document.querySelectorAll(".calo-bars .bar .fill");
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

    displayFoodColumn(".food-column:nth-child(1) ul", recentFoods || []);
    displayFoodColumn(".food-column:nth-child(2) ul", favoriteFoods || []);
    displayFoodColumn(".food-column:nth-child(3) ul", myFoods || []);
  }

  // ===== HIỂN THỊ CỘT THỰC PHẨM =====
  function displayFoodColumn(selector, foods) {
    const container = document.querySelector(selector);
    if (!container) return;

    container.innerHTML = "";

    if (foods.length === 0) {
      container.innerHTML = '<li class="no-foods">Chưa có dữ liệu</li>';
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
    const heartClass = food.isFavorite
      ? "fas fa-heart favorite"
      : "far fa-heart";

    li.setAttribute("data-calories", food.calories);
    li.setAttribute("data-carbs", food.carbs || 0);
    li.setAttribute("data-protein", food.protein || 0);
    li.setAttribute("data-fat", food.fat || 0);
    li.setAttribute("data-fiber", food.fiber || 0);

    li.innerHTML = `
      <img src="${food.image}" alt="${food.name}" onerror="this.src='../assets/images/Calories/placeholder-food.png'">
      <div class="food-info">
        <p>${food.name}</p>
        <span>${food.weight}g, ${food.calories}kcal</span>
      </div>
      <i class="${heartClass}"></i>
      <button class="add-btn">+</button>
    `;

    return li;
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
    div.className = "meal-food-item";
    div.innerHTML = `
      <img src="${food.image}" alt="${food.name}" onerror="this.src='../assets/images/Calories/placeholder-food.png'">
      <div class="meal-food-info">
        <p class="meal-food-name">${food.name}</p>
        <span class="meal-food-details">${food.weight}g, ${food.calories}kcal</span>
      </div>
      <div class="meal-food-calories">${food.calories} cal</div>
      <button class="remove-food-btn" data-meal="${mealType}" data-index="${index}">×</button>
    `;
    return div;
  }

  // ===== HÀM KHỞI TẠO =====
  async function init() {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      return;
    }

    const caloriesData = await fetchCaloriesData(currentUser.id);

    if (!caloriesData) {
      console.warn("⚠️ Không có dữ liệu calories");
      return;
    }

    // Lưu data vào window
    window.currentCaloriesData = caloriesData;

    // Cập nhật tất cả các phần
    displayUserInfo(caloriesData);
    updateOverviewCalories(caloriesData);
    displayWeeklyData(caloriesData.weeklyData);
    displayFoodCategories(caloriesData);

    // Dispatch event để Calories.js biết
    window.dispatchEvent(new Event("caloriesDataLoaded"));
  }

  // ===== CHỜ DOM LOAD =====
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // ✅ EXPORT FUNCTIONS
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
