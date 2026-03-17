import { Feather } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import type { CameraType } from "expo-camera";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
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
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

interface CameraModalProps {
  visible: boolean;
  initialFacing?: "front" | "back";
  onPhoto: (uri: string) => void;
  onClose: () => void;
}

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
  const isTakingRef = useRef(false);

  // ── Animations ──────────────────────────────────────────────────────────
  const shutterScale = useSharedValue(1);
  const flashOpacity = useSharedValue(0);

  const shutterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shutterScale.value }],
  }));
  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  // ── Camera actions ───────────────────────────────────────────────────────
  const flipCamera = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFacing((prev) => (prev === "front" ? "back" : "front"));
  };

  const toggleFlash = () => {
    Haptics.selectionAsync();
    setFlash((prev) => (prev === "off" ? "on" : "off"));
  };

  const takePhoto = async () => {
    if (!cameraRef.current || isTakingRef.current) return;
    isTakingRef.current = true;
    setIsTaking(true);

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

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.container}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          flash={flash}
        />

        {/* Flash white overlay (only on real capture) */}
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
          <View style={styles.oval}>
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
          </View>

          {/* Static guide hints below oval */}
          <View style={styles.guideHints}>
            <Text style={styles.guideTitle}>Centra tu cara en el óvalo</Text>
            <Text style={styles.guideSubtitle}>
              Ojos en la línea amarilla · Cabeza erguida · Fondo neutro
            </Text>
          </View>
        </View>

        {/* Static checklist (top-right corner) */}
        <StaticChecklist />

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
            <Animated.View style={[styles.shutterOuter, shutterStyle]}>
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

// ── Static checklist — always visible, no periodic snapshots ─────────────────
function StaticChecklist() {
  const tips = [
    { id: "face",   label: "Rostro visible" },
    { id: "dist",   label: "Distancia correcta" },
    { id: "angle",  label: "Cabeza recta" },
    { id: "center", label: "Centrado" },
  ];

  return (
    <Animated.View entering={FadeIn.delay(300)} style={styles.checklist}>
      {tips.map((t) => (
        <View key={t.id} style={styles.checkRow}>
          <Feather name="circle" size={12} color="rgba(255,255,255,0.55)" />
          <Text style={styles.checkLabel}>{t.label}</Text>
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
  checklist: {
    position: "absolute", top: 100, right: 16, zIndex: 6,
    backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 12, gap: 8,
  },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  checkLabel: { fontFamily: "Inter_500Medium", fontSize: 11, color: "rgba(255,255,255,0.75)" },
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
