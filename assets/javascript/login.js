// login.js
const loginBtn = document.getElementById("loginBtn");
const userDropdown = document.getElementById("userDropdown");
const logoutDropdownBtn = document.getElementById("logoutDropdownBtn");
const loginModal = document.getElementById("loginModal");
const loginForm = document.querySelector(".login-form");
const closeButtons = document.querySelectorAll(".close");
const registerModal = document.getElementById("registerModalNew");
const openRegisterBtn = document.getElementById("openRegisterFromLogin");
const backToLoginBtn = document.querySelector(".back-to-login-btn");
const registerForms = Array.from(
  document.querySelectorAll("#registerModalNew .register-form-new")
);
const progressSteps = document.querySelectorAll(
  "#registerModalNew .progress-step"
);
const progressFill = document.getElementById("progressFill");
const stepIndicator = document.querySelector(
  "#registerModalNew .step-indicator"
);
const completeRegisterBtn = document.getElementById("completeRegisterBtn");
let seedUsersCache = [];

fetch("/data/users.json")
  .then((response) => response.json())
  .then((data) => {
    seedUsersCache = Array.isArray(data) ? data : [];
  })
  .catch((error) => {
    console.warn("Không thể tải danh sách người dùng mặc định:", error);
  });

// Biến lưu trạng thái đăng nhập
let isLoggedIn = false;
let currentUser = null;
let registerStepIndex = 0;
const registerDraft = {
  account: {},
  personal: {},
  health: {},
};

function enforceNonNegativeNumberInputs() {
  const selectorList = [
    'input[data-non-negative="true"]',
    "#registerAge",
    "#registerHeight",
    "#registerWeight",
    "#registerHeartRate",
    "#registerGlucose",
    "#registerSleepHours",
  ];

  const inputs = selectorList
    .map((selector) => Array.from(document.querySelectorAll(selector)))
    .flat()
    .filter(Boolean);

  if (inputs.length === 0) return;

  const uniqueInputs = Array.from(new Set(inputs));

  uniqueInputs.forEach((input) => {
    if (input.dataset.nonNegativeBound === "true") {
      return;
    }
    input.dataset.nonNegativeBound = "true";

    const minValue = input.hasAttribute("min")
      ? Number(input.getAttribute("min"))
      : 0;

    const clampValue = () => {
      if (input.value === "" || input.value === "-") {
        if (input.value === "-") input.value = "";
        return;
      }

      const numeric = Number(input.value);
      if (Number.isNaN(numeric)) {
        input.value = "";
        return;
      }

      if (!Number.isNaN(minValue) && numeric < minValue) {
        input.value = minValue > 0 ? String(minValue) : "";
        return;
      }

      input.value = numeric.toString();
    };

    input.addEventListener("keydown", (event) => {
      if (
        event.key === "-" ||
        event.key === "Subtract" ||
        event.key === "e" ||
        event.key === "E"
      ) {
        event.preventDefault();
      }
    });

    input.addEventListener("wheel", (event) => {
      event.preventDefault();
    });

    input.addEventListener("input", () => {
      if (!input.value) return;
      if (input.value.includes("-")) {
        input.value = input.value.replace(/-/g, "");
      }
      if (/e|E/.test(input.value)) {
        input.value = input.value.replace(/[eE]/g, "");
      }
      clampValue();
    });

    input.addEventListener("change", clampValue);
    input.addEventListener("blur", clampValue);
  });
}

function markProtectedContentAsVerified() {
  const protectedBlocks = document.querySelectorAll(".main-content");
  protectedBlocks.forEach((block) => block.classList.add("auth-verified"));
}

function emitAuthStateChange(status) {
  try {
    document.dispatchEvent(
      new CustomEvent("auth:state-changed", {
        detail: {
          status,
          user: currentUser,
          timestamp: Date.now(),
        },
      })
    );
  } catch (error) {
    console.warn("Không thể phát sự kiện auth:state-changed", error);
  }
}

