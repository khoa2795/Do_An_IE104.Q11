// =====  QUẢN LÝ HỘP CHỌN CƯỜNG ĐỘ LUYỆN TẬP =====
document.addEventListener("DOMContentLoaded", () => {
  const text = document.getElementById("intensityText");
  const box = document.getElementById("intensityBox");
  const closeBtn = document.getElementById("closeBox");
  const saveBtn = document.getElementById("saveBox");
  const select = document.getElementById("activityLevel");
  const desc = document.getElementById("activityDesc");

  if (!text || !box || !closeBtn || !saveBtn || !select || !desc) {
    console.warn("Một số elements cường độ luyện tập không tồn tại");
    return;
  }

  text.addEventListener("click", () => {
    box.style.display = box.style.display === "none" ? "block" : "none";
  });

  select.addEventListener("change", () => {
    const level = select.value;
    const descriptions = {
      1: "• Nếu bạn ngồi nhiều, ít hoạt động chân tay, không tập thể dục",
      2: "• Bạn có đi bộ hoặc vận động nhẹ 1–3 lần/tuần",
      3: "• Bạn tập thể dục đều đặn 3–5 buổi/tuần",
      4: "• Bạn vận động nặng hoặc chơi thể thao mỗi ngày",
    };
    desc.textContent = descriptions[level];
  });

  closeBtn.addEventListener("click", () => (box.style.display = "none"));

  saveBtn.addEventListener("click", () => {
    const level = select.value;
    text.textContent = `mức ${level} ▼`;
    box.style.display = "none";
  });
});

// =====  QUẢN LÝ MÓN ĂN =====

//BIẾN GLOBAL - PHẢI Ở NGOÀI DOMContentLoaded
let currentMealType = null;
let mealFoods = { breakfast: [], lunch: [], dinner: [], snack: [] };

// LOAD DỮ LIỆU TỪ LOCALSTORAGE
function loadMealFoodsFromStorage() {
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  if (!currentUser) return { breakfast: [], lunch: [], dinner: [], snack: [] };

  const storageKey = `mealFoods_${currentUser.id}`;
  const saved = localStorage.getItem(storageKey);

  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Lỗi khi parse meal foods:", e);
      return { breakfast: [], lunch: [], dinner: [], snack: [] };
    }
  }

  return { breakfast: [], lunch: [], dinner: [], snack: [] };
}

// LƯU DỮ LIỆU VÀO LOCALSTORAGE 
function saveMealFoodsToStorage() {
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  if (!currentUser) return;

  const storageKey = `mealFoods_${currentUser.id}`;
  localStorage.setItem(storageKey, JSON.stringify(mealFoods));
}

// TRÍCH XUẤT CALORIES
function extractCalories(text) {
  const match = text.match(/(\d+)kcal/);
  return match ? match[1] : "0";
}

// LẤY TÊN BUỔI ĂN
function getMealName(mealType) {
  const names = {
    breakfast: "buổi sáng",
    lunch: "buổi trưa",
    dinner: "buổi tối",
    snack: "buổi phụ",
  };
  return names[mealType] || "bữa ăn";
}

