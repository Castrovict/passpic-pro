import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useLang } from "@/context/LangContext";

interface Props {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
  onApply: (newUri: string) => void;
}

const { width: SW, height: SH } = Dimensions.get("window");
const PREVIEW_H = Math.min(SH * 0.34, 280);

function buildHtml(b64: string, ext: string): string {
  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:100%;height:100%;background:#111827;display:flex;align-items:center;justify-content:center;overflow:hidden;}
#img{max-width:100%;max-height:100%;object-fit:contain;transition:filter 0.15s;}
canvas{display:none;}
</style></head><body>
<img id="img" src="data:image/${ext};base64,${b64}" />
<canvas id="c"></canvas>
<script>
var img=document.getElementById('img');
var c=document.getElementById('c');
var ctx=c.getContext('2d');
function onMsg(e){
  var d;try{d=JSON.parse(e.data);}catch(err){return;}
  if(d.type==='FILTER'){img.style.filter=d.filter;}
  else if(d.type==='EXPORT'){
    c.width=img.naturalWidth;c.height=img.naturalHeight;
    ctx.filter=img.style.filter;
    ctx.drawImage(img,0,0,c.width,c.height);
    window.ReactNativeWebView.postMessage(JSON.stringify({type:'RESULT',data:c.toDataURL('image/jpeg',0.93)}));
  }
}
document.addEventListener('message',onMsg);window.addEventListener('message',onMsg);
img.onload=function(){window.ReactNativeWebView.postMessage(JSON.stringify({type:'READY'}));};
if(img.complete&&img.naturalWidth>0){window.ReactNativeWebView.postMessage(JSON.stringify({type:'READY'}));}
</script></body></html>`;
}

function cssFilter(br: number, co: number, sa: number): string {
  return `brightness(${((100 + br) / 100).toFixed(2)}) contrast(${((100 + co) / 100).toFixed(2)}) saturate(${((100 + sa) / 100).toFixed(2)})`;
}

export default function PhotoEditorSheet({ visible, imageUri, onClose, onApply }: Props) {
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  const webviewRef = useRef<WebView>(null);

  const [html, setHtml] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [applying, setApplying] = useState(false);
  const [loading, setLoading] = useState(false);

  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [zoomPct, setZoomPct] = useState(0);
  const [sliderZoom, setSliderZoom] = useState(0);
  const [currentUri, setCurrentUri] = useState(imageUri);

  useEffect(() => {
    if (visible) {
      setCurrentUri(imageUri);
      setBrightness(0);
      setContrast(0);
      setSaturation(0);
      setZoomPct(0);
      setSliderZoom(0);
      setReady(false);
      setHtml(null);
      loadImage(imageUri);
    }
  }, [visible, imageUri]);

  const loadImage = async (uri: string) => {
    setLoading(true);
    try {
      const info = await FileSystem.getInfoAsync(uri);
      let workUri = uri;
      if (info.exists && (info as any).size > 2_500_000) {
        const r = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: 1200 } }],
          { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
        );
        workUri = r.uri;
      }
      const b64 = await FileSystem.readAsStringAsync(workUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const ext = workUri.toLowerCase().endsWith(".png") ? "png" : "jpeg";
      setHtml(buildHtml(b64, ext));
    } catch (e) {
      console.warn("[Editor] loadImage:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ready || !webviewRef.current) return;
    webviewRef.current.injectJavaScript(
      `img.style.filter='${cssFilter(brightness, contrast, saturation)}';true;`
    );
  }, [brightness, contrast, saturation, ready]);

  const handleMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      let msg: { type: string; data?: string };
      try { msg = JSON.parse(event.nativeEvent.data); } catch { return; }

      if (msg.type === "READY") {
        setReady(true);
        webviewRef.current?.injectJavaScript(
          `img.style.filter='${cssFilter(brightness, contrast, saturation)}';true;`
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

  const exportWithFilters = () => {
    setApplying(true);
    webviewRef.current?.injectJavaScript(`
      (function(){
        var c=document.getElementById('c');
        var i=document.getElementById('img');
        c.width=i.naturalWidth;c.height=i.naturalHeight;
        var x=c.getContext('2d');
        x.filter=i.style.filter;
        x.drawImage(i,0,0,c.width,c.height);
        window.ReactNativeWebView.postMessage(JSON.stringify({type:'RESULT',data:c.toDataURL('image/jpeg',0.93)}));
      })();true;
    `);
  };

  const handleApply = () => {
    const hasColor = brightness !== 0 || contrast !== 0 || saturation !== 0;
    if (!hasColor) {
      onApply(currentUri);
    } else {
      exportWithFilters();
    }
  };

  const handleReset = () => {
    setBrightness(0); setContrast(0); setSaturation(0);
    if (zoomPct !== 0) {
      setZoomPct(0);
      setSliderZoom(0);
      setCurrentUri(imageUri);
      setReady(false); setHtml(null);
      loadImage(imageUri);
    }
    Haptics.selectionAsync();
  };

  const handleCropZoom = async (pct: number) => {
    const clamped = Math.max(0, Math.min(Math.round(pct), 60));
    if (clamped === zoomPct) return;
    setZoomPct(clamped);
    setSliderZoom(clamped);
    Haptics.selectionAsync();
    if (clamped === 0) {
      setCurrentUri(imageUri);
      setReady(false); setHtml(null);
      await loadImage(imageUri);
      return;
    }
    try {
      const orig = await ImageManipulator.manipulateAsync(imageUri, [], {
        compress: 1,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      const w = orig.width;
      const h = orig.height;
      const factor = 1 - clamped / 100;
      const cropW = Math.round(w * factor);
      const cropH = Math.round(h * factor);
      const originX = Math.round((w - cropW) / 2);
      const originY = Math.round((h - cropH) * 0.30);
      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { crop: { originX, originY, width: cropW, height: cropH } },
          { resize: { width: w, height: h } },
        ],
        { compress: 0.92, format: ImageManipulator.SaveFormat.JPEG }
      );
      setCurrentUri(result.uri);
      setReady(false); setHtml(null);
      await loadImage(result.uri);
    } catch (e) { console.warn("[Editor] zoom:", e); }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[s.root, { paddingTop: insets.top || 16, paddingBottom: insets.bottom || 8 }]}>

        {/* Header */}
        <View style={s.header}>
          <Pressable onPress={onClose} hitSlop={16} style={s.headerSide}>
            <Feather name="x" size={22} color={Colors.textMuted} />
          </Pressable>
          <Text style={s.title}>{t.editorTitle}</Text>
          <Pressable
            onPress={handleApply}
            disabled={applying || !ready}
            hitSlop={16}
            style={[s.headerSide, s.headerRight, (applying || !ready) && { opacity: 0.35 }]}
          >
            {applying
              ? <ActivityIndicator size="small" color={Colors.primary} />
              : <Text style={s.applyText}>{t.applyEdits}</Text>}
          </Pressable>
        </View>

        {/* Preview */}
        <View style={[s.preview, { height: PREVIEW_H }]}>
          {loading && (
            <View style={s.loadingBox}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={s.loadingTxt}>Cargando imagen...</Text>
            </View>
          )}
          {!loading && html && (
            <WebView
              ref={webviewRef}
              source={{ html }}
              style={s.webview}
              onMessage={handleMessage}
              scrollEnabled={false}
              bounces={false}
              javaScriptEnabled
              originWhitelist={["*"]}
              allowFileAccess
              allowUniversalAccessFromFileURLs
            />
          )}
          {!loading && !html && (
            <View style={s.loadingBox}>
              <Feather name="image" size={40} color="#2a2a40" />
            </View>
          )}
          {!ready && html && !loading && (
            <View style={s.loadingOverlay}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}
        </View>

        {/* Controls */}
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Zoom / Face crop */}
          <View style={s.sectionHeaderRow}>
            <Text style={s.sectionLabel}>Acercar Rostro</Text>
            <Feather name="zoom-in" size={13} color="#4ECDC4" />
          </View>
          <View style={s.zoomRow}>
            {([
              { pct: 0,  label: "Original", icon: "image"      },
              { pct: 15, label: "+15%",     icon: "zoom-in"    },
              { pct: 30, label: "+30%",     icon: "zoom-in"    },
              { pct: 45, label: "+45%",     icon: "maximize-2" },
            ] as const).map(({ pct, label, icon }) => {
              const isActive = zoomPct === pct || (pct === 45 && zoomPct > 40 && zoomPct <= 60);
              const isClosest = pct !== 0 && Math.abs(zoomPct - pct) < 8 && zoomPct !== 0;
              return (
                <Pressable
                  key={pct}
                  onPress={() => handleCropZoom(pct)}
                  style={({ pressed }) => [
                    s.zoomBtn,
                    (isActive || isClosest) && s.zoomBtnActive,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Feather
                    name={icon as keyof typeof Feather.glyphMap}
                    size={pct === 0 ? 16 : pct === 45 ? 22 : 19}
                    color={(isActive || isClosest) ? "#4ECDC4" : Colors.textMuted}
                  />
                  <Text style={[s.zoomBtnLabel, (isActive || isClosest) && s.zoomBtnLabelActive]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {/* Continuous zoom slider */}
          <View style={s.zoomSliderRow}>
            <Feather name="zoom-in" size={13} color={sliderZoom > 0 ? "#4ECDC4" : Colors.textMuted} />
            <Slider
              style={s.zoomSlider}
              minimumValue={0}
              maximumValue={60}
              step={1}
              value={sliderZoom}
              onValueChange={(v) => setSliderZoom(Math.round(v))}
              onSlidingComplete={(v) => handleCropZoom(Math.round(v))}
              minimumTrackTintColor="#4ECDC4"
              maximumTrackTintColor="#2a2a40"
              thumbTintColor="#4ECDC4"
            />
            <Text style={[s.zoomSliderVal, sliderZoom > 0 && { color: "#4ECDC4" }]}>
              {sliderZoom}%
            </Text>
          </View>

          {/* Color adjustments */}
          <View style={s.sectionHeaderRow}>
            <Text style={[s.sectionLabel, { marginBottom: 0, marginTop: 0, flex: 1 }]}>Color</Text>
            <Pressable onPress={handleReset} hitSlop={8} style={s.resetInline}>
              <Feather name="refresh-ccw" size={12} color={Colors.textMuted} />
              <Text style={s.resetInlineText}>{t.resetEdits}</Text>
            </Pressable>
          </View>
          <AdjSlider
            icon="sun" label={t.brightness} value={brightness}
            onChange={setBrightness} color="#FFD93D"
          />
          <AdjSlider
            icon="circle" label={t.contrast} value={contrast}
            onChange={setContrast} color="#6C63FF"
          />
          <AdjSlider
            icon="droplet" label={t.saturation} value={saturation}
            onChange={setSaturation} color="#FF6B6B"
          />

          <View style={{ height: 12 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function AdjSlider({
  icon, label, value, onChange, color,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
}) {
  return (
    <View style={s.sliderRow}>
      <View style={s.sliderLabelRow}>
        <Feather name={icon} size={14} color={color} />
        <Text style={s.sliderLabel}>{label}</Text>
        <Text style={[s.sliderVal, { color }]}>{value > 0 ? `+${value}` : value}</Text>
      </View>
      <Slider
        style={s.slider}
        minimumValue={-100}
        maximumValue={100}
        step={1}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={color}
        maximumTrackTintColor="#2a2a40"
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1e1e30",
  },
  headerSide: {
    width: 60,
    justifyContent: "center",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.2,
  },
  applyText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.primary,
  },
  preview: {
    backgroundColor: "#111827",
    overflow: "hidden",
  },
  webview: {
    flex: 1,
    backgroundColor: "#111827",
  },
  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingTxt: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(13,13,26,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    gap: 0,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textMuted,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 4,
  },
  resetInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: "#1a1a2e",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2a2a40",
  },
  resetInlineText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
    marginTop: 4,
  },
  zoomRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
  },
  zoomBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#2a2a40",
  },
  zoomBtnActive: {
    backgroundColor: "#0d2b2e",
    borderColor: "#4ECDC4",
  },
  zoomBtnLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: "600",
    textAlign: "center",
  },
  zoomBtnLabelActive: {
    color: "#4ECDC4",
  },
  zoomSliderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  zoomSlider: {
    flex: 1,
    height: 36,
  },
  zoomSliderVal: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "700",
    width: 34,
    textAlign: "right",
  },
  sliderRow: {
    marginBottom: 14,
  },
  sliderLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 2,
  },
  sliderLabel: {
    flex: 1,
    fontSize: 13,
    color: "#e2e8f0",
    fontWeight: "600",
  },
  sliderVal: {
    fontSize: 12,
    fontWeight: "700",
    minWidth: 36,
    textAlign: "right",
  },
  slider: {
    width: "100%",
    height: Platform.OS === "ios" ? 30 : 42,
    marginTop: -2,
  },
});
