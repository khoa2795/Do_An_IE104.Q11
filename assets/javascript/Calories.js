//Sử dụng JavaScript để quản lý hộp chọn cường độ luyện tập
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


// Chuyển đổi giữa phần Tổng quan và phần Thực phẩm
document.addEventListener("DOMContentLoaded", () => {
  const caloCircle = document.querySelector(".overview-container .circle");
  const overviewSection = document.getElementById("overviewSection");
  const foodSection = document.getElementById("foodSection");
  const backBtn = document.querySelector(".food-header .back-btn");

  // Khi nhấn vào hình tròn calo → ẩn tổng quan, hiện món ăn
    caloCircle.addEventListener("click", () => {
    overviewSection.classList.add("hide");
    setTimeout(() => {
        overviewSection.style.display = "none";
        foodSection.style.display = "block";
        foodSection.classList.remove("hide");
    }, 300);
    });

  // Khi nhấn nút quay lại → ẩn món ăn, hiện lại tổng quan
    backBtn.addEventListener("click", () => {
    foodSection.classList.add("hide");
    setTimeout(() => {
        foodSection.style.display = "none";
        overviewSection.style.display = "block";
        overviewSection.classList.remove("hide");
    }, 300);
    });
});


// Chuyển đổi giữa phần Dashboard và phần Theo dõi
document.addEventListener("DOMContentLoaded", () => {
  const calendarIcon = document.querySelector(".calendar-box i"); // icon lịch
  const dashboardSection = document.getElementById("dashboardSection");
  const followSection = document.getElementById("followSection");
  const backButton = document.querySelector(".follow-header .back");

  // Khi nhấn vào icon lịch → hiện phần Theo dõi, ẩn Dashboard
    calendarIcon.addEventListener("click", () => {
    dashboardSection.classList.add("hidden");
    setTimeout(() => {
        dashboardSection.style.display = "none";
        followSection.style.display = "block";
        followSection.classList.remove("hidden");
        window.scrollTo({ top: followSection.offsetTop, behavior: "smooth" });
    }, 300);
    });
  // Khi nhấn nút quay lại → hiện Dashboard, ẩn phần Theo dõi
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

  // Khi nhấn dấu hỏi chấm → hiện phần hướng dẫn, ẩn danh sách món ăn
  helpBtn.addEventListener("click", () => {
    foodSection.style.display = "none";
    guideSection.style.display = "block";
    window.scrollTo({ top: guideSection.offsetTop, behavior: "smooth" });

    // đổi placeholder thanh tìm kiếm cho phù hợp
    const input = document.querySelector("#guideSection .food-header input");
    if (input) input.placeholder = "Tìm kiếm trong hướng dẫn...";
  });

  // Khi nhấn nút quay lại → hiện lại danh sách món ăn
  backBtn.addEventListener("click", () => {
    guideSection.style.display = "none";
    foodSection.style.display = "block";
    window.scrollTo({ top: foodSection.offsetTop, behavior: "smooth" });

    // đổi lại placeholder cũ
    const input = document.querySelector("#foodSection .food-header input");
    if (input) input.placeholder = "Tìm kiếm món ăn...";
  });
});





