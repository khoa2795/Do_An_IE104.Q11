// Slideshow functionality
const slides = document.querySelectorAll(".slide");
const indicators = document.querySelectorAll(".slide-indicators span");
let currentSlide = 0;
const slideInterval = 5000; // Change slide every 5 seconds

function showSlide(index) {
  // Remove active class from all slides and indicators
  slides.forEach((slide) => slide.classList.remove("active"));
  indicators.forEach((indicator) => indicator.classList.remove("active"));

  // Add active class to current slide and indicator
  slides[index].classList.add("active");
  indicators[index].classList.add("active");
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

// Add click event to indicators
indicators.forEach((indicator, index) => {
  indicator.addEventListener("click", () => {
    currentSlide = index;
    showSlide(currentSlide);
    resetInterval();
  });
});

// Start automatic slideshow
let slideTimer = setInterval(nextSlide, slideInterval);

// Reset interval when manually changing slides
function resetInterval() {
  clearInterval(slideTimer);
  slideTimer = setInterval(nextSlide, slideInterval);
}

// Menu item click handler
const menuItems = document.querySelectorAll(".menu-item a");
menuItems.forEach((item) => {
  if (item.getAttribute("href") === "#") {
    item.addEventListener("click", (e) => {
      e.preventDefault();

      // Cập nhật active class
      menuItems.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
    });
  }
});

// ===== Slide-box thứ 2 =====
const slideGroups = document.querySelectorAll(".slide-group");
const dots2 = document.querySelectorAll(".slide-dots .dot");
const prev2 = document.querySelector(".prev");
const next2 = document.querySelector(".next");

let currentGroup = 0;
const totalGroups = slideGroups.length;
let autoSlideTimer2;

function showGroup(index) {
  // Ẩn tất cả các nhóm
  slideGroups.forEach((group) => {
    group.classList.remove("active");
  });

  // Hiển thị nhóm hiện tại
  slideGroups[index].classList.add("active");

  // Cập nhật dots
  dots2.forEach((dot) => dot.classList.remove("active"));
  if (dots2[index]) dots2[index].classList.add("active");

  // Cập nhật nút điều hướng
  if (prev2 && next2) {
    prev2.disabled = index === 0;
    next2.disabled = index === totalGroups - 1;
  }
}

function nextGroup() {
  if (currentGroup < totalGroups - 1) {
    currentGroup++;
    showGroup(currentGroup);
  }
}

function prevGroup() {
  if (currentGroup > 0) {
    currentGroup--;
    showGroup(currentGroup);
  }
}

// Gắn sự kiện
if (next2 && prev2) {
  next2.addEventListener("click", () => {
    nextGroup();
    resetAutoSlide2();
  });
  prev2.addEventListener("click", () => {
    prevGroup();
    resetAutoSlide2();
  });
}

if (dots2.length > 0) {
  dots2.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      currentGroup = i;
      showGroup(currentGroup);
      resetAutoSlide2();
    });
  });
}

function startAutoSlide2() {
  autoSlideTimer2 = setInterval(() => {
    if (currentGroup < totalGroups - 1) {
      nextGroup();
    } else {
      currentGroup = 0;
      showGroup(currentGroup);
    }
  }, 5000);
}

function resetAutoSlide2() {
  clearInterval(autoSlideTimer2);
  startAutoSlide2();
}

// Khởi tạo
showGroup(0);
startAutoSlide2();
