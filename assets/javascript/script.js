// Hero slideshow functionality
const slides = document.querySelectorAll(".hero__slide");
const indicators = document.querySelectorAll(".hero__indicator");
let currentSlide = 0;
const slideInterval = 5000; // Change slide every 5 seconds

function showSlide(index) {
  // Remove active class from all slides and indicators
  slides.forEach((slide) => slide.classList.remove("hero__slide--active"));
  indicators.forEach((indicator) =>
    indicator.classList.remove("hero__indicator--active")
  );

  // Add active class to current slide and indicator
  slides[index].classList.add("hero__slide--active");
  indicators[index].classList.add("hero__indicator--active");
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
const menuItems = document.querySelectorAll(".leftnav__link");
menuItems.forEach((item) => {
  if (item.getAttribute("href") === "#") {
    item.addEventListener("click", (e) => {
      e.preventDefault();

      // Cập nhật active class
      menuItems.forEach((i) => i.classList.remove("leftnav__link--active"));
      item.classList.add("leftnav__link--active");
    });
  }
});

// ===== CAROUSEL =====
const carouselGroups = document.querySelectorAll(".carousel__group");
const carouselDots = document.querySelectorAll(".carousel__dot");
const prevBtn = document.querySelector(".carousel__button--prev");
const nextBtn = document.querySelector(".carousel__button--next");

let currentGroup = 0;
const totalGroups = carouselGroups.length;
let autoSlideTimer2;

function showGroup(index) {
  // Ẩn tất cả các nhóm
  carouselGroups.forEach((group) => {
    group.classList.remove("carousel__group--active");
  });

  // Hiển thị nhóm hiện tại
  carouselGroups[index].classList.add("carousel__group--active");

  // Cập nhật dots
  carouselDots.forEach((dot) => dot.classList.remove("carousel__dot--active"));
  if (carouselDots[index])
    carouselDots[index].classList.add("carousel__dot--active");

  // Cập nhật nút điều hướng
  if (prevBtn && nextBtn) {
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === totalGroups - 1;
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
if (nextBtn && prevBtn) {
  nextBtn.addEventListener("click", () => {
    nextGroup();
    resetAutoSlide2();
  });
  prevBtn.addEventListener("click", () => {
    prevGroup();
    resetAutoSlide2();
  });
}

if (carouselDots.length > 0) {
  carouselDots.forEach((dot, i) => {
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
