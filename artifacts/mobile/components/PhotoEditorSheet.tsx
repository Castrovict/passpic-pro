import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import Slider from "@react-native-community/slider";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useLang } from "@/context/LangContext";

interface Props {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
  onApply: (newUri: string) => void;
}

const { width: SW } = Dimensions.get("window");
const PREVIEW_SIZE = Math.min(SW - 48, 340);

function buildHtml(b64: string, ext: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:100%;height:100%;background:#0d0d1a;display:flex;align-items:center;justify-content:center;overflow:hidden;}
#img{max-width:100%;max-height:100%;object-fit:contain;}
canvas{display:none;}
</style>
</head>
<body>
<img id="img" src="data:image/${ext};base64,${b64}" />
<canvas id="c"></canvas>
<script>
var img=document.getElementById('img');
var canvas=document.getElementById('c');
var ctx=canvas.getContext('2d');

function onMsg(e){
  var d;
  try{d=JSON.parse(e.data);}catch(err){return;}
  if(d.type==='FILTER'){
    img.style.filter=d.filter;
  } else if(d.type==='EXPORT'){
    canvas.width=img.naturalWidth;
    canvas.height=img.naturalHeight;
    ctx.filter=img.style.filter;
    ctx.drawImage(img,0,0,canvas.width,canvas.height);
    var result=canvas.toDataURL('image/jpeg',0.93);
    window.ReactNativeWebView.postMessage(JSON.stringify({type:'RESULT',data:result}));
  }
}
document.addEventListener('message',onMsg);
window.addEventListener('message',onMsg);
img.onload=function(){
  window.ReactNativeWebView.postMessage(JSON.stringify({type:'READY'}));
};
if(img.complete && img.naturalWidth>0){
  window.ReactNativeWebView.postMessage(JSON.stringify({type:'READY'}));
}
</script>
</body>
</html>`;
}

function filterString(br: number, co: number, sa: number): string {
  const b = (100 + br) / 100;
  const c = (100 + co) / 100;
  const s = (100 + sa) / 100;
  return `brightness(${b.toFixed(2)}) contrast(${c.toFixed(2)}) saturate(${s.toFixed(2)})`;
}

export default function PhotoEditorSheet({ visible, imageUri, onClose, onApply }: Props) {
  const { t } = useLang();
  const webviewRef = useRef<WebView>(null);

  const [html, setHtml] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [applying, setApplying] = useState(false);

  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [currentUri, setCurrentUri] = useState(imageUri);

  useEffect(() => {
    if (visible) {
      setCurrentUri(imageUri);
      setBrightness(0);
      setContrast(0);
      setSaturation(0);
      setReady(false);
      setHtml(null);
      loadImage(imageUri);
    }
  }, [visible, imageUri]);

  const loadImage = async (uri: string) => {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      let workUri = uri;
      if (info.exists && (info as any).size > 2_000_000) {
        const resized = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: 1200 } }],
          { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
        );
        workUri = resized.uri;
      }
      const b64 = await FileSystem.readAsStringAsync(workUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const ext = workUri.toLowerCase().endsWith(".png") ? "png" : "jpeg";
      setHtml(buildHtml(b64, ext));
    } catch (e) {
      console.warn("[Editor] loadImage error:", e);
    }
  };

  useEffect(() => {
    if (!ready || !webviewRef.current) return;
    const filter = filterString(brightness, contrast, saturation);
    webviewRef.current.injectJavaScript(
      `img.style.filter='${filter}';true;`
    );
  }, [brightness, contrast, saturation, ready]);

  const handleMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      let msg: { type: string; data?: string };
      try {
        msg = JSON.parse(event.nativeEvent.data);
      } catch {
        return;
      }
      if (msg.type === "READY") {
        setReady(true);
        const filter = filterString(brightness, contrast, saturation);
        webviewRef.current?.injectJavaScript(
          `img.style.filter='${filter}';true;`
        );
      } else if (msg.type === "RESULT" && msg.data) {
        const raw = msg.data.replace(/^data:image\/\w+;base64,/, "");
        const dest = `${FileSystem.cacheDirectory}edited_${Date.now()}.jpg`;
        await FileSystem.writeAsStringAsync(dest, raw, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setApplying(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onApply(dest);
      }
    },
    [brightness, contrast, saturation, onApply]
  );

  const handleApply = () => {
    const hasColorChanges = brightness !== 0 || contrast !== 0 || saturation !== 0;
    if (!hasColorChanges) {
      onApply(currentUri);
      return;
    }
    setApplying(true);
    webviewRef.current?.injectJavaScript(`
      (function(){
        var c=document.getElementById('c');
        var imgEl=document.getElementById('img');
        c.width=imgEl.naturalWidth;
        c.height=imgEl.naturalHeight;
        var ctx2d=c.getContext('2d');
        ctx2d.filter=imgEl.style.filter;
        ctx2d.drawImage(imgEl,0,0,c.width,c.height);
        var r=c.toDataURL('image/jpeg',0.93);
        window.ReactNativeWebView.postMessage(JSON.stringify({type:'RESULT',data:r}));
      })();
      true;
    `);
  };

  const handleReset = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    Haptics.selectionAsync();
  };

  const handleRotate = async (angle: 90 | -90) => {
    try {
      Haptics.selectionAsync();
      const result = await ImageManipulator.manipulateAsync(
        currentUri,
        [{ rotate: angle }],
        { compress: 0.92, format: ImageManipulator.SaveFormat.JPEG }
      );
      setCurrentUri(result.uri);
      setReady(false);
      setHtml(null);
      await loadImage(result.uri);
    } catch (e) {
      console.warn("[Editor] rotate error:", e);
    }
  };

  const handleFlip = async () => {
    try {
      Haptics.selectionAsync();
      const result = await ImageManipulator.manipulateAsync(
        currentUri,
        [{ flip: ImageManipulator.FlipType.Horizontal }],
        { compress: 0.92, format: ImageManipulator.SaveFormat.JPEG }
      );
      setCurrentUri(result.uri);
      setReady(false);
      setHtml(null);
      await loadImage(result.uri);
    } catch (e) {
      console.warn("[Editor] flip error:", e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={s.root}>
        <View style={s.header}>
          <Pressable onPress={onClose} hitSlop={12} style={s.closeBtn}>
            <Feather name="x" size={22} color={Colors.textMuted} />
          </Pressable>
          <Text style={s.title}>{t.editorTitle}</Text>
          <Pressable
            onPress={handleApply}
            disabled={applying || !ready}
            hitSlop={12}
            style={[s.applyBtn, (applying || !ready) && { opacity: 0.4 }]}
          >
            {applying ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={s.applyText}>{t.applyEdits}</Text>
            )}
          </Pressable>
        </View>

        <View style={s.previewContainer}>
          {html ? (
            <WebView
              ref={webviewRef}
              source={{ html }}
              style={s.webview}
              onMessage={handleMessage}
              scrollEnabled={false}
              bounces={false}
              javaScriptEnabled
              domStorageEnabled
              originWhitelist={["*"]}
              allowFileAccess
              allowUniversalAccessFromFileURLs
              mixedContentMode="always"
            />
          ) : (
            <View style={s.loadingBox}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={s.loadingText}>Cargando...</Text>
            </View>
          )}
          {!ready && html && (
            <View style={s.loadingOverlay}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}
        </View>

        <View style={s.controls}>
          <View style={s.transformRow}>
            <TransformBtn icon="rotate-ccw" label={t.rotateLeft} onPress={() => handleRotate(-90)} />
            <TransformBtn icon="rotate-cw" label={t.rotateRight} onPress={() => handleRotate(90)} />
            <TransformBtn icon="refresh-cw" label={t.flipH} onPress={handleFlip} />
            <TransformBtn icon="sliders" label={t.resetEdits} onPress={handleReset} />
          </View>

          <SliderRow
            label={t.brightness}
            value={brightness}
            onChange={setBrightness}
            color="#FFD93D"
            icon="sun"
          />
          <SliderRow
            label={t.contrast}
            value={contrast}
            onChange={setContrast}
            color="#6C63FF"
            icon="circle"
          />
          <SliderRow
            label={t.saturation}
            value={saturation}
            onChange={setSaturation}
            color="#FF6B6B"
            icon="droplet"
          />
        </View>
      </View>
    </Modal>
  );
}

function TransformBtn({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={s.transformBtn} onPress={onPress}>
      <Feather name={icon} size={18} color={Colors.text} />
      <Text style={s.transformLabel}>{label}</Text>
    </Pressable>
  );
}

function SliderRow({
  label,
  value,
  onChange,
  color,
  icon,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
  icon: keyof typeof Feather.glyphMap;
}) {
  return (
    <View style={s.sliderRow}>
      <View style={s.sliderLabelRow}>
        <Feather name={icon} size={13} color={color} />
        <Text style={s.sliderLabel}>{label}</Text>
        <Text style={[s.sliderValue, { color }]}>
          {value > 0 ? `+${value}` : value}
        </Text>
      </View>
      <Slider
        style={s.slider}
        minimumValue={-100}
        maximumValue={100}
        step={1}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={color}
        maximumTrackTintColor="#2a2a3e"
        thumbTintColor={color}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0d0d1a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1e1e30",
  },
  closeBtn: {
    width: 36,
    alignItems: "flex-start",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    letterSpacing: 0.3,
  },
  applyBtn: {
    width: 64,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  applyText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.primary,
  },
  previewContainer: {
    height: PREVIEW_SIZE,
    backgroundColor: "#0d0d1a",
    marginHorizontal: 0,
    overflow: "hidden",
  },
  webview: {
    flex: 1,
    backgroundColor: "#0d0d1a",
  },
  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(13,13,26,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  controls: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 4,
  },
  transformRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    gap: 8,
  },
  transformBtn: {
    flex: 1,
    alignItems: "center",
    gap: 5,
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#2a2a40",
  },
  transformLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  sliderRow: {
    marginBottom: 10,
  },
  sliderLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  sliderLabel: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    fontWeight: "600",
  },
  sliderValue: {
    fontSize: 12,
    fontWeight: "700",
    minWidth: 34,
    textAlign: "right",
  },
  slider: {
    width: "100%",
    height: Platform.OS === "ios" ? 32 : 40,
  },
});