// ===== ĐỌC FILE JSON VÀ XÁC THỰC ĐĂNG NHẬP =====
async function authenticateUser(username, password) {
  try {
    let users = Array.isArray(seedUsersCache) ? seedUsersCache : [];

    if (users.length === 0) {
      const response = await fetch("/data/users.json");
      const data = await response.json();
      users = Array.isArray(data) ? data : [];
      seedUsersCache = users;
    }
    const customUsers = getCustomUsers();
    const mergedUsers = [...users, ...customUsers];

    const user = mergedUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      const userSession = {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
      };

      // ✅ SỬ DỤNG sessionStorage THAY VÌ localStorage
      sessionStorage.setItem("currentUser", JSON.stringify(userSession));
      return { success: true, user: userSession };
    } else {
      return {
        success: false,
        message: "Tên đăng nhập hoặc mật khẩu không đúng",
      };
    }
  } catch (error) {
    console.error("Lỗi khi đọc file users.json:", error);
    return { success: false, message: "Lỗi hệ thống, vui lòng thử lại sau" };
  }
}

// ===== KIỂM TRA SESSION KHI LOAD TRANG =====
function checkUserSession() {
  const userSession = sessionStorage.getItem("currentUser");
  if (userSession) {
    currentUser = JSON.parse(userSession);
    isLoggedIn = true;
    updateLoginButton();
    markProtectedContentAsVerified();
  }

  deliverQueuedAuthToast();
}

// ===== HÀM CẬP NHẬT TRẠNG THÁI NÚT ĐĂNG NHẬP =====
function updateLoginButton() {
  if (!loginBtn) {
    return;
  }
  if (isLoggedIn && currentUser) {
    loginBtn.textContent = currentUser.username;
    loginBtn.classList.add("logged-in");
  } else {
    loginBtn.textContent = "Đăng Nhập";
    loginBtn.classList.remove("logged-in");
    if (userDropdown) {
      userDropdown.style.display = "none";
    }
  }
}

// ===== XỬ LÝ CLICK NÚT ĐĂNG NHẬP =====
if (loginBtn) {
  loginBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    if (isLoggedIn) {
      if (userDropdown && userDropdown.style.display === "block") {
        userDropdown.style.display = "none";
      } else if (userDropdown) {
        userDropdown.style.display = "block";
      }
    } else if (loginModal) {
      loginModal.style.display = "block";
    }
  });
}

// ===== XỬ LÝ NÚT ĐĂNG XUẤT TRONG DROPDOWN =====
if (logoutDropdownBtn) {
  logoutDropdownBtn.addEventListener("click", (e) => {
    e.preventDefault();

    //  XÓA TỪ sessionStorage
    sessionStorage.removeItem("currentUser");

    isLoggedIn = false;
    currentUser = null;
    updateLoginButton();
    emitAuthStateChange("logged-out");

    if (loginForm) {
      loginForm.reset();
    }

    // RELOAD TRANG để hiển thị overlay yêu cầu đăng nhập
    location.reload();
  });
}

// ===== ĐÓNG DROPDOWN KHI CLICK NGOÀI =====
document.addEventListener("click", (e) => {
  if (
    userDropdown &&
    !userDropdown.contains(e.target) &&
    e.target !== loginBtn
  ) {
    userDropdown.style.display = "none";
  }
});

// ===== ĐÓNG MODAL KHI CLICK DẤU X =====
closeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const modal = button.closest(".modal");
    if (modal) {
      modal.style.display = "none";
      if (modal === registerModal) {
        resetRegisterFlow();
      }
    } else {
      loginModal.style.display = "none";
    }
  });
});

if (openRegisterBtn) {
  openRegisterBtn.addEventListener("click", () => {
    openRegisterFlow();
  });
}

if (backToLoginBtn) {
  backToLoginBtn.addEventListener("click", () => {
    if (registerModal) {
      registerModal.style.display = "none";
    }
    resetRegisterFlow();
    loginModal.style.display = "block";
  });
}

document.querySelectorAll("#registerModalNew .next-btn").forEach((btn) => {
  btn.addEventListener("click", (event) => {
    const targetStep = parseInt(event.currentTarget.dataset.nextStep, 10) - 1;
    handleRegisterNext(targetStep);
  });
});

