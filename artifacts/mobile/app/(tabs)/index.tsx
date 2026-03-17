import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { COUNTRY_FORMATS, POPULAR_COUNTRIES } from "@/constants/countries";
import { usePhotos } from "@/context/PhotoContext";
import { simulateValidation } from "@/utils/photoProcessing";
import { CountryCard } from "@/components/ui/CountryCard";
import { Button } from "@/components/ui/Button";
import { CameraModal } from "@/components/CameraModal";
import { useLang } from "@/context/LangContext";
import { useCameraPermissions } from "expo-camera";
import { AdBanner } from "@/components/AdBanner";

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const { t, lang, setLang } = useLang();
  const { selectedCountry, setSelectedCountry, addPhoto, updatePhoto } = usePhotos();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"front" | "back">("front");
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [, requestCameraPermission] = useCameraPermissions();
  const isWeb = Platform.OS === "web";

  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : 0;

  const popularCountries = POPULAR_COUNTRIES.map((code) =>
    COUNTRY_FORMATS.find((c) => c.code === code)!
  ).filter(Boolean);

  const toggleCamera = () => {
    Haptics.selectionAsync();
    setCameraFacing((prev) => (prev === "front" ? "back" : "front"));
  };

  const openCamera = async () => {
    if (Platform.OS !== "web") {
      const { granted } = await requestCameraPermission();
      if (!granted) return;
    }
    setShowCameraModal(true);
  };

  const handleCameraPhoto = async (uri: string) => {
    setShowCameraModal(false);
    await processPhoto(uri);
  };

  const pickFromGallery = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Acceso a Fotos",
          perm.canAskAgain
            ? "Se necesita permiso para acceder a tu galería."
            : "Activa el acceso a fotos en Ajustes > PassPic PRO para continuar."
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.95,
      });
      if (result.canceled || !result.assets?.[0]) return;
      await processPhoto(result.assets[0].uri);
    } catch (e: any) {
      console.error("pickFromGallery error:", e);
      Alert.alert("Error", `No se pudo acceder a la galería. ${e?.message ?? "Intenta de nuevo."}`);
    }
  };

  const processPhoto = async (uri: string) => {
    setIsProcessing(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const id = await addPhoto({
      originalUri: uri,
      processedUri: null,
      countryCode: selectedCountry.code,
      countryName: selectedCountry.name,
      status: "processing",
    });

    router.push({ pathname: "/photo/[id]", params: { id } });

    setTimeout(() => {
      const validation = simulateValidation(uri);
      updatePhoto(id, {
        status: "done",
        processedUri: uri,
        validationResults: validation,
      });
      setIsProcessing(false);
    }, 3000);
  };

  return (
    <View style={[styles.container, { paddingBottom: bottomPad }]}>
      <LinearGradient
        colors={[Colors.navy, Colors.navyLight, Colors.offWhite]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 8 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t.appName}</Text>
            <Text style={styles.subtitle}>{t.appSub}</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable
              onPress={() => { Haptics.selectionAsync(); setLang(lang === "es" ? "en" : "es"); }}
              style={styles.langBtn}
            >
              <Text style={styles.langBtnText}>{lang === "es" ? "EN" : "ES"}</Text>
            </Pressable>
            <View style={styles.proTag}>
              <Text style={styles.proText}>PRO</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.heroCard}>
          <View style={styles.passportMock}>
            <View style={styles.passportInner}>
              <View style={styles.passportFaceOuter}>
                <View style={styles.passportFaceInner}>
                  <Feather name="user" size={40} color={Colors.muted} />
                </View>
              </View>
              <View style={styles.passportLines}>
                <View style={[styles.passportLine, { width: 80 }]} />
                <View style={[styles.passportLine, { width: 60 }]} />
                <View style={[styles.passportLine, { width: 40 }]} />
              </View>
            </View>
            <View style={styles.scanLine} />
          </View>

          <View style={styles.featureList}>
            {[
              { icon: "zap", key: "feat1" },
              { icon: "shield", key: "feat2" },
              { icon: "check-circle", key: "feat3" },
            ].map((f, i) => {
              const labels = lang === "es"
                ? ["Fondo Blanco con IA", "50+ Formatos de País", "Validación de Calidad"]
                : ["AI White Background", "50+ Country Formats", "Quality Validation"];
              return (
                <View key={f.key} style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Feather name={f.icon as any} size={14} color={Colors.cobalt} />
                  </View>
                  <Text style={styles.featureText}>{labels[i]}</Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.countryFormat}</Text>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                router.push("/country-selector");
              }}
              style={styles.seeAllBtn}
            >
              <Text style={styles.seeAllText}>{t.allCountries}</Text>
              <Feather name="chevron-right" size={14} color={Colors.cobalt} />
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.countryRow}
          >
            {popularCountries.map((c) => (
              <CountryCard
                key={c.code}
                country={c}
                selected={selectedCountry.code === c.code}
                onPress={setSelectedCountry}
              />
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(350).springify()} style={styles.selectedInfo}>
          <Text style={styles.selectedFlag}>{selectedCountry.flag}</Text>
          <View style={styles.selectedDetails}>
            <Text style={styles.selectedName}>{selectedCountry.name}</Text>
            <Text style={styles.selectedSpec}>
              {selectedCountry.widthMm}×{selectedCountry.heightMm}mm · {selectedCountry.dpi}dpi
            </Text>
            <Text style={styles.selectedNote}>{selectedCountry.notes}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.actions}>
          {/* Selector cámara delantera / trasera */}
          <View style={styles.cameraToggleRow}>
            <Text style={styles.cameraToggleLabel}>{t.camera}:</Text>
            <View style={styles.cameraToggleWrap}>
              <Pressable
                onPress={() => { Haptics.selectionAsync(); setCameraFacing("front"); }}
                style={[
                  styles.cameraToggleBtn,
                  cameraFacing === "front" && styles.cameraToggleBtnActive,
                ]}
              >
                <Feather
                  name="user"
                  size={15}
                  color={cameraFacing === "front" ? Colors.white : Colors.muted}
                />
                <Text
                  style={[
                    styles.cameraToggleText,
                    cameraFacing === "front" && styles.cameraToggleTextActive,
                  ]}
                >
                  {lang === "es" ? "Delantera" : "Front"}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => { Haptics.selectionAsync(); setCameraFacing("back"); }}
                style={[
                  styles.cameraToggleBtn,
                  cameraFacing === "back" && styles.cameraToggleBtnActive,
                ]}
              >
                <Feather
                  name="camera"
                  size={15}
                  color={cameraFacing === "back" ? Colors.white : Colors.muted}
                />
                <Text
                  style={[
                    styles.cameraToggleText,
                    cameraFacing === "back" && styles.cameraToggleTextActive,
                  ]}
                >
                  {lang === "es" ? "Trasera" : "Rear"}
                </Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={openCamera}
            disabled={isProcessing}
            style={({ pressed }) => [
              styles.cameraBtn,
              { opacity: pressed ? 0.88 : isProcessing ? 0.5 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
          >
            <LinearGradient
              colors={[Colors.cobalt, Colors.cobaltDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cameraBtnGradient}
            >
              <View style={styles.cameraIconRing}>
                <Feather name={cameraFacing === "front" ? "user" : "camera"} size={28} color={Colors.white} />
              </View>
              <View>
                <Text style={styles.cameraBtnTitle}>{t.takePhoto}</Text>
                <Text style={styles.cameraBtnSub}>
                  {lang === "es"
                    ? `Cámara ${cameraFacing === "front" ? "delantera" : "trasera"}`
                    : `${cameraFacing === "front" ? "Front" : "Rear"} camera`}
                </Text>
              </View>
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={pickFromGallery}
            disabled={isProcessing}
            style={({ pressed }) => [
              styles.galleryBtn,
              { opacity: pressed ? 0.88 : isProcessing ? 0.5 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
          >
            <Feather name="image" size={22} color={Colors.cobalt} />
            <Text style={styles.galleryBtnText}>{t.uploadGallery}</Text>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(500)} style={styles.tips}>
          <Text style={styles.tipsTitle}>{t.tips}</Text>
          <View style={styles.tipsList}>
            {t.tipsList.map((tip, i) => (
              <View key={i} style={styles.tipItem}>
                <View style={styles.tipNum}>
                  <Text style={styles.tipNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <AdBanner />

      <CameraModal
        visible={showCameraModal}
        initialFacing={cameraFacing}
        onPhoto={handleCameraPhoto}
        onClose={() => setShowCameraModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  scroll: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingTop: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  langBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  langBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    color: Colors.white,
    letterSpacing: 1,
  },
  greeting: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: Colors.white,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    marginTop: 2,
  },
  proTag: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  proText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    color: Colors.navy,
    letterSpacing: 1,
  },
  heroCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  passportMock: {
    width: 80,
    height: 100,
    backgroundColor: Colors.offWhite,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.silver,
    position: "relative",
  },
  passportInner: {
    flex: 1,
    padding: 8,
    alignItems: "center",
    gap: 8,
  },
  passportFaceOuter: {
    width: 44,
    height: 52,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.silverMid,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.silver,
  },
  passportFaceInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  passportLines: {
    gap: 4,
    width: "100%",
  },
  passportLine: {
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.silver,
  },
  scanLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.cobalt + "80",
  },
  featureList: {
    flex: 1,
    gap: 10,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.cobalt + "12",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.navy,
    flex: 1,
    letterSpacing: -0.1,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: Colors.navy,
    letterSpacing: -0.3,
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  seeAllText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.cobalt,
  },
  countryRow: {
    gap: 10,
    paddingRight: 20,
  },
  selectedInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: Colors.cobalt + "30",
    shadowColor: Colors.cobalt,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedFlag: {
    fontSize: 32,
  },
  selectedDetails: {
    flex: 1,
    gap: 2,
  },
  selectedName: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: Colors.navy,
    letterSpacing: -0.2,
  },
  selectedSpec: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: Colors.cobalt,
  },
  selectedNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.muted,
  },
  actions: {
    gap: 12,
    marginBottom: 28,
  },
  cameraBtn: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: Colors.cobalt,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  cameraBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  cameraIconRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBtnTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.white,
    letterSpacing: -0.3,
  },
  cameraBtnSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  galleryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: Colors.cobalt + "30",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  galleryBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.cobalt,
    letterSpacing: -0.2,
  },
  tips: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  tipsTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.navy,
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  tipNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.cobalt + "15",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  tipNumText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    color: Colors.cobalt,
  },
  tipText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 18,
    flex: 1,
  },
  cameraToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: Colors.silver,
    marginBottom: 2,
  },
  cameraToggleLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.navy,
    letterSpacing: -0.2,
  },
  cameraToggleWrap: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: Colors.offWhite,
    borderRadius: 10,
    padding: 3,
  },
  cameraToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cameraToggleBtnActive: {
    backgroundColor: Colors.cobalt,
  },
  cameraToggleText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.muted,
  },
  cameraToggleTextActive: {
    color: Colors.white,
  },
});
