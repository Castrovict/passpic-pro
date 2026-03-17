import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

const REMOVE_BG_KEY = process.env.EXPO_PUBLIC_REMOVE_BG_KEY ?? "";

export type RemoveBgResult =
  | { success: true; uri: string }
  | { success: false; reason: string };

/**
 * Removes the background from an image using remove.bg API.
 * Returns the URI of the new PNG with transparent background written to a temp file.
 * Falls back gracefully if API key is missing or request fails.
 */
export async function removeBackground(sourceUri: string): Promise<RemoveBgResult> {
  if (!REMOVE_BG_KEY) {
    return { success: false, reason: "no_key" };
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

    const body = new FormData();
    body.append("image_file_b64", base64);
    body.append("size", "auto");
    body.append("type", "person");
    body.append("bg_color", "ffffff");
    body.append("format", "jpg");

    const res = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": REMOVE_BG_KEY,
      },
      body,
    });

    if (!res.ok) {
      const err = await res.text().catch(() => res.status.toString());
      console.warn("[removeBackground] remove.bg error:", err);
      return { success: false, reason: err };
    }

    const resultBlob = await res.blob();
    const base64Result = await blobToBase64(resultBlob);

    if (Platform.OS === "web") {
      const dataUri = `data:image/jpeg;base64,${base64Result}`;
      return { success: true, uri: dataUri };
    }

    const destPath = `${FileSystem.cacheDirectory}rmbg_${Date.now()}.jpg`;
    await FileSystem.writeAsStringAsync(destPath, base64Result, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return { success: true, uri: destPath };
  } catch (e: any) {
    console.warn("[removeBackground] exception:", e?.message ?? e);
    return { success: false, reason: e?.message ?? "unknown" };
  }
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
  const base64 = await blobToBase64(blob);
  return base64;
}

export function hasRemoveBgKey(): boolean {
  return !!REMOVE_BG_KEY;
}
