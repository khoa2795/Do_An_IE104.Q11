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
  const dragBoundary = 16;
  const followSpacing = 16;

  // Nếu không tìm thấy HTML → báo lỗi
  if (!chatToggle || !chatBox || !closeChat || !chatInput || !sendButton) {
    console.error(" Chatbot HTML chưa load hoặc thiếu phần tử.");
    return;
  }

  const isChatVisible = () => chatBox.style.display === "flex";

  //  SỰ KIỆN MỞ / ĐÓNG CHATBOT
  chatToggle.addEventListener("click", () => {
    const willShow = !isChatVisible();
    if (willShow) {
      chatBox.style.display = "flex";
      // Force layout to ensure width/height available before positioning
      void chatBox.offsetWidth;
      positionChatBoxRelativeToToggle();
    } else {
      chatBox.style.display = "none";
    }
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

  const chatHeader = chatBox.querySelector(".chatbot__header");
  makeDraggable(chatToggle, {
    boundary: dragBoundary,
    onDrag: () => {
      if (isChatVisible()) {
        positionChatBoxRelativeToToggle();
      }
    },
  });
  if (chatHeader) {
    makeDraggable(chatBox, {
      handle: chatHeader,
      boundary: dragBoundary,
      cursor: "move",
    });
  }

  window.addEventListener("resize", () => {
    if (isChatVisible()) {
      positionChatBoxRelativeToToggle();
    }
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

  function positionChatBoxRelativeToToggle() {
    if (!chatToggle || !chatBox) return;

    const toggleRect = chatToggle.getBoundingClientRect();
    const boxStyles = window.getComputedStyle(chatBox);
    const boxWidth = chatBox.offsetWidth || parseFloat(boxStyles.width) || 360;
    const boxHeight =
      chatBox.offsetHeight || parseFloat(boxStyles.height) || 420;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = toggleRect.left + toggleRect.width - boxWidth;
    left = Math.min(
      viewportWidth - boxWidth - followSpacing,
      Math.max(followSpacing, left)
    );

    let top = toggleRect.top - boxHeight - followSpacing;
    if (top < followSpacing) {
      top = Math.min(
        viewportHeight - boxHeight - followSpacing,
        toggleRect.bottom + followSpacing
      );
    }

    chatBox.style.left = `${left}px`;
    chatBox.style.top = `${top}px`;
    chatBox.style.right = "auto";
    chatBox.style.bottom = "auto";
  }

  function makeDraggable(element, options = {}) {
    const handle = options.handle || element;
    const boundary = options.boundary ?? 0;
    const onDragStart =
      typeof options.onDragStart === "function" ? options.onDragStart : null;
    const onDrag = typeof options.onDrag === "function" ? options.onDrag : null;
    const onDragEnd =
      typeof options.onDragEnd === "function" ? options.onDragEnd : null;

    if (
      !element ||
      !handle ||
      element.dataset.draggableInitialized === "true"
    ) {
      return;
    }

    element.dataset.draggableInitialized = "true";
    handle.style.cursor = options.cursor || handle.style.cursor || "grab";
    handle.style.touchAction = "none";
    handle.style.userSelect = "none";

    handle.addEventListener("pointerdown", (event) => {
      const isPrimary = event.pointerType === "touch" || event.button === 0;
      if (!isPrimary) return;

      const rect = element.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      const startX = event.clientX;
      const startY = event.clientY;
      let moved = false;

      element.style.position = "fixed";
      element.style.right = "auto";
      element.style.bottom = "auto";

      if (onDragStart) {
        onDragStart({ event, element });
      }

      const maxLeft = () =>
        Math.max(boundary, window.innerWidth - element.offsetWidth - boundary);
      const maxTop = () =>
        Math.max(
          boundary,
          window.innerHeight - element.offsetHeight - boundary
        );

      function onPointerMove(moveEvent) {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        if (!moved && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
          moved = true;
        }

        const left = Math.min(
          maxLeft(),
          Math.max(boundary, moveEvent.clientX - offsetX)
        );
        const top = Math.min(
          maxTop(),
          Math.max(boundary, moveEvent.clientY - offsetY)
        );

        element.style.left = `${left}px`;
        element.style.top = `${top}px`;

        if (onDrag) {
          onDrag({ event: moveEvent, element, left, top });
        }
      }

      function onPointerUp(upEvent) {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        if (handle.releasePointerCapture) {
          try {
            handle.releasePointerCapture(event.pointerId);
          } catch (err) {
            /* no-op if pointer already released */
          }
        }

        if (moved) {
          const suppressClick = (clickEvent) => {
            clickEvent.preventDefault();
            clickEvent.stopPropagation();
            handle.removeEventListener("click", suppressClick, true);
          };
          handle.addEventListener("click", suppressClick, true);
        }

        if (onDragEnd) {
          onDragEnd({ event: upEvent, element, moved });
        }
      }

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      if (handle.setPointerCapture) {
        try {
          handle.setPointerCapture(event.pointerId);
        } catch (err) {
          /* Safari might throw if capture fails */
        }
      }
    });
  }
}
