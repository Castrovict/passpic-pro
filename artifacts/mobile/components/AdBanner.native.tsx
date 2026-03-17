import React from "react";
import { StyleSheet, View, Text } from "react-native";

/**
 * AdBanner — muestra un placeholder en Expo Go / __DEV__.
 * En la build de producción (EAS Build para Play Store) reemplaza
 * este componente con el BannerAd real de react-native-google-mobile-ads.
 *
 * Pasos para producción:
 *  1. Reemplaza los TEST_IDs con tus IDs reales de AdMob.
 *  2. Haz `eas build --platform android`.
 *  3. Descomenta el bloque `BannerAd` de abajo y comenta el placeholder.
 */

// ── IDs de prueba de Google (reemplazar antes de publicar) ──────────────────
// const BANNER_UNIT_ID =
//   Platform.OS === "android"
//     ? "ca-app-pub-TUAPP~TUUNIDAD/BANNERID_ANDROID"
//     : "ca-app-pub-TUAPP~TUUNIDAD/BANNERID_IOS";

// ── Bloque producción (descomentar en EAS Build) ────────────────────────────
// import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
// export function AdBanner() {
//   return (
//     <View style={styles.container}>
//       <BannerAd
//         unitId={BANNER_UNIT_ID}
//         size={BannerAdSize.BANNER}
//         requestOptions={{ requestNonPersonalizedAdsOnly: false }}
//       />
//     </View>
//   );
// }

// ── Placeholder para Expo Go / desarrollo ───────────────────────────────────
export function AdBanner() {
  if (!__DEV__) return null; // en producción no mostrar nada hasta descomentar bloque real
  return (
    <View style={styles.placeholder}>
      <Text style={styles.text}>📢 Espacio para anuncio (AdMob)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#0A1628",
    paddingVertical: 4,
  },
  placeholder: {
    height: 50,
    width: "100%",
    backgroundColor: "#111D33",
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  text: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
    letterSpacing: 0.5,
    fontFamily: "Inter_400Regular",
  },
});
