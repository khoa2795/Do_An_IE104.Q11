// Tên tệp: Health.js (THAY THẾ TOÀN BỘ NỘI DUNG CŨ)
document.addEventListener("DOMContentLoaded", () => {

    // --- 1. Code xử lý Tab (ĐÃ CẬP NHẬT) ---
    // Logic mới: Chuyển trang thay vì ẩn/hiện div
    const tabs = document.querySelectorAll(".tab");

    tabs.forEach(tab => {
        tab.addEventListener("click", (event) => {
            event.preventDefault(); // Ngăn hành vi mặc định
            const targetTab = tab.getAttribute("data-tab");

            if (targetTab === "info") {
                // Khi nhấn tab "Thông tin sức khỏe", luôn đi đến trang hiển thị
                window.location.href = "Health.html";
            } else if (targetTab === "disease") {
                // Khi nhấn tab "Tiền sử bệnh", luôn đi đến trang bệnh án
                window.location.href = "tien-su-benh.html";
            }
        });
    });

    // --- (HÀM) HÀM TÍNH BMI (Giữ nguyên) ---
    function calculateBMI(weight, height) {
        const w = parseFloat(weight);
        const h = parseFloat(height);

        if (!w || !h || w <= 0 || h <= 0) {
            return null;
        }

        const heightInMeters = h / 100; // Đổi cm sang mét
        const bmi = w / (heightInMeters * heightInMeters);

        return bmi.toFixed(1); // Trả về BMI, làm tròn 1 chữ số thập phân
    }

    // --- 2. Code cho trang `Health.html` (Nút Lưu) (Giữ nguyên) ---
    const saveButton = document.querySelector(".btn-save");

    if (saveButton) {
        saveButton.addEventListener("click", (event) => {
            event.preventDefault();

            // Lấy giá trị từ các ô input (thêm ? để tránh lỗi nếu không tìm thấy)
            const height = document.getElementById("input-height")?.value;
            const weight = document.getElementById("input-weight")?.value;
            const bp = document.getElementById("input-bp")?.value;
            const heart = document.getElementById("input-heart")?.value;
            const glucose = document.getElementById("input-glucose")?.value;

            // Lưu vào localStorage
            if (height) localStorage.setItem("health_height", height);
            if (weight) localStorage.setItem("health_weight", weight);
            if (bp) localStorage.setItem("health_bp", bp);
            if (heart) localStorage.setItem("health_heart", heart);
            if (glucose) localStorage.setItem("health_glucose", glucose);

            // Luôn chuyển hướng về trang SỨC KHỎE (hiển thị) sau khi lưu
            window.location.href = "Health.html";
        });
    }

    // --- 3. Code cho trang `suc-khoe.html` (Nút Chỉnh sửa) (Giữ nguyên) ---
    // (Đã sửa lỗi querySelector1 và preventDefault1 từ tệp gốc của bạn)
    const changeButton = document.querySelector(".btn-change");

    if (changeButton) {
        changeButton.addEventListener("click", (event) => {
            event.preventDefault();
            window.location.href = "Health.html"; // Chuyển đến trang chỉnh sửa
        });
    }

    // --- 4. Code TỰ ĐỘNG TẢI DỮ LIỆU cho trang `suc-khoe.html` (Giữ nguyên) ---
    const displayHeightEl = document.getElementById("display-height");

    if (displayHeightEl) { // Kiểm tra xem có ở trang suc-khoe.html không

        // Lấy dữ liệu từ localStorage
        const height = localStorage.getItem("health_height");
        const weight = localStorage.getItem("health_weight");
        const bp = localStorage.getItem("health_bp");
        const heart = localStorage.getItem("health_heart");
        const glucose = localStorage.getItem("health_glucose");

        // Cập nhật nội dung (như cũ)
        if (height) displayHeightEl.textContent = height;
        if (weight) document.getElementById("display-weight").textContent = weight;
        if (bp) document.getElementById("display-bp").textContent = bp;
        if (heart) document.getElementById("display-heart").textContent = heart;
        if (glucose) document.getElementById("display-glucose").textContent = glucose;

        // Tính và cập nhật BMI (như cũ)
        const bmi = calculateBMI(weight, height);

        if (bmi) {
            const bmiHeaderEl = document.getElementById("display-bmi-header");
            const bmiCardEl = document.getElementById("display-bmi-card");

            if (bmiHeaderEl) bmiHeaderEl.textContent = bmi;
            if (bmiCardEl) bmiCardEl.textContent = bmi;
        }
    }
});