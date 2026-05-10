/**
 * Supabase Auth PKCE needs Web Crypto:
 * - `crypto.getRandomValues` (verifier)
 * - `crypto.subtle.digest("SHA-256", ...)` (S256 challenge)
 *
 * React Native / Hermes omit these; auth-js then throws or falls back to "plain".
 */
import * as ExpoCrypto from "expo-crypto";

function install() {
  if (typeof global === "undefined") return;

  const g = global as typeof globalThis & {
    crypto?: {
      getRandomValues?: typeof ExpoCrypto.getRandomValues;
      subtle?: { digest?: unknown; [k: string]: unknown };
    };
  };

  if (!g.crypto) {
    g.crypto = {};
  }
  const c = g.crypto;

  if (typeof c.getRandomValues !== "function") {
    c.getRandomValues = ExpoCrypto.getRandomValues;
  }

  if (!c.subtle || typeof c.subtle.digest !== "function") {
    const digest = async (
      algorithm: AlgorithmIdentifier,
      data: ArrayBufferView | ArrayBuffer
    ): Promise<ArrayBuffer> => {
      const name =
        typeof algorithm === "string"
          ? algorithm
          : (algorithm as { name: string }).name;
      if (name !== "SHA-256") {
        throw new Error(`Unsupported digest algorithm: ${name}`);
      }
      const buf =
        data instanceof ArrayBuffer
          ? new Uint8Array(data)
          : new Uint8Array(
              data.buffer,
              data.byteOffset,
              data.byteLength
            );
      let binary = "";
      for (let i = 0; i < buf.length; i++) {
        binary += String.fromCharCode(buf[i]!);
      }
      const hex = await ExpoCrypto.digestStringAsync(
        ExpoCrypto.CryptoDigestAlgorithm.SHA256,
        binary,
        { encoding: ExpoCrypto.CryptoEncoding.HEX }
      );
      const out = new Uint8Array(hex.length / 2);
      for (let i = 0; i < hex.length; i += 2) {
        out[i / 2] = parseInt(hex.slice(i, i + 2), 16);
      }
      return out.buffer;
    };

    c.subtle = { ...c.subtle, digest };
  }
}

install();
