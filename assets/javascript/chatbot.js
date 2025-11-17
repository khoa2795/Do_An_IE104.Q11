//  LOAD CHATBOT HTML TỪ FILE
(function () {
  var CHATBOT_CACHE_KEY = "chatbot-component-v2";

  // Check cache
  var cached = sessionStorage.getItem(CHATBOT_CACHE_KEY);

  if (cached) {
    var container = document.createElement("div");
    container.innerHTML = cached;
    document.body.appendChild(container);
    initChatbot();
    return;
  }

  fetch("/html/components/chatbot.html")
    .then((res) => res.text())
    .then((html) => {
      sessionStorage.setItem(CHATBOT_CACHE_KEY, html);
      const container = document.createElement("div");
      container.innerHTML = html;
      document.body.appendChild(container);

      // Sau khi HTML đã load xong → kích hoạt chatbot
      initChatbot();
    })
    .catch((err) => console.error("Không thể load chatbot:", err));
})();

//  HÀM KHỞI TẠO CHATBOT
function initChatbot() {
  const chatToggle = document.getElementById("chatToggle");
  const chatBox = document.getElementById("chatBox");
  const closeChat = document.getElementById("closeChat");
  const chatBody = document.getElementById("chatBody");
  const chatInput = document.querySelector(".chatbot__input-field");
  const sendButton = document.querySelector(".chatbot__send-btn");

  // Nếu không tìm thấy HTML → báo lỗi
  if (!chatToggle || !chatBox || !closeChat || !chatInput || !sendButton) {
    console.error(" Chatbot HTML chưa load hoặc thiếu phần tử.");
    return;
  }

  //  SỰ KIỆN MỞ / ĐÓNG CHATBOT
  chatToggle.addEventListener("click", () => {
    chatBox.style.display = chatBox.style.display === "flex" ? "none" : "flex";
  });

  closeChat.addEventListener("click", () => {
    chatBox.style.display =
      chatBox.style.display === "flex" || chatBox.style.display === "block"
        ? "none"
        : "flex";
  });

  //  SỰ KIỆN GỬI TIN NHẮN
  sendButton.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  //  HÀM GỬI TIN NHẮN
  function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // USER MESSAGE
    const userRow = document.createElement("div");
    userRow.classList.add("chatbot__message", "chatbot__message--user");

    const userMsg = document.createElement("div");
    userMsg.classList.add("chatbot__bubble");
    userMsg.textContent = text;

    const userAvatar = document.createElement("img");
    userAvatar.classList.add("chatbot__avatar");
    userAvatar.src = "https://cdn-icons-png.flaticon.com/512/4140/4140048.png";

    userRow.appendChild(userMsg);
    userRow.appendChild(userAvatar);
    chatBody.appendChild(userRow);

    chatInput.value = "";
    chatBody.scrollTop = chatBody.scrollHeight;

    // BOT REPLY
    setTimeout(() => {
      const botRow = document.createElement("div");
      botRow.classList.add("chatbot__message", "chatbot__message--bot");

      const botAvatar = document.createElement("img");
      botAvatar.classList.add("chatbot__avatar");
      botAvatar.src = "https://cdn-icons-png.flaticon.com/512/4712/4712104.png";

      const botMsg = document.createElement("div");
      botMsg.classList.add("chatbot__bubble");
      botMsg.textContent = "Bot: Tôi đã nhận được tin nhắn của bạn!";

      botRow.appendChild(botAvatar);
      botRow.appendChild(botMsg);
      chatBody.appendChild(botRow);

      chatBody.scrollTop = chatBody.scrollHeight;
    }, 700);
  }
}