// CẬP NHẬT BIỂU ĐỒ TRÒN
function updateCircleProgress(current, target) {
  const circle = document.querySelector(
    ".calories__overview-content .calories__circle"
  );
  if (!circle) return;

  const safeTarget = target > 0 ? target : 1;
  const percentage = Math.min((current / safeTarget) * 100, 100);

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

// CẬP NHẬT BIỂU ĐỒ TRÒN TRONG DASHBOARD
function updateDashboardCircleProgress(current, target) {
  const circle = document.querySelector(".calories__stats-circle");
  if (!circle) return;

  const safeTarget = target > 0 ? target : 1;
  const percentage = Math.min((current / safeTarget) * 100, 100);

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

// CẬP NHẬT DỮ LIỆU CALORIES
function updateCaloriesData() {
  let totalIntake = {
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0,
    fiber: 0,
  };

    const mealTypes = Object.keys(mealFoods);
    mealTypes.forEach((mealType) => {
    mealFoods[mealType].forEach((food) => {
      totalIntake.calories += parseInt(food.calories || 0);
      totalIntake.carbs += parseInt(food.carbs || 0);
      totalIntake.protein += parseInt(food.protein || 0);
      totalIntake.fat += parseInt(food.fat || 0);
      totalIntake.fiber += parseInt(food.fiber || 0);
    });
  });

  const mainCaloriesText = document.querySelector(
    ".calories__overview-content .calories__circle .calories__circle-inner p"
  );
  if (mainCaloriesText && window.currentCaloriesData) {
    const target = window.currentCaloriesData.dailyTarget;

    mainCaloriesText.innerHTML = `${totalIntake.calories}<br><span>/${target.calories} calo</span>`;
    mainCaloriesText.classList.remove("loading-placeholder");

    updateCircleProgress(totalIntake.calories, target.calories);

    updateDashboardCircleProgress(totalIntake.calories, target.calories);

    if (window.CaloriesDataLoader) {
      window.CaloriesDataLoader.updateNutrientBars(target, totalIntake);
      window.CaloriesDataLoader.updateDashboardNutrition(target, totalIntake);
    }
  }

  const dashboardCaloriesText = document.querySelector(
    ".calories__stats .calories__stats-circle-inner p"
  );
  if (dashboardCaloriesText && window.currentCaloriesData) {
    const target = window.currentCaloriesData.dailyTarget.calories;
    dashboardCaloriesText.innerHTML = `${totalIntake.calories}<br><span>/${target} calo</span>`;
    dashboardCaloriesText.classList.remove("loading-placeholder");
  }
}

// HIỂN THỊ THÔNG BÁO
function showSuccessMessage(message) {
  const toast = document.createElement("div");
  toast.style.cssText = `
    position: fixed; top: 20px; right: 20px; background: #2f8f46;
    color: white; padding: 12px 20px; border-radius: 8px; z-index: 1001;
    animation: slideIn 0.3s ease; font-weight: 500; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function showErrorMessage(message) {
  const toast = document.createElement("div");
  toast.style.cssText = `
    position: fixed; top: 20px; right: 20px; background: #e55b4d;
    color: white; padding: 12px 20px; border-radius: 8px; z-index: 1001;
    animation: slideIn 0.3s ease; font-weight: 500; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// HIỂN THỊ MÓN ĂN THEO BUỔI
document.addEventListener("DOMContentLoaded", () => {
  const mealTitle = document.getElementById("mealTitle");
  const currentMealName = document.getElementById("currentMealName");
  const foodSection = document.getElementById("foodSection");
  const backBtn = document.querySelector(
    ".calories__food-header .calories__back-btn"
  );
  const overviewSection = document.getElementById("overviewSection");
  const guideSection = document.getElementById("guideSection");
  const mealButtons = document.querySelectorAll(".calories__meal-btn");

  if (!mealTitle || !currentMealName || !foodSection) {
    console.warn("Một số meal elements không tồn tại");
    return;
  }

  mealFoods = loadMealFoodsFromStorage();

  foodSection.style.display = "none";
  mealTitle.style.display = "none";

  function showMealFoods(mealType) {
    currentMealType = mealType;

    const mealNames = {
      breakfast: "Buổi sáng",
      lunch: "Buổi trưa",
      dinner: "Buổi tối",
      snack: "Buổi phụ",
    };

    currentMealName.textContent = mealNames[mealType];
    mealTitle.style.display = "block";
    foodSection.style.display = "block";

    if (overviewSection) overviewSection.style.display = "none";
    if (guideSection) guideSection.style.display = "none";

    displayMealFoodsInContainer(mealType);
  }

  function displayMealFoodsInContainer(mealType) {
    let container = document.getElementById("mealFoodsContainer");

    if (!container) {
      container = document.createElement("div");
      container.id = "mealFoodsContainer";
      container.className = "calories__meal-foods";

      const insertPoint = mealTitle.nextElementSibling;
      if (insertPoint) {
        mealTitle.parentNode.insertBefore(container, insertPoint);
      } else {
        mealTitle.parentNode.appendChild(container);
      }
    }

    container.innerHTML = "";
    container.style.display = "block";

    const foods = mealFoods[mealType];

    if (foods.length === 0) {
      container.innerHTML = `
        <div class="calories__meal-empty">
          <p>Chưa có món ăn nào. Hãy thêm món từ danh sách bên dưới!</p>
        </div>
      `;
    } else {
      foods.forEach((foodData, index) => {
        const foodElement = createMealFoodElement(foodData, index, mealType);
        container.appendChild(foodElement);
      });

      const totalCalories = foods.reduce(
        (sum, food) => sum + parseInt(food.calories || 0),
        0
      );
      const totalDiv = document.createElement("div");
      totalDiv.className = "calories__meal-total";
      totalDiv.innerHTML = `<strong>Tổng: ${totalCalories} kcal</strong>`;
      container.appendChild(totalDiv);
    }
  }

  function createMealFoodElement(foodData, index, mealType) {
    const div = document.createElement("div");
    div.className = "calories__meal-food-item";
    div.innerHTML = `
      <img src="${foodData.image}" alt="${foodData.name}" onerror="this.src='../assets/images/Calories/placeholder-food.png'">
      <div class="calories__meal-food-info">
        <p class="calories__meal-food-name">${foodData.name}</p>
        <span class="calories__meal-food-details">${foodData.info}</span>
      </div>
      <div class="calories__meal-food-calories">${foodData.calories} cal</div>
      <button class="calories__remove-food-btn" data-index="${index}">×</button>
    `;

    const removeBtn = div.querySelector(".calories__remove-food-btn");
    removeBtn.addEventListener("click", function () {
      const removedFood = mealFoods[mealType][index];
      mealFoods[mealType].splice(index, 1);
      saveMealFoodsToStorage();
      displayMealFoodsInContainer(mealType);
      updateCaloriesData();
      showSuccessMessage(
        `Đã xóa "${removedFood.name}" khỏi ${getMealName(mealType)}!`
      );
    });

    return div;
  }

  mealButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const mealType = button.getAttribute("data-meal");
      mealButtons.forEach((btn) =>
        btn.classList.remove("calories__meal-btn--active")
      );
      button.classList.add("calories__meal-btn--active");
      showMealFoods(mealType);
    });
  });

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      foodSection.style.display = "none";
      mealTitle.style.display = "none";

      if (overviewSection) overviewSection.style.display = "block";
      if (guideSection) guideSection.style.display = "none";

      mealButtons.forEach((btn) =>
        btn.classList.remove("calories__meal-btn--active")
      );

      const container = document.getElementById("mealFoodsContainer");
      if (container) container.style.display = "none";
    });
  }

  document.addEventListener("click", function (e) {
    if (
      e.target.classList.contains("calories__add-btn") &&
      e.target.closest(".calories__food-column")
    ) {
      e.preventDefault();
      e.stopPropagation();

      if (!currentMealType) {
        showErrorMessage("Vui lòng chọn bữa ăn trước khi thêm món!");
        return;
      }

      const foodItem = e.target.closest("li");
      if (!foodItem) return;

      const foodData = {
        id: foodItem.dataset.id || Date.now(),
        name:
          foodItem.querySelector(".calories__food-info p")?.textContent ||
          "Món ăn",
        info:
          foodItem.querySelector(".calories__food-info span")?.textContent ||
          "100g, 0kcal",
        image:
          foodItem.querySelector("img")?.src ||
          "../assets/images/Calories/placeholder-food.png",
        calories: parseInt(
          foodItem.dataset.calories ||
            extractCalories(
              foodItem.querySelector(".calories__food-info span")
                ?.textContent || "0kcal"
            )
        ),
        carbs: parseInt(foodItem.dataset.carbs || 0),
        protein: parseInt(foodItem.dataset.protein || 0),
        fat: parseInt(foodItem.dataset.fat || 0),
        fiber: parseInt(foodItem.dataset.fiber || 0),
      };

      if (isFoodAlreadyInMeal(currentMealType, foodData.id)) {
        showErrorMessage(
          `"${foodData.name}" đã có trong ${getMealName(currentMealType)}!`
        );
        return;
      }

      mealFoods[currentMealType].push(foodData);
      saveMealFoodsToStorage();

      const container = document.getElementById("mealFoodsContainer");
      if (container) container.style.display = "block";
      mealTitle.style.display = "block";

      displayMealFoodsInContainer(currentMealType);
      updateCaloriesData();

      showSuccessMessage(
        `Đã thêm "${foodData.name}" vào ${getMealName(currentMealType)}!`
      );
    }
  });

  // KIỂM TRA MÓN ĂN ĐÃ TỒN TẠI TRONG BUỔI ĂN
  function isFoodAlreadyInMeal(mealType, foodId) {
    if (!mealFoods[mealType]) return false;

    return mealFoods[mealType].some(
      (food) =>
        food.id == foodId ||
        (food.name && food.name === getFoodNameById(foodId))
    );
  }

  // LẤY TÊN MÓN ĂN THEO ID
  function getFoodNameById(foodId) {
    // Tìm trong tất cả các cột
    const allFoodItems = document.querySelectorAll(".calories__food-column li");
    for (let item of allFoodItems) {
      if (item.dataset.id == foodId) {
        return item.querySelector(".calories__food-info p")?.textContent;
      }
    }
    return null;
  }

  const activeButton = document.querySelector(
    ".calories__meal-btn.calories__meal-btn--active"
  );
  if (activeButton) {
    const mealType = activeButton.getAttribute("data-meal");
    showMealFoods(mealType);
  }

  window.showMealFoods = showMealFoods;
});

