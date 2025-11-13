(function () {
  fetch("/html/components/chatbot.html") // đường dẫn tới file chatbot của bạn
    .then((response) => response.text())
    .then((html) => {
      const container = document.createElement("div");
      container.innerHTML = html;
      document.body.appendChild(container);
    })
    .catch((err) => console.error("Không thể load chatbot:", err));
})();