document.querySelectorAll("#registerModalNew .prev-btn").forEach((btn) => {
  btn.addEventListener("click", (event) => {
    const targetStep = parseInt(event.currentTarget.dataset.prevStep, 10) - 1;
    handleRegisterPrev(targetStep);
  });
});

if (registerForms.length > 0) {
  const lastForm = registerForms[registerForms.length - 1];
  lastForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleRegisterSubmit();
  });
}

function openRegisterFlow() {
  if (!registerModal) return;
  loginModal.style.display = "none";
  registerModal.style.display = "block";
  enforceNonNegativeNumberInputs();
  resetRegisterFlow();
}

function resetRegisterFlow() {
  registerStepIndex = 0;
  registerDraft.account = {};
  registerDraft.personal = {};
  registerDraft.health = {};
  registerForms.forEach((form) => form.reset());
  updateRegisterStep();
}

function updateRegisterStep() {
  if (registerForms.length === 0) return;
  registerForms.forEach((form, index) => {
    if (index === registerStepIndex) {
      form.classList.add("active");
    } else {
      form.classList.remove("active");
    }
  });

  const currentStepNumber = registerStepIndex + 1;
  if (stepIndicator) {
    stepIndicator.textContent = `${currentStepNumber}/${registerForms.length}`;
  }

  progressSteps.forEach((step) => {
    const stepValue = parseInt(step.dataset.step, 10);
    step.classList.toggle("active", stepValue === currentStepNumber);
    step.classList.toggle("completed", stepValue < currentStepNumber);
  });

  if (progressFill && registerForms.length > 1) {
    const progressPercent =
      (registerStepIndex / (registerForms.length - 1)) * 100;
    progressFill.style.width = `${progressPercent}%`;
  }

  hydrateRegisterStep(registerStepIndex);
}

function handleRegisterNext(targetIndex) {
  if (registerForms.length === 0) return;
  if (!validateRegisterStep(registerStepIndex)) return;
  persistRegisterDraft(registerStepIndex);
  const safeTarget = Number.isInteger(targetIndex)
    ? targetIndex
    : registerStepIndex + 1;
  registerStepIndex = Math.min(safeTarget, registerForms.length - 1);
  updateRegisterStep();
}

function handleRegisterPrev(targetIndex) {
  if (registerForms.length === 0) return;
  persistRegisterDraft(registerStepIndex);
  const safeTarget = Number.isInteger(targetIndex)
    ? targetIndex
    : registerStepIndex - 1;
  registerStepIndex = Math.max(safeTarget, 0);
  updateRegisterStep();
}

function persistRegisterDraft(stepIndex) {
  switch (stepIndex) {
    case 0:
      registerDraft.account = {
        username: document.getElementById("registerUsername").value.trim(),
        email: document.getElementById("registerEmail").value.trim(),
        phone: document.getElementById("registerPhone").value.trim(),
        password: document.getElementById("registerPassword").value,
        confirmPassword: document.getElementById("registerConfirmPassword")
          .value,
      };
      break;
    case 1:
      registerDraft.personal = {
        fullname: document.getElementById("registerFullname").value.trim(),
        age: toNumber(document.getElementById("registerAge").value),
        gender: document.getElementById("registerGender").value,
        diet: document.getElementById("registerDiet").value,
        bloodGroup: document.getElementById("registerBloodGroup").value,
        location: document.getElementById("registerLocation").value.trim(),
        height: toNumber(document.getElementById("registerHeight").value),
        weight: toNumber(document.getElementById("registerWeight").value),
      };
      break;
    case 2:
      registerDraft.health = {
        bloodPressure: document
          .getElementById("registerBloodPressure")
          .value.trim(),
        heartRate: toNumber(document.getElementById("registerHeartRate").value),
        glucose: toNumber(document.getElementById("registerGlucose").value),
        goal: document.getElementById("registerGoal").value.trim(),
        chronicDiseases: document
          .getElementById("registerChronicDiseases")
          .value.trim(),
        allergies: document.getElementById("registerAllergies").value.trim(),
        sleepHours: toNumber(
          document.getElementById("registerSleepHours").value
        ),
        mentalHealth: document
          .getElementById("registerMentalHealth")
          .value.trim(),
        treatment: document.getElementById("registerTreatment").value.trim(),
      };
      break;
    default:
      break;
  }
}

