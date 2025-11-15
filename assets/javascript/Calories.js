// ===== 1. QUẢN LÝ HỘP CHỌN CƯỜNG ĐỘ LUYỆN TẬP =====
document.addEventListener("DOMContentLoaded", () => {
  const text = document.getElementById("intensityText");
  const box = document.getElementById("intensityBox");
  const closeBtn = document.getElementById("closeBox");
  const saveBtn = document.getElementById("saveBox");
  const select = document.getElementById("activityLevel");
  const desc = document.getElementById("activityDesc");

  if (!text || !box || !closeBtn || !saveBtn || !select || !desc) {
    console.warn("⚠️ Một số elements cường độ luyện tập không tồn tại");
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

// ===== 2. QUẢN LÝ MÓN ĂN - GLOBAL VARIABLES & FUNCTIONS =====

// ✅ BIẾN GLOBAL - PHẢI Ở NGOÀI DOMContentLoaded
let currentMealType = null;
let mealFoods = { breakfast: [], lunch: [], dinner: [], snack: [] };

// ✅ LOAD DỮ LIỆU TỪ LOCALSTORAGE - GLOBAL FUNCTION
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

// ✅ LƯU DỮ LIỆU VÀO LOCALSTORAGE - GLOBAL FUNCTION
function saveMealFoodsToStorage() {
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  if (!currentUser) return;

  const storageKey = `mealFoods_${currentUser.id}`;
  localStorage.setItem(storageKey, JSON.stringify(mealFoods));
}

// ✅ TRÍCH XUẤT CALORIES - GLOBAL FUNCTION
function extractCalories(text) {
  const match = text.match(/(\d+)kcal/);
  return match ? match[1] : "0";
}

// ✅ LẤY TÊN BUỔI ĂN - GLOBAL FUNCTION
function getMealName(mealType) {
  const names = {
    breakfast: "buổi sáng",
    lunch: "buổi trưa",
    dinner: "buổi tối",
    snack: "buổi phụ",
  };
  return names[mealType] || "bữa ăn";
}

// ✅ CẬP NHẬT BIỂU ĐỒ TRÒN - GLOBAL FUNCTION
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

// ✅ CẬP NHẬT DỮ LIỆU CALORIES - GLOBAL FUNCTION (BẮT BUỘC)
function updateCaloriesData() {
  let totalIntake = {
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0,
    fiber: 0,
  };

  // ✅ BÂY GIỜ CÓ THỂ TRUY CẬP mealFoods
  Object.keys(mealFoods).forEach((mealType) => {
    mealFoods[mealType].forEach((food) => {
      totalIntake.calories += parseInt(food.calories || 0);
      totalIntake.carbs += parseInt(food.carbs || 0);
      totalIntake.protein += parseInt(food.protein || 0);
      totalIntake.fat += parseInt(food.fat || 0);
      totalIntake.fiber += parseInt(food.fiber || 0);
    });
  });

  const mainCaloriesText = document.querySelector(
    ".overview-content .circle .inner-text p"
  );
  if (mainCaloriesText && window.currentCaloriesData) {
    const target = window.currentCaloriesData.dailyTarget;

    mainCaloriesText.innerHTML = `${totalIntake.calories}<br><span>/${target.calories} calo</span>`;
    mainCaloriesText.classList.remove("loading-placeholder");

    updateCircleProgress(totalIntake.calories, target.calories);

    if (window.CaloriesDataLoader) {
      window.CaloriesDataLoader.updateNutrientBars(target, totalIntake);
      window.CaloriesDataLoader.updateDashboardNutrition(target, totalIntake);
    }
  }

  const dashboardCaloriesText = document.querySelector(
    ".calo-box .calo-inner p"
  );
  if (dashboardCaloriesText && window.currentCaloriesData) {
    const target = window.currentCaloriesData.dailyTarget.calories;
    dashboardCaloriesText.innerHTML = `${totalIntake.calories}<br><span>/${target} calo</span>`;
    dashboardCaloriesText.classList.remove("loading-placeholder");
  }
}

// ✅ HIỂN THỊ THÔNG BÁO - GLOBAL FUNCTIONS
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

// ===== DOM EVENT LISTENERS - CHỈ XỬ LÝ UI =====
document.addEventListener("DOMContentLoaded", () => {
  const mealTitle = document.getElementById("mealTitle");
  const currentMealName = document.getElementById("currentMealName");
  const foodSection = document.getElementById("foodSection");
  const backBtn = document.querySelector(".food-header .back-btn");
  const overviewSection = document.getElementById("overviewSection");
  const guideSection = document.getElementById("guideSection");
  const mealButtons = document.querySelectorAll(".meal-btn");

  if (!mealTitle || !currentMealName || !foodSection) {
    console.warn("⚠️ Một số meal elements không tồn tại");
    return;
  }

  // ✅ LOAD DỮ LIỆU KHI KHỞI TẠO - GÁN VÀO BIẾN GLOBAL
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
      container.className = "meal-foods-container";

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
        <div class="empty-meal-message">
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
      totalDiv.className = "meal-total-calories";
      totalDiv.innerHTML = `<strong>Tổng: ${totalCalories} kcal</strong>`;
      container.appendChild(totalDiv);
    }
  }

  function createMealFoodElement(foodData, index, mealType) {
    const div = document.createElement("div");
    div.className = "meal-food-item";
    div.innerHTML = `
      <img src="${foodData.image}" alt="${foodData.name}" onerror="this.src='../assets/images/Calories/placeholder-food.png'">
      <div class="meal-food-info">
        <p class="meal-food-name">${foodData.name}</p>
        <span class="meal-food-details">${foodData.info}</span>
      </div>
      <div class="meal-food-calories">${foodData.calories} cal</div>
      <button class="remove-food-btn" data-index="${index}">×</button>
    `;

    const removeBtn = div.querySelector(".remove-food-btn");
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
      mealButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      showMealFoods(mealType);
    });
  });

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      foodSection.style.display = "none";
      mealTitle.style.display = "none";

      if (overviewSection) overviewSection.style.display = "block";
      if (guideSection) guideSection.style.display = "block";

      mealButtons.forEach((btn) => btn.classList.remove("active"));

      const container = document.getElementById("mealFoodsContainer");
      if (container) container.style.display = "none";
    });
  }

  document.addEventListener("click", function (e) {
    if (
      e.target.classList.contains("add-btn") &&
      e.target.closest(".food-column")
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
        name: foodItem.querySelector(".food-info p")?.textContent || "Món ăn",
        info:
          foodItem.querySelector(".food-info span")?.textContent ||
          "100g, 0kcal",
        image:
          foodItem.querySelector("img")?.src ||
          "../assets/images/Calories/placeholder-food.png",
        calories: parseInt(
          foodItem.dataset.calories ||
            extractCalories(
              foodItem.querySelector(".food-info span")?.textContent || "0kcal"
            )
        ),
        carbs: parseInt(foodItem.dataset.carbs || 0),
        protein: parseInt(foodItem.dataset.protein || 0),
        fat: parseInt(foodItem.dataset.fat || 0),
        fiber: parseInt(foodItem.dataset.fiber || 0),
      };

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

  const activeButton = document.querySelector(".meal-btn.active");
  if (activeButton) {
    const mealType = activeButton.getAttribute("data-meal");
    showMealFoods(mealType);
  }

  window.showMealFoods = showMealFoods;
});

