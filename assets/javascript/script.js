// Slideshow functionality
const slides = document.querySelectorAll('.slide');
const indicators = document.querySelectorAll('.slide-indicators span');
let currentSlide = 0;
const slideInterval = 5000; // Change slide every 5 seconds

function showSlide(index) {
    // Remove active class from all slides and indicators
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    // Add active class to current slide and indicator
    slides[index].classList.add('active');
    indicators[index].classList.add('active');
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

// Add click event to indicators
indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
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
const menuItems = document.querySelectorAll('.menu-item a');
menuItems.forEach(item => {
    if (item.getAttribute('href') === '#') {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Cập nhật active class
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    }
});

const chatToggle = document.getElementById('chatToggle');
const chatBox = document.getElementById('chatBox');
const closeChat = document.getElementById('closeChat');

chatToggle.addEventListener('click', () => {
    chatBox.style.display = chatBox.style.display === 'flex' ? 'none' : 'flex';
});

closeChat.addEventListener('click', () => {
    chatBox.style.display = (chatBox.style.display === 'flex' || chatBox.style.display === 'block') ? 'none' : 'flex';
});

const chatBody = document.getElementById('chatBody');
const chatInput = document.querySelector('.chat-input input');
const sendButton = document.querySelector('.chat-input button');

sendButton.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});
function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  // ========== USER MESSAGE ==========
  const userRow = document.createElement('div');
  userRow.classList.add('message-row', 'user');

  const userMsg = document.createElement('div');
  userMsg.classList.add('message');
  userMsg.textContent = text;

  const userAvatar = document.createElement('img');
  userAvatar.classList.add('avatar');
  userAvatar.src = 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png';
  userAvatar.alt = 'User';

  // Append theo đúng thứ tự hiển thị của flex (row-reverse)
  // → vẫn append tin nhắn trước, avatar sau
  userRow.appendChild(userMsg);
  userRow.appendChild(userAvatar);
  chatBody.appendChild(userRow);

  chatInput.value = '';
  chatBody.scrollTop = chatBody.scrollHeight;

  // ========== BOT REPLY ==========
  setTimeout(() => {
    const botRow = document.createElement('div');
    botRow.classList.add('message-row', 'bot');

    const botAvatar = document.createElement('img');
    botAvatar.classList.add('avatar');
    botAvatar.src = 'https://cdn-icons-png.flaticon.com/512/4712/4712104.png';
    botAvatar.alt = 'Bot';

    const botMsg = document.createElement('div');
    botMsg.classList.add('message');
    botMsg.textContent = 'Bot: Tôi đã nhận được tin nhắn của bạn!';

    // append theo đúng hướng row (avatar trái, message phải)
    botRow.appendChild(botAvatar);
    botRow.appendChild(botMsg);
    chatBody.appendChild(botRow);
    chatBody.scrollTop = chatBody.scrollHeight;
  }, 700);
}



// ===== Slide-box thứ 2 =====
const slideGroups = document.querySelectorAll('.slide-group');
const dots2 = document.querySelectorAll('.slide-dots .dot');
const prev2 = document.querySelector('.prev');
const next2 = document.querySelector('.next');

let currentGroup = 0;
const totalGroups = slideGroups.length;
let autoSlideTimer2;

function showGroup(index) {
    // Ẩn tất cả các nhóm
    slideGroups.forEach(group => {
        group.classList.remove('active');
    });
    
    // Hiển thị nhóm hiện tại
    slideGroups[index].classList.add('active');
    
    // Cập nhật dots
    dots2.forEach(dot => dot.classList.remove('active'));
    if (dots2[index]) dots2[index].classList.add('actives');
    
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
    next2.addEventListener('click', () => {
        nextGroup();
        resetAutoSlide2();
    });
    prev2.addEventListener('click', () => {
        prevGroup();
        resetAutoSlide2();
    });
}

if (dots2.length > 0) {
    dots2.forEach((dot, i) => {
        dot.addEventListener('click', () => {
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



