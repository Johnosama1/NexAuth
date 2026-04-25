import { getClerk, BASE, appearance, goTo } from "../clerk-config.js";

// Particles
const container = document.getElementById("particles");
if (container) {
  for (let i = 0; i < 15; i++) {
    const p = document.createElement("div");
    p.className = "particle particle-sm";
    p.style.left = `${(i * 19 + 7) % 100}%`;
    p.style.top = `${(i * 29 + 11) % 100}%`;
    p.style.animationDuration = `${9 + (i % 5)}s`;
    p.style.animationDelay = `${(i * 1.5) % 8}s`;
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
    const mountEl = document.getElementById("clerk-sign-in");

    if (loading) loading.style.display = "none";
    if (mountEl) mountEl.style.display = "block";

    clerk.mountSignIn(mountEl, {
      appearance,
      routing: "virtual",
      signUpUrl: BASE + "/sign-up.html",
      fallbackRedirectUrl: BASE + "/portal.html",
    });
  } catch (err) {
    console.error("Sign-in init error:", err);
    const loading = document.getElementById("loading");
    if (loading) loading.innerHTML = '<p style="color:#ef4444;">حدث خطأ. <a href="index.html" style="color:#60a5fa;">العودة</a></p>';
  }
})();
