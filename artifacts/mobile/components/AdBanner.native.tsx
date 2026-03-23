import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";

/**
 * Banner AdMob — usa IDs de prueba en DEV, reales en producción.
 *
 * ANTES DE PUBLICAR: reemplaza BANNER_UNIT_ID_ANDROID con el Ad Unit ID
 * real de tipo Banner que creaste en la consola de AdMob.
 * Formato: ca-app-pub-4394857612598690/XXXXXXXXXX
 */
const BANNER_UNIT_ID_ANDROID = "ca-app-pub-4394857612598690/XXXXXXXXXX"; // ← reemplazar

const UNIT_ID = __DEV__
  ? TestIds.BANNER
  : Platform.OS === "android"
  ? BANNER_UNIT_ID_ANDROID
  : TestIds.BANNER; // iOS no configurado aún

export function AdBanner() {
  return (
    <View style={styles.container}>
      <BannerAd
        unitId={UNIT_ID}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#0A1628",
    paddingVertical: 2,
  },
});
