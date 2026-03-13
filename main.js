const from_lang = document.querySelector(".from_lang");
const to_lang = document.querySelector(".to_lang");
const mic_btn = document.querySelector(".mic_btn");
const translate_btn = document.querySelector(".translate_btn");
const input_text = document.querySelector(".input_text");
const result = document.querySelector(".result");

const langMap = {
  uz: "uz-UZ",
  en: "en-US",
  kk: "kk-KZ",
  ru: "ru-RU",
};

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const rec = new SpeechRecognition();
  rec.continuous = false;
  rec.interimResults = false;

  mic_btn.onclick = () => {
    rec.lang = langMap[from_lang.value] || "en-US";
    rec.start();
    mic_btn.textContent = "🔴 Listening...";
    mic_btn.disabled = true;
  };

  rec.onresult = (e) => {
    input_text.value = e.results[0][0].transcript;
    mic_btn.textContent = "🎤 Speak";
    mic_btn.disabled = false;
  };

  rec.onerror = (e) => {
    console.error("Speech recognition error:", e.error);
    mic_btn.textContent = "🎤 Speak";
    mic_btn.disabled = false;
    result.textContent = "Mic error: " + e.error;
  };

  rec.onend = () => {
    mic_btn.textContent = "🎤 Speak";
    mic_btn.disabled = false;
  };
} else {
  mic_btn.disabled = true;
  mic_btn.title = "Speech recognition not supported in this browser";
}

const translate = async () => {
  const text = input_text.value.trim();
  if (!text) {
    result.textContent = "Please enter or speak some text first.";
    return;
  }

  result.textContent = "Translating...";
  translate_btn.disabled = true;

  const url = "https://google-translate113.p.rapidapi.com/api/v1/translator/text";

  const options = {
    method: "POST",
    headers: {
      "x-rapidapi-key": "d88720b9ccmsh7f308d7d3fda0f2p15f5c2jsne9eada0d6b65",
      "x-rapidapi-host": "google-translate113.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: from_lang.value,
      to: to_lang.value,
      text: text,
    }),
  };

  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error("Network error: " + res.status);
    const data = await res.json();
    result.textContent = data.trans || "No translation returned.";
  } catch (err) {
    console.error("Translation error:", err);
    result.textContent = "Translation failed. Check your API key or network.";
  } finally {
    translate_btn.disabled = false;
  }
};

translate_btn.onclick = translate;

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("Service Worker registered"))
    .catch((err) => console.error("SW registration failed:", err));
}

const install_btn = document.querySelector(".install_btn");
let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  install_btn.style.display = "block";
});

install_btn.onclick = async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  install_btn.style.display = "none";
};

window.addEventListener("appinstalled", () => {
  install_btn.style.display = "none";
  deferredPrompt = null;
});