// ===== QUẢN LÝ MÓN ĂN YÊU THÍCH  =====
document.addEventListener("DOMContentLoaded", function () {
  initializeFavoriteFoods();

  // Xử lý click vào icon tim
  document.addEventListener("click", function (e) {
    const heartIcon = e.target.closest(".fa-heart");
    if (heartIcon) {
      e.preventDefault();
      e.stopPropagation();

      const foodItem = heartIcon.closest("li");
      if (!foodItem) return;

      // Lấy thông tin món ăn từ data attributes
      const foodId = foodItem.dataset.id;
      const foodName = foodItem.querySelector(".calories__food-info p")?.textContent || "Món ăn";
      const foodImage = foodItem.querySelector("img")?.src || "../assets/images/Calories/placeholder-food.png";
      const weight = parseInt(foodItem.dataset.weight || 100);
      const calories = parseInt(foodItem.dataset.calories || 0);
      const carbs = parseInt(foodItem.dataset.carbs || 0);
      const protein = parseInt(foodItem.dataset.protein || 0);
      const fat = parseInt(foodItem.dataset.fat || 0);
      const fiber = parseInt(foodItem.dataset.fiber || 0);

      const isCurrentlyFavorite = heartIcon.classList.contains("fas");

      if (!isCurrentlyFavorite) {
        addToFavorites(foodId, foodName, foodImage, weight, calories, carbs, protein, fat, fiber);
      } else {
        removeFromFavorites(foodId);
      }
    }
  });
});

function initializeFavoriteFoods() {
  syncFavoriteIcons();
  updateFavoriteFoodsDisplay();
}

function syncFavoriteIcons() {
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  if (!currentUser) {
    console.warn("Không có currentUser trong sessionStorage");
    return;
  }

  // LẤY DỮ LIỆU TỪ WINDOW DATA)
  const userProfile = window.currentCaloriesData;
  if (!userProfile) {
    console.warn("Không có userProfile trong window");
    return;
  }

  // LẤY DANH SÁCH YÊU THÍCH
  const favoriteFoods = userProfile.favoriteFoods || [];
  const favoriteIds = favoriteFoods.map((food) => food.id.toString());

  document.querySelectorAll(".calories__food-column li").forEach((li) => {
    const foodId = li.dataset.id;
    const heartIcon = li.querySelector(".fa-heart");

    if (heartIcon && foodId) {
      if (favoriteIds.includes(foodId.toString())) {
        heartIcon.classList.remove("far");
        heartIcon.classList.add("fas", "favorite");
      } else {
        heartIcon.classList.remove("fas", "favorite");
        heartIcon.classList.add("far");
      }
    }
  });
}

function addToFavorites(foodId, foodName, foodImage, weight, calories, carbs, protein, fat, fiber) {
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  if (!currentUser) {
    return;
  }

  // LẤY DỮ LIỆU TỪ WINDOW 
  let userProfile = window.currentCaloriesData;
  if (!userProfile) {
    showErrorMessage("Không thể tải dữ liệu!");
    return;
  }

  // KHỞI TẠO DANH SÁCH YÊU THÍCH NẾU CHƯA CÓ
  if (!userProfile.favoriteFoods) {
    userProfile.favoriteFoods = [];
  }

  // KIỂM TRA ĐÃ CÓ TRONG YÊU THÍCH CHƯA
  const alreadyExists = userProfile.favoriteFoods.some(food => food.id == foodId);
  if (alreadyExists) {
    return;
  }

  // THÊM VÀO YÊU THÍCH
  userProfile.favoriteFoods.push({
    id: foodId,
    name: foodName,
    image: foodImage,
    weight: weight,
    calories: calories,
    carbs: carbs,
    protein: protein,
    fat: fat,
    fiber: fiber,
  });

  // ===== LƯU LẠI VÀO LOCALSTORAGE =====
  const customProfilesKey = "customCaloriesProfiles";
  let customProfiles = JSON.parse(localStorage.getItem(customProfilesKey)) || [];

  const profileIndex = customProfiles.findIndex(p => p.userId === currentUser.id);
  if (profileIndex >= 0) {
    customProfiles[profileIndex] = userProfile;
  } else {
    customProfiles.push(userProfile);
  }

  localStorage.setItem(customProfilesKey, JSON.stringify(customProfiles));

  // CẬP NHẬT WINDOW DATA
  window.currentCaloriesData = userProfile;

  // HIỂN THỊ THÔNG BÁO VÀ ĐỒNG BỘ
  showSuccessMessage(`Đã thêm "${foodName}" vào yêu thích! ♥`);
  syncFavoriteIcons();
  updateFavoriteFoodsDisplay();
}

function removeFromFavorites(foodId) {
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  if (!currentUser) {
    return;
  }

  // LẤY DỮ LIỆU TỪ WINDOW 
  let userProfile = window.currentCaloriesData;
  if (!userProfile) {
    showErrorMessage("Không thể tải dữ liệu!");
    return;
  }

  // TÌM THỰC PHẨM
  const foodToRemove = userProfile.favoriteFoods?.find(food => food.id == foodId);
  const foodName = foodToRemove?.name || "Món ăn";

  // XÓA KHỎI YÊU THÍCH
  if (userProfile.favoriteFoods) {
    userProfile.favoriteFoods = userProfile.favoriteFoods.filter(food => food.id != foodId);
  }

  // ===== LƯU LẠI VÀO LOCALSTORAGE =====
  const customProfilesKey = "customCaloriesProfiles";
  let customProfiles = JSON.parse(localStorage.getItem(customProfilesKey)) || [];

  const profileIndex = customProfiles.findIndex(p => p.userId === currentUser.id);
  if (profileIndex >= 0) {
    customProfiles[profileIndex] = userProfile;
  } else {
    customProfiles.push(userProfile);
  }

  localStorage.setItem(customProfilesKey, JSON.stringify(customProfiles));

  // CẬP NHẬT WINDOW DATA
  window.currentCaloriesData = userProfile;

  // HIỂN THỊ THÔNG BÁO VÀ ĐỒNG BỘ
  showSuccessMessage(`Đã xóa "${foodName}" khỏi yêu thích! ♡`);
  syncFavoriteIcons();
  updateFavoriteFoodsDisplay();
}

