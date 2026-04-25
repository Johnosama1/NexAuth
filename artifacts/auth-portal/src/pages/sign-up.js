import { getClerk, BASE, appearance, goTo } from "../clerk-config.js";

// Particles
const container = document.getElementById("particles");
if (container) {
  for (let i = 0; i < 15; i++) {
    const p = document.createElement("div");
    p.className = "particle particle-sm";
    p.style.left = `${(i * 23 + 9) % 100}%`;
    p.style.top = `${(i * 31 + 13) % 100}%`;
    p.style.animationDuration = `${8 + (i % 6)}s`;
    p.style.animationDelay = `${(i * 1.7) % 9}s`;
    container.appendChild(p);
  }
}

(async () => {
  try {
    const clerk = await getClerk();

    // Already signed in → go to portal
    if (clerk.user) {
      goTo("/portal.html");
      return;
    }

    const loading = document.getElementById("loading");
    const mountEl = document.getElementById("clerk-sign-up");

    if (loading) loading.style.display = "none";
    if (mountEl) mountEl.style.display = "block";

    clerk.mountSignUp(mountEl, {
      appearance,
      routing: "virtual",
      signInUrl: BASE + "/sign-in.html",
      fallbackRedirectUrl: BASE + "/portal.html",
    });
  } catch (err) {
    console.error("Sign-up init error:", err);
    const loading = document.getElementById("loading");
    if (loading) loading.innerHTML = '<p style="color:#ef4444;">حدث خطأ. <a href="index.html" style="color:#60a5fa;">العودة</a></p>';
  }
})();
