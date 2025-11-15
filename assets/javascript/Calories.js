
// Quản lý hộp chọn cường độ luyện tập
document.addEventListener("DOMContentLoaded", () => {
  const text = document.getElementById("intensityText");
  const box = document.getElementById("intensityBox");
  const closeBtn = document.getElementById("closeBox");
  const saveBtn = document.getElementById("saveBox");
  const select = document.getElementById("activityLevel");
  const desc = document.getElementById("activityDesc");

  // Khi bấm vào dòng "Cường độ luyện tập"
  text.addEventListener("click", () => {
    box.style.display = box.style.display === "none" ? "block" : "none";
  });

  // Khi chọn mức mới, thay đổi mô tả
  select.addEventListener("change", () => {
    const level = select.value;
    const descriptions = {
      1: "• Nếu bạn ngồi nhiều, ít hoạt động chân tay, không tập thể dục",
      2: "• Bạn có đi bộ hoặc vận động nhẹ 1–3 lần/tuần",
      3: "• Bạn tập thể dục đều đặn 3–5 buổi/tuần",
      4: "• Bạn vận động nặng hoặc chơi thể thao mỗi ngày"
    };
    desc.textContent = descriptions[level];
  });

  // Đóng hộp
  closeBtn.addEventListener("click", () => (box.style.display = "none"));

  // Lưu lại lựa chọn
  saveBtn.addEventListener("click", () => {
    const level = select.value;
    text.textContent = `mức ${level} ▼`;
    box.style.display = "none";
  });
});