function toggleFavoriteFood(foodData) {
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  if (!currentUser) {
    return;
  }

  // LẤY DỮ LIỆU TỪ WINDOW 
  let userProfile = window.currentCaloriesData;
  if (!userProfile) {
    showErrorMessage("Không thể tải dữ liệu!");
    return;
  }

  // KHỞI TẠO DANH SÁCH YÊU THÍCH NẾU CHƯA CÓ
  if (!userProfile.favoriteFoods) {
    userProfile.favoriteFoods = [];
  }

  if (foodData.isFavorite) {
    // Thêm vào yêu thích
    const existingIndex = userProfile.favoriteFoods.findIndex(
      (food) => food.id == foodData.id
    );
    if (existingIndex === -1) {
      const foodToAdd = {
        id: foodData.id,
        name: foodData.name,
        image: foodData.image,
        weight: foodData.weight || 100,
        calories: foodData.calories || 0,
        carbs: foodData.carbs || 0,
        protein: foodData.protein || 0,
        fat: foodData.fat || 0,
        fiber: foodData.fiber || 0,
      };

      userProfile.favoriteFoods.push(foodToAdd);
      showSuccessMessage(`Đã thêm "${foodData.name}" vào món yêu thích! ♥`);
    }
  } else {
    // Xóa khỏi yêu thích
    userProfile.favoriteFoods = userProfile.favoriteFoods.filter(
      (food) => food.id != foodData.id
    );
    showSuccessMessage(`Đã xóa "${foodData.name}" khỏi món yêu thích! ♡`);
  }

  // LƯU LẠI VÀO LOCALSTORAGE 
  const customProfilesKey = "customCaloriesProfiles";
  let customProfiles = JSON.parse(localStorage.getItem(customProfilesKey)) || [];

  const profileIndex = customProfiles.findIndex(p => p.userId === currentUser.id);
  if (profileIndex >= 0) {
    customProfiles[profileIndex] = userProfile;
  } else {
    customProfiles.push(userProfile);
  }

  localStorage.setItem(customProfilesKey, JSON.stringify(customProfiles));

  // CẬP NHẬT WINDOW DATA
  window.currentCaloriesData = userProfile;

  syncFavoriteIcons();
  updateFavoriteFoodsDisplay();
}

// HIỂN THỊ MÓN YÊU THÍCH
function updateFavoriteFoodsDisplay() {
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  if (!currentUser) {
    return;
  }

  // LẤY DỮ LIỆU TỪ WINDOW DATA (ĐÃ MERGE TỪ JSON + CUSTOM)
  const userProfile = window.currentCaloriesData;
  if (!userProfile) {
    return;
  }

  const favoriteFoods = userProfile.favoriteFoods || [];

  const favoriteColumn = document.querySelector(
    ".calories__food-column:nth-child(2) ul"
  );
  if (!favoriteColumn) {
    console.warn("Không tìm thấy cột món yêu thích");
    return;
  }

  favoriteColumn.innerHTML = "";

  if (favoriteFoods.length === 0) {
    favoriteColumn.innerHTML =
      '<li class="calories__food-empty">Chưa có món yêu thích</li>';
    return;
  }

  favoriteFoods.forEach((food) => {
    const li = createFavoriteFoodItem(food);
    favoriteColumn.appendChild(li);
  });

  setTimeout(() => {
    syncFavoriteIcons();
  }, 100);
}

// TẠO PHẦN TỬ MÓN YÊU THÍCH
function createFavoriteFoodItem(food) {
  const li = document.createElement("li");

  // Thêm data attributes
  li.setAttribute("data-id", food.id);
  li.setAttribute("data-calories", food.calories);
  li.setAttribute("data-carbs", food.carbs || 0);
  li.setAttribute("data-protein", food.protein || 0);
  li.setAttribute("data-fat", food.fat || 0);
  li.setAttribute("data-fiber", food.fiber || 0);
  li.setAttribute("data-weight", food.weight || 100);

  li.innerHTML = `
      <img src="${food.image}" alt="${food.name}" onerror="this.src='../assets/images/Calories/placeholder-food.png'">
      <div class="calories__food-info">
        <p>${food.name}</p>
        <span>${food.weight}g, ${food.calories}kcal</span>
      </div>
      <i class="fas fa-heart favorite"></i>
      <button class="calories__add-btn">+</button>
    `;

  return li;
}


// Chuyển đổi dashboard và theo dõi
document.addEventListener("DOMContentLoaded", () => {
  const calendarIcon = document.querySelector(".calories__calendar-icon i");
  const dashboardSection = document.getElementById("dashboardSection");
  const followSection = document.getElementById("followSection");
  const backButton = document.querySelector(
    ".calories__follow-header .calories__follow-back"
  );

  if (!calendarIcon || !dashboardSection || !followSection || !backButton) {
    console.warn("Một số dashboard elements không tồn tại");
    return;
  }

  calendarIcon.addEventListener("click", () => {
    if (window.updateMonthCalendar && typeof window.updateMonthCalendar === "function") {
      try {
        window.updateMonthCalendar();
      } catch (e) {
        console.warn("updateMonthCalendar() failed:", e);
      }
    }

    const weekBar = document.querySelector(".calories__week");
    if (weekBar) weekBar.style.display = "none";

    displayFollowingData();
    dashboardSection.classList.add("hidden");
    followSection.classList.remove("section-hidden");
    followSection.style.display = "block";
    dashboardSection.style.display = "none";

    window.scrollTo({ top: followSection.offsetTop, behavior: "smooth" });
  });

  backButton.addEventListener("click", () => {
    followSection.classList.add("section-hidden");
    followSection.style.display = "none";
    dashboardSection.style.display = "grid";
    dashboardSection.classList.remove("hidden");

    const weekBar = document.querySelector(".calories__week");
    if (weekBar) weekBar.style.display = "flex";

    window.scrollTo({ top: dashboardSection.offsetTop, behavior: "smooth" });
  });
});

// Chuyển đổi danh sách và hướng dẫn
document.addEventListener("DOMContentLoaded", () => {
  const foodSection = document.getElementById("foodSection");
  const guideSection = document.getElementById("guideSection");
  const backBtn = document.querySelector(
    "#guideSection .calories__food-header .calories__back-btn"
  );
  const helpBtn = document.querySelector(
    "#foodSection .calories__food-tools .fa-question-circle"
  );

  if (!foodSection || !guideSection) {
    console.warn("⚠️ Food/Guide sections không tồn tại");
    return;
  }

  if (helpBtn) {
    helpBtn.addEventListener("click", () => {
      foodSection.classList.add("section-hidden");
      guideSection.classList.remove("section-hidden");
      foodSection.style.display = "none";
      guideSection.style.display = "block";
      window.scrollTo({ top: guideSection.offsetTop, behavior: "smooth" });

      const input = document.querySelector(
        "#guideSection .calories__food-header input"
      );
      if (input) input.placeholder = "Tìm kiếm trong hướng dẫn...";
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      guideSection.classList.add("section-hidden");
      guideSection.style.display = "none";
      foodSection.classList.remove("section-hidden");
      foodSection.style.display = "block";
      window.scrollTo({ top: foodSection.offsetTop, behavior: "smooth" });

      const input = document.querySelector(
        "#foodSection .calories__food-header input"
      );
      if (input) input.placeholder = "Tìm kiếm món ăn...";
    });
  }
});

