/* ===== ChatBotAlpha - App Logic ===== */

const messagesEl = document.getElementById("messages");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");
const welcomeMessage = document.getElementById("welcomeMessage");

let isLoading = false;

// ===== Auto-resize textarea =====
userInput.addEventListener("input", () => {
  userInput.style.height = "auto";
  userInput.style.height = Math.min(userInput.scrollHeight, 120) + "px";
});

// ===== Send Message =====
function sendMessage(text) {
  const msg = (text || userInput.value).trim();
  if (!msg || isLoading) return;

  welcomeMessage.style.display = "none";
  appendMessage("user", msg);
  userInput.value = "";
  userInput.style.height = "auto";
  showTyping();
  isLoading = true;
  sendBtn.disabled = true;

  fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: msg }),
  })
    .then((res) => res.json())
    .then((data) => {
      removeTyping();
      if (data.reply) {
        appendMessage("bot", data.reply);
      } else {
        appendMessage(
          "bot",
          "Sorry, I ran into an issue. Could you try again? " + (data.error || "")
        );
      }
    })
    .catch((err) => {
      removeTyping();
      appendMessage("bot", "Connection error. Please check your internet and try again.");
      console.error("Chat error:", err);
    })
    .finally(() => {
      isLoading = false;
      sendBtn.disabled = false;
      userInput.focus();
    });
}

// ===== Append Message =====
function appendMessage(role, text) {
  const div = document.createElement("div");
  div.className = `message ${role}`;

  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  div.innerHTML = `
    <div class="msg-avatar">${role === "bot" ? "🤖" : "👤"}</div>
    <div>
      <div class="msg-content">${escapeHTML(text).replace(/\n/g, "<br>")}</div>
      <div class="msg-time">${time}</div>
    </div>
  `;

  messagesEl.appendChild(div);
  scrollToBottom();
}

// ===== Typing Indicator =====
function showTyping() {
  const div = document.createElement("div");
  div.className = "message bot";
  div.id = "typingIndicator";
  div.innerHTML = `
    <div class="msg-avatar">🤖</div>
    <div class="msg-content"><div class="typing"><span></span><span></span><span></span></div></div>
  `;
  messagesEl.appendChild(div);
  scrollToBottom();
}

function removeTyping() {
  const el = document.getElementById("typingIndicator");
  if (el) el.remove();
}

// ===== Helpers =====
function scrollToBottom() {
  messagesEl.parentElement.scrollTop = messagesEl.parentElement.scrollHeight;
}

function escapeHTML(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ===== Event Listeners =====
sendBtn.addEventListener("click", () => sendMessage());

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

clearBtn.addEventListener("click", () => {
  messagesEl.innerHTML = "";
  welcomeMessage.style.display = "block";
});

// ===== Quick Prompt Buttons =====
document.querySelectorAll(".prompt-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    sendMessage(btn.dataset.prompt);
  });
});

// ===== Init =====
userInput.focus();
