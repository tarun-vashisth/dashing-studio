document.addEventListener("DOMContentLoaded", () => {
 const BACKEND_URL = "https://tarunvashisth-dashing-studio.hf.space";

  // ── DOM ELEMENTS ──────────────────────────────────────────────
  const toast         = document.getElementById("toast");
  const signinModal   = document.getElementById("signinModal");
  const promptInput   = document.getElementById("promptInput");
  const negativeInput = document.getElementById("negativeInput");
  const endpointInput = document.getElementById("endpointInput");
  const generateBtn   = document.getElementById("generateBtn");
  const enhanceBtn    = document.getElementById("enhanceBtn");
  const saveBtn       = document.getElementById("saveBtn");
  const signinBtn     = document.getElementById("signinBtn");
  const emailInput    = document.getElementById("emailInput");
  const previewCard   = document.getElementById("previewCard");
  const previewModel  = document.getElementById("previewModel");
  const previewStatus = document.getElementById("previewStatus");
  const modelSelect   = document.getElementById("modelSelect");
  const formatSelect  = document.getElementById("formatSelect");
  const exportBtn     = document.getElementById("exportBtn");
  const copyApiBtn    = document.getElementById("copyApiBtn");
  const creativityRange = document.getElementById("creativityRange");
  const creativityValue = document.getElementById("creativityValue");
  const stepsRange    = document.getElementById("stepsRange");
  const stepsValue    = document.getElementById("stepsValue");

  // ── RESTORE SAVED VALUES ──────────────────────────────────────
  const savedPrompt   = localStorage.getItem("dashingPrompt");
  const savedEndpoint = localStorage.getItem("dashingEndpoint");
  if (savedPrompt && promptInput)     promptInput.value   = savedPrompt;
  if (savedEndpoint && endpointInput) endpointInput.value = savedEndpoint;

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

  // ── SAVE ENDPOINT ─────────────────────────────────────────────
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      if (promptInput)   localStorage.setItem("dashingPrompt",   promptInput.value);
      if (endpointInput) localStorage.setItem("dashingEndpoint", endpointInput.value);
      showToast("Endpoint and prompt saved!");
    });
  }

  // ── COPY API ROUTE ────────────────────────────────────────────
  if (copyApiBtn) {
    copyApiBtn.addEventListener("click", () => {
      const url = endpointInput ? endpointInput.value.trim() + "/generate" : "";
      if (!url) { showToast("No endpoint set."); return; }
      navigator.clipboard.writeText(url).then(() => showToast("API route copied!"));
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
        ", highly detailed, professional lighting, award winning, 8k resolution, masterpiece";
      showToast("Prompt enhanced!");
    });
  }

  // ── DEMO BUTTON ───────────────────────────────────────────────
  document.querySelectorAll("[data-demo]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (promptInput) promptInput.value = "a futuristic city at sunset, neon lights, cinematic";
      showToast("Demo prompt loaded!");
      const gen = document.getElementById("generate");
      if (gen) gen.scrollIntoView({ behavior: "smooth" });
    });
  });

  // ── IMAGE GENERATION ──────────────────────────────────────────
  async function generateImage() {
    const endpoint = BACKEND_URL;
    const prompt   = promptInput   ? promptInput.value.trim()   : "";

    if (!endpoint) {
      showToast("Please enter your API endpoint URL first!");
      return;
    }

    if (!prompt) {
      showToast("Please enter a prompt!");
      return;
    }

    // Build full API URL
    const apiUrl = endpoint.replace(/\/$/, "") + "/generate";

    // Show loading state
    if (generateBtn)  { generateBtn.disabled = true; generateBtn.textContent = "Generating..."; }
    if (previewStatus) previewStatus.textContent = "Generating...";
    if (previewCard)   previewCard.innerHTML = `<div style="text-align:center;color:#94a3b8;font-size:14px;">⏳ Generating your image...<br><small>This may take 10–30 seconds</small></div>`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"   // fixes ngrok CORS warning
        },
        body: JSON.stringify({
          prompt: prompt,
          negativePrompt: negativeInput ? negativeInput.value.trim() : "",
          steps: stepsRange ? parseInt(stepsRange.value) : 20,
          guidanceScale: creativityRange ? parseFloat(creativityRange.value) : 7.5,
          num_images: 1
        })
      });

      if (!response.ok) throw new Error(`Server returned ${response.status}`);

      const data = await response.json();

      // Handle both response formats
      let base64Image = null;
      if (data.image && data.image.base64) {
        base64Image = data.image.base64;          // colab_model_server.py format
      } else if (data.images && data.images[0]) {
        base64Image = data.images[0];             // older format
      }

      if (!base64Image) throw new Error("No image in response");

      // Show image
      if (previewCard) {
        previewCard.innerHTML = `
          <div style="width:100%;text-align:center;">
            <img src="data:image/png;base64,${base64Image}"
                 style="max-width:100%;border-radius:10px;display:block;margin:0 auto;" />
            <button onclick="downloadImage('${base64Image}')"
                    style="margin-top:12px;padding:8px 20px;background:#2563eb;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">
              ⬇ Download
            </button>
          </div>`;
      }

      if (previewStatus) previewStatus.textContent = "Ready";
      if (previewModel)  previewModel.textContent  = modelSelect ? modelSelect.value : "AI";
      showToast("Image generated successfully! 🎉");

    } catch (err) {
      console.error("Generation error:", err);
      if (previewCard) {
        previewCard.innerHTML = `
          <div style="text-align:center;color:#ef4444;font-size:14px;padding:20px;">
            ⚠️ Generation failed<br>
            <small style="color:#94a3b8;">${err.message}</small><br><br>
            <small style="color:#94a3b8;">Make sure your Colab server is running and the endpoint URL is correct.</small>
          </div>`;
      }
      if (previewStatus) previewStatus.textContent = "Failed";
      showToast("Generation failed — check console for details.");
    } finally {
      if (generateBtn) { generateBtn.disabled = false; generateBtn.textContent = "Generate"; }
    }
  }

  // Download helper
  window.downloadImage = function(base64) {
    const link = document.createElement("a");
    link.href  = `data:image/png;base64,${base64}`;
    link.download = `dashing-studio-${Date.now()}.png`;
    link.click();
    showToast("Image downloaded!");
  };

  // Generate button click
  if (generateBtn) generateBtn.addEventListener("click", generateImage);

  // Enter key in prompt box
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
