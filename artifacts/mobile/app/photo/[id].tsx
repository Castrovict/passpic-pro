import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as MediaLibrary from "expo-media-library";
import { router, useLocalSearchParams } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
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
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { captureRef } from "react-native-view-shot";
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
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const whiteBgRef = useRef<View>(null);
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const photo = getPhoto(id!);
  const country = photo ? COUNTRY_FORMATS.find((c) => c.code === photo.countryCode) : null;

  const scoreAnim = useSharedValue(0);

  const captureWhiteBg = useCallback(async () => {
    if (isWeb || !whiteBgRef.current) return;
    try {
      const uri = await captureRef(whiteBgRef, { format: "jpg", quality: 0.97 });
      setWhiteBgUri(uri);
    } catch (e) {
      console.warn("[captureRef] capture failed:", e);
    }
  }, [isWeb]);

  useEffect(() => {
    if (photo?.status === "processing") {
      const interval = setInterval(() => {
        setProcessingStep((s) => Math.min(s + 1, 4));
      }, 2200);
      return () => clearInterval(interval);
    }
    if (photo?.status === "done" && photo.processedUri) {
      scoreAnim.value = withSpring(
        (photo.validationResults?.score ?? 0) / 100,
        { damping: 20, stiffness: 90 }
      );
      setTimeout(captureWhiteBg, 1200);
    }
  }, [photo?.status, photo?.processedUri]);

  const scoreBarStyle = useAnimatedStyle(() => ({
    width: `${scoreAnim.value * 100}%`,
  }));

  const shareUri = whiteBgUri ?? photo?.processedUri ?? null;

  const getLocalUri = async (uri: string): Promise<string> => {
    if (uri.startsWith("file://") || uri.startsWith("/")) return uri;
    const dest = `${FileSystem.cacheDirectory}passpic_${Date.now()}.jpg`;
    const info = await FileSystem.downloadAsync(uri, dest);
    return info.uri;
  };

  const handleShare = async () => {
    if (!shareUri) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const isAvailable = !isWeb && await Sharing.isAvailableAsync();
      if (isAvailable) {
        const localUri = await getLocalUri(shareUri);
        await Sharing.shareAsync(localUri, {
          mimeType: "image/jpeg",
          dialogTitle: lang === "es"
            ? `Mi foto de pasaporte — ${photo?.countryName}`
            : `Passport photo — ${photo?.countryName}`,
          UTI: "public.jpeg",
        });
      } else {
        const msg = lang === "es"
          ? `Mi foto de pasaporte para ${photo?.countryName} — Generada con PassPic PRO`
          : `My passport photo for ${photo?.countryName} — Generated with PassPic PRO`;
        await import("react-native").then(({ Share }) =>
          Share.share({ message: msg })
        );
      }
    } catch (e: any) {
      if (!e?.message?.includes("cancel")) {
        console.warn("[Share] error:", e?.message);
      }
    }
  };

  const handleSaveToGallery = async () => {
    if (isWeb) {
      Alert.alert(t.mobileOnly, t.mobileOnlyDesc);
      return;
    }
    if (!shareUri) return;
    setSaving(true);
    const dest = `${FileSystem.cacheDirectory}passpic_save_${Date.now()}.jpg`;
    try {
      let permGranted = false;
      try {
        const perm = await MediaLibrary.requestPermissionsAsync();
        permGranted = perm.status === "granted" || perm.status === "limited";
      } catch {
        permGranted = true;
      }
      if (!permGranted) {
        Alert.alert(t.permissionDenied, t.permDesc);
        setSaving(false);
        return;
      }
      await FileSystem.copyAsync({ from: shareUri, to: dest });
      await MediaLibrary.saveToLibraryAsync(dest);
      setSavedOk(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => setSavedOk(false), 3000);
    } catch (e: any) {
      console.warn("[Save] error:", e?.message);
      try {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          setSaving(false);
          await Sharing.shareAsync(dest.startsWith("file://") ? dest : shareUri, {
            mimeType: "image/jpeg",
            dialogTitle: lang === "es" ? "Guardar foto de pasaporte" : "Save passport photo",
          });
          return;
        }
      } catch { /* ignore */ }
      Alert.alert("Error", t.saveError);
    } finally {
      setSaving(false);
    }
  };

  const openDocumentPreview = () => {
    if (!shareUri) return;
    Haptics.selectionAsync();
    setShowPreview(true);
  };

  if (!photo) {
    return (
      <View style={styles.notFound}>
        <Feather name="alert-circle" size={40} color={Colors.muted} />
        <Text style={styles.notFoundText}>{t.noPhotos}</Text>
        <Button title={t.goBack} onPress={() => router.back()} />
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
            onPress={openDocumentPreview}
            style={({ pressed }) => [styles.shareBtn, { opacity: pressed ? 0.6 : 1 }]}
            hitSlop={12}
          >
            <Feather name="eye" size={20} color={Colors.white} />
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
              <View style={styles.viewShotWrap}>
                <View ref={whiteBgRef} style={styles.whiteBgContainer} collapsable={false}>
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
                        onLoadEnd={captureWhiteBg}
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
              </View>

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

              {isDone && shareUri && (
                <Pressable
                  onPress={openDocumentPreview}
                  style={({ pressed }) => [styles.previewTapHint, { opacity: pressed ? 0.7 : 1 }]}
                >
                  <Feather name="file-text" size={14} color={Colors.cobalt} />
                  <Text style={styles.previewTapText}>{t.tapToPreview}</Text>
                </Pressable>
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
                  { label: t.country, value: `${country.flag} ${country.name}` },
                  { label: t.dimensions, value: `${country.widthMm}×${country.heightMm}mm` },
                  { label: t.resolution, value: `${country.dpi} DPI` },
                  { label: t.outputSize, value: `${country.widthPx}×${country.heightPx}px` },
                  { label: t.background, value: t.backgroundWhite },
                  { label: t.notes, value: country.notes },
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
                title={t.docPreviewTitle}
                onPress={openDocumentPreview}
                icon={<Feather name="file-text" size={16} color={Colors.white} />}
                style={styles.primaryBtn}
              />
              <View style={styles.secondaryRow}>
                <Button
                  title={t.saveToGallery}
                  onPress={handleSaveToGallery}
                  variant="ghost"
                  icon={<Feather name="download" size={16} color={Colors.cobalt} />}
                  style={styles.halfBtn}
                />
                <Button
                  title={t.share}
                  onPress={handleShare}
                  variant="ghost"
                  icon={<Feather name="share-2" size={16} color={Colors.cobalt} />}
                  style={styles.halfBtn}
                />
              </View>
              <Button
                title={t.newPhoto}
                onPress={() => router.back()}
                variant="ghost"
                icon={<Feather name="camera" size={16} color={Colors.muted} />}
                style={[styles.primaryBtn, { opacity: 0.7 }]}
              />
            </Animated.View>

            {savedOk && (
              <Animated.View entering={FadeIn} style={styles.savedBanner}>
                <Feather name="check-circle" size={16} color="#fff" />
                <Text style={styles.savedBannerText}>{t.savedToGallery}</Text>
              </Animated.View>
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <AdBanner />

      {/* ── Document Preview Modal ─────────────────────────────────────── */}
      <Modal
        visible={showPreview}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPreview(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowPreview(false)} />
          <Animated.View entering={FadeInDown.springify()} style={styles.modalSheet}>

            {/* Handle */}
            <View style={styles.sheetHandle} />

            {/* Header */}
            <View style={styles.sheetHeader}>
              <View style={styles.sheetTitleRow}>
                <Feather name="file-text" size={18} color={Colors.navy} />
                <Text style={styles.sheetTitle}>{t.docPreviewTitle}</Text>
              </View>
              <Pressable onPress={() => setShowPreview(false)} hitSlop={12}>
                <View style={styles.closeBtn}>
                  <Feather name="x" size={18} color={Colors.navy} />
                </View>
              </Pressable>
            </View>

            {/* Document preview */}
            <View style={styles.docContainer}>
              <View style={styles.docPaper}>
                {/* Document header strip */}
                <View style={styles.docHeader}>
                  <View style={styles.docHeaderLeft}>
                    {country && (
                      <Text style={styles.docFlag}>{country.flag}</Text>
                    )}
                    <View>
                      <Text style={styles.docCountryName}>{country?.name ?? "—"}</Text>
                      <Text style={styles.docFormatLabel}>{t.docFormat}</Text>
                    </View>
                  </View>
                  <View style={styles.docDimsBadge}>
                    <Text style={styles.docDimsText}>
                      {country ? `${country.widthMm}×${country.heightMm}mm` : "—"}
                    </Text>
                    <Text style={styles.docDpiText}>{country?.dpi ?? 300} DPI</Text>
                  </View>
                </View>

                <View style={styles.docDivider} />

                {/* Photo */}
                <View style={styles.docPhotoArea}>
                  <View style={[
                    styles.docPhotoFrame,
                    { aspectRatio: country ? country.widthMm / country.heightMm : 0.75 }
                  ]}>
                    {shareUri ? (
                      <Image
                        source={{ uri: shareUri }}
                        style={styles.docPhoto}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={styles.docPhotoPlaceholder}>
                        <Feather name="image" size={40} color={Colors.muted} />
                      </View>
                    )}
                  </View>
                  <Text style={styles.docPhotoLabel}>
                    {t.whiteBgReady}
                  </Text>
                </View>

                <View style={styles.docDivider} />

                {/* Specs row */}
                <View style={styles.docSpecsRow}>
                  {[
                    { icon: "check-circle", label: t.validated, color: Colors.success },
                    { icon: "image", label: `${country?.widthPx ?? "—"}×${country?.heightPx ?? "—"}px`, color: Colors.cobalt },
                    { icon: "layers", label: "JPG · 97%", color: Colors.muted },
                  ].map(({ icon, label, color }) => (
                    <View key={label} style={styles.docSpecItem}>
                      <Feather name={icon as any} size={14} color={color} />
                      <Text style={[styles.docSpecText, { color }]}>{label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Action buttons */}
            <View style={styles.sheetActions}>
              <Pressable
                onPress={async () => {
                  await handleSaveToGallery();
                }}
                style={({ pressed }) => [styles.sheetBtn, styles.sheetBtnPrimary, { opacity: pressed || saving ? 0.8 : 1 }]}
                disabled={saving}
              >
                <Feather name={savedOk ? "check" : "download"} size={18} color="#fff" />
                <Text style={styles.sheetBtnPrimaryText}>
                  {saving ? t.saving : savedOk ? t.saved : t.saveToGallery}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => { setShowPreview(false); setTimeout(handleShare, 300); }}
                style={({ pressed }) => [styles.sheetBtn, styles.sheetBtnSecondary, { opacity: pressed ? 0.8 : 1 }]}
              >
                <Feather name="share-2" size={18} color={Colors.cobalt} />
                <Text style={styles.sheetBtnSecondaryText}>{t.share}</Text>
              </Pressable>
            </View>

            <View style={{ height: insets.bottom + 8 }} />
          </Animated.View>
        </View>
      </Modal>
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
  previewTapHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    backgroundColor: Colors.cobalt + "12",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.cobalt + "25",
  },
  previewTapText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: Colors.cobalt,
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
    gap: 10,
    marginTop: 4,
    marginBottom: 12,
  },
  primaryBtn: {
    width: "100%",
  },
  secondaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  halfBtn: {
    flex: 1,
  },
  savedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.success,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  savedBannerText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#fff",
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

  // ── Modal ───────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 20,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.silver,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  sheetTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sheetTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.navy,
    letterSpacing: -0.4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.offWhite,
    alignItems: "center",
    justifyContent: "center",
  },
  docContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  docPaper: {
    width: "100%",
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.silver,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  docHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    backgroundColor: Colors.navy,
  },
  docHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  docFlag: {
    fontSize: 26,
  },
  docCountryName: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: Colors.white,
    letterSpacing: -0.2,
  },
  docFormatLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.55)",
    marginTop: 1,
  },
  docDimsBadge: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
  },
  docDimsText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: Colors.white,
    letterSpacing: -0.2,
  },
  docDpiText: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    marginTop: 1,
  },
  docDivider: {
    height: 1,
    backgroundColor: Colors.silver,
  },
  docPhotoArea: {
    alignItems: "center",
    padding: 20,
    backgroundColor: Colors.white,
  },
  docPhotoFrame: {
    width: 160,
    backgroundColor: Colors.white,
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.silver,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  },
  docPhoto: {
    width: "100%",
    height: "100%",
  },
  docPhotoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  docPhotoLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: Colors.muted,
    marginTop: 10,
    textAlign: "center",
  },
  docSpecsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 12,
    backgroundColor: Colors.offWhite,
  },
  docSpecItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  docSpecText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  sheetActions: {
    gap: 10,
    marginBottom: 8,
  },
  sheetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 15,
    borderRadius: 16,
  },
  sheetBtnPrimary: {
    backgroundColor: Colors.cobalt,
  },
  sheetBtnPrimaryText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.white,
    letterSpacing: -0.3,
  },
  sheetBtnSecondary: {
    backgroundColor: Colors.offWhite,
    borderWidth: 1.5,
    borderColor: Colors.silver,
  },
  sheetBtnSecondaryText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.cobalt,
    letterSpacing: -0.3,
  },
});
