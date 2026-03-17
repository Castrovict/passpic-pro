import { Feather } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import type { CameraType } from "expo-camera";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

const API_DOMAIN = process.env.EXPO_PUBLIC_DOMAIN ?? "";

interface CameraModalProps {
  visible: boolean;
  initialFacing?: "front" | "back";
  onPhoto: (uri: string) => void;
  onClose: () => void;
}

// ── Face check types ─────────────────────────────────────────────────────────
type FaceStatus = "no_face" | "too_far" | "too_close" | "tilted" | "off_center" | "ready";

interface FaceResult {
  status: FaceStatus;
  message: string;
  messageEs: string;
}

const STATUS_MAP: Record<FaceStatus, { color: string; icon: string }> = {
  no_face:    { color: "rgba(255,80,80,0.9)",   icon: "user-x" },
  too_far:    { color: "rgba(255,160,0,0.9)",   icon: "zoom-in" },
  too_close:  { color: "rgba(255,160,0,0.9)",   icon: "zoom-out" },
  tilted:     { color: "rgba(255,160,0,0.9)",   icon: "rotate-cw" },
  off_center: { color: "rgba(255,160,0,0.9)",   icon: "move" },
  ready:      { color: "rgba(34,197,94,0.92)",  icon: "check-circle" },
};