// ===== 3-5: CÁC PHẦN KHÁC GIỮ NGUYÊN 100% =====
// Chuyển đổi dashboard và theo dõi
document.addEventListener("DOMContentLoaded", () => {
  const calendarIcon = document.querySelector(".calendar-box i");
  const dashboardSection = document.getElementById("dashboardSection");
  const followSection = document.getElementById("followSection");
  const backButton = document.querySelector(".follow-header .back");

  if (!calendarIcon || !dashboardSection || !followSection || !backButton) {
    console.warn("⚠️ Một số dashboard elements không tồn tại");
    return;
  }

  calendarIcon.addEventListener("click", () => {
    dashboardSection.classList.add("hidden");
    setTimeout(() => {
      dashboardSection.style.display = "none";
      followSection.style.display = "block";
      followSection.classList.remove("hidden");
      window.scrollTo({ top: followSection.offsetTop, behavior: "smooth" });
    }, 300);
  });

  backButton.addEventListener("click", () => {
    followSection.classList.add("hidden");
    setTimeout(() => {
      followSection.style.display = "none";
      dashboardSection.style.display = "grid";
      dashboardSection.classList.remove("hidden");
      window.scrollTo({ top: dashboardSection.offsetTop, behavior: "smooth" });
    }, 300);
  });
});