// Quản lý modal thêm thực phẩm - FIXED VERSION
document.addEventListener("DOMContentLoaded", function() {
    // Kiểm tra xem các phần tử có tồn tại không
    const addFoodBtn = document.querySelector(".add-food");
    const foodModal = document.getElementById("foodModal");
    
    if (!addFoodBtn || !foodModal) {
        console.log("Không tìm thấy nút thêm thực phẩm hoặc modal");
        return;
    }

    const closeModalBtn = document.querySelector(".close-modal");
    const cancelBtn = document.querySelector(".btn-cancel");
    const saveBtn = document.querySelector(".btn-save");

    // Mở modal khi nhấn nút "Thêm thực phẩm của bạn"
    addFoodBtn.addEventListener("click", function() {
        console.log("Mở modal thêm thực phẩm");
        foodModal.style.display = "flex";
        document.body.style.overflow = "hidden";
    });

    // Đóng modal
    function closeModal() {
        console.log("Đóng modal");
        foodModal.style.display = "none";
        document.body.style.overflow = "auto";
        clearForm();
    }

    if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

    // Đóng modal khi click ra ngoài
    foodModal.addEventListener("click", function(e) {
        if (e.target === foodModal) {
            closeModal();
        }
    });

    // Đóng modal bằng phím ESC
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape" && foodModal.style.display === "flex") {
            closeModal();
        }
    });

    // Lưu thực phẩm mới
    if (saveBtn) {
        saveBtn.addEventListener("click", function() {
            console.log("Nhấn nút lưu");
            const foodData = getFoodData();
            
            if (validateFoodData(foodData)) {
                saveFoodToLocal(foodData);
                addFoodToList(foodData);
                closeModal();
                showSuccessMessage("🎉 Thêm thực phẩm thành công!");
            }
        });
    }

    // Lấy dữ liệu từ form
    function getFoodData() {
        return {
            id: Date.now(), // ID duy nhất
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

    // Validate dữ liệu
    function validateFoodData(data) {
        if (!data.name) {
            showError("Vui lòng nhập tên thực phẩm!");
            document.getElementById("foodName").focus();
            return false;
        }
        if (data.nutrition.calories < 0) {
            showError("Calories không thể âm!");
            document.getElementById("foodCalories").focus();
            return false;
        }
        return true;
    }

    // Hiển thị lỗi
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e55b4d;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1001;
            animation: slideIn 0.3s ease;
            font-weight: 500;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => errorDiv.remove(), 300);
        }, 3000);
    }

    // Lưu vào localStorage
    function saveFoodToLocal(foodData) {
        try {
            let myFoods = JSON.parse(localStorage.getItem('myFoods')) || [];
            myFoods.push(foodData);
            localStorage.setItem('myFoods', JSON.stringify(myFoods));
            console.log('Đã lưu thực phẩm:', foodData);
        } catch (error) {
            console.error('Lỗi khi lưu vào localStorage:', error);
        }
    }

    // Thêm vào danh sách hiển thị
    function addFoodToList(foodData) {
        const myFoodsList = document.querySelector('.food-column:last-child ul');
        if (!myFoodsList) {
            console.log("Không tìm thấy danh sách thực phẩm");
            return;
        }
        
        const newFoodItem = createFoodItem(foodData);
        myFoodsList.appendChild(newFoodItem);
    }

    // Tạo HTML cho item thực phẩm mới
    function createFoodItem(food) {
        const li = document.createElement('li');
        li.innerHTML = `
            <img src="${food.image}" alt="${food.name}" onerror="this.src='image/placeholder-food.png'">
            <div class="food-info">
                <p>${food.name}</p>
                <span>${food.nutrition.weight}g, ${food.nutrition.calories}kcal</span>
            </div>
            <i class="far fa-heart"></i>
            <button class="add-btn">+</button>
        `;

        // Thêm event listener cho nút tim
        const heartIcon = li.querySelector('.fa-heart');
        heartIcon.addEventListener('click', function() {
            this.classList.toggle('far');
            this.classList.toggle('fas');
            this.classList.toggle('favorite');
            toggleFavorite(food.id, this.classList.contains('favorite'));
        });

        // Thêm event listener cho nút thêm
        const addBtn = li.querySelector('.add-btn');
        addBtn.addEventListener('click', function() {
            addFoodToMeal(food);
        });

        return li;
    }

    // Xử lý yêu thích
    function toggleFavorite(foodId, isFavorite) {
        try {
            let myFoods = JSON.parse(localStorage.getItem('myFoods')) || [];
            const foodIndex = myFoods.findIndex(f => f.id === foodId);
            
            if (foodIndex !== -1) {
                myFoods[foodIndex].isFavorite = isFavorite;
                localStorage.setItem('myFoods', JSON.stringify(myFoods));
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật yêu thích:', error);
        }
    }

    // Thêm vào bữa ăn
    function addFoodToMeal(food) {
        console.log('Thêm vào bữa ăn:', food);
        showSuccessMessage(`Đã thêm "${food.name}" vào bữa ăn!`);
    }

    // Hiển thị thông báo thành công
    function showSuccessMessage(message) {
        const toast = document.createElement('div');
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
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Clear form
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

    // Load thực phẩm từ localStorage khi trang được tải
    function loadMyFoods() {
        try {
            const myFoods = JSON.parse(localStorage.getItem('myFoods')) || [];
            const myFoodsList = document.querySelector('.food-column:last-child ul');
            
            if (myFoodsList && myFoods.length > 0) {
                console.log('Đang tải', myFoods.length, 'thực phẩm từ localStorage');
                
                // Xóa các item mẫu (nếu có)
                myFoodsList.innerHTML = '';
                
                // Thêm các thực phẩm đã lưu
                myFoods.forEach(food => {
                    const foodItem = createFoodItem(food);
                    myFoodsList.appendChild(foodItem);
                });
            }
        } catch (error) {
            console.error('Lỗi khi load từ localStorage:', error);
        }
    }

    // Gọi hàm load khi trang được tải
    loadMyFoods();
});

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