// Modal thêm thực phẩm
document.addEventListener("DOMContentLoaded", function () {
  const addFoodBtn = document.querySelector(".calories__add-food");
  const foodModal = document.getElementById("foodModal");
  if (!addFoodBtn || !foodModal) {
    console.warn("⚠️ Add food elements không tồn tại");
    return;
  }

  const closeModalBtn = foodModal.querySelector(".modal__close");
  const cancelBtn = foodModal.querySelector(".modal__btn--cancel");
  const saveBtn = foodModal.querySelector(".modal__btn--save");

  addFoodBtn.addEventListener("click", function () {
    foodModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  });

  function closeModal() {
    foodModal.style.display = "none";
    document.body.style.overflow = "auto";
    clearForm();
  }

  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  foodModal.addEventListener("click", function (e) {
    if (e.target === foodModal) closeModal();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && foodModal.style.display === "flex") {
      closeModal();
    }
  });

  // XỬ LÝ UPLOAD VÀ PREVIEW HÌNH ẢNH THỰC PHẨM
  const imageInput = document.getElementById("foodImage");
  const imagePreview = document.getElementById("imagePreview");
  const imagePathInput = document.getElementById("foodImagePath");

  if (imagePreview) {
    imagePreview.addEventListener("click", function () {
      imageInput.click();
    });
  }

  if (imageInput) {
    imageInput.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
          const imageSrc = event.target.result;
          imagePathInput.value = imageSrc;
          
          // HIỂN THỊ PREVIEW
          imagePreview.innerHTML = `
            <img src="${imageSrc}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">
          `;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      // LẤY DỮ LIỆU TỪ FORM 
      const foodName = document.getElementById("foodName").value.trim();
      const foodImage = document.getElementById("foodImagePath").value || "../assets/images/Calories/placeholder-food.png";
      const foodCalories = parseInt(document.getElementById("foodCalories").value) || 0;
      const foodCarbs = parseInt(document.getElementById("foodCarbs").value) || 0;
      const foodProtein = parseInt(document.getElementById("foodProtein").value) || 0;
      const foodFat = parseInt(document.getElementById("foodFat").value) || 0;
      const foodFiber = parseInt(document.getElementById("foodFiber").value) || 0;
      const foodCategory = document.getElementById("foodCategory").value;
      const foodWeight = parseInt(document.getElementById("foodWeight").value) || 100;

      // KIỂM TRA DỮ LIỆU
      if (!foodName) {
        showErrorMessage("Vui lòng nhập tên thực phẩm!");
        return;
      }

      // TẠO OBJECT THỰC PHẨM MỚI
      const newFood = {
        id: Date.now().toString(),
        name: foodName,
        image: foodImage || "../assets/images/Calories/placeholder-food.png",
        weight: foodWeight,
        calories: foodCalories,
        carbs: foodCarbs,
        protein: foodProtein,
        fat: foodFat,
        fiber: foodFiber,
      };

      // LƯU VÀO LOCALSTORAGE THEO DANH MỤC
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
      if (!currentUser) {
        showErrorMessage("Bạn cần đăng nhập để thêm thực phẩm!");
        return;
      }

      // CHUYỂN ĐỔI DANH MỤC 
      const categoryMap = {
        recent: "recentFoods",
        favorite: "favoriteFoods",
        myfoods: "myFoods",
      };

      const categoryKey = categoryMap[foodCategory] || "myFoods";

      // LẤY DỮ LIỆU CALORIES TỪ WINDOW 
      let userProfile = window.currentCaloriesData ? JSON.parse(JSON.stringify(window.currentCaloriesData)) : null;

      if (!userProfile) {
        showErrorMessage("Không thể tải dữ liệu người dùng!");
        return;
      }

      // KHỞI TẠO DANH MỤC NẾU CHƯA CÓ
      if (!userProfile[categoryKey]) {
        userProfile[categoryKey] = [];
      }

      // KIỂM TRA THỰC PHẨM TRÙNG
      const isDuplicate = userProfile[categoryKey].some(food => food.name.toLowerCase() === foodName.toLowerCase());
      if (isDuplicate) {
        showErrorMessage(`"${foodName}" đã tồn tại trong danh sách!`);
        return;
      }

      // THÊM THỰC PHẨM MỚI
      userProfile[categoryKey].push(newFood);

      // Lưu toàn bộ profile vào customCaloriesProfiles
      const customProfilesKey = "customCaloriesProfiles";
      let customProfiles = JSON.parse(localStorage.getItem(customProfilesKey)) || [];

      // TÌM VÀ CẬP NHẬT PROFILE CỦA NGƯỜI DÙNG
      const profileIndex = customProfiles.findIndex(p => p.userId === currentUser.id);
      if (profileIndex >= 0) {
        customProfiles[profileIndex] = userProfile;
      } else {
        customProfiles.push(userProfile);
      }

      localStorage.setItem(customProfilesKey, JSON.stringify(customProfiles));

      // CẬP NHẬT WINDOW DATA 
      window.currentCaloriesData = userProfile;

      // CẬP NHẬT DANH SÁCH THỰC PHẨM TRÊN GIAO DIỆN
      const columnMap = {
        recent: ".calories__food-column:nth-child(1) ul",
        favorite: ".calories__food-column:nth-child(2) ul",
        myfoods: ".calories__food-column:nth-child(3) ul",
      };

      const columnSelector = columnMap[foodCategory];
      const column = document.querySelector(columnSelector);

      if (column) {
        // XÓA THÔNG BÁO "CHƯA CÓ DỮ LIỆU" NẾU CÓ
        const emptyMsg = column.querySelector(".calories__food-empty");
        if (emptyMsg) {
          emptyMsg.remove();
        }

        // TẠO PHẦN TỬ THỰC PHẨM MỚI
        const li = document.createElement("li");
        li.setAttribute("data-id", newFood.id);
        li.setAttribute("data-calories", newFood.calories);
        li.setAttribute("data-carbs", newFood.carbs);
        li.setAttribute("data-protein", newFood.protein);
        li.setAttribute("data-fat", newFood.fat);
        li.setAttribute("data-fiber", newFood.fiber);
        li.setAttribute("data-weight", newFood.weight);

        li.innerHTML = `
          <img src="${newFood.image}" alt="${newFood.name}" onerror="this.src='../assets/images/Calories/placeholder-food.png'">
          <div class="calories__food-info">
            <p>${newFood.name}</p>
            <span>${newFood.weight}g, ${newFood.calories}kcal</span>
          </div>
          <i class="far fa-heart"></i>
          <button class="calories__add-btn">+</button>
        `;

        column.appendChild(li);

        // GẮN SỰ KIỆN CHO NÚT THÊM
        const addBtn = li.querySelector(".calories__add-btn");
        if (addBtn) {
          addBtn.addEventListener("click", function () {
            if (!currentMealType) {
              showErrorMessage("Vui lòng chọn một buổi ăn trước!");
              return;
            }

            const foodId = li.getAttribute("data-id");
            const foodName = li.querySelector(".calories__food-info p").textContent;
            const foodImage = li.querySelector("img").src;
            const foodWeight = parseInt(li.getAttribute("data-weight")) || 100;
            const foodCalories = parseInt(li.getAttribute("data-calories")) || 0;
            const foodCarbs = parseInt(li.getAttribute("data-carbs")) || 0;
            const foodProtein = parseInt(li.getAttribute("data-protein")) || 0;
            const foodFat = parseInt(li.getAttribute("data-fat")) || 0;
            const foodFiber = parseInt(li.getAttribute("data-fiber")) || 0;

            // Kiểm tra món ăn đã tồn tại
            if (isFoodAlreadyInMeal(currentMealType, foodId)) {
              showErrorMessage(`"${foodName}" đã có trong buổi ${getMealName(currentMealType)}!`);
              return;
            }

            // Thêm vào mealFoods và lưu
            mealFoods[currentMealType].push({
              id: foodId,
              name: foodName,
              image: foodImage,
              weight: foodWeight,
              calories: foodCalories,
              carbs: foodCarbs,
              protein: foodProtein,
              fat: foodFat,
              fiber: foodFiber,
            });

            saveMealFoodsToStorage();
            displayMealFoodsInContainer(currentMealType);
            updateCaloriesData();
            showSuccessMessage(`Đã thêm "${foodName}" vào buổi ${getMealName(currentMealType)}!`);
          });
        }

        // ĐỒNG BỘ BIỂU TƯỢNG TIM VỚI THỰC PHẨM MỚI
        setTimeout(() => {
          syncFavoriteIcons();
        }, 100);
      }

      // HIỂN THỊ THÔNG BÁO THÀNH CÔNG
      showSuccessMessage(`Đã thêm "${foodName}" vào danh sách!`);

      // ĐÓNG MODAL VÀ CLEAR FORM
      closeModal();
    });
  }

  function clearForm() {
    document.getElementById("foodName").value = "";
    document.getElementById("foodImage").value = "";
    document.getElementById("foodImagePath").value = "";
    document.getElementById("foodCalories").value = "0";
    document.getElementById("foodWeight").value = "100";
    document.getElementById("foodCarbs").value = "0";
    document.getElementById("foodProtein").value = "0";
    document.getElementById("foodFat").value = "0";
    document.getElementById("foodFiber").value = "0";
    document.getElementById("foodCategory").value = "myfoods";
    
    // RESET PREVIEW ẢNH
    document.getElementById("imagePreview").innerHTML = `
      <div style="text-align: center;">
        <i class="fas fa-image" style="font-size: 32px; color: #ccc; margin-bottom: 8px; display: block;"></i>
        <p style="margin: 0; color: #999; font-size: 14px;">Click để chọn ảnh</p>
      </div>
    `;
  }
});