function hydrateRegisterStep(stepIndex) {
  switch (stepIndex) {
    case 0: {
      const account = registerDraft.account;
      if (!account) return;
      document.getElementById("registerUsername").value =
        account.username || "";
      document.getElementById("registerEmail").value = account.email || "";
      document.getElementById("registerPhone").value = account.phone || "";
      document.getElementById("registerPassword").value =
        account.password || "";
      document.getElementById("registerConfirmPassword").value =
        account.confirmPassword || "";
      break;
    }
    case 1: {
      const personal = registerDraft.personal;
      if (!personal) return;
      document.getElementById("registerFullname").value =
        personal.fullname || "";
      document.getElementById("registerAge").value = personal.age || "";
      document.getElementById("registerGender").value = personal.gender || "";
      document.getElementById("registerDiet").value = personal.diet || "";
      document.getElementById("registerBloodGroup").value =
        personal.bloodGroup || "";
      document.getElementById("registerLocation").value =
        personal.location || "";
      document.getElementById("registerHeight").value = personal.height || "";
      document.getElementById("registerWeight").value = personal.weight || "";
      break;
    }
    case 2: {
      const health = registerDraft.health;
      if (!health) return;
      document.getElementById("registerBloodPressure").value =
        health.bloodPressure || "";
      document.getElementById("registerHeartRate").value =
        health.heartRate || "";
      document.getElementById("registerGlucose").value = health.glucose || "";
      document.getElementById("registerGoal").value = health.goal || "";
      document.getElementById("registerChronicDiseases").value =
        health.chronicDiseases || "";
      document.getElementById("registerAllergies").value =
        health.allergies || "";
      document.getElementById("registerSleepHours").value =
        health.sleepHours || "";
      document.getElementById("registerMentalHealth").value =
        health.mentalHealth || "";
      document.getElementById("registerTreatment").value =
        health.treatment || "";
      break;
    }
    default:
      break;
  }
}

function validateRegisterStep(stepIndex) {
  if (stepIndex === 0) {
    const username = document.getElementById("registerUsername").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const phone = document.getElementById("registerPhone").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById(
      "registerConfirmPassword"
    ).value;

    if (!username || !email || !phone || !password || !confirmPassword) {
      alert("Vui lòng điền đầy đủ thông tin tài khoản");
      return false;
    }

    if (username.length < 4) {
      alert("Tên đăng nhập phải từ 4 ký tự trở lên");
      return false;
    }

    if (!email.includes("@")) {
      alert("Email không hợp lệ");
      return false;
    }

    if (password.length < 6) {
      alert("Mật khẩu phải từ 6 ký tự trở lên");
      return false;
    }

    if (password !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp");
      return false;
    }

    if (isUsernameTaken(username)) {
      alert("Tên đăng nhập đã tồn tại");
      return false;
    }

    if (isEmailTaken(email)) {
      alert("Email đã được sử dụng");
      return false;
    }

    return true;
  }

  if (stepIndex === 1) {
    const fullname = document.getElementById("registerFullname").value.trim();
    const age = Number(document.getElementById("registerAge").value);
    const gender = document.getElementById("registerGender").value;
    const height = Number(document.getElementById("registerHeight").value);
    const weight = Number(document.getElementById("registerWeight").value);

    if (!fullname || !gender) {
      alert("Vui lòng điền đầy đủ thông tin cá nhân");
      return false;
    }

    if (!Number.isFinite(age) || age <= 0) {
      alert("Tuổi không hợp lệ");
      return false;
    }

    if (!Number.isFinite(height) || height <= 0) {
      alert("Chiều cao phải lớn hơn 0");
      return false;
    }

    if (!Number.isFinite(weight) || weight <= 0) {
      alert("Cân nặng phải lớn hơn 0");
      return false;
    }

    return true;
  }

  if (stepIndex === 2) {
    const bloodPressure = document
      .getElementById("registerBloodPressure")
      .value.trim();
    const heartRate = Number(
      document.getElementById("registerHeartRate").value
    );
    const glucoseRaw = document.getElementById("registerGlucose").value;
    const sleepHoursRaw = document.getElementById("registerSleepHours").value;
    const glucose = glucoseRaw === "" ? null : Number(glucoseRaw);
    const sleepHours = sleepHoursRaw === "" ? null : Number(sleepHoursRaw);

    if (!bloodPressure) {
      alert("Vui lòng nhập huyết áp gần nhất");
      return false;
    }

    if (!Number.isFinite(heartRate) || heartRate <= 0) {
      alert("Nhịp tim không hợp lệ");
      return false;
    }

    if (glucose !== null && (!Number.isFinite(glucose) || glucose < 0)) {
      alert("Đường huyết phải là số không âm");
      return false;
    }

    if (
      sleepHours !== null &&
      (!Number.isFinite(sleepHours) || sleepHours < 0)
    ) {
      alert("Giấc ngủ trung bình phải là số không âm");
      return false;
    }

    return true;
  }

  return true;
}