// Quản lý hiển thị danh sách món ăn khi nhấn vào bữa ăn
document.addEventListener("DOMContentLoaded", () => {
    const mealButtons = document.querySelectorAll(".meal-btn");
    const foodSection = document.getElementById("foodSection");
    const backBtn = document.querySelector(".food-header .back-btn");
    const mealTitle = document.getElementById("mealTitle");
    const currentMealName = document.getElementById("currentMealName");
    
    foodSection.style.display = "none";
    mealTitle.style.display = "none";

    mealButtons.forEach(button => {
        button.addEventListener("click", () => {
            const mealType = button.getAttribute("data-meal");
            const mealNames = {
                'breakfast': 'Buổi sáng',
                'lunch': 'Buổi trưa', 
                'dinner': 'Buổi tối',
                'snack': 'Buổi phụ'
            };
            
            currentMealName.textContent = mealNames[mealType];
            mealTitle.style.display = "block";
            foodSection.style.display = "block";
            
            const mealFoodsContainer = document.getElementById('mealFoodsContainer');
            if (mealFoodsContainer) {
                mealFoodsContainer.style.display = 'block';
                showMealFoods(mealType);
            }

            mealButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    backBtn.addEventListener("click", () => {
        foodSection.style.display = "none";
        mealTitle.style.display = "none";
        mealButtons.forEach(btn => btn.classList.remove('active'));

        const mealFoodsContainer = document.getElementById('mealFoodsContainer');
        if (mealFoodsContainer) {
            mealFoodsContainer.style.display = 'none';
        }
    });
});

// Chuyển đổi giữa phần Dashboard và phần Theo dõi
document.addEventListener("DOMContentLoaded", () => {
    const calendarIcon = document.querySelector(".calendar-box i");
    const dashboardSection = document.getElementById("dashboardSection");
    const followSection = document.getElementById("followSection");
    const backButton = document.querySelector(".follow-header .back");

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

// Chuyển đổi giữa phần danh sách món ăn và phần hướng dẫn
document.addEventListener("DOMContentLoaded", () => {
    const foodSection = document.getElementById("foodSection");
    const guideSection = document.getElementById("guideSection");
    const backBtn = document.querySelector("#guideSection .food-header .back-btn");
    const helpBtn = document.querySelector("#foodSection .food-tools .fa-question-circle");

    helpBtn.addEventListener("click", () => {
        foodSection.style.display = "none";
        guideSection.style.display = "block";
        window.scrollTo({ top: guideSection.offsetTop, behavior: "smooth" });

        const input = document.querySelector("#guideSection .food-header input");
        if (input) input.placeholder = "Tìm kiếm trong hướng dẫn...";
    });

    backBtn.addEventListener("click", () => {
        guideSection.style.display = "none";
        foodSection.style.display = "block";
        window.scrollTo({ top: foodSection.offsetTop, behavior: "smooth" });

        const input = document.querySelector("#foodSection .food-header input");
        if (input) input.placeholder = "Tìm kiếm món ăn...";
    });
});

// Quản lý modal thêm thực phẩm
document.addEventListener("DOMContentLoaded", function() {
    const addFoodBtn = document.querySelector(".add-food");
    const foodModal = document.getElementById("foodModal");
    const closeModalBtn = document.querySelector(".close-modal");
    const cancelBtn = document.querySelector(".btn-cancel");
    const saveBtn = document.querySelector(".btn-save");

    addFoodBtn.addEventListener("click", function() {
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

    foodModal.addEventListener("click", function(e) {
        if (e.target === foodModal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape" && foodModal.style.display === "flex") {
            closeModal();
        }
    });

    if (saveBtn) {
        saveBtn.addEventListener("click", function() {
            const foodData = getFoodData();
            
            if (validateFoodData(foodData)) {
                saveFoodToLocal(foodData);
                addFoodToList(foodData);
                closeModal();
                showToast("🎉 Thêm thực phẩm thành công!", "success");
            }
        });
    }

    function getFoodData() {
        return {
            id: Date.now(),
            name: document.getElementById("foodName").value.trim(),
            image: document.getElementById("foodImage").value.trim() || "image/placeholder-food.png",
            nutrition: {
                calories: parseInt(document.getElementById("foodCalories").value) || 0,
                weight: parseInt(document.getElementById("foodWeight").value) || 100,
                carbs: parseInt(document.getElementById("foodCarbs").value) || 0,
                protein: parseInt(document.getElementById("foodProtein").value) || 0,
                fat: parseInt(document.getElementById("foodFat").value) || 0,
                fiber: parseInt(document.getElementById("foodFiber").value) || 0
            },
            category: document.getElementById("foodCategory").value,
            isFavorite: false,
            createdAt: new Date().toISOString()
        };
    }

    function validateFoodData(data) {
        if (!data.name) {
            showToast("Vui lòng nhập tên thực phẩm!", "error");
            document.getElementById("foodName").focus();
            return false;
        }
        if (data.nutrition.calories < 0) {
            showToast("Calories không thể âm!", "error");
            document.getElementById("foodCalories").focus();
            return false;
        }
        return true;
    }

    function saveFoodToLocal(foodData) {
        try {
            let myFoods = JSON.parse(localStorage.getItem('myFoods')) || [];
            myFoods.push(foodData);
            localStorage.setItem('myFoods', JSON.stringify(myFoods));
        } catch (error) {
            console.error('Lỗi khi lưu vào localStorage:', error);
        }
    }

    function addFoodToList(foodData) {
        const myFoodsList = document.querySelector('.food-column:last-child ul');
        const newFoodItem = createFoodListItem(foodData);
        myFoodsList.appendChild(newFoodItem);
    }

    function clearForm() {
        document.getElementById('foodName').value = '';
        document.getElementById('foodImage').value = '';
        document.getElementById('foodCalories').value = '';
        document.getElementById('foodCarbs').value = '';
        document.getElementById('foodProtein').value = '';
        document.getElementById('foodFat').value = '';
        document.getElementById('foodFiber').value = '';
        document.getElementById('foodCategory').value = 'myfoods';
    }

    // Gọi hàm load khi trang được tải
    setTimeout(loadMyFoods, 100);
});

// Hiển thị lịch theo thời gian thực
document.addEventListener("DOMContentLoaded", function() {
    function updateWeekCalendar() {
        const now = new Date();
        const currentDay = now.getDay();
        const weekDays = document.querySelectorAll('.week-days span');
        
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
        
        const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
                        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
        
        document.querySelector('.month').textContent = monthNames[now.getMonth()];
        document.querySelector('.week').textContent = 'Tuần này';
        
        weekDays.forEach((span, index) => {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + index);
            
            const dayNumber = day.getDate();
            span.innerHTML = `T${index + 2}<br>${dayNumber}`;
            
            if (day.toDateString() === now.toDateString()) {
                span.classList.add('active');
            } else {
                span.classList.remove('active');
            }
        });
    }

    function updateMonthCalendar() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const currentDate = now.getDate();
        
        const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
                        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
        
        document.querySelector('.calendar-top span').textContent = 
            `${monthNames[currentMonth]} ${currentYear}`;
        
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        
        const calendarBody = document.querySelector('.calendar-table tbody');
        calendarBody.innerHTML = '';
        
        let date = 1;
        let rows = '';
        
        for (let i = 0; i < 6; i++) {
            let cells = '';
            
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < startingDay) {
                    cells += '<td></td>';
                } else if (date > daysInMonth) {
                    cells += '<td></td>';
                } else {
                    const isToday = date === currentDate;
                    const cellClass = isToday ? 'dot-green' : '';
                    cells += `<td class="${cellClass}">${date}</td>`;
                    date++;
                }
            }
            
            rows += `<tr>${cells}</tr>`;
            if (date > daysInMonth) break;
        }
        
        calendarBody.innerHTML = rows;
    }

    function setupCalendarNavigation() {
        let currentMonth = new Date().getMonth();
        let currentYear = new Date().getFullYear();
        
        document.querySelector('.calendar-arrow .fa-chevron-left').addEventListener('click', function() {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            updateMonthCalendarWithParams(currentMonth, currentYear);
        });
        
        document.querySelector('.calendar-arrow .fa-chevron-right').addEventListener('click', function() {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            updateMonthCalendarWithParams(currentMonth, currentYear);
        });
    }
    
    function updateMonthCalendarWithParams(month, year) {
        const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
                        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
        
        document.querySelector('.calendar-top span').textContent = `${monthNames[month]} ${year}`;
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        
        const calendarBody = document.querySelector('.calendar-table tbody');
        calendarBody.innerHTML = '';
        
        let date = 1;
        let rows = '';
        const now = new Date();
        const currentDate = now.getDate();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        for (let i = 0; i < 6; i++) {
            let cells = '';
            
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < startingDay) {
                    cells += '<td></td>';
                } else if (date > daysInMonth) {
                    cells += '<td></td>';
                } else {
                    const isToday = date === currentDate && month === currentMonth && year === currentYear;
                    const cellClass = isToday ? 'dot-green' : '';
                    cells += `<td class="${cellClass}">${date}</td>`;
                    date++;
                }
            }
            
            rows += `<tr>${cells}</tr>`;
            if (date > daysInMonth) break;
        }
        
        calendarBody.innerHTML = rows;
    }

    function setupWeekNavigation() {
        let currentWeekOffset = 0;
        
        document.querySelector('.week-arrows span:first-child').addEventListener('click', function() {
            currentWeekOffset--;
            updateWeekCalendarWithOffset(currentWeekOffset);
        });
        
        document.querySelector('.week-arrows span:last-child').addEventListener('click', function() {
            currentWeekOffset++;
            updateWeekCalendarWithOffset(currentWeekOffset);
        });
    }
    
    function updateWeekCalendarWithOffset(weekOffset) {
        const now = new Date();
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + (weekOffset * 7));
        
        const currentDay = targetDate.getDay();
        const weekDays = document.querySelectorAll('.week-days span');
        
        const startOfWeek = new Date(targetDate);
        startOfWeek.setDate(targetDate.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
        
        const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
                        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
        
        document.querySelector('.month').textContent = monthNames[targetDate.getMonth()];
        document.querySelector('.week').textContent = weekOffset === 0 ? 'Tuần này' : 
                                                    weekOffset === -1 ? 'Tuần trước' : 
                                                    weekOffset === 1 ? 'Tuần sau' : 
                                                    `Tuần ${weekOffset > 0 ? '+' : ''}${weekOffset}`;
        
        weekDays.forEach((span, index) => {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + index);
            
            const dayNumber = day.getDate();
            span.innerHTML = `T${index + 2}<br>${dayNumber}`;
            
            const now = new Date();
            if (day.toDateString() === now.toDateString() && weekOffset === 0) {
                span.classList.add('active');
            } else {
                span.classList.remove('active');
            }
        });
    }

    updateWeekCalendar();
    updateMonthCalendar();
    setupCalendarNavigation();
    setupWeekNavigation();
});

// Quản lý modal chú thích chế độ ăn
document.addEventListener("DOMContentLoaded", function() {
    const helpBtn = document.querySelector(".diet-mode .help");
    const dietModal = document.getElementById("dietModal");
    const closeDietModal = document.querySelector(".close-diet-modal");

    helpBtn.addEventListener("click", function() {
        dietModal.style.display = "flex";
        document.body.style.overflow = "hidden";
    });

    function closeDietModalFunc() {
        dietModal.style.display = "none";
        document.body.style.overflow = "auto";
    }

    if (closeDietModal) {
        closeDietModal.addEventListener("click", closeDietModalFunc);
    }

    dietModal.addEventListener("click", function(e) {
        if (e.target === dietModal) {
            closeDietModalFunc();
        }
    });
});

// Quản lý modal bộ lọc món ăn
document.addEventListener("DOMContentLoaded", function() {
    const filterBtn = document.querySelector(".food-tools .fa-filter");
    const filterModal = document.getElementById("filterModal");
    const closeFilterModal = document.querySelector(".close-filter-modal");
    const btnReset = document.querySelector(".btn-reset");
    const btnApply = document.querySelector(".btn-apply");

    initRangeSliders();

    filterBtn.addEventListener("click", function() {
        filterModal.style.display = "flex";
        document.body.style.overflow = "hidden";
    });

    function closeFilterModalFunc() {
        filterModal.style.display = "none";
        document.body.style.overflow = "auto";
    }

    if (closeFilterModal) {
        closeFilterModal.addEventListener("click", closeFilterModalFunc);
    }

    if (btnReset) {
        btnReset.addEventListener("click", function() {
            resetFilters();
            closeFilterModalFunc();
        });
    }

    if (btnApply) {
        btnApply.addEventListener("click", function() {
            applyFilters();
            closeFilterModalFunc();
        });
    }

    function initRangeSliders() {
        const sliders = document.querySelectorAll('.range-slider');
        
        sliders.forEach(slider => {
            const inputs = slider.querySelectorAll('input[type="range"]');
            const track = slider.querySelector('.range-track');
            const valuesContainer = slider.querySelector('.range-values');
            const max = parseInt(slider.dataset.max);
            const unit = slider.dataset.unit;
            
            if (!valuesContainer.querySelector('.range-value')) {
                valuesContainer.innerHTML = `
                    <div class="range-value min">0 ${unit}</div>
                    <div class="range-value max">0 ${unit}</div>
                `;
            }
            
            const minValue = valuesContainer.querySelector('.range-value.min');
            const maxValue = valuesContainer.querySelector('.range-value.max');
            
            function updateSlider() {
                const minVal = parseInt(inputs[0].value);
                const maxVal = parseInt(inputs[1].value);
                
                if (minVal > maxVal) {
                    inputs[0].value = maxVal;
                    inputs[1].value = minVal;
                    updateSlider();
                    return;
                }
                
                const minPercent = (minVal / max) * 100;
                const maxPercent = (maxVal / max) * 100;
                track.style.left = `${minPercent}%`;
                track.style.width = `${maxPercent - minPercent}%`;
                
                minValue.textContent = `${minVal} ${unit}`;
                maxValue.textContent = `${maxVal} ${unit}`;
            }
            
            inputs.forEach(input => {
                input.addEventListener('input', updateSlider);
            });
            
            updateSlider();
        });
    }

    function resetFilters() {
        const sliders = document.querySelectorAll('.range-slider');
        
        sliders.forEach(slider => {
            const inputs = slider.querySelectorAll('input[type="range"]');
            const max = parseInt(slider.dataset.max);
            
            inputs[0].value = Math.floor(max * 0.1);
            inputs[1].value = Math.floor(max * 0.8);
            
            inputs[0].dispatchEvent(new Event('input'));
        });
        
        showToast("Đã đặt lại bộ lọc!", "success");
    }

    function applyFilters() {
        const filterData = {};
        
        const sliders = document.querySelectorAll('.range-slider');
        sliders.forEach(slider => {
            const inputs = slider.querySelectorAll('input[type="range"]');
            const label = slider.closest('.filter-item').querySelector('label').textContent;
            
            let filterType;
            if (label.includes('Calories')) filterType = 'calories';
            else if (label.includes('Tinh bột')) filterType = 'carbs';
            else if (label.includes('Đạm')) filterType = 'protein';
            else if (label.includes('Béo')) filterType = 'fat';
            else if (label.includes('Xơ')) filterType = 'fiber';
            
            if (filterType) {
                filterData[filterType] = {
                    min: parseInt(inputs[0].value),
                    max: parseInt(inputs[1].value)
                };
            }
        });
        
        filterFoodItems(filterData);
        showToast("Đã áp dụng bộ lọc!", "success");
    }

    function filterFoodItems(filters) {
        const foodItems = document.querySelectorAll('.food-column li');
        let visibleCount = 0;

        foodItems.forEach(item => {
            const nutritionText = item.querySelector('.food-info span').textContent;
            const caloriesMatch = nutritionText.match(/(\d+)kcal/);
            
            const itemCalories = caloriesMatch ? parseInt(caloriesMatch[1]) : 0;
            
            let showItem = true;
            
            if (filters.calories && (itemCalories < filters.calories.min || itemCalories > filters.calories.max)) {
                showItem = false;
            }
            
            if (showItem) {
                item.style.display = 'flex';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });
    }
});

// Quản lý thêm món ăn vào thực đơn theo buổi 
document.addEventListener("DOMContentLoaded", () => {
    let currentMealType = null;
    const mealFoods = {
        'breakfast': [],
        'lunch': [],
        'dinner': [],
        'snack': []
    };

    const mealButtons = document.querySelectorAll(".meal-btn");
    mealButtons.forEach(button => {
        button.addEventListener("click", () => {
            const newMealType = button.getAttribute("data-meal");
            
            mealButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            showMealFoods(newMealType);
        });
    });

    function showMealFoods(mealType) {
        currentMealType = mealType;
        
        const mealNames = {
            'breakfast': 'Buổi sáng',
            'lunch': 'Buổi trưa', 
            'dinner': 'Buổi tối',
            'snack': 'Buổi phụ'
        };
        document.getElementById("currentMealName").textContent = mealNames[mealType];
        document.getElementById("mealTitle").style.display = "block";

        displayMealFoods(mealType);
    }

    function displayMealFoods(mealType) {
        const mealFoodsContainer = getOrCreateMealFoodsContainer();
        mealFoodsContainer.innerHTML = '';

        const foods = mealFoods[mealType];
        
        if (foods.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-meal-message';
            emptyMessage.textContent = 'Chưa có món ăn nào. Hãy thêm món từ danh sách bên trên!';
            mealFoodsContainer.appendChild(emptyMessage);
        } else {
            foods.forEach((foodData, index) => {
                const foodElement = createMealFoodElement(foodData, index);
                mealFoodsContainer.appendChild(foodElement);
            });
        }

        updateNutritionSummary();
    }

    function setupAddFoodButtons() {
        const addButtons = document.querySelectorAll(".add-btn");
        
        addButtons.forEach(button => {
            button.addEventListener("click", function(e) {
                e.stopPropagation();
                
                if (!currentMealType) {
                    showToast("Vui lòng chọn bữa ăn trước khi thêm món!", "error");
                    return;
                }

                const foodItem = this.closest('li');
                const foodData = getFoodDataFromItem(foodItem);
                
                // KIỂM TRA MÓN ĂN ĐÃ TỒN TẠI TRONG BUỔI CHƯA
                if (isFoodAlreadyInMeal(currentMealType, foodData)) {
                    showToast(`"${foodData.name}" đã có trong ${getMealName(currentMealType)}!`, "error");
                    return;
                }
                
                addFoodToMeal(currentMealType, foodData);
                displayMealFoods(currentMealType);
                
                showToast(`Đã thêm "${foodData.name}" vào ${getMealName(currentMealType)}!`, "success");
            });
        });
    }

    // HÀM MỚI: Kiểm tra món ăn đã tồn tại trong buổi chưa
    function isFoodAlreadyInMeal(mealType, newFoodData) {
        const existingFoods = mealFoods[mealType];
        
        // Tạo ID duy nhất cho món ăn dựa trên tên và thông tin
        const newFoodId = generateFoodId(newFoodData);
        
        // Kiểm tra xem đã có món ăn cùng ID chưa
        return existingFoods.some(existingFood => 
            generateFoodId(existingFood) === newFoodId
        );
    }

    // HÀM MỚI: Tạo ID duy nhất cho món ăn
    function generateFoodId(foodData) {
        // Kết hợp tên món và calories để tạo ID duy nhất
        return `${foodData.name.toLowerCase().replace(/\s+/g, '_')}_${foodData.calories}`;
    }

    function getFoodDataFromItem(foodItem) {
        const name = foodItem.querySelector('.food-info p').textContent;
        const info = foodItem.querySelector('.food-info span').textContent;
        const image = foodItem.querySelector('img').src;
        const calories = extractCalories(info);
        
        return {
            name: name,
            info: info,
            image: image,
            calories: calories,
            // Thêm ID duy nhất
            id: generateFoodId({ name: name, calories: calories })
        };
    }

    function addFoodToMeal(mealType, foodData) {
        // Đảm bảo món ăn có ID
        if (!foodData.id) {
            foodData.id = generateFoodId(foodData);
        }
        mealFoods[mealType].push(foodData);
    }

    function removeFoodFromMeal(mealType, index) {
        const removedFood = mealFoods[mealType][index];
        mealFoods[mealType].splice(index, 1);
        return removedFood;
    }

    function getOrCreateMealFoodsContainer() {
        let container = document.getElementById('mealFoodsContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'mealFoodsContainer';
            container.className = 'meal-foods-container';
            document.getElementById("mealTitle").parentNode.insertBefore(container, document.getElementById("mealTitle").nextSibling);
        }
        return container;
    }

    function createMealFoodElement(foodData, index) {
        const div = document.createElement('div');
        div.className = 'meal-food-item';
        div.innerHTML = `
            <img src="${foodData.image}" alt="${foodData.name}" onerror="this.src='../assets/images/Calories/placeholder-food.png'">
            <div class="meal-food-info">
                <p class="meal-food-name">${foodData.name}</p>
                <span class="meal-food-details">${foodData.info}</span>
            </div>
            <div class="meal-food-calories">${foodData.calories} cal</div>
            <button class="remove-food-btn">×</button>
        `;

        const removeBtn = div.querySelector('.remove-food-btn');
        removeBtn.addEventListener('click', function() {
            const removedFood = removeFoodFromMeal(currentMealType, index);
            displayMealFoods(currentMealType);
            showToast(`Đã xóa "${removedFood.name}" khỏi ${getMealName(currentMealType)}!`, "success");
        });

        return div;
    }

    function extractCalories(foodInfo) {
        const match = foodInfo.match(/(\d+)kcal/);
        return match ? match[1] : '0';
    }

    function updateNutritionSummary() {
        if (currentMealType) {
            const totalCalories = mealFoods[currentMealType].reduce((sum, food) => {
                return sum + parseInt(food.calories);
            }, 0);
            console.log(`Tổng calories ${currentMealType}: ${totalCalories}`);
        }
    }

    function getMealName(mealType) {
        const mealNames = {
            'breakfast': 'buổi sáng',
            'lunch': 'buổi trưa', 
            'dinner': 'buổi tối',
            'snack': 'buổi phụ'
        };
        return mealNames[mealType] || 'bữa ăn';
    }

    setupAddFoodButtons();
});

// Quản lý chức năng yêu thích cho món ăn
document.addEventListener("DOMContentLoaded", function() {
    let favoriteFoods = JSON.parse(localStorage.getItem('favoriteFoods')) || [];
    
    loadFavoriteFoods();
    
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('fa-heart')) {
            handleHeartClick(e.target);
        }
    });
    
    function handleHeartClick(heartIcon) {
        const foodItem = heartIcon.closest('li');
        if (!foodItem) return;
        
        const foodData = getFoodDataFromItem(foodItem);
        const isCurrentlyFavorite = heartIcon.classList.contains('favorite');
        
        if (isCurrentlyFavorite) {
            removeFromFavorites(foodData);
        } else {
            addToFavorites(foodData);
        }
    }
    
    function addToFavorites(foodData) {
        if (!favoriteFoods.some(food => food.id === foodData.id)) {
            favoriteFoods.push(foodData);
        }
        
        saveFavoritesToLocalStorage();
        syncAllHeartIcons();
        updateFavoriteFoodsList();
        
        showToast(`Đã thêm "${foodData.name}" vào mục yêu thích!`, "success");
    }
    
    function removeFromFavorites(foodData) {
        favoriteFoods = favoriteFoods.filter(food => food.id !== foodData.id);
        
        saveFavoritesToLocalStorage();
        syncAllHeartIcons();
        updateFavoriteFoodsList();
        
        showToast(`Đã xóa "${foodData.name}" khỏi mục yêu thích!`, "success");
    }
    
    function getFoodDataFromItem(foodItem) {
        const name = foodItem.querySelector('.food-info p').textContent;
        const info = foodItem.querySelector('.food-info span').textContent;
        const image = foodItem.querySelector('img').src;
        
        const id = name.replace(/\s+/g, '-').toLowerCase() + '-' + info.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        
        return {
            id: id,
            name: name,
            info: info,
            image: image,
            calories: extractCalories(info)
        };
    }
    
    function saveFavoritesToLocalStorage() {
        localStorage.setItem('favoriteFoods', JSON.stringify(favoriteFoods));
    }
    
    function updateFavoriteFoodsList() {
        const favoriteFoodsList = document.getElementById('favoriteFoodsList');
        
        if (!favoriteFoodsList) return;
        
        favoriteFoodsList.innerHTML = '';
        
        favoriteFoods.forEach(foodData => {
            const favoriteItem = createFoodListItem(foodData, true);
            favoriteFoodsList.appendChild(favoriteItem);
        });
        
        if (favoriteFoods.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.style.cssText = 'text-align: center; color: #999; font-style: italic; padding: 20px;';
            emptyMessage.textContent = 'Chưa có món ăn yêu thích nào';
            favoriteFoodsList.appendChild(emptyMessage);
        }
    }
    

    function createFoodListItem(foodData, isInFavorites = false) {
        const li = document.createElement('li');
        const isFavorite = favoriteFoods.some(fav => fav.id === foodData.id);
        const heartClass = isFavorite ? 'fas fa-heart favorite' : 'far fa-heart';
        
        li.innerHTML = `
            <img src="${foodData.image}" alt="${foodData.name}" onerror="this.src='../assets/images/Calories/placeholder-food.png'">
            <div class="food-info">
                <p>${foodData.name}</p>
                <span>${foodData.info}</span>
            </div>
            <i class="${heartClass}"></i>
            <button class="add-btn">+</button>
        `;
        
        const addBtn = li.querySelector('.add-btn');
        addBtn.addEventListener('click', function() {
            if (typeof addFoodToMeal === 'function' && currentMealType) {
                // KIỂM TRA TRÙNG LẶP TRƯỚC KHI THÊM
                if (isFoodAlreadyInMeal(currentMealType, foodData)) {
                    showToast(`"${foodData.name}" đã có trong ${getMealName(currentMealType)}!`, "error");
                    return;
                }
                
                addFoodToMeal(currentMealType, foodData);
                displayMealFoods(currentMealType);
                showToast(`Đã thêm "${foodData.name}" vào ${getMealName(currentMealType)}!`, "success");
            } else {
                showToast("Vui lòng chọn bữa ăn trước khi thêm món!", "error");
            }
        });
        
        return li;
}
    
    function syncAllHeartIcons() {
        const allHeartIcons = document.querySelectorAll('.fa-heart');
        
        allHeartIcons.forEach(heartIcon => {
            const foodItem = heartIcon.closest('li');
            if (foodItem) {
                const foodData = getFoodDataFromItem(foodItem);
                const isFavorite = favoriteFoods.some(food => food.id === foodData.id);
                
                if (isFavorite) {
                    heartIcon.classList.remove('far');
                    heartIcon.classList.add('fas', 'favorite');
                } else {
                    heartIcon.classList.remove('fas', 'favorite');
                    heartIcon.classList.add('far');
                }
            }
        });
    }
    
    function loadFavoriteFoods() {
        updateFavoriteFoodsList();
        syncAllHeartIcons();
    }
    
    function extractCalories(foodInfo) {
        const match = foodInfo.match(/(\d+)kcal/);
        return match ? match[1] : '0';
    }
    
    if (typeof addFoodToMeal === 'undefined') {
        window.addFoodToMeal = function(mealType, foodData) {
            console.log('Thêm món ăn:', foodData.name, 'vào bữa:', mealType);
        };
    }
    
    if (typeof displayMealFoods === 'undefined') {
        window.displayMealFoods = function(mealType) {
            console.log('Hiển thị món ăn cho bữa:', mealType);
        };
    }
    
    if (typeof getMealName === 'undefined') {
        window.getMealName = function(mealType) {
            const mealNames = {
                'breakfast': 'buổi sáng',
                'lunch': 'buổi trưa', 
                'dinner': 'buổi tối',
                'snack': 'buổi phụ'
            };
            return mealNames[mealType] || 'bữa ăn';
        };
    }
    
    if (typeof currentMealType === 'undefined') {
        window.currentMealType = null;
    }
});

// Hàm tải thực phẩm từ localStorage
function loadMyFoods() {
    try {
        const myFoods = JSON.parse(localStorage.getItem('myFoods')) || [];
        const myFoodsList = document.querySelector('.food-column:last-child ul');
        
        if (myFoodsList && myFoods.length > 0) {
            myFoodsList.innerHTML = '';
            
            myFoods.forEach(food => {
                const foodData = {
                    id: food.id,
                    name: food.name,
                    info: `${food.nutrition.weight}g, ${food.nutrition.calories}kcal`,
                    image: food.image,
                    calories: food.nutrition.calories
                };
                
                const foodItem = createFoodListItem(foodData);
                myFoodsList.appendChild(foodItem);
            });
        }
    } catch (error) {
        console.error('Lỗi khi load từ localStorage:', error);
    }
}

// Hàm hiển thị thông báo
function showToast(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = type === 'success' ? 'toast-success' : 'toast-error';
    toast.textContent = message;
    
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
}

// Thêm animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);