// Hiển thị lịch theo thời gian thực
document.addEventListener("DOMContentLoaded", function () {
  // Lịch tuần
  function updateWeekCalendar() {
    const now = new Date();
    const currentDay = now.getDay(); // 0: Chủ nhật, 1: Thứ 2, ...
    const weekDays = document.querySelectorAll(".calories__week-days span");

    // Lấy ngày đầu tuần
    const startOfWeek = new Date(now);
    startOfWeek.setDate(
      now.getDate() - (currentDay === 0 ? 6 : currentDay - 1)
    );

    // Cập nhật tháng và tuần
    const monthNames = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];

    document.querySelector(".calories__week-month").textContent =
      monthNames[now.getMonth()];
    document.querySelector(".calories__week-label").textContent = "Tuần này";

    // Cập nhật các ngày trong tuần
    weekDays.forEach((span, index) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + index);

      const dayNumber = day.getDate();

      if (index === 6) {
        // Chủ nhật là ngày cuối tuần (index = 6)
        span.innerHTML = `CN<br>${dayNumber}`;
      } else {
        span.innerHTML = `T${index + 2}<br>${dayNumber}`; // T2 đến T7
      }

      // Highlight ngày hiện tại
      if (day.toDateString() === now.toDateString()) {
        span.classList.add("calories__week-day--active");
      } else {
        span.classList.remove("calories__week-day--active");
      }
    });
  }

  // Lịch tháng
  function updateMonthCalendar() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentDate = now.getDate();

    // Cập nhật tiêu đề tháng
    const monthNames = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];

    document.querySelector(
      ".calories__calendar-top span"
    ).textContent = `${monthNames[currentMonth]} ${currentYear}`;

    // Tạo lịch tháng
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const calendarBody = document.querySelector(
      ".calories__calendar-table tbody"
    );
    calendarBody.innerHTML = "";

    let date = 1;
    let rows = "";

    for (let i = 0; i < 6; i++) {
      let cells = "";

      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < startingDay) {
          cells += "<td></td>";
        } else if (date > daysInMonth) {
          cells += "<td></td>";
        } else {
          const isToday = date === currentDate;
          const cellClass = isToday ? "dot-green" : "";
          cells += `<td class="${cellClass}">${date}</td>`;
          date++;
        }
      }

      rows += `<tr>${cells}</tr>`;
      if (date > daysInMonth) break;
    }

    calendarBody.innerHTML = rows;
  }

  // Xử lý nút chuyển tháng
  function setupCalendarNavigation() {
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    document
      .querySelector(".calories__calendar-arrow .fa-chevron-left")
      .addEventListener("click", function () {
        currentMonth--;
        if (currentMonth < 0) {
          currentMonth = 11;
          currentYear--;
        }
        updateMonthCalendarWithParams(currentMonth, currentYear);
      });

    document
      .querySelector(".calories__calendar-arrow .fa-chevron-right")
      .addEventListener("click", function () {
        currentMonth++;
        if (currentMonth > 11) {
          currentMonth = 0;
          currentYear++;
        }
        updateMonthCalendarWithParams(currentMonth, currentYear);
      });
  }

  function updateMonthCalendarWithParams(month, year) {
    const monthNames = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];

    document.querySelector(
      ".calories__calendar-top span"
    ).textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const calendarBody = document.querySelector(
      ".calories__calendar-table tbody"
    );
    calendarBody.innerHTML = "";

    let date = 1;
    let rows = "";
    const now = new Date();
    const currentDate = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    for (let i = 0; i < 6; i++) {
      let cells = "";

      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < startingDay) {
          cells += "<td></td>";
        } else if (date > daysInMonth) {
          cells += "<td></td>";
        } else {
          const isToday =
            date === currentDate &&
            month === currentMonth &&
            year === currentYear;
          const cellClass = isToday ? "dot-green" : "";
          cells += `<td class="${cellClass}">${date}</td>`;
          date++;
        }
      }

      rows += `<tr>${cells}</tr>`;
      if (date > daysInMonth) break;
    }

    calendarBody.innerHTML = rows;
  }

  // Xử lý nút chuyển tuần
  function setupWeekNavigation() {
    let currentWeekOffset = 0;

    document
      .querySelector(".calories__week-arrows span:first-child")
      .addEventListener("click", function () {
        currentWeekOffset--;
        updateWeekCalendarWithOffset(currentWeekOffset);
      });

    document
      .querySelector(".calories__week-arrows span:last-child")
      .addEventListener("click", function () {
        currentWeekOffset++;
        updateWeekCalendarWithOffset(currentWeekOffset);
      });
  }

  function updateWeekCalendarWithOffset(weekOffset) {
    const now = new Date();
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + weekOffset * 7);

    const currentDay = targetDate.getDay();
    const weekDays = document.querySelectorAll(".calories__week-days span");

    const startOfWeek = new Date(targetDate);
    startOfWeek.setDate(
      targetDate.getDate() - (currentDay === 0 ? 6 : currentDay - 1)
    );

    const monthNames = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];

    document.querySelector(".calories__week-month").textContent =
      monthNames[targetDate.getMonth()];
    document.querySelector(".calories__week-label").textContent =
      weekOffset === 0
        ? "Tuần này"
        : weekOffset === -1
        ? "Tuần trước"
        : weekOffset === 1
        ? "Tuần sau"
        : `Tuần ${weekOffset > 0 ? "+" : ""}${weekOffset}`;

    weekDays.forEach((span, index) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + index);

      const dayNumber = day.getDate();

      if (index === 6) {
        // Chủ nhật
        span.innerHTML = `CN<br>${dayNumber}`;
      } else {
        span.innerHTML = `T${index + 2}<br>${dayNumber}`; // T2 đến T7
      }

      const now = new Date();
      if (day.toDateString() === now.toDateString() && weekOffset === 0) {
        span.classList.add("calories__week-day--active");
      } else {
        span.classList.remove("calories__week-day--active");
      }
    });
  }

  // Khởi tạo
  updateWeekCalendar();
  updateMonthCalendar();
  setupCalendarNavigation();
  setupWeekNavigation();

  // Cập nhật mỗi ngày
  setInterval(function () {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      updateWeekCalendar();
      updateMonthCalendar();
    }
  }, 60000); // Kiểm tra mỗi phút

  try {
    if (typeof window !== "undefined") {
      window.updateMonthCalendar = updateMonthCalendar;
      window.updateMonthCalendarWithParams = updateMonthCalendarWithParams;
      window.updateWeekCalendar = updateWeekCalendar;
      window.updateWeekCalendarWithOffset = updateWeekCalendarWithOffset;
    }
  } catch (e) {
    console.warn("Không thể export calendar helpers:", e);
  }
});

