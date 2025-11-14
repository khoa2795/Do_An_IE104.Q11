//  LOAD CHATBOT HTML TỪ FILE
(function () {
  fetch("/html/components/chatbot.html")
    .then((res) => res.text())
    .then((html) => {
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
  const chatInput = document.querySelector(".chat-input input");
  const sendButton = document.querySelector(".chat-input button");

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
    userRow.classList.add("message-row", "user");

    const userMsg = document.createElement("div");
    userMsg.classList.add("message");
    userMsg.textContent = text;

    const userAvatar = document.createElement("img");
    userAvatar.classList.add("avatar");
    userAvatar.src = "https://cdn-icons-png.flaticon.com/512/4140/4140048.png";

    userRow.appendChild(userMsg);
    userRow.appendChild(userAvatar);
    chatBody.appendChild(userRow);

    chatInput.value = "";
    chatBody.scrollTop = chatBody.scrollHeight;

    // BOT REPLY
    setTimeout(() => {
      const botRow = document.createElement("div");
      botRow.classList.add("message-row", "bot");

      const botAvatar = document.createElement("img");
      botAvatar.classList.add("avatar");
      botAvatar.src = "https://cdn-icons-png.flaticon.com/512/4712/4712104.png";

      const botMsg = document.createElement("div");
      botMsg.classList.add("message");
      botMsg.textContent = "Bot: Tôi đã nhận được tin nhắn của bạn!";

      botRow.appendChild(botAvatar);
      botRow.appendChild(botMsg);
      chatBody.appendChild(botRow);

      chatBody.scrollTop = chatBody.scrollHeight;
    }, 700);
  }

  console.log(" Chatbot loaded and initialized!");
}