function isUsernameTaken(username) {
  const normalized = username.toLowerCase();
  const customUsers = getCustomUsers();
  const allUsers = [...seedUsersCache, ...customUsers];
  return allUsers.some(
    (user) => (user.username || "").toLowerCase() === normalized
  );
}

function isEmailTaken(email) {
  const normalized = email.toLowerCase();
  const customUsers = getCustomUsers();
  const allUsers = [...seedUsersCache, ...customUsers];
  return allUsers.some(
    (user) => (user.email || "").toLowerCase() === normalized
  );
}

function getCustomUsers() {
  try {
    const stored = localStorage.getItem("customUsers");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn("Không thể đọc customUsers từ localStorage", error);
    return [];
  }
}

function saveCustomUsers(users) {
  localStorage.setItem("customUsers", JSON.stringify(users));
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

function saveCustomHealthProfiles(profiles) {
  localStorage.setItem("customHealthProfiles", JSON.stringify(profiles));
}

function storeHealthProfile(userId, profile) {
  const profiles = getCustomHealthProfiles();
  const existingIndex = profiles.findIndex(
    (p) => p.userId === userId || p.username === profile.username
  );
  if (existingIndex >= 0) {
    profiles[existingIndex] = profile;
  } else {
    profiles.push(profile);
  }
  saveCustomHealthProfiles(profiles);
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

function saveCustomCaloriesProfiles(profiles) {
  localStorage.setItem("customCaloriesProfiles", JSON.stringify(profiles));
}

function storeCaloriesProfile(profile) {
  if (!profile || !profile.userId) return;
  const profiles = getCustomCaloriesProfiles();
  const existingIndex = profiles.findIndex(
    (item) =>
      item.userId === profile.userId ||
      (item.username &&
        profile.username &&
        item.username.toLowerCase() === profile.username.toLowerCase())
  );
  if (existingIndex >= 0) {
    profiles[existingIndex] = profile;
  } else {
    profiles.push(profile);
  }
  saveCustomCaloriesProfiles(profiles);
}

function buildCaloriesProfile(user, personal, health) {
  const activityLevel = determineActivityLevel(health.goal);
  const dailyTarget = calculateDailyTargets(personal, health, activityLevel);
  return {
    userId: user.id,
    username: user.username,
    fullname: personal.fullname,
    userInfo: {
      age: personal.age,
      height: personal.height,
      weight: personal.weight,
      activityLevel,
      goal: formatFallback(health.goal, "Duy trì cân nặng"),
      diet: formatFallback(personal.diet, "Cân bằng"),
    },
    dailyTarget,
    todayIntake: {
      calories: 0,
      carbs: 0,
      protein: 0,
      fat: 0,
      fiber: 0,
      lastUpdated: new Date().toISOString(),
    },
    meals: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    },
    weeklyData: buildWeeklyCaloriesData(dailyTarget.calories),
    monthlyStats: {
      month: new Date().toISOString().slice(0, 7),
      totalCalories: 0,
      targetCalories: dailyTarget.calories * 30,
      deficit: 0,
      daysOnTrack: 0,
      daysUnder: 0,
      daysOver: 0,
    },
    recentFoods: [],
    favoriteFoods: [],
    myFoods: [],
  };
}

function determineActivityLevel(goalText) {
  const normalized = (goalText || "").toLowerCase();
  if (normalized.includes("tăng") || normalized.includes("gain")) {
    return 3;
  }
  if (normalized.includes("giảm") || normalized.includes("giam")) {
    return 2;
  }
  return 2;
}

function calculateDailyTargets(personal, health, activityLevel) {
  const weight = personal.weight || 60;
  const height = personal.height || 165;
  const age = personal.age || 28;
  const gender = (personal.gender || "Nam").toLowerCase();
  const bmr =
    10 * weight + 6.25 * height - 5 * age + (gender === "nữ" ? -161 : 5);
  const multiplierMap = { 1: 1.2, 2: 1.375, 3: 1.55, 4: 1.725 };
  const maintenance = Math.round(bmr * (multiplierMap[activityLevel] || 1.375));
  const normalizedGoal = (health.goal || "").toLowerCase();
  let calories = maintenance;
  if (normalizedGoal.includes("giảm") || normalizedGoal.includes("giam")) {
    calories = Math.max(maintenance - 300, 1200);
  } else if (
    normalizedGoal.includes("tăng") ||
    normalizedGoal.includes("gain") ||
    normalizedGoal.includes("bulk")
  ) {
    calories = maintenance + 250;
  }

  const protein = Math.max(60, Math.round(weight * 1.6));
  const fat = Math.max(40, Math.round((calories * 0.25) / 9));
  const carbs = Math.max(
    130,
    Math.round((calories - (protein * 4 + fat * 9)) / 4)
  );
  const fiber = 28;

  return {
    calories,
    carbs,
    protein,
    fat,
    fiber,
  };
}

function buildWeeklyCaloriesData(targetCalories) {
  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const calories = Math.round(targetCalories * (0.85 + Math.random() * 0.1));
    let status = "ok";
    if (calories < targetCalories * 0.8) status = "under";
    if (calories > targetCalories * 1.05) status = "over";
    return {
      date: date.toISOString().split("T")[0],
      calories,
      target: targetCalories,
      status,
    };
  });
}