// Quản lý modal chú thích chế độ ăn
document.addEventListener("DOMContentLoaded", function () {
  const helpBtn = document.querySelector(
    ".calories__diet .calories__diet-help"
  );
  const dietModal = document.getElementById("dietModal");

  const closeDietModal = dietModal.querySelector(".modal__close");

  // Mở modal khi nhấn vào dấu "?"
  helpBtn.addEventListener("click", function () {
    dietModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  });

  // Đóng modal
  function closeDietModalFunc() {
    dietModal.style.display = "none";
    document.body.style.overflow = "auto";
  }

  // Đóng bằng nút X
  if (closeDietModal) {
    closeDietModal.addEventListener("click", closeDietModalFunc);
  }

  // Đóng modal khi click ra ngoài
  dietModal.addEventListener("click", function (e) {
    if (e.target === dietModal) {
      closeDietModalFunc();
    }
  });
});

// Quản lý modal bộ lọc món ăn
document.addEventListener("DOMContentLoaded", function () {
  const filterBtn = document.querySelector(".calories__food-tools .fa-filter");
  const filterModal = document.getElementById("filterModal");

  const closeFilterModal = filterModal.querySelector(".modal__close");
  const btnReset = filterModal.querySelector(".modal__btn--reset");
  const btnApply = filterModal.querySelector(".modal__btn--apply");

  // Khởi tạo bộ lọc
  initRangeSliders();

  // Mở modal khi nhấn vào icon lọc
  filterBtn.addEventListener("click", function () {
    filterModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  });

  // Đóng modal
  function closeFilterModalFunc() {
    filterModal.style.display = "none";
    document.body.style.overflow = "auto";
  }

  // Đóng bằng nút X
  if (closeFilterModal) {
    closeFilterModal.addEventListener("click", closeFilterModalFunc);
  }

  // Đóng bằng nút Đặt lại
  if (btnReset) {
    btnReset.addEventListener("click", function () {
      resetFilters();
      closeFilterModalFunc();
    });
  }

  // Đóng bằng nút Áp dụng
  if (btnApply) {
    btnApply.addEventListener("click", function () {
      applyFilters();
      closeFilterModalFunc();
    });
  }

  // Khởi tạo thanh trượt với hiển thị giá trị đơn giản
  function initRangeSliders() {
    const sliders = document.querySelectorAll(".modal__range-slider");

    sliders.forEach((slider) => {
      const inputs = slider.querySelectorAll('input[type="range"]');
      const track = slider.querySelector(".modal__range-track");
      const valuesContainer = slider.querySelector(".modal__range-values");
      const max = parseInt(slider.dataset.max);
      const unit = slider.dataset.unit;

      // Tạo phần tử hiển thị giá trị nếu chưa có
      if (!valuesContainer.querySelector(".modal__range-value")) {
        valuesContainer.innerHTML = `
                        <div class="modal__range-value modal__range-value--min">0 ${unit}</div>
                        <div class="modal__range-value modal__range-value--max">0 ${unit}</div>
                    `;
      }

      const minValue = valuesContainer.querySelector(
        ".modal__range-value--min"
      );
      const maxValue = valuesContainer.querySelector(
        ".modal__range-value--max"
      );

      // Cập nhật vị trí thanh track và giá trị hiển thị
      function updateSlider() {
        const minVal = parseInt(inputs[0].value);
        const maxVal = parseInt(inputs[1].value);

        // Đảm bảo min không vượt quá max
        if (minVal > maxVal) {
          inputs[0].value = maxVal;
          inputs[1].value = minVal;
          updateSlider();
          return;
        }

        // Cập nhật thanh track
        const minPercent = (minVal / max) * 100;
        const maxPercent = (maxVal / max) * 100;
        track.style.left = `${minPercent}%`;
        track.style.width = `${maxPercent - minPercent}%`;

        // Cập nhật giá trị hiển thị
        minValue.textContent = `${minVal} ${unit}`;
        maxValue.textContent = `${maxVal} ${unit}`;
      }

      // Thêm sự kiện cho cả hai input
      inputs.forEach((input) => {
        input.addEventListener("input", updateSlider);
      });

      // Khởi tạo giá trị ban đầu
      updateSlider();
    });
  }

  // Reset bộ lọc về mặc định
  function resetFilters() {
    const sliders = document.querySelectorAll(".modal__range-slider");

    // Reset các thanh trượt
    sliders.forEach((slider) => {
      const inputs = slider.querySelectorAll('input[type="range"]');
      const max = parseInt(slider.dataset.max);

      // Đặt giá trị mặc định
      inputs[0].value = Math.floor(max * 0.1); // 10%
      inputs[1].value = Math.floor(max * 0.8); // 80%

      // Kích hoạt sự kiện cập nhật
      inputs[0].dispatchEvent(new Event("input"));
    });

    showSuccessMessage("Đã đặt lại bộ lọc!");
  }

  // Áp dụng bộ lọc
  function applyFilters() {
    const filterData = {};

    // Lấy giá trị từ các thanh trượt
    const sliders = document.querySelectorAll(".modal__range-slider");
    sliders.forEach((slider) => {
      const inputs = slider.querySelectorAll('input[type="range"]');
      const label = slider
        .closest(".modal__filter-item")
        .querySelector("label").textContent;

      // Xác định loại bộ lọc dựa trên nhãn
      let filterType;
      if (label.includes("Calories")) filterType = "calories";
      else if (label.includes("Tinh bột")) filterType = "carbs";
      else if (label.includes("Đạm")) filterType = "protein";
      else if (label.includes("Béo")) filterType = "fat";
      else if (label.includes("Xơ")) filterType = "fiber";

      if (filterType) {
        filterData[filterType] = {
          min: parseInt(inputs[0].value),
          max: parseInt(inputs[1].value),
        };
      }
    });

    filterFoodItems(filterData);
    showSuccessMessage("Đã áp dụng bộ lọc!");
  }

  // Lọc danh sách món ăn
  function filterFoodItems(filters) {
    const foodItems = document.querySelectorAll(".calories__food-column li");
    let visibleCount = 0;

    foodItems.forEach((item) => {
      // Lấy thông tin dinh dưỡng từ item
      const nutritionNode = item.querySelector(".calories__food-info span");
      if (!nutritionNode) {
        // Bỏ qua các phần tử placeholder hoặc không có thông tin dinh dưỡng
        item.style.display = "";
        return;
      }

      const nutritionText = nutritionNode.textContent;
      const caloriesMatch = nutritionText.match(/(\d+)kcal/);
      const weightMatch = nutritionText.match(/(\d+)g/);

      const itemCalories = caloriesMatch ? parseInt(caloriesMatch[1]) : 0;
      const itemWeight = weightMatch ? parseInt(weightMatch[1]) : 100;

      // Kiểm tra điều kiện lọc
      let showItem = true;

      // Lọc theo calories
      if (
        filters.calories &&
        (itemCalories < filters.calories.min ||
          itemCalories > filters.calories.max)
      ) {
        showItem = false;
      }
      // Lọc theo carbs
      if (showItem) {
        item.style.display = "flex";
        visibleCount++;
      } else {
        item.style.display = "none";
      }
    });
  }

  // Hiển thị thông báo
  function showSuccessMessage(message) {
    const toast = document.createElement("div");
    toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #2f8f46;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                z-index: 1001;
                animation: slideIn 0.3s ease;
                font-weight: 500;
            `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "slideOut 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
});

// Quản lý sự kiện cho các phần tử động
document.addEventListener("DOMContentLoaded", function () {

  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("calories__remove-food-btn")) {
      const foodItem = e.target.closest("li");
      if (foodItem) {
        // Xử lý xóa món ăn
        foodItem.remove();
        showSuccessMessage("Đã xóa món ăn khỏi danh sách!");
      }
    }
  });
});

// HIỂN THỊ DỮ LIỆU THEO DÕI (forwarder) 
function displayFollowingData() {
  if (window.CaloriesDataLoader && typeof window.CaloriesDataLoader.displayFollowingData === 'function') {
    try {
      window.CaloriesDataLoader.displayFollowingData();
    } catch (e) {
      console.warn('CaloriesDataLoader.displayFollowingData threw an error:', e);
    }
  } else {
    console.warn('CaloriesDataLoader.displayFollowingData is not available');
  }
}

// SAU KHI LOAD DATA - CẬP NHẬT CALORIES & BIỂU ĐỒ
window.addEventListener("caloriesDataLoaded", () => {
  if (!window.currentCaloriesData) return;

  try {
    updateCaloriesData();
  } catch (e) {
    console.warn("updateCaloriesData failed:", e);
  }

  try {
    syncFavoriteIcons();
  } catch (e) {
    console.warn("syncFavoriteIcons failed:", e);
  }

  try {
    if (typeof updateFavoriteFoodsDisplay === "function") {
      updateFavoriteFoodsDisplay();
    }
  } catch (e) {
    console.warn("updateFavoriteFoodsDisplay failed:", e);
  }

  try {
    displayFollowingData();
  } catch (e) {
    console.warn("displayFollowingData failed:", e);
  }

  // Vẽ lại biểu đồ với dữ liệu hiện tại
  try {
    const data = window.currentCaloriesData;
    const target = data.dailyTarget || {
      calories: 0,
      carbs: 0,
      protein: 0,
      fat: 0,
      fiber: 0,
    };

    let currentIntake = { calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0 };

    // Lấy intake từ localStorage
    if (window.CaloriesDataLoader && typeof window.CaloriesDataLoader.calculateCurrentIntake === "function") {
      currentIntake = window.CaloriesDataLoader.calculateCurrentIntake();
    }

    if (currentIntake.calories === 0 && data.todayIntake && data.todayIntake.calories > 0) {
      currentIntake = { ...data.todayIntake };
    }

    // Cập nhật vòng tròn
    const mainCircleP = document.querySelector(
      ".calories__overview-content .calories__circle .calories__circle-inner p"
    );
    if (mainCircleP) {
      mainCircleP.innerHTML = `${currentIntake.calories}<br><span>/${target.calories} calo</span>`;
    }

    const dashboardCircleP = document.querySelector(
      ".calories__stats .calories__stats-circle-inner p"
    );
    if (dashboardCircleP) {
      dashboardCircleP.innerHTML = `${currentIntake.calories}<br><span>/${target.calories} calo</span>`;
    }

    // Vẽ biểu đồ
    updateCircleProgress(currentIntake.calories, target.calories);
    updateDashboardCircleProgress(currentIntake.calories, target.calories);

    // Cập nhật thanh dinh dưỡng
    if (window.CaloriesDataLoader) {
      if (typeof window.CaloriesDataLoader.updateNutrientBars === "function") {
        window.CaloriesDataLoader.updateNutrientBars(target, currentIntake);
      }
      if (typeof window.CaloriesDataLoader.updateDashboardNutrition === "function") {
        window.CaloriesDataLoader.updateDashboardNutrition(target, currentIntake);
      }
    }
  } catch (e) {
    console.warn("Chart redraw after load failed:", e);
  }
});
