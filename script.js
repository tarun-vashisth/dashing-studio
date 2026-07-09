document.addEventListener("DOMContentLoaded", () => {

  // ── DOM ELEMENTS ──────────────────────────────────────────────
  const toast         = document.getElementById("toast");
  const signinModal   = document.getElementById("signinModal");
  const promptInput   = document.getElementById("promptInput");
  const negativeInput = document.getElementById("negativeInput");
  const generateBtn   = document.getElementById("generateBtn");
  const enhanceBtn    = document.getElementById("enhanceBtn");
  const saveBtn       = document.getElementById("saveBtn");
  const signinBtn     = document.getElementById("signinBtn");
  const emailInput    = document.getElementById("emailInput");
  const previewCard   = document.getElementById("previewCard");
  const previewModel  = document.getElementById("previewModel");
  const previewStatus = document.getElementById("previewStatus");
  const modelSelect   = document.getElementById("modelSelect");
  const exportBtn     = document.getElementById("exportBtn");
  const copyApiBtn    = document.getElementById("copyApiBtn");
  const creativityRange = document.getElementById("creativityRange");
  const creativityValue = document.getElementById("creativityValue");
  const stepsRange    = document.getElementById("stepsRange");
  const stepsValue    = document.getElementById("stepsValue");

  // ── RESTORE SAVED VALUES ──────────────────────────────────────
  const savedPrompt = localStorage.getItem("dashingPrompt");
  if (savedPrompt && promptInput) promptInput.value = savedPrompt;

  // ── TOAST ─────────────────────────────────────────────────────
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }

  // ── SIGN IN MODAL ─────────────────────────────────────────────
  function openSignin() {
    if (!signinModal) return;
    signinModal.classList.add("open");
    if (emailInput) emailInput.focus();
  }

  function closeSignin() {
    if (!signinModal) return;
    signinModal.classList.remove("open");
  }

  document.querySelectorAll("[data-open-signin]").forEach(btn => btn.addEventListener("click", openSignin));
  document.querySelectorAll("[data-close-signin]").forEach(btn => btn.addEventListener("click", closeSignin));
  if (signinModal) signinModal.addEventListener("click", e => { if (e.target === signinModal) closeSignin(); });

  if (signinBtn) {
    signinBtn.addEventListener("click", () => {
      const email = emailInput ? emailInput.value.trim() : "";
      if (!email.includes("@")) { showToast("Enter a valid email address."); return; }
      closeSignin();
      showToast(`Signed in as ${email}`);
    });
  }

  // ── SMOOTH SCROLL ─────────────────────────────────────────────
  document.querySelectorAll("[data-scroll]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = document.querySelector(btn.dataset.scroll);
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });

  document.querySelectorAll(".nav-links a, .brand").forEach(link => {
    link.addEventListener("click", e => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    });
  });

  // ── MODEL SELECTION ───────────────────────────────────────────
  document.querySelectorAll(".model-card").forEach(card => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".model-card").forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      if (modelSelect) modelSelect.value = card.dataset.model;
      if (previewModel) previewModel.textContent = card.dataset.model;
      showToast(`${card.dataset.model} model selected.`);
    });
  });

  if (modelSelect) {
    modelSelect.addEventListener("change", () => {
      if (previewModel) previewModel.textContent = modelSelect.value;
    });
  }

  // ── SLIDERS ───────────────────────────────────────────────────
  if (creativityRange && creativityValue) {
    creativityRange.addEventListener("input", () => {
      creativityValue.textContent = creativityRange.value;
    });
  }

  if (stepsRange && stepsValue) {
    stepsRange.addEventListener("input", () => {
      stepsValue.textContent = stepsRange.value;
    });
  }

  // ── SAVE PROMPT ───────────────────────────────────────────────
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      if (promptInput) localStorage.setItem("dashingPrompt", promptInput.value);
      showToast("Prompt saved!");
    });
  }

  // ── COPY API ROUTE ────────────────────────────────────────────
  if (copyApiBtn) {
    copyApiBtn.addEventListener("click", () => {
      navigator.clipboard.writeText("https://image.pollinations.ai/prompt/")
        .then(() => showToast("API route copied!"));
    });
  }

  // ── PROMPT ENHANCE ────────────────────────────────────────────
  if (enhanceBtn) {
    enhanceBtn.addEventListener("click", () => {
      if (!promptInput || !promptInput.value.trim()) {
        showToast("Enter a prompt first!");
        return;
      }
      promptInput.value = promptInput.value.trim() +
        ", photorealistic, highly detailed, professional photography, 8k resolution, sharp focus";
      showToast("Prompt enhanced!");
    });
  }

  // ── DEMO BUTTON ───────────────────────────────────────────────
  document.querySelectorAll("[data-demo]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (promptInput) promptInput.value = "a futuristic city at sunset, neon lights, cinematic, photorealistic";
      showToast("Demo prompt loaded!");
      const gen = document.getElementById("generate");
      if (gen) gen.scrollIntoView({ behavior: "smooth" });
    });
  });

  // ── MODEL STYLE PREFIXES ──────────────────────────────────────