function calculateBMI(heightCm, weightKg) {
  if (!heightCm || !weightKg) return null;
  const heightMeters = heightCm / 100;
  if (heightMeters === 0) return null;
  return Number((weightKg / (heightMeters * heightMeters)).toFixed(1));
}

function toNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildMedicalHistory(chronicDiseasesText) {
  const diseases = splitMultiLine(chronicDiseasesText).map((name) => ({
    name,
    severity: "Chưa cập nhật",
    duration: "Đang cập nhật",
    complications: "Đang cập nhật",
    treatmentStatus: "Đang cập nhật",
  }));

  return {
    currentDiseases: diseases,
    medications: [],
    surgeries: [],
    vaccinations: [],
  };
}

function buildNotes(personal, health) {
  return {
    drugAllergy: formatFallback(health.allergies, "Không"),
    sleepHours: formatSleepHours(health.sleepHours),
    goal: formatFallback(health.goal, "Chưa cập nhật"),
    nutrition: formatFallback(personal.diet, "Chưa cập nhật"),
    mentalHealth: formatFallback(health.mentalHealth, "Chưa cập nhật"),
    geneticDiseases: "Chưa cập nhật",
    currentTreatment: formatFallback(health.treatment, "Không"),
  };
}

function splitMultiLine(value) {
  if (!value) return [];
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatFallback(value, fallback) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return value;
}

function formatSleepHours(hours) {
  if (!hours) return "Chưa cập nhật";
  const numeric = Number(hours);
  if (!Number.isFinite(numeric)) {
    return `${hours}`;
  }
  return `${numeric}h`;
}

