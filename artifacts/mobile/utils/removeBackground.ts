import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

/**
 * The API server URL for background removal.
 * Priority:
 *  1. EXPO_PUBLIC_DOMAIN env var (set in dev workflow and EAS builds)
 *  2. EXPO_PUBLIC_API_BASE hardcoded constant (set after deployment)
 */
const DEPLOYED_API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? "";
const DEV_DOMAIN = process.env.EXPO_PUBLIC_DOMAIN ?? "";

/** Timeout for the first attempt (30 seconds — server may be cold-starting) */
const FIRST_ATTEMPT_TIMEOUT_MS = 30_000;
/** Timeout for the retry attempt (90 seconds — model may be loading ONNX) */
const RETRY_TIMEOUT_MS = 90_000;
/** Delay before retrying after a timeout */
const RETRY_DELAY_MS = 2_000;

function getApiBase(): string {
  if (DEV_DOMAIN) return `https://${DEV_DOMAIN}`;
  if (DEPLOYED_API_BASE) return DEPLOYED_API_BASE;
  return "";
}

export type RemoveBgResult =
  | { success: true; uri: string }
  | { success: false; reason: string };

/**
 * Internal single attempt with AbortSignal for timeout control.
 */
async function removeBackgroundOnce(
  sourceUri: string,
  signal: AbortSignal
): Promise<RemoveBgResult> {
  const apiBase = getApiBase();
  if (!apiBase) {
    return { success: false, reason: "no_api_url" };
  }

  let base64: string;
  if (Platform.OS === "web") {
    base64 = await fetchToBase64Web(sourceUri);
  } else {
    base64 = await FileSystem.readAsStringAsync(sourceUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }

  const url = `${apiBase}/api/remove-bg`;
  console.log("[removeBackground] calling:", url);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_base64: base64 }),
    signal,
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.status.toString());
    console.warn("[removeBackground] server error:", err);
    return { success: false, reason: err };
  }

  const data = (await res.json()) as { image_base64?: string };
  if (!data.image_base64) {
    return { success: false, reason: "server_no_data" };
  }

  return saveBase64ToFile(data.image_base64);
}

/**
 * Removes background from a portrait photo and returns white-background JPEG.
 *
 * Strategy:
 *   1. First attempt: 30-second timeout. If it passes, the server is busy
 *      (cold start or ONNX model loading).
 *   2. Calls `onRetrying()` so the UI can show "Server is busy, retrying..."
 *   3. Second attempt: 90-second timeout (model is now warm).
 *   4. If both fail, returns { success: false, reason: "timeout" }.
 *
 * @param sourceUri   Local file URI of the photo
 * @param onRetrying  Callback called when the first attempt times out (for UI feedback)
 */
export async function removeBackground(
  sourceUri: string,
  onRetrying?: () => void
): Promise<RemoveBgResult> {
  if (!getApiBase()) {
    console.warn("[removeBackground] No API base URL configured");
    return { success: false, reason: "no_api_url" };
  }

  // ── First attempt (30s timeout) ───────────────────────────────────────────
  const ctrl1 = new AbortController();
  const timer1 = setTimeout(() => ctrl1.abort(), FIRST_ATTEMPT_TIMEOUT_MS);

  try {
    const result = await removeBackgroundOnce(sourceUri, ctrl1.signal);
    clearTimeout(timer1);
    return result;
  } catch (e: any) {
    clearTimeout(timer1);

    const isTimeout = e?.name === "AbortError" || e?.message?.includes("aborted");
    if (!isTimeout) {
      // Non-timeout error (network failure, parse error, etc.)
      console.warn("[removeBackground] exception:", e?.message ?? e);
      return { success: false, reason: e?.message ?? "unknown" };
    }

    // ── Server is busy — notify UI and retry ─────────────────────────────
    console.warn("[removeBackground] Timeout on first attempt. Retrying...");
    onRetrying?.();
    await delay(RETRY_DELAY_MS);

    const ctrl2 = new AbortController();
    const timer2 = setTimeout(() => ctrl2.abort(), RETRY_TIMEOUT_MS);

    try {
      const result = await removeBackgroundOnce(sourceUri, ctrl2.signal);
      clearTimeout(timer2);
      return result;
    } catch (e2: any) {
      clearTimeout(timer2);
      console.warn("[removeBackground] Retry also failed:", e2?.message ?? e2);
      return { success: false, reason: "timeout" };
    }
  }
}

async function saveBase64ToFile(base64: string): Promise<RemoveBgResult> {
  if (Platform.OS === "web") {
    return { success: true, uri: `data:image/jpeg;base64,${base64}` };
  }
  const destPath = `${FileSystem.cacheDirectory}rmbg_${Date.now()}.jpg`;
  await FileSystem.writeAsStringAsync(destPath, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return { success: true, uri: destPath };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function fetchToBase64Web(uri: string): Promise<string> {
  const res = await fetch(uri);
  const blob = await res.blob();
  return blobToBase64(blob);
}

/** True if the API server URL is configured */
export function hasRemoveBgKey(): boolean {
  return !!getApiBase();
}