// ── Main component ────────────────────────────────────────────────────────────
export function CameraModal({
  visible,
  initialFacing = "front",
  onPhoto,
  onClose,
}: CameraModalProps) {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const [facing, setFacing] = useState<CameraType>(initialFacing as CameraType);
  const [flash, setFlash] = useState<"off" | "on">("off");
  const [isTaking, setIsTaking] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // ── Face detection state ────────────────────────────────────────────────
  const [faceResult, setFaceResult] = useState<FaceResult | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const analyzeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isReadyRef = useRef(false);
  const isTakingRef = useRef(false);

  // ── Animations ──────────────────────────────────────────────────────────
  const shutterScale = useSharedValue(1);
  const flashOpacity = useSharedValue(0);
  // 0=white (no result), 1=warning (orange), 2=ready (green)
  const ovalState = useSharedValue(0);
  const ovalPulse = useSharedValue(1);

  const shutterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shutterScale.value }],
  }));
  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const ovalBorderStyle = useAnimatedStyle(() => {
    const colors = [
      "rgba(255,255,255,0.88)",
      "rgba(255,160,50,0.9)",
      "rgba(34,197,94,0.95)",
    ];
    return {
      borderColor: colors[Math.round(ovalState.value)] ?? colors[0],
      transform: [{ scale: ovalPulse.value }],
    };
  });

  // Pulse animation when ready
  useEffect(() => {
    if (faceResult?.status === "ready") {
      ovalPulse.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(ovalPulse);
      ovalPulse.value = withTiming(1, { duration: 150 });
    }
  }, [faceResult?.status]);

  // ── Face analysis via server ─────────────────────────────────────────────
  const analyzeFrame = useCallback(async () => {
    if (!cameraRef.current || isTakingRef.current || analyzing) return;
    if (!API_DOMAIN) return;

    try {
      setAnalyzing(true);
      const snap = await cameraRef.current.takePictureAsync({
        quality: 0.25,
        skipProcessing: true,
        base64: true,
      });
      if (!snap?.base64) return;

      const res = await fetch(`https://${API_DOMAIN}/api/analyze-face`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_base64: snap.base64 }),
        signal: AbortSignal.timeout(4000),
      });

      if (!res.ok) return;
      const data = (await res.json()) as FaceResult;
      setFaceResult(data);
      ovalState.value = withTiming(data.status === "ready" ? 2 : 1, { duration: 300 });

      const wasReady = isReadyRef.current;
      isReadyRef.current = data.status === "ready";

      // Start countdown on first "ready" detection
      if (data.status === "ready" && !wasReady && !isTakingRef.current) {
        startCountdown();
      } else if (data.status !== "ready") {
        clearCountdown();
      }
    } catch {
      // Silently ignore analysis errors (timeout, offline, etc.)
    } finally {
      setAnalyzing(false);
    }
  }, [analyzing]);

  const startCountdown = useCallback(() => {
    setCountdown(3);
    let count = 3;
    countdownTimerRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        clearCountdown();
        if (!isTakingRef.current && isReadyRef.current) {
          handleAutoCapture();
        }
      }
    }, 1000);
  }, []);

  const clearCountdown = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
  }, []);

  // Start/stop periodic analysis when modal opens/closes
  useEffect(() => {
    if (!visible || isWeb || !API_DOMAIN) return;

    // First analysis after 800ms
    const initial = setTimeout(() => analyzeFrame(), 800);
    // Then every 2 seconds
    analyzeTimerRef.current = setInterval(() => analyzeFrame(), 2000);

    return () => {
      clearTimeout(initial);
      if (analyzeTimerRef.current) clearInterval(analyzeTimerRef.current);
      clearCountdown();
      isReadyRef.current = false;
      isTakingRef.current = false;
      setFaceResult(null);
      setCountdown(null);
      ovalState.value = 0;
    };
  }, [visible, isWeb]);

  // ── Camera actions ───────────────────────────────────────────────────────
  const flipCamera = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFacing((prev) => (prev === "front" ? "back" : "front"));
    setFaceResult(null);
    ovalState.value = withTiming(0, { duration: 200 });
    clearCountdown();
  };

  const toggleFlash = () => {
    Haptics.selectionAsync();
    setFlash((prev) => (prev === "off" ? "on" : "off"));
  };

  const capturePhoto = async () => {
    if (!cameraRef.current || isTakingRef.current) return;
    isTakingRef.current = true;
    setIsTaking(true);
    clearCountdown();
    if (analyzeTimerRef.current) clearInterval(analyzeTimerRef.current);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    shutterScale.value = withSequence(
      withTiming(0.88, { duration: 80 }),
      withTiming(1, { duration: 120 })
    );
    flashOpacity.value = withSequence(
      withTiming(0.6, { duration: 60 }),
      withTiming(0, { duration: 200 })
    );

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.95,
        skipProcessing: false,
      });
      if (photo?.uri) onPhoto(photo.uri);
    } catch (e) {
      console.error("takePhoto error:", e);
    } finally {
      isTakingRef.current = false;
      setIsTaking(false);
    }
  };

  const handleAutoCapture = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await capturePhoto();
  };

  const takePhoto = () => capturePhoto();

  // ── Early returns ────────────────────────────────────────────────────────
  if (!visible) return null;

  if (isWeb) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={[styles.webFallback, { paddingTop: topPad + 20, paddingBottom: bottomPad + 20 }]}>
          <LinearGradient colors={[Colors.navy, "#0D1F3C"]} style={StyleSheet.absoluteFill} />
          <Feather name="camera-off" size={64} color="rgba(255,255,255,0.3)" />
          <Text style={styles.webTitle}>Cámara no disponible en navegador</Text>
          <Text style={styles.webSubtitle}>
            Para usar la cámara, abre la app en tu móvil con Expo Go o usa "Subir foto" para seleccionar desde la galería.
          </Text>
          <Pressable onPress={onClose} style={styles.webCloseBtn}>
            <Text style={styles.webCloseBtnText}>Cerrar</Text>
          </Pressable>
        </View>
      </Modal>
    );
  }

  if (!permission) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={styles.centeredContainer}>
          <ActivityIndicator color={Colors.cobalt} size="large" />
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={[styles.permContainer, { paddingTop: topPad + 20, paddingBottom: bottomPad + 20 }]}>
          <LinearGradient colors={[Colors.navy, "#0D1F3C"]} style={StyleSheet.absoluteFill} />
          <View style={styles.permIcon}>
            <Feather name="camera" size={36} color={Colors.white} />
          </View>
          <Text style={styles.permTitle}>Se necesita acceso a la cámara</Text>
          <Text style={styles.permDesc}>
            Para tomar fotos de pasaporte necesitamos acceder a tu cámara.
          </Text>
          <Pressable onPress={requestPermission} style={styles.permBtn}>
            <LinearGradient colors={[Colors.cobalt, Colors.cobaltDark]} style={styles.permBtnGradient}>
              <Text style={styles.permBtnText}>Permitir acceso</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={onClose} style={styles.cancelLink}>
            <Text style={styles.cancelLinkText}>Cancelar</Text>
          </Pressable>
        </View>
      </Modal>
    );
  }

  const statusInfo = faceResult ? STATUS_MAP[faceResult.status] : null;

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.container}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          flash={flash}
        />

        <Animated.View style={[StyleSheet.absoluteFill, styles.flashOverlay, flashStyle]} pointerEvents="none" />

        {/* Top bar */}
        <LinearGradient
          colors={["rgba(0,0,0,0.55)", "transparent"]}
          style={[styles.topBar, { paddingTop: topPad + 12 }]}
        >
          <Animated.View entering={FadeIn.delay(100)}>
            <Pressable onPress={onClose} style={styles.iconBtn}>
              <Feather name="x" size={24} color={Colors.white} />
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(150)} style={styles.facingBadge}>
            <Feather name={facing === "front" ? "user" : "camera"} size={13} color={Colors.white} />
            <Text style={styles.facingText}>
              {facing === "front" ? "Cámara delantera" : "Cámara trasera"}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(200)}>
            <Pressable onPress={toggleFlash} style={styles.iconBtn}>
              <Feather
                name={flash === "on" ? "zap" : "zap-off"}
                size={22}
                color={flash === "on" ? Colors.gold : Colors.white}
              />
            </Pressable>
          </Animated.View>
        </LinearGradient>

        {/* ICAO face guide overlay */}
        <View style={styles.guide} pointerEvents="none">
          <Animated.View style={[styles.oval, ovalBorderStyle]}>
            {/* Eye level indicator — ICAO: eyes ~35% from top */}
            <View style={styles.eyeLine}>
              <View style={styles.eyeLineDash} />
              <View style={styles.eyeLineLabel}>
                <Text style={styles.eyeLineTxt}>OJOS</Text>
              </View>
              <View style={styles.eyeLineDash} />
            </View>
            <View style={[styles.marker, styles.markerTop]} />
            <View style={[styles.marker, styles.markerBottom]} />
          </Animated.View>

          {/* Status badge (below oval) */}
          {statusInfo && faceResult ? (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
              style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}
            >
              <Feather name={statusInfo.icon as any} size={14} color="#fff" />
              <Text style={styles.statusText}>{faceResult.messageEs}</Text>
              {analyzing && (
                <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" style={{ marginLeft: 4 }} />
              )}
            </Animated.View>
          ) : (
            <View style={styles.guideHints}>
              <Text style={styles.guideTitle}>Centra tu cara en el óvalo</Text>
              <Text style={styles.guideSubtitle}>
                Ojos en la línea amarilla · Cabeza erguida · Fondo neutro
              </Text>
            </View>
          )}
        </View>

        {/* Countdown overlay */}
        {countdown !== null && (
          <Animated.View
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(150)}
            style={styles.countdownOverlay}
            pointerEvents="none"
          >
            <Text style={styles.countdownNumber}>{countdown}</Text>
            <Text style={styles.countdownLabel}>¡Mantén la pose!</Text>
          </Animated.View>
        )}

        {/* Biometric checklist (top-right corner) */}
        <BiometricChecklist status={faceResult?.status ?? null} />

        {/* Bottom controls */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.72)"]}
          style={[styles.bottomBar, { paddingBottom: bottomPad + 28 }]}
        >
          <Pressable onPress={flipCamera} style={styles.sideBtn} hitSlop={12}>
            <Feather name="refresh-cw" size={22} color={Colors.white} />
            <Text style={styles.sideBtnText}>
              {facing === "front" ? "Trasera" : "Delantera"}
            </Text>
          </Pressable>

          <Pressable onPress={takePhoto} disabled={isTaking} hitSlop={8}>
            <Animated.View
              style={[
                styles.shutterOuter,
                shutterStyle,
                faceResult?.status === "ready" && styles.shutterReady,
              ]}
            >
              <View style={styles.shutterInner}>
                {isTaking ? (
                  <ActivityIndicator color={Colors.navy} size="small" />
                ) : null}
              </View>
            </Animated.View>
          </Pressable>

          <View style={styles.sideBtn}>
            <Feather name="image" size={22} color="rgba(255,255,255,0.4)" />
            <Text style={[styles.sideBtnText, { color: "rgba(255,255,255,0.4)" }]}>
              Galería
            </Text>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