const MODEL_PREFIXES = {
  "Photoreal":  "photorealistic, hyperrealistic, DSLR photo, 8k resolution, sharp focus, professional photography, masterpiece, best quality,",
  "Cinematic":  "cinematic film still, dramatic lighting, anamorphic lens, movie scene, professional colorgrading, sharp, 8k,",
  "3D Render":  "3D render, octane render, studio lighting, high detail, blender, 8k, photorealistic, masterpiece,",
  "Fashion":    "high fashion editorial, vogue magazine, professional photography, studio lighting, sharp focus, 8k, masterpiece,",
};

  // ── IMAGE GENERATION USING POLLINATIONS AI ────────────────────
  async function generateImage() {
    const prompt = promptInput ? promptInput.value.trim() : "";

    if (!prompt) {
      showToast("Please enter a prompt!");
      return;
    }

    // Get selected model style
    const selectedModel = modelSelect ? modelSelect.value : "Photoreal";
    const prefix = MODEL_PREFIXES[selectedModel] || "";
    const fullPrompt = `${prefix} ${prompt}`.trim();

    // Build Pollinations URL
    const encodedPrompt = encodeURIComponent(fullPrompt);
    const seed = Math.floor(Math.random() * 1000000);
   const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux-realism&enhance=true`;
    // Show loading state
    if (generateBtn)  { generateBtn.disabled = true; generateBtn.textContent = "Generating..."; }
    if (previewStatus) previewStatus.textContent = "Generating...";
    if (previewCard) {
      previewCard.innerHTML = `
        <div style="text-align:center;color:#94a3b8;font-size:14px;padding:40px 20px;">
          ⏳ Generating your image...<br>
          <small style="color:#cbd5e1;">Usually takes 5-15 seconds</small>
        </div>`;
    }

    try {
      // Pollinations returns a direct image URL — just load it as an img tag
      const img = new Image();

      img.onload = () => {
        if (previewCard) {
          previewCard.innerHTML = `
            <div style="width:100%;text-align:center;">
              <img src="${imageUrl}"
                   style="max-width:100%;border-radius:10px;display:block;margin:0 auto;" />
              <button onclick="downloadImage('${imageUrl}')"
                      style="margin-top:12px;padding:8px 20px;background:#2563eb;color:white;
                             border:none;border-radius:8px;cursor:pointer;font-weight:600;">
                ⬇ Download
              </button>
            </div>`;
        }
        if (previewStatus) previewStatus.textContent = "Ready";
        if (previewModel)  previewModel.textContent  = selectedModel;
        if (generateBtn)   { generateBtn.disabled = false; generateBtn.textContent = "Generate"; }
        showToast("Image generated! 🎉");
      };

      img.onerror = () => {
        throw new Error("Image failed to load from Pollinations");
      };

      img.src = imageUrl;

    } catch (err) {
      console.error("Generation error:", err);
      if (previewCard) {
        previewCard.innerHTML = `
          <div style="text-align:center;color:#ef4444;font-size:14px;padding:20px;">
            ⚠️ Generation failed<br>
            <small style="color:#94a3b8;">${err.message}</small>
          </div>`;
      }
      if (previewStatus) previewStatus.textContent = "Failed";
      if (generateBtn)   { generateBtn.disabled = false; generateBtn.textContent = "Generate"; }
      showToast("Generation failed — try again.");
    }
  }

  // Download helper
  window.downloadImage = function(url) {
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `dashing-studio-${Date.now()}.png`;
        link.click();
        showToast("Image downloaded!");
      });
  };

  // Generate button click
  if (generateBtn) generateBtn.addEventListener("click", generateImage);

  // Ctrl+Enter in prompt box
  if (promptInput) {
    promptInput.addEventListener("keydown", e => {
      if (e.key === "Enter" && e.ctrlKey) generateImage();
    });
  }

  // ── EXPORT ────────────────────────────────────────────────────
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      showToast("Export coming soon!");
    });
  }

});