// Chuyển đổi danh sách và hướng dẫn
document.addEventListener("DOMContentLoaded", () => {
  const foodSection = document.getElementById("foodSection");
  const guideSection = document.getElementById("guideSection");
  const backBtn = document.querySelector(
    "#guideSection .food-header .back-btn"
  );
  const helpBtn = document.querySelector(
    "#foodSection .food-tools .fa-question-circle"
  );

  if (!foodSection || !guideSection) {
    console.warn("⚠️ Food/Guide sections không tồn tại");
    return;
  }

  if (helpBtn) {
    helpBtn.addEventListener("click", () => {
      foodSection.style.display = "none";
      guideSection.style.display = "block";
      window.scrollTo({ top: guideSection.offsetTop, behavior: "smooth" });

      const input = document.querySelector("#guideSection .food-header input");
      if (input) input.placeholder = "Tìm kiếm trong hướng dẫn...";
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      guideSection.style.display = "none";
      foodSection.style.display = "block";
      window.scrollTo({ top: foodSection.offsetTop, behavior: "smooth" });

      const input = document.querySelector("#foodSection .food-header input");
      if (input) input.placeholder = "Tìm kiếm món ăn...";
    });
  }
});

// Modal thêm thực phẩm
document.addEventListener("DOMContentLoaded", function () {
  const addFoodBtn = document.querySelector(".add-food");
  const foodModal = document.getElementById("foodModal");
  const closeModalBtn = document.querySelector(".close-modal");
  const cancelBtn = document.querySelector(".btn-cancel");
  const saveBtn = document.querySelector(".btn-save");

  if (!addFoodBtn || !foodModal) {
    console.warn("⚠️ Add food elements không tồn tại");
    return;
  }

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

  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      // TODO: Implement save logic
      closeModal();
    });
  }

  function clearForm() {
    const form = foodModal.querySelector("form");
    if (form) form.reset();
  }
});