// Hiển thị lịch theo thời gian thực
document.addEventListener("DOMContentLoaded", function() {
    // Lịch tuần
    function updateWeekCalendar() {
        const now = new Date();
        const currentDay = now.getDay(); // 0: Chủ nhật, 1: Thứ 2, ...
        const weekDays = document.querySelectorAll('.week-days span');
        
        // Lấy ngày đầu tuần (Thứ 2)
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
        
        // Cập nhật tháng và tuần
        const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
                           "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
        
        document.querySelector('.month').textContent = monthNames[now.getMonth()];
        document.querySelector('.week').textContent = 'Tuần này';
        
        // Cập nhật các ngày trong tuần
        weekDays.forEach((span, index) => {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + index);
            
            const dayNumber = day.getDate();
            span.innerHTML = `T${index + 2}<br>${dayNumber}`;
            
            // Highlight ngày hiện tại
            if (day.toDateString() === now.toDateString()) {
                span.classList.add('active');
            } else {
                span.classList.remove('active');
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
        const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
                           "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
        
        document.querySelector('.calendar-top span').textContent = 
            `${monthNames[currentMonth]} ${currentYear}`;
        
        // Tạo lịch tháng
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

    // Xử lý nút chuyển tháng
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

    // Xử lý nút chuyển tuần
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

    // Khởi tạo
    updateWeekCalendar();
    updateMonthCalendar();
    setupCalendarNavigation();
    setupWeekNavigation();
    
    // Cập nhật mỗi ngày
    setInterval(function() {
        const now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0) {
            updateWeekCalendar();
            updateMonthCalendar();
        }
    }, 60000); // Kiểm tra mỗi phút
});




// Quản lý modal chú thích chế độ ăn - GIỐNG ẢNH
document.addEventListener("DOMContentLoaded", function() {
    const helpBtn = document.querySelector(".diet-mode .help");
    const dietModal = document.getElementById("dietModal");
    const closeDietModal = document.querySelector(".close-diet-modal");
    const btnCloseDiet = document.querySelector(".btn-close-diet");

    // Kiểm tra xem các phần tử có tồn tại không
    if (!helpBtn || !dietModal) {
        console.log("Không tìm thấy nút help hoặc modal chế độ ăn");
        return;
    }

    // Mở modal khi nhấn vào dấu "?"
    helpBtn.addEventListener("click", function() {
        console.log("Mở modal chế độ ăn");
        dietModal.style.display = "flex";
        document.body.style.overflow = "hidden";
    });

    // Đóng modal
    function closeDietModalFunc() {
        console.log("Đóng modal chế độ ăn");
        dietModal.style.display = "none";
        document.body.style.overflow = "auto";
    }

    // Đóng bằng nút X
    if (closeDietModal) {
        closeDietModal.addEventListener("click", closeDietModalFunc);
    }

    // // Đóng bằng nút Đóng
    // if (btnCloseDiet) {
    //     btnCloseDiet.addEventListener("click", closeDietModalFunc);
    // }

    // Đóng modal khi click ra ngoài
    dietModal.addEventListener("click", function(e) {
        if (e.target === dietModal) {
            closeDietModalFunc();
        }
    });

    // Đóng modal bằng phím ESC
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape" && dietModal.style.display === "flex") {
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

    // Kiểm tra xem các phần tử có tồn tại không
    if (!filterBtn || !filterModal) {
        console.log("Không tìm thấy nút lọc hoặc modal bộ lọc");
        return;
    }

    // Mở modal khi nhấn vào icon lọc
    filterBtn.addEventListener("click", function() {
        console.log("Mở modal bộ lọc");
        filterModal.style.display = "flex";
        document.body.style.overflow = "hidden";
    });

    // Đóng modal
    function closeFilterModalFunc() {
        console.log("Đóng modal bộ lọc");
        filterModal.style.display = "none";
        document.body.style.overflow = "auto";
    }

    // Đóng bằng nút X
    if (closeFilterModal) {
        closeFilterModal.addEventListener("click", closeFilterModalFunc);
    }

    // Đóng bằng nút Đặt lại
    if (btnReset) {
        btnReset.addEventListener("click", function() {
            resetFilters();
            closeFilterModalFunc();
        });
    }

    // Đóng bằng nút Áp dụng
    if (btnApply) {
        btnApply.addEventListener("click", function() {
            applyFilters();
            closeFilterModalFunc();
        });
    }

    // Đóng modal khi click ra ngoài
    filterModal.addEventListener("click", function(e) {
        if (e.target === filterModal) {
            closeFilterModalFunc();
        }
    });

    // Đóng modal bằng phím ESC
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape" && filterModal.style.display === "flex") {
            closeFilterModalFunc();
        }
    });

    // Reset bộ lọc về mặc định
    function resetFilters() {
        const calorieSlider = document.querySelector('.range-input');
        const carbInput = document.querySelector('.nutrition-inputs input:nth-child(1)');
        const proteinInput = document.querySelector('.nutrition-inputs input:nth-child(2)');
        const fatInput = document.querySelector('.nutrition-inputs input:nth-child(3)');
        const fiberInput = document.querySelector('.nutrition-inputs input:nth-child(4)');
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');

        // Reset values
        calorieSlider.value = 800;
        carbInput.value = 100;
        proteinInput.value = 20;
        fatInput.value = 20;
        fiberInput.value = 0;

        // Check all checkboxes
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });

        console.log("Đã reset bộ lọc");
        showSuccessMessage("Đã đặt lại bộ lọc!");
    }

    // Áp dụng bộ lọc
    function applyFilters() {
        const calorieValue = document.querySelector('.range-input').value;
        const carbValue = document.querySelector('.nutrition-inputs input:nth-child(1)').value;
        const proteinValue = document.querySelector('.nutrition-inputs input:nth-child(2)').value;
        const fatValue = document.querySelector('.nutrition-inputs input:nth-child(3)').value;
        const fiberValue = document.querySelector('.nutrition-inputs input:nth-child(4)').value;

        const filterData = {
            calories: parseInt(calorieValue),
            carbs: parseInt(carbValue),
            protein: parseInt(proteinValue),
            fat: parseInt(fatValue),
            fiber: parseInt(fiberValue)
        };

        console.log("Áp dụng bộ lọc:", filterData);
        filterFoodItems(filterData);
        showSuccessMessage("Đã áp dụng bộ lọc!");
    }

    // Lọc danh sách món ăn
    function filterFoodItems(filters) {
        const foodItems = document.querySelectorAll('.food-column li');
        let visibleCount = 0;

        foodItems.forEach(item => {
            // Lấy thông tin dinh dưỡng từ item (trong thực tế sẽ lấy từ data attributes)
            const itemCalories = parseInt(item.querySelector('.food-info span').textContent.match(/\d+/)[0]) || 0;
            
            // Kiểm tra điều kiện lọc
            const showItem = itemCalories <= filters.calories;
            
            if (showItem) {
                item.style.display = 'flex';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });

        console.log(`Hiển thị ${visibleCount} món ăn phù hợp`);
    }

    // Hiển thị thông báo
    function showSuccessMessage(message) {
        const toast = document.createElement('div');
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
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
});