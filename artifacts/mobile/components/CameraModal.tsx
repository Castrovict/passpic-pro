import { Feather } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import type { CameraType } from "expo-camera";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useLang } from "@/context/LangContext";

interface CameraModalProps {
  visible: boolean;
  initialFacing?: "front" | "back";
  onPhoto: (uri: string) => void;
  onClose: () => void;
}

export function CameraModal({
  visible,
  initialFacing = "front",
  onPhoto,
  onClose,
}: CameraModalProps) {
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const [facing, setFacing] = useState<CameraType>(initialFacing as CameraType);
  const [flash, setFlash] = useState<"off" | "on">("off");
  const [isTaking, setIsTaking] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const isTakingRef = useRef(false);

  const shutterScale = useRef(new Animated.Value(1)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;

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

    Animated.sequence([
      Animated.timing(shutterScale, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.timing(shutterScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.timing(flashOpacity, { toValue: 0.6, duration: 60, useNativeDriver: true }),
      Animated.timing(flashOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();

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

  // ── Early returns ─────────────────────────────────────────────────────────
  // NOTE: returning null when !visible ensures the CameraView is unmounted
  // and the camera hardware is released, saving battery.
  if (!visible) return null;

  if (isWeb) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={[styles.webFallback, { paddingTop: topPad + 20, paddingBottom: bottomPad + 20 }]}>
          <LinearGradient colors={[Colors.navy, "#0D1F3C"]} style={StyleSheet.absoluteFill} />
          <Feather name="camera-off" size={64} color="rgba(255,255,255,0.3)" />
          <Text style={styles.webTitle}>{t.cameraWebTitle}</Text>
          <Text style={styles.webSubtitle}>{t.cameraWebSubtitle}</Text>
          <Pressable onPress={onClose} style={styles.webCloseBtn}>
            <Text style={styles.webCloseBtnText}>{t.cancel}</Text>
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
          <Text style={styles.permTitle}>{t.cameraNeedsPermission}</Text>
          <Text style={styles.permDesc}>{t.cameraNeedsPermissionDesc}</Text>
          <Pressable onPress={requestPermission} style={styles.permBtn}>
            <LinearGradient colors={[Colors.cobalt, Colors.cobaltDark]} style={styles.permBtnGradient}>
              <Text style={styles.permBtnText}>{t.cameraAllow}</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={onClose} style={styles.cancelLink}>
            <Text style={styles.cancelLinkText}>{t.cancel}</Text>
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

        <Animated.View
          style={[StyleSheet.absoluteFill, styles.flashOverlay, { opacity: flashOpacity }]}
          pointerEvents="none"
        />

        {/* Top bar */}
        <LinearGradient
          colors={["rgba(0,0,0,0.55)", "transparent"]}
          style={[styles.topBar, { paddingTop: topPad + 12 }]}
        >
          <View>
            <Pressable onPress={onClose} style={styles.iconBtn}>
              <Feather name="x" size={24} color={Colors.white} />
            </Pressable>
          </View>

          <View style={styles.facingBadge}>
            <Feather name={facing === "front" ? "user" : "camera"} size={13} color={Colors.white} />
            <Text style={styles.facingText}>
              {t.cameraLabel(facing)}
            </Text>
          </View>

          <View>
            <Pressable onPress={toggleFlash} style={styles.iconBtn}>
              <Feather
                name={flash === "on" ? "zap" : "zap-off"}
                size={22}
                color={flash === "on" ? Colors.gold : Colors.white}
              />
            </Pressable>
          </View>
        </LinearGradient>

        {/* ICAO face guide */}
        <View style={styles.guide} pointerEvents="none">
          <View style={styles.oval}>
            <View style={styles.eyeLine}>
              <View style={styles.eyeLineDash} />
              <View style={styles.eyeLineLabel}>
                <Text style={styles.eyeLineTxt}>{t.eyeLineLabel}</Text>
              </View>
              <View style={styles.eyeLineDash} />
            </View>
            <View style={[styles.marker, styles.markerTop]} />
            <View style={[styles.marker, styles.markerBottom]} />
          </View>

          <View style={styles.guideHints}>
            <Text style={styles.guideTitle}>{t.cameraCenterFace}</Text>
            <Text style={styles.guideSubtitle}>{t.cameraGuideHint}</Text>
          </View>
        </View>

        {/* Static checklist */}
        <StaticChecklist t={t} />

        {/* Bottom controls */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.72)"]}
          style={[styles.bottomBar, { paddingBottom: bottomPad + 28 }]}
        >
          <Pressable onPress={flipCamera} style={styles.sideBtn} hitSlop={12}>
            <Feather name="refresh-cw" size={22} color={Colors.white} />
            <Text style={styles.sideBtnText}>
              {facing === "front" ? t.rearLabel : t.frontLabel}
            </Text>
          </Pressable>

          <Pressable onPress={takePhoto} disabled={isTaking} hitSlop={8}>
            <Animated.View style={[styles.shutterOuter, { transform: [{ scale: shutterScale }] }]}>
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
              {t.galleryLabel}
            </Text>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

function StaticChecklist({ t }: { t: ReturnType<typeof useLang>["t"] }) {
  const tips = [
    { id: "face",   label: t.checkFaceVisible },
    { id: "dist",   label: t.checkDistance },
    { id: "angle",  label: t.checkHeadStraight },
    { id: "center", label: t.checkCentered },
  ];

  return (
    <View style={styles.checklist}>
      {tips.map((tip) => (
        <View key={tip.id} style={styles.checkRow}>
          <Feather name="circle" size={12} color="rgba(255,255,255,0.55)" />
          <Text style={styles.checkLabel}>{tip.label}</Text>
        </View>
      ))}
    </View>
  );
}

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