function handleRegisterSubmit() {
  if (!validateRegisterStep(registerForms.length - 1)) return;
  persistRegisterDraft(registerStepIndex);

  const account = registerDraft.account;
  const personal = registerDraft.personal;
  const health = registerDraft.health;

  const newUser = {
    id: Date.now(),
    username: account.username,
    email: account.email,
    phone: account.phone,
    password: account.password,
    fullname: personal.fullname,
    gender: personal.gender,
    age: personal.age,
    createdAt: new Date().toISOString(),
  };

  const healthProfile = {
    userId: newUser.id,
    username: account.username,
    fullname: personal.fullname,
    personalInfo: {
      age: personal.age,
      gender: personal.gender,
      bloodGroup: personal.bloodGroup || "Chưa cập nhật",
      diet: personal.diet || "Chưa cập nhật",
      height: personal.height,
      weight: personal.weight,
      bloodPressure: health.bloodPressure || "Chưa cập nhật",
      heartRate: health.heartRate || null,
      glucose: health.glucose || null,
      bmi: calculateBMI(personal.height, personal.weight),
      location: personal.location || "",
    },
    medicalHistory: buildMedicalHistory(health.chronicDiseases),
    notes: buildNotes(personal, health),
    updatedAt: new Date().toISOString(),
  };

  const submitBtn = completeRegisterBtn;
  const originalLabel = submitBtn ? submitBtn.textContent : "";
  if (submitBtn) {
    submitBtn.textContent = "Đang tạo tài khoản...";
    submitBtn.disabled = true;
  }

  setTimeout(() => {
    const users = getCustomUsers();
    users.push(newUser);
    saveCustomUsers(users);
    storeHealthProfile(newUser.id, healthProfile);
    storeCaloriesProfile(buildCaloriesProfile(newUser, personal, health));

    const userSession = {
      id: newUser.id,
      username: newUser.username,
      fullname: newUser.fullname,
      email: newUser.email,
    };

    sessionStorage.setItem("currentUser", JSON.stringify(userSession));
    currentUser = userSession;
    isLoggedIn = true;
    updateLoginButton();
    markProtectedContentAsVerified();

    if (submitBtn) {
      submitBtn.textContent = originalLabel;
      submitBtn.disabled = false;
    }
    if (registerModal) {
      registerModal.style.display = "none";
    }
    showAuthToast(`Đăng ký thành công, chào mừng ${newUser.fullname}!`);
    emitAuthStateChange("logged-in");
    resetRegisterFlow();
  }, 600);
}

function showAuthToast(message) {
  let toast = document.getElementById("authToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "authToast";
    toast.className = "auth-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.remove("auth-toast--visible");
  void toast.offsetWidth;
  toast.classList.add("auth-toast--visible");

  clearTimeout(showAuthToast.hideTimer);
  showAuthToast.hideTimer = setTimeout(() => {
    toast.classList.remove("auth-toast--visible");
  }, 3200);
}

function queueAuthToast(message) {
  if (!message) return;
  try {
    sessionStorage.setItem("authToastMessage", message);
  } catch (error) {
    console.warn("Không thể lưu thông báo:", error);
  }
}

function deliverQueuedAuthToast() {
  try {
    const message = sessionStorage.getItem("authToastMessage");
    if (!message) return;
    sessionStorage.removeItem("authToastMessage");
    showAuthToast(message);
  } catch (error) {
    console.warn("Không thể đọc thông báo:", error);
  }
}

// ===== XỬ LÝ FORM ĐĂNG NHẬP =====
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!username || !password) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const submitBtn = loginForm.querySelector(".submit-btn");
    const originalText = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) {
      submitBtn.textContent = "Đang đăng nhập...";
      submitBtn.disabled = true;
    }

    const result = await authenticateUser(username, password);

    if (submitBtn) {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }

    if (result.success) {
      isLoggedIn = true;
      currentUser = result.user;
      updateLoginButton();
      markProtectedContentAsVerified();
      if (loginModal) {
        loginModal.style.display = "none";
      }

      loginForm.reset();

      showAuthToast(`Chào mừng ${currentUser.fullname}!`);
      emitAuthStateChange("logged-in");
    } else {
      alert(result.message);
    }
  });
}

window.addEventListener("click", (e) => {
  if (e.target === loginModal) {
    loginModal.style.display = "none";
  }
  if (e.target === registerModal) {
    registerModal.style.display = "none";
    resetRegisterFlow();
  }
});

// ===== KHỞI TẠO =====
enforceNonNegativeNumberInputs();
checkUserSession();
updateLoginButton();