// Hiển thị lịch theo thời gian thực
document.addEventListener("DOMContentLoaded", function () {
  // Lịch tuần
  function updateWeekCalendar() {
    const now = new Date();
    const currentDay = now.getDay(); // 0: Chủ nhật, 1: Thứ 2, ...
    const weekDays = document.querySelectorAll(".week-days span");

    // Lấy ngày đầu tuần (Thứ 2)
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

    document.querySelector(".month").textContent = monthNames[now.getMonth()];
    document.querySelector(".week").textContent = "Tuần này";

    // Cập nhật các ngày trong tuần
    weekDays.forEach((span, index) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + index);

      const dayNumber = day.getDate();

      // ✅ LOGIC ĐÚNG
      if (index === 6) {
        // Chủ nhật là ngày cuối tuần (index = 6)
        span.innerHTML = `CN<br>${dayNumber}`;
      } else {
        span.innerHTML = `T${index + 2}<br>${dayNumber}`; // T2 đến T7
      }

      // Highlight ngày hiện tại
      if (day.toDateString() === now.toDateString()) {
        span.classList.add("active");
      } else {
        span.classList.remove("active");
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
      ".calendar-top span"
    ).textContent = `${monthNames[currentMonth]} ${currentYear}`;

    // Tạo lịch tháng
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const calendarBody = document.querySelector(".calendar-table tbody");
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
      .querySelector(".calendar-arrow .fa-chevron-left")
      .addEventListener("click", function () {
        currentMonth--;
        if (currentMonth < 0) {
          currentMonth = 11;
          currentYear--;
        }
        updateMonthCalendarWithParams(currentMonth, currentYear);
      });

    document
      .querySelector(".calendar-arrow .fa-chevron-right")
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
      ".calendar-top span"
    ).textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const calendarBody = document.querySelector(".calendar-table tbody");
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
      .querySelector(".week-arrows span:first-child")
      .addEventListener("click", function () {
        currentWeekOffset--;
        updateWeekCalendarWithOffset(currentWeekOffset);
      });

    document
      .querySelector(".week-arrows span:last-child")
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
    const weekDays = document.querySelectorAll(".week-days span");

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

    document.querySelector(".month").textContent =
      monthNames[targetDate.getMonth()];
    document.querySelector(".week").textContent =
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

      // ✅ LOGIC ĐÚNG
      if (index === 6) {
        // Chủ nhật
        span.innerHTML = `CN<br>${dayNumber}`;
      } else {
        span.innerHTML = `T${index + 2}<br>${dayNumber}`; // T2 đến T7
      }

      const now = new Date();
      if (day.toDateString() === now.toDateString() && weekOffset === 0) {
        span.classList.add("active");
      } else {
        span.classList.remove("active");
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
});

// Quản lý modal chú thích chế độ ăn
document.addEventListener("DOMContentLoaded", function () {
  const helpBtn = document.querySelector(".diet-mode .help");
  const dietModal = document.getElementById("dietModal");
  const closeDietModal = document.querySelector(".close-diet-modal");
  const btnCloseDiet = document.querySelector(".btn-close-diet");

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
  const filterBtn = document.querySelector(".food-tools .fa-filter");
  const filterModal = document.getElementById("filterModal");
  const closeFilterModal = document.querySelector(".close-filter-modal");
  const btnReset = document.querySelector(".btn-reset");
  const btnApply = document.querySelector(".btn-apply");

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
    const sliders = document.querySelectorAll(".range-slider");

    sliders.forEach((slider) => {
      const inputs = slider.querySelectorAll('input[type="range"]');
      const track = slider.querySelector(".range-track");
      const valuesContainer = slider.querySelector(".range-values");
      const max = parseInt(slider.dataset.max);
      const unit = slider.dataset.unit;

      // Tạo phần tử hiển thị giá trị nếu chưa có
      if (!valuesContainer.querySelector(".range-value")) {
        valuesContainer.innerHTML = `
                        <div class="range-value min">0 ${unit}</div>
                        <div class="range-value max">0 ${unit}</div>
                    `;
      }

      const minValue = valuesContainer.querySelector(".range-value.min");
      const maxValue = valuesContainer.querySelector(".range-value.max");

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

        // Cập nhật giá trị hiển thị - CHỈ HIỂN THỊ SỐ VÀ CHỮ
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
    const sliders = document.querySelectorAll(".range-slider");

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
    const sliders = document.querySelectorAll(".range-slider");
    sliders.forEach((slider) => {
      const inputs = slider.querySelectorAll('input[type="range"]');
      const label = slider
        .closest(".filter-item")
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
    const foodItems = document.querySelectorAll(".food-column li");
    let visibleCount = 0;

    foodItems.forEach((item) => {
      // Lấy thông tin dinh dưỡng từ item
      const nutritionText = item.querySelector(".food-info span").textContent;
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

      // Trong thực tế, bạn sẽ cần lấy thông tin carbs, protein, fat, fiber từ data attributes

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
  // Ví dụ: Gán sự kiện cho các nút "Xóa" trong danh sách món ăn
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-remove-food")) {
      const foodItem = e.target.closest("li");
      if (foodItem) {
        // Xử lý xóa món ăn
        foodItem.remove();
        showSuccessMessage("Đã xóa món ăn khỏi danh sách!");
      }
    }
  });
});

// ✅ SAU KHI LOAD DATA - CẬP NHẬT CALORIES
window.addEventListener("caloriesDataLoaded", () => {
  if (window.currentCaloriesData) {
    updateCaloriesData();
  }
});
