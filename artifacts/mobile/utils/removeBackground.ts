import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

/**
 * The API server URL for background removal.
 * Priority:
 *  1. EXPO_PUBLIC_DOMAIN env var (set in dev workflow and EAS builds)
 *  2. EXPO_PUBLIC_API_BASE hardcoded constant (set after deployment)
 *
 * The API server uses @imgly/background-removal-node — free, fully local ML,
 * no third-party API key needed. First run downloads the ONNX model (~80 MB).
 */
const DEPLOYED_API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? "";
const DEV_DOMAIN = process.env.EXPO_PUBLIC_DOMAIN ?? "";

function getApiBase(): string {
  if (DEV_DOMAIN) return `https://${DEV_DOMAIN}`;
  if (DEPLOYED_API_BASE) return DEPLOYED_API_BASE;
  return "";
}

export type RemoveBgResult =
  | { success: true; uri: string }
  | { success: false; reason: string };

/**
 * Removes background from a portrait photo and returns white-background JPEG.
 * Uses the self-hosted API server with local ML (free, no API key needed).
 */
export async function removeBackground(sourceUri: string): Promise<RemoveBgResult> {
  const apiBase = getApiBase();
  if (!apiBase) {
    console.warn("[removeBackground] No API base URL configured");
    return { success: false, reason: "no_api_url" };
  }

  try {
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

    return await saveBase64ToFile(data.image_base64);
  } catch (e: any) {
    console.warn("[removeBackground] exception:", e?.message ?? e);
    return { success: false, reason: e?.message ?? "unknown" };
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
