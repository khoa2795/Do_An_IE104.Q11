// health-data-loader.js - Load dữ liệu sức khỏe theo user

(function () {
  // ===== HÀM LẤY THÔNG TIN USER HIỆN TẠI =====
  function getCurrentUser() {
    const userSession = sessionStorage.getItem("currentUser");
    if (!userSession) return null;
    return JSON.parse(userSession);
  }

  // ===== HÀM FETCH DỮ LIỆU SỨC KHỎE TỪ JSON =====
  async function fetchHealthData(user) {
    try {
      let loader;

      if (
        window.DataCache &&
        typeof window.DataCache.fetchJSON === "function"
      ) {
        loader = window.DataCache.fetchJSON("/data/health-data.json", {
          cacheKey: "health-data",
          ttl: 1000 * 60 * 5,
        });
      } else {
        loader = fetch("/data/health-data.json").then(function (response) {
          if (!response.ok) {
            throw new Error("Không thể tải dữ liệu sức khỏe");
          }
          return response.json();
        });
      }

      const seedHealthData = (await loader) || [];
      const customHealthData = getCustomHealthProfiles();
      const mergedHealthData = mergeHealthProfiles(
        seedHealthData,
        customHealthData
      );

      const userId = user ? user.id : null;
      const username =
        user && user.username ? user.username.toLowerCase() : null;

      const userData = mergedHealthData.find((data) => {
        if (!data) return false;
        if (userId && data.userId === userId) return true;
        if (username && (data.username || "").toLowerCase() === username) {
          return true;
        }
        return false;
      });

      if (!userData) {
        console.warn(`Không tìm thấy dữ liệu sức khỏe cho userId: ${userId}`);
        return null;
      }

      return userData;
    } catch (error) {
      console.error("Lỗi khi load dữ liệu sức khỏe:", error);
      return null;
    }
  }

  function getCustomHealthProfiles() {
    try {
      const stored = localStorage.getItem("customHealthProfiles");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn("Không thể đọc customHealthProfiles", error);
      return [];
    }
  }

  function mergeHealthProfiles(baseProfiles, customProfiles) {
    const result = Array.isArray(baseProfiles) ? [...baseProfiles] : [];
    if (!Array.isArray(customProfiles) || customProfiles.length === 0) {
      return result;
    }

    customProfiles.forEach((profile) => {
      if (!profile) return;
      const idx = result.findIndex((item) => {
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
        result[idx] = {
          ...result[idx],
          ...profile,
          personalInfo: {
            ...(result[idx].personalInfo || {}),
            ...(profile.personalInfo || {}),
          },
          medicalHistory: {
            ...(result[idx].medicalHistory || {}),
            ...(profile.medicalHistory || {}),
          },
          notes: {
            ...(result[idx].notes || {}),
            ...(profile.notes || {}),
          },
        };
      } else {
        result.push(profile);
      }
    });

    return result;
  }

  // ===== HÀM TÍNH BMI =====
  function calculateBMI(weight, height) {
    if (!weight || !height || weight <= 0 || height <= 0) return null;
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  }

  // ===== HÀM CẬP NHẬT GIAO DIỆN - THÔNG TIN CÁ NHÂN =====
  function updatePersonalInfo(data) {
    const { personalInfo, fullname, notes } = data;

    // Cập nhật header
    const titleEl = document.querySelector(".header-left .title h2");
    if (titleEl) titleEl.textContent = fullname;

    const headerRightEl = document.querySelector(".header-right");
    if (headerRightEl) {
      const bmi = calculateBMI(personalInfo.weight, personalInfo.height);
      headerRightEl.innerHTML = `
        <p>Tuổi: <b>${
          personalInfo.age
        }</b> &nbsp; Giới tính: <b class="highlight">${
        personalInfo.gender
      }</b> &nbsp; Chỉ số BMI: <b class="highlight">${bmi || "N/A"}</b></p>
        <p>Chế độ ăn uống: <b class="highlight">${
          personalInfo.diet
        }</b> &nbsp; Nhóm máu: <b class="highlight">${
        personalInfo.bloodGroup
      }</b></p>
      `;
    }

    // Cập nhật các chỉ số sức khỏe
    const updates = {
      "display-height": personalInfo.height,
      "display-weight": personalInfo.weight,
      "display-bp": personalInfo.bloodPressure,
      "display-heart": personalInfo.heartRate,
      "display-glucose": personalInfo.glucose,
      "display-bmi-header": calculateBMI(
        personalInfo.weight,
        personalInfo.height
      ),
      "display-bmi-card": calculateBMI(
        personalInfo.weight,
        personalInfo.height
      ),
    };

    Object.entries(updates).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el && value) el.textContent = value;
    });

    // Cập nhật phần "Lưu ý"
    updateNotes(notes);
  }

  // ===== HÀM CẬP NHẬT PHẦN LƯU Ý =====
  function updateNotes(notes) {
    const notesData = [
      { title: "Dị ứng thuốc", value: notes.drugAllergy },
      { title: "Thói quen sống", value: `Giấc ngủ: ${notes.sleepHours}` },
      { title: "Mục tiêu", value: notes.goal },
      { title: "Chế độ dinh dưỡng", value: notes.nutrition },
      { title: "Tình trạng tâm lý", value: notes.mentalHealth },
      { title: "Bệnh di truyền", value: notes.geneticDiseases },
      { title: "Đang điều trị bệnh lý", value: notes.currentTreatment },
    ];

    const notesColumn = document.querySelector(".notes-column");
    if (!notesColumn) return;

    const infoCards = notesColumn.querySelectorAll(
      ".info-card:not(.info-card-add)"
    );
    notesData.forEach((note, index) => {
      if (infoCards[index]) {
        const titleEl = infoCards[index].querySelector(".info-card-title");
        const contentEl = infoCards[index].querySelector(".info-card-content");
        if (titleEl) titleEl.textContent = note.title;
        if (contentEl) contentEl.textContent = note.value;
      }
    });
  }

  // ===== HÀM CẬP NHẬT TIỀN SỬ BỆNH TẬT =====
  function updateMedicalHistory(medicalHistory) {
    if (!medicalHistory) return;

    // 1. Cập nhật Bệnh đang mắc
    updateDiseaseList(medicalHistory.currentDiseases);

    // 2. Cập nhật Thuốc điều trị
    updateMedicationsList(medicalHistory.medications);

    // 3. Cập nhật Tiền sử phẫu thuật
    updateSurgeriesList(medicalHistory.surgeries);

    // 4. Cập nhật Tiền sử tiêm chủng
    updateVaccinationsList(medicalHistory.vaccinations);
  }

  // ===== CẬP NHẬT DANH SÁCH BỆNH =====
  function updateDiseaseList(diseases) {
    const container = document.querySelector(
      ".history-card:nth-child(1) .history-card-content"
    );
    if (!container) return;

    if (!diseases || diseases.length === 0) {
      container.innerHTML = '<p class="no-data">Chưa có dữ liệu</p>';
      return;
    }

    container.innerHTML = diseases
      .map(
        (disease) => `
      <div class="history-item">
        <div class="item-header">
          <strong>${disease.name}</strong>
          <div class="item-actions">
            <span>✏️</span> <span>🗑️</span>
          </div>
        </div>
        <div class="item-field"><span>Mức độ:</span> <strong>${disease.severity}</strong></div>
        <div class="item-field"><span>Thời gian mắc:</span> <strong>${disease.duration}</strong></div>
        <div class="item-field"><span>Biến chứng:</span> <strong>${disease.complications}</strong></div>
        <div class="item-field"><span>Tình trạng điều trị:</span> <strong>${disease.treatmentStatus}</strong></div>
      </div>
    `
      )
      .join("");
  }

  // ===== CẬP NHẬT DANH SÁCH THUỐC =====
  function updateMedicationsList(medications) {
    const container = document.querySelector(
      ".history-card:nth-child(2) .history-card-content"
    );
    if (!container) return;

    if (!medications || medications.length === 0) {
      container.innerHTML = '<p class="no-data">Chưa có dữ liệu</p>';
      return;
    }

    container.innerHTML = medications
      .map(
        (med) => `
      <div class="history-item">
        <div class="item-header">
          <strong>${med.name}</strong>
          <div class="item-actions">
            <span>✏️</span> <span>🗑️</span>
          </div>
        </div>
        <div class="item-field"><span>Thời gian sử dụng:</span> <strong>${med.duration}</strong></div>
        <div class="item-field"><span>Liều lượng:</span> <strong>${med.dosage}</strong></div>
        <div class="item-field"><span>BS. Kê đơn:</span> <strong>${med.prescribedBy}</strong></div>
      </div>
    `
      )
      .join("");
  }

  // ===== CẬP NHẬT DANH SÁCH PHẪU THUẬT =====
  function updateSurgeriesList(surgeries) {
    const container = document.querySelector(
      ".health-col:nth-child(2) .history-card:nth-child(1) .history-card-content"
    );
    if (!container) return;

    if (!surgeries || surgeries.length === 0) {
      container.innerHTML = '<p class="no-data">Chưa có dữ liệu</p>';
      return;
    }

    container.innerHTML = surgeries
      .map(
        (surgery) => `
      <div class="history-item">
        <div class="item-header">
          <strong>${surgery.name}</strong>
          <div class="item-actions">
            <span>✏️</span> <span>🗑️</span>
          </div>
        </div>
        <div class="item-field"><span>Thời gian:</span> <strong>${surgery.date}</strong></div>
        <div class="item-field"><span>Bệnh viện:</span> <strong>${surgery.hospital}</strong></div>
        <div class="item-field"><span>Biến chứng:</span> <strong>${surgery.complications}</strong></div>
        <div class="item-field"><span>Kết quả:</span> <strong>${surgery.result}</strong></div>
        <div class="item-field"><span>BS. Phẫu thuật:</span> <strong>${surgery.surgeon}</strong></div>
      </div>
    `
      )
      .join("");
  }

  // ===== CẬP NHẬT DANH SÁCH TIÊM CHỦNG =====
  function updateVaccinationsList(vaccinations) {
    const container = document.querySelector(
      ".health-col:nth-child(2) .history-card:nth-child(2) .history-card-content"
    );
    if (!container) return;

    if (!vaccinations || vaccinations.length === 0) {
      container.innerHTML = '<p class="no-data">Chưa có dữ liệu</p>';
      return;
    }

    container.innerHTML = vaccinations
      .map(
        (vac) => `
      <div class="history-item">
        <div class="item-header">
          <strong>${vac.name}</strong>
          <div class="item-actions">
            <span>✏️</span> <span>🗑️</span>
          </div>
        </div>
        <div class="item-field"><span>Ngày tiêm:</span> <strong>${vac.date}</strong></div>
        <div class="item-field"><span>Phản ứng:</span> <strong>${vac.reaction}</strong></div>
        <div class="item-field"><span>Biến chứng:</span> <strong>${vac.complications}</strong></div>
        <div class="item-field"><span>Kết quả:</span> <strong>${vac.result}</strong></div>
      </div>
    `
      )
      .join("");
  }

  // ===== HÀM KHỞI TẠO - LOAD DỮ LIỆU =====
  async function init() {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      return;
    }

    const healthData = await fetchHealthData(currentUser);

    if (!healthData) {
      console.warn("⚠️ Không có dữ liệu sức khỏe");
      return;
    }

    // Cập nhật giao diện dựa vào trang hiện tại
    const currentPage = window.location.pathname.split("/").pop();

    if (currentPage === "suc-khoe.html" || currentPage === "Health.html") {
      updatePersonalInfo(healthData);
    }

    if (currentPage === "tien-su-benh.html") {
      updatePersonalInfo(healthData); // Vẫn cần update header
      updateMedicalHistory(healthData.medicalHistory);
    }
  }

  // ===== CHỜ DOM LOAD XONG =====
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

  // Export functions để có thể sử dụng ở nơi khác
  window.HealthDataLoader = {
    fetchHealthData,
    getCurrentUser,
    calculateBMI,
  };
})();
