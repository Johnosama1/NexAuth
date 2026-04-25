import { getClerk, BASE, goTo } from "../clerk-config.js";

// Particles
const container = document.getElementById("particles");
if (container) {
  for (let i = 0; i < 12; i++) {
    const p = document.createElement("div");
    p.className = "particle particle-sm";
    p.style.left = `${(i * 21 + 6) % 100}%`;
    p.style.top = `${(i * 27 + 8) % 100}%`;
    p.style.animationDuration = `${10 + (i % 4)}s`;
    p.style.animationDelay = `${(i * 1.9) % 7}s`;
    container.appendChild(p);
  }
}

(async () => {
  try {
    const clerk = await getClerk();
    const loading = document.getElementById("loading");
    const content = document.getElementById("portal-content");

    // Not signed in → redirect to sign-in
    if (!clerk.user) {
      goTo("/sign-in.html");
      return;
    }

    // Show portal content
    if (loading) loading.style.display = "none";
    if (content) content.style.display = "flex";

    // Show user email/name
    const emailEl = document.getElementById("user-email");
    if (emailEl && clerk.user) {
      const name = clerk.user.firstName || clerk.user.username;
      const email = clerk.user.primaryEmailAddress?.emailAddress;
      if (name) emailEl.textContent = `أهلاً ${name}، تم تسجيل دخولك بنجاح`;
      else if (email) emailEl.textContent = email;
    }

    // Sign out button
    const btnSignout = document.getElementById("btn-signout");
    if (btnSignout) {
      btnSignout.addEventListener("click", async () => {
        btnSignout.disabled = true;
        btnSignout.textContent = "جارٍ الخروج...";
        await clerk.signOut();
        goTo("/index.html");
      });
    }
  } catch (err) {
    console.error("Portal init error:", err);
    goTo("/sign-in.html");
  }
})();
