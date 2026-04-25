import { Clerk } from "@clerk/clerk-js";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const proxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
export const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

if (!publishableKey) throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");

export const appearance = {
  variables: {
    colorPrimary: "#3b82f6",
    colorBackground: "#111827",
    colorInputBackground: "#1e2d45",
    colorInputText: "#f1f5f9",
    colorText: "#f1f5f9",
    colorTextSecondary: "#94a3b8",
    colorForeground: "#f1f5f9",
    colorNeutral: "#1e293b",
    colorDanger: "#ef4444",
    colorAlphaShade: "#2d3f5a",
    fontFamily: "'Tajawal', 'Inter', system-ui, sans-serif",
    borderRadius: "0.75rem",
    fontSize: "15px",
  },
  elements: {
    socialButtonsBlockButton: {
      border: "1px solid #2d3f5a",
      background: "#1a2235",
    },
    formButtonPrimary: {
      background: "#2563eb",
      borderRadius: "10px",
    },
    card: {
      background: "transparent",
      boxShadow: "none",
      border: "none",
    },
  },
};

let _clerk = null;

export async function getClerk() {
  if (_clerk) return _clerk;
  _clerk = proxyUrl
    ? new Clerk(publishableKey, { proxyUrl })
    : new Clerk(publishableKey);
  await _clerk.load({ appearance });
  return _clerk;
}

export function goTo(path) {
  window.location.href = BASE + path;
}