// ── Biometric checklist component ─────────────────────────────────────────────
function BiometricChecklist({ status }: { status: FaceStatus | null }) {
  const checks = [
    {
      id: "face",
      label: "Rostro visible",
      ok: status !== null && status !== "no_face",
    },
    {
      id: "dist",
      label: "Distancia correcta",
      ok: status !== null && status !== "too_far" && status !== "too_close" && status !== "no_face",
    },
    {
      id: "angle",
      label: "Cabeza recta",
      ok: status !== null && status !== "tilted" && status !== "no_face",
    },
    {
      id: "center",
      label: "Centrado",
      ok: status !== null && status !== "off_center" && status !== "no_face",
    },
  ];

  if (status === null) return null;

  return (
    <Animated.View entering={FadeIn.delay(300)} style={styles.checklist}>
      {checks.map((c) => (
        <View key={c.id} style={styles.checkRow}>
          <Feather
            name={c.ok ? "check-circle" : "circle"}
            size={12}
            color={c.ok ? "rgba(34,197,94,0.95)" : "rgba(255,255,255,0.45)"}
          />
          <Text style={[styles.checkLabel, c.ok && styles.checkLabelOk]}>{c.label}</Text>
        </View>
      ))}
    </Animated.View>
  );
}

// ── Constants & styles ────────────────────────────────────────────────────────
const OVAL_W = 220;
const OVAL_H = 290;
const EYE_TOP_PCT = 0.35;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  centeredContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.navy },
  flashOverlay: { backgroundColor: "#fff" },
  topBar: {
    position: "absolute", top: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 24, zIndex: 10,
  },
  iconBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center",
  },
  facingBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(0,0,0,0.35)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  facingText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.white },
  guide: { ...StyleSheet.absoluteFillObject, zIndex: 5, alignItems: "center", justifyContent: "center" },
  oval: {
    width: OVAL_W, height: OVAL_H, borderRadius: OVAL_W / 2,
    borderWidth: 2.5, borderColor: "rgba(255,255,255,0.88)", overflow: "hidden",
  },
  eyeLine: {
    position: "absolute", top: OVAL_H * EYE_TOP_PCT, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16,
  },
  eyeLineDash: { flex: 1, height: 1.5, backgroundColor: "rgba(255,220,50,0.85)" },
  eyeLineLabel: {
    backgroundColor: "rgba(255,220,50,0.9)", paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 4, marginHorizontal: 5,
  },
  eyeLineTxt: { fontSize: 9, fontWeight: "800", color: "#000", letterSpacing: 0.5 },
  marker: { position: "absolute", alignSelf: "center", width: 12, height: 2, backgroundColor: "rgba(255,255,255,0.55)", borderRadius: 1 },
  markerTop: { top: 10 },
  markerBottom: { bottom: 10 },
  guideHints: { marginTop: 18, alignItems: "center", gap: 4, paddingHorizontal: 20 },
  guideTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.white, textAlign: "center", letterSpacing: -0.2 },
  guideSubtitle: { fontFamily: "Inter_400Regular", fontSize: 11.5, color: "rgba(255,255,255,0.62)", textAlign: "center" },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 7,
    marginTop: 16, paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 22, maxWidth: 280,
  },
  statusText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#fff", flexShrink: 1 },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject, zIndex: 20,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  countdownNumber: {
    fontFamily: "Inter_700Bold", fontSize: 120, color: "rgba(34,197,94,0.95)",
    lineHeight: 130,
  },
  countdownLabel: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: "#fff", marginTop: 8 },
  checklist: {
    position: "absolute", top: 100, right: 16, zIndex: 6,
    backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 12, gap: 8,
  },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  checkLabel: { fontFamily: "Inter_500Medium", fontSize: 11, color: "rgba(255,255,255,0.5)" },
  checkLabelOk: { color: "rgba(255,255,255,0.9)" },
  bottomBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 40, paddingTop: 40, zIndex: 10,
  },
  sideBtn: { alignItems: "center", gap: 6, width: 60 },
  sideBtnText: { fontFamily: "Inter_500Medium", fontSize: 11, color: Colors.white },
  shutterOuter: {
    width: 78, height: 78, borderRadius: 39,
    borderWidth: 4, borderColor: Colors.white, alignItems: "center", justifyContent: "center",
  },
  shutterReady: { borderColor: "rgba(34,197,94,0.95)" },
  shutterInner: {
    width: 62, height: 62, borderRadius: 31,
    backgroundColor: Colors.white, alignItems: "center", justifyContent: "center",
  },
  permContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 16 },
  permIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.cobalt, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  permTitle: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.white, textAlign: "center", letterSpacing: -0.4 },
  permDesc: { fontFamily: "Inter_400Regular", fontSize: 14, color: "rgba(255,255,255,0.6)", textAlign: "center", lineHeight: 21 },
  permBtn: { width: "100%", marginTop: 8, borderRadius: 14, overflow: "hidden" },
  permBtnGradient: { paddingVertical: 16, alignItems: "center" },
  permBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.white },
  cancelLink: { paddingVertical: 8 },
  cancelLinkText: { fontFamily: "Inter_500Medium", fontSize: 14, color: "rgba(255,255,255,0.5)" },
  webFallback: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 16 },
  webTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.white, textAlign: "center", letterSpacing: -0.3, marginTop: 12 },
  webSubtitle: { fontFamily: "Inter_400Regular", fontSize: 14, color: "rgba(255,255,255,0.6)", textAlign: "center", lineHeight: 21 },
  webCloseBtn: { marginTop: 16, backgroundColor: Colors.cobalt, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  webCloseBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.white },
});
