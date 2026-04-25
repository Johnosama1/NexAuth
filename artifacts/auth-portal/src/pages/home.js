import { getClerk, BASE, goTo } from "../clerk-config.js";

// Generate particles
const container = document.getElementById("particles");
if (container) {
  for (let i = 0; i < 20; i++) {
    const p = document.createElement("div");
    p.className = "particle particle-sm";
    p.style.left = `${(i * 17 + 5) % 100}%`;
    p.style.top = `${(i * 23 + 10) % 100}%`;
    p.style.animationDuration = `${8 + (i % 5)}s`;
    p.style.animationDelay = `${(i * 1.3) % 8}s`;
    container.appendChild(p);
  }
  for (let i = 0; i < 8; i++) {
    const p = document.createElement("div");
    p.className = "particle particle-lg";
    p.style.left = `${(i * 31 + 15) % 100}%`;
    p.style.top = `${(i * 41 + 20) % 100}%`;
    p.style.animationDuration = `${12 + (i % 4)}s`;
    p.style.animationDelay = `${(i * 2.1) % 10}s`;
    container.appendChild(p);
  }
}

// Init Clerk and check if already signed in
(async () => {
  try {
    const clerk = await getClerk();
    if (clerk.user) {
      goTo("/portal.html");
      return;
    }

    // Google OAuth button
    const btnGoogle = document.getElementById("btn-google");
    if (btnGoogle) {
      btnGoogle.addEventListener("click", async () => {
        try {
          await clerk.signIn.authenticateWithRedirect({
            strategy: "oauth_google",
            redirectUrl: window.location.origin + BASE + "/sign-in.html",
            redirectUrlComplete: window.location.origin + BASE + "/portal.html",
          });
        } catch {
          goTo("/sign-in.html");
        }
      });
    }

    // Apple OAuth button
    const btnApple = document.getElementById("btn-apple");
    if (btnApple) {
      btnApple.addEventListener("click", async () => {
        try {
          await clerk.signIn.authenticateWithRedirect({
            strategy: "oauth_apple",
            redirectUrl: window.location.origin + BASE + "/sign-in.html",
            redirectUrlComplete: window.location.origin + BASE + "/portal.html",
          });
        } catch {
          goTo("/sign-in.html");
        }
      });
    }
  } catch (err) {
    console.error("Clerk init error:", err);
  }
})();
