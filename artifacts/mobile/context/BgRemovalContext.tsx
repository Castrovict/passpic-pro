import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
} from "react";
import { Platform, View } from "react-native";
import WebView, { type WebViewMessageEvent } from "react-native-webview";
import * as FileSystem from "expo-file-system/legacy";

// ─── Types ────────────────────────────────────────────────────────────────────

type PendingEntry = {
  resolve: (base64: string) => void;
  reject: (err: Error) => void;
};

export type BgRemovalResult =
  | { success: true; uri: string }
  | { success: false; reason: string };

type BgRemovalContextValue = {
  removeBackground: (imageBase64: string) => Promise<string>;
  removeBackgroundFromUri: (uri: string) => Promise<BgRemovalResult>;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const BgRemovalContext = createContext<BgRemovalContextValue | null>(null);

// ─── HTML page (runs inside the hidden WebView) ───────────────────────────────
// Uses @imgly/background-removal browser build from CDN.
// Processes images on-device — no server required.
const BG_REMOVAL_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
<script type="module">
  import { removeBackground as doRemoveBg } from "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/dist/index.mjs";

  function sendToNative(obj) {
    window.ReactNativeWebView.postMessage(JSON.stringify(obj));
  }

  function handleMessage(event) {
    var msg;
    try { msg = JSON.parse(event.data); } catch(e) { return; }
    if (!msg || msg.type !== "PROCESS") return;

    var id = msg.id;
    var base64 = msg.base64;

    // Convert base64 JPEG → Blob
    var byteStr = atob(base64);
    var ab = new ArrayBuffer(byteStr.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteStr.length; i++) ia[i] = byteStr.charCodeAt(i);
    var inputBlob = new Blob([ab], { type: "image/jpeg" });

    doRemoveBg(inputBlob, { model: "medium", output: { format: "image/png" } })
      .then(function(pngBlob) {
        return new Promise(function(resolve, reject) {
          var img = new Image();
          img.onload = function() {
            var canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext("2d");
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/jpeg", 0.9).split(",")[1]);
          };
          img.onerror = reject;
          img.src = URL.createObjectURL(pngBlob);
        });
      })
      .then(function(resultBase64) {
        sendToNative({ type: "SUCCESS", id: id, base64: resultBase64 });
      })
      .catch(function(err) {
        sendToNative({ type: "ERROR", id: id, error: err && err.message ? err.message : String(err) });
      });
  }

  // Listen for messages from React Native (both window and document for max compat)
  window.addEventListener("message", handleMessage);
  document.addEventListener("message", handleMessage);

  // Signal ready after module loads
  sendToNative({ type: "READY" });
</script>
</body>
</html>
`;

// ─── Provider ─────────────────────────────────────────────────────────────────

export function BgRemovalProvider({ children }: { children: React.ReactNode }) {
  const webViewRef = useRef<WebView>(null);
  const pendingRef = useRef<Record<string, PendingEntry>>({});
  const isReadyRef = useRef(false);
  const queueRef = useRef<Array<{ id: string; base64: string }>>([]);

  const flushQueue = useCallback(() => {
    const queue = queueRef.current.splice(0);
    for (const item of queue) {
      webViewRef.current?.postMessage(
        JSON.stringify({ type: "PROCESS", id: item.id, base64: item.base64 })
      );
    }
  }, []);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    let msg: { type: string; id?: string; base64?: string; error?: string };
    try {
      msg = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }

    if (msg.type === "READY") {
      isReadyRef.current = true;
      flushQueue();
      return;
    }

    if (!msg.id) return;
    const entry = pendingRef.current[msg.id];
    if (!entry) return;
    delete pendingRef.current[msg.id];

    if (msg.type === "SUCCESS" && msg.base64) {
      entry.resolve(msg.base64);
    } else {
      entry.reject(new Error(msg.error ?? "bg-removal failed"));
    }
  }, [flushQueue]);

  const removeBackground = useCallback((imageBase64: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
      pendingRef.current[id] = { resolve, reject };

      const payload = { type: "PROCESS", id, base64: imageBase64 };
      if (isReadyRef.current && webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify(payload));
      } else {
        queueRef.current.push({ id, base64: imageBase64 });
      }
    });
  }, []);

  const removeBackgroundFromUri = useCallback(async (uri: string): Promise<BgRemovalResult> => {
    try {
      let base64: string;
      if (Platform.OS === "web") {
        const res = await fetch(uri);
        const buf = await res.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let str = "";
        bytes.forEach((b) => (str += String.fromCharCode(b)));
        base64 = btoa(str);
      } else {
        base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      const resultBase64 = await removeBackground(base64);

      if (Platform.OS === "web") {
        return { success: true, uri: `data:image/jpeg;base64,${resultBase64}` };
      }
      const dest = `${FileSystem.cacheDirectory}rmbg_${Date.now()}.jpg`;
      await FileSystem.writeAsStringAsync(dest, resultBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return { success: true, uri: dest };
    } catch (e: any) {
      console.warn("[BgRemoval] WebView processing failed:", e?.message ?? e);
      return { success: false, reason: e?.message ?? "unknown" };
    }
  }, [removeBackground]);

  return (
    <BgRemovalContext.Provider value={{ removeBackground, removeBackgroundFromUri }}>
      {children}
      {/* Hidden WebView — zero size, not visible to the user */}
      <View style={{ width: 0, height: 0, overflow: "hidden" }}>
        <WebView
          ref={webViewRef}
          source={{ html: BG_REMOVAL_HTML }}
          onMessage={handleMessage}
          javaScriptEnabled
          originWhitelist={["*"]}
          // Allow loading CDN resources
          mixedContentMode="always"
          style={{ width: 1, height: 1 }}
        />
      </View>
    </BgRemovalContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBgRemoval(): BgRemovalContextValue {
  const ctx = useContext(BgRemovalContext);
  if (!ctx) throw new Error("useBgRemoval must be used inside BgRemovalProvider");
  return ctx;
}
