import * as Linking from "expo-linking";

const CALLBACK_SEGMENT = "auth/callback";

/**
 * OAuth return URL for Supabase (Google, password reset, etc.).
 *
 * Expo Go dev:
 * - `npx expo start` → `exp://<LAN-IP>:8081/--/auth/callback`
 * - `npx expo start --tunnel` → `exp://…exp.direct…/--/auth/callback`
 * These are **different strings**. Supabase → Auth → Redirect URLs must list **every**
 * variant you use, or OAuth works only in the mode whose URL you added.
 *
 * Production / dev build: uses `scheme` from app.json (e.g. `exratio-mobile://auth/callback`).
 */
export function getSupabaseOAuthRedirectUrl(): string {
  return Linking.createURL(CALLBACK_SEGMENT);
}

/** One clear dev log so LAN vs tunnel mismatches are obvious. */
export function logDevExpoOAuthRedirectHint(redirectTo: string): void {
  if (!__DEV__) return;
  console.log(
    "[OAuth] Redirect URL (add EXACTLY to Supabase → Auth → Redirect URLs):\n" +
      `  ${redirectTo}\n` +
      "  LAN (`expo start`) and tunnel (`expo start --tunnel`) use different exp:// URLs.\n" +
      "  Add both to the allow list if you switch modes, or Google sign-in will fail in the other."
  );
}

export type OAuthReturnParsed = {
  code?: string;
  error?: string;
  errorDescription?: string;
  access_token?: string;
  refresh_token?: string;
};

/**
 * Parse Supabase OAuth return URL from WebBrowser.openAuthSessionAsync.
 * Supports ?code= (PKCE) and #access_token= / #refresh_token= (implicit) without relying on AuthSession.parse.
 */
export function parseOAuthReturnUrl(url: string): OAuthReturnParsed {
  const out: OAuthReturnParsed = {};
  if (!url || typeof url !== "string") return out;

  try {
    const hashIndex = url.indexOf("#");
    const beforeHash = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
    const qIndex = beforeHash.indexOf("?");
    const queryString = qIndex >= 0 ? beforeHash.slice(qIndex + 1) : "";

    if (queryString) {
      const qs = new URLSearchParams(queryString);
      const code = qs.get("code");
      if (code) out.code = code;
      const err = qs.get("error");
      if (err) out.error = err;
      const ed = qs.get("error_description");
      if (ed) out.errorDescription = ed;
    }

    if (hashIndex >= 0) {
      const hp = new URLSearchParams(url.slice(hashIndex + 1));
      const code = hp.get("code");
      if (code && !out.code) out.code = code;
      const at = hp.get("access_token");
      const rt = hp.get("refresh_token");
      if (at) out.access_token = at;
      if (rt) out.refresh_token = rt;
      const err = hp.get("error");
      if (err) out.error = err;
      const ed = hp.get("error_description");
      if (ed) out.errorDescription = ed;
    }
  } catch (e) {
    console.warn("parseOAuthReturnUrl:", e);
  }

  return out;
}
