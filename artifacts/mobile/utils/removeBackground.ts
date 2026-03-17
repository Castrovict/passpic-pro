import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

const REMOVE_BG_KEY = process.env.EXPO_PUBLIC_REMOVE_BG_KEY ?? "";
const API_DOMAIN = process.env.EXPO_PUBLIC_DOMAIN ?? "";

export type RemoveBgResult =
  | { success: true; uri: string }
  | { success: false; reason: string };

/**
 * Removes background and applies white background using remove.bg.
 * Strategy:
 *  1. If EXPO_PUBLIC_REMOVE_BG_KEY is set → call remove.bg directly
 *  2. Else → proxy through the API server (uses server-side REMOVE_BG_API_KEY)
 *  3. If both fail → return { success: false }
 * Always returns image/jpeg with #ffffff background.
 */
export async function removeBackground(sourceUri: string): Promise<RemoveBgResult> {
  try {
    let base64: string;

    if (Platform.OS === "web") {
      base64 = await fetchToBase64Web(sourceUri);
    } else {
      base64 = await FileSystem.readAsStringAsync(sourceUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }

    // Try direct remove.bg if key is available
    if (REMOVE_BG_KEY) {
      const result = await callRemoveBgDirect(base64);
      if (result.success) return result;
      console.warn("[removeBackground] direct call failed, trying server proxy...");
    }

    // Try via API server proxy
    if (API_DOMAIN) {
      const result = await callRemoveBgViaServer(base64);
      if (result.success) return result;
    }

    return { success: false, reason: "no_key_or_server" };
  } catch (e: any) {
    console.warn("[removeBackground] exception:", e?.message ?? e);
    return { success: false, reason: e?.message ?? "unknown" };
  }
}

async function callRemoveBgDirect(base64: string): Promise<RemoveBgResult> {
  try {
    const body = new FormData();
    body.append("image_file_b64", base64);
    body.append("size", "auto");
    body.append("type", "person");
    body.append("bg_color", "ffffff");
    body.append("format", "jpg");

    const res = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": REMOVE_BG_KEY },
      body,
    });

    if (!res.ok) {
      const err = await res.text().catch(() => res.status.toString());
      console.warn("[removeBackground] direct error:", err);
      return { success: false, reason: err };
    }

    const resultBlob = await res.blob();
    const base64Result = await blobToBase64(resultBlob);
    return await saveBase64ToFile(base64Result);
  } catch (e: any) {
    return { success: false, reason: e?.message ?? "direct_exception" };
  }
}

async function callRemoveBgViaServer(base64: string): Promise<RemoveBgResult> {
  try {
    const url = `https://${API_DOMAIN}/api/remove-bg`;
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
    console.warn("[removeBackground] server exception:", e?.message ?? e);
    return { success: false, reason: e?.message ?? "server_exception" };
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

/** True if any remove.bg path is available (direct key or server) */
export function hasRemoveBgKey(): boolean {
  return !!(REMOVE_BG_KEY || API_DOMAIN);
}
