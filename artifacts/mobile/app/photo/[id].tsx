import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import ViewShot from "react-native-view-shot";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { COUNTRY_FORMATS } from "@/constants/countries";
import { usePhotos } from "@/context/PhotoContext";
import { useLang } from "@/context/LangContext";
import { formatDimensions, getScoreColor } from "@/utils/photoProcessing";
import { ProcessingAnimation } from "@/components/ProcessingAnimation";
import { CheckRow, ValidationBadge } from "@/components/ui/ValidationBadge";
import { Button } from "@/components/ui/Button";
import { AdBanner } from "@/components/AdBanner";

export default function PhotoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPhoto } = usePhotos();
  const { t, lang } = useLang();
  const insets = useSafeAreaInsets();
  const [processingStep, setProcessingStep] = useState(0);
  const [whiteBgUri, setWhiteBgUri] = useState<string | null>(null);
  const viewShotRef = useRef<ViewShot>(null);
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const photo = getPhoto(id!);
  const country = photo ? COUNTRY_FORMATS.find((c) => c.code === photo.countryCode) : null;

  const scoreAnim = useSharedValue(0);

  useEffect(() => {
    if (photo?.status === "processing") {
      const interval = setInterval(() => {
        setProcessingStep((s) => Math.min(s + 1, 4));
      }, 600);
      return () => clearInterval(interval);
    }
    if (photo?.status === "done" && photo.processedUri) {
      setTimeout(() => {
        scoreAnim.value = withSpring(
          (photo.validationResults?.score ?? 0) / 100,
          { damping: 20, stiffness: 90 }
        );
        if (!isWeb && viewShotRef.current) {
          (viewShotRef.current as any).capture?.().then((uri: string) => {
            setWhiteBgUri(uri);
          }).catch(() => {});
        }
      }, 600);
    }
  }, [photo?.status, photo?.processedUri]);

  const scoreBarStyle = useAnimatedStyle(() => ({
    width: `${scoreAnim.value * 100}%`,
  }));

  const shareUri = whiteBgUri ?? photo?.processedUri ?? null;

  const handleShare = async () => {
    if (!shareUri) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const msg = lang === "es"
        ? `Mi foto de pasaporte para ${photo?.countryName} — Generada con PassPic PRO`
        : `My passport photo for ${photo?.countryName} — Generated with PassPic PRO`;
      await Share.share({ message: msg, url: shareUri });
    } catch (e) {
      console.log("Share cancelled");
    }
  };

  if (!photo) {
    return (
      <View style={styles.notFound}>
        <Feather name="alert-circle" size={40} color={Colors.muted} />
        <Text style={styles.notFoundText}>Photo not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const isProcessing = photo.status === "processing";
  const isDone = photo.status === "done";
  const scoreColor = photo.validationResults
    ? getScoreColor(photo.validationResults.score)
    : Colors.muted;

  return (
    <View style={[styles.container, { paddingBottom: bottomPad }]}>
      <LinearGradient
        colors={[Colors.navy, Colors.navyMid]}
        style={styles.headerGradient}
      />

      <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
          hitSlop={12}
        >
          <Feather name="chevron-down" size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.topBarTitle}>
          {isProcessing ? t.processing : t.passportPhoto}
        </Text>
        {isDone && (
          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [styles.shareBtn, { opacity: pressed ? 0.6 : 1 }]}
            hitSlop={12}
          >
            <Feather name="share" size={20} color={Colors.white} />
          </Pressable>
        )}
        {!isDone && <View style={{ width: 36 }} />}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {isProcessing ? (
          <Animated.View entering={FadeIn} style={styles.processingCard}>
            <ProcessingAnimation step={processingStep} />
          </Animated.View>
        ) : (
          <>
            <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.photoFrame}>
              <ViewShot
                ref={viewShotRef}
                options={{ format: "jpg", quality: 0.97 }}
                style={styles.viewShotWrap}
              >
                <View style={styles.whiteBgContainer}>
                  <View
                    style={[
                      styles.passportFrame,
                      {
                        aspectRatio: country
                          ? country.widthMm / country.heightMm
                          : 3 / 4,
                      },
                    ]}
                  >
                    {photo.processedUri ? (
                      <Image
                        source={{ uri: photo.processedUri }}
                        style={styles.photo}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={styles.photoPlaceholder}>
                        <Feather name="image" size={32} color={Colors.muted} />
                      </View>
                    )}
                    <View style={styles.frameOverlay}>
                      <View style={styles.frameTL} />
                      <View style={styles.frameTR} />
                      <View style={styles.frameBL} />
                      <View style={styles.frameBR} />
                    </View>
                  </View>
                </View>
              </ViewShot>

              {whiteBgUri && (
                <Animated.View entering={FadeIn.delay(200)} style={styles.bgDoneBadge}>
                  <Feather name="check-circle" size={13} color={Colors.success} />
                  <Text style={styles.bgDoneText}>{t.bgDone}</Text>
                </Animated.View>
              )}

              {country && (
                <View style={styles.formatTag}>
                  <Text style={styles.formatFlag}>{country.flag}</Text>
                  <Text style={styles.formatName}>{country.name}</Text>
                  <Text style={styles.formatDims}>
                    {formatDimensions(country.widthMm, country.heightMm)}
                  </Text>
                </View>
              )}
            </Animated.View>

            {photo.validationResults && (
              <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{t.qualityScore}</Text>
                  <ValidationBadge score={photo.validationResults.score} />
                </View>

                <View style={styles.scoreRow}>
                  <Text style={[styles.scoreNum, { color: scoreColor }]}>
                    {photo.validationResults.score}
                  </Text>
                  <Text style={styles.scoreMax}>/100</Text>
                </View>

                <View style={styles.scoreBar}>
                  <Animated.View
                    style={[
                      styles.scoreBarFill,
                      { backgroundColor: scoreColor },
                      scoreBarStyle,
                    ]}
                  />
                </View>

                <Text style={[styles.scoreLabel, { color: scoreColor }]}>
                  {photo.validationResults.score >= 80
                    ? t.excellent
                    : photo.validationResults.score >= 60
                    ? t.good
                    : photo.validationResults.score >= 40
                    ? t.fair
                    : t.needsImprovement}
                </Text>
              </Animated.View>
            )}

            {photo.validationResults && (
              <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.card}>
                <Text style={styles.cardTitle}>{t.validationChecks}</Text>
                <View style={styles.divider} />
                {photo.validationResults.checks.map((c, i) => (
                  <React.Fragment key={c.label}>
                    <CheckRow label={c.label} passed={c.passed} message={c.message} />
                    {i < photo.validationResults!.checks.length - 1 && (
                      <View style={styles.divider} />
                    )}
                  </React.Fragment>
                ))}
              </Animated.View>
            )}

            {country && (
              <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.card}>
                <Text style={styles.cardTitle}>{t.photoSpecs}</Text>
                <View style={styles.divider} />
                {[
                  {
                    label: lang === "es" ? "País" : "Country",
                    value: `${country.flag} ${country.name}`,
                  },
                  {
                    label: lang === "es" ? "Dimensiones" : "Dimensions",
                    value: `${country.widthMm}×${country.heightMm}mm`,
                  },
                  { label: lang === "es" ? "Resolución" : "Resolution", value: `${country.dpi} DPI` },
                  {
                    label: lang === "es" ? "Tamaño de salida" : "Output Size",
                    value: `${country.widthPx}×${country.heightPx}px`,
                  },
                  { label: t.background, value: t.backgroundWhite },
                  { label: lang === "es" ? "Notas" : "Notes", value: country.notes },
                ].map(({ label, value }) => (
                  <View key={label} style={styles.specRow}>
                    <Text style={styles.specLabel}>{label}</Text>
                    <Text style={styles.specValue}>{value}</Text>
                  </View>
                ))}
              </Animated.View>
            )}

            <Animated.View entering={FadeInDown.delay(450).springify()} style={styles.actions}>
              <Button
                title={t.share}
                onPress={handleShare}
                icon={<Feather name="share-2" size={16} color={Colors.white} />}
                style={styles.primaryBtn}
              />
              <Button
                title={lang === "es" ? "Nueva Foto" : "New Photo"}
                onPress={() => router.back()}
                variant="ghost"
                icon={<Feather name="camera" size={16} color={Colors.cobalt} />}
                style={styles.secondaryBtn}
              />
            </Animated.View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 220,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: Colors.white,
    letterSpacing: -0.3,
  },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  processingCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    paddingHorizontal: 20,
  },
  photoFrame: {
    alignItems: "center",
    marginBottom: 20,
  },
  viewShotWrap: {
    alignItems: "center",
    width: "100%",
  },
  whiteBgContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 8,
    width: "70%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  bgDoneBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.success + "18",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.success + "30",
  },
  bgDoneText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: Colors.success,
  },
  passportFrame: {
    width: "100%",
    minHeight: 180,
    backgroundColor: Colors.white,
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.silver,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  frameOverlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "none",
  },
  frameTL: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 16,
    height: 16,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: Colors.cobalt,
    borderTopLeftRadius: 2,
  },
  frameTR: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: Colors.cobalt,
    borderTopRightRadius: 2,
  },
  frameBL: {
    position: "absolute",
    bottom: 6,
    left: 6,
    width: 16,
    height: 16,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: Colors.cobalt,
    borderBottomLeftRadius: 2,
  },
  frameBR: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 16,
    height: 16,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: Colors.cobalt,
    borderBottomRightRadius: 2,
  },
  formatTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  formatFlag: {
    fontSize: 16,
  },
  formatName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.navy,
  },
  formatDims: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.muted,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  cardTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.navy,
    letterSpacing: -0.3,
    marginBottom: 0,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginBottom: 12,
  },
  scoreNum: {
    fontFamily: "Inter_700Bold",
    fontSize: 48,
    letterSpacing: -2,
  },
  scoreMax: {
    fontFamily: "Inter_400Regular",
    fontSize: 18,
    color: Colors.muted,
  },
  scoreBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.silver,
    overflow: "hidden",
    marginBottom: 8,
  },
  scoreBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  scoreLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    letterSpacing: -0.1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.offWhite,
    marginVertical: 2,
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.offWhite,
    gap: 12,
  },
  specLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.muted,
    flex: 1,
  },
  specValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.navy,
    flex: 2,
    textAlign: "right",
  },
  actions: {
    gap: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  primaryBtn: {
    width: "100%",
  },
  secondaryBtn: {
    width: "100%",
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 40,
  },
  notFoundText: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: Colors.muted,
  },
});
