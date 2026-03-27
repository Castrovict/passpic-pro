import React, { Component, ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";

class AdSafeWrapper extends Component<{ children: ReactNode }, { crashed: boolean }> {
  state = { crashed: false };
  static getDerivedStateFromError() { return { crashed: true }; }
  componentDidCatch(e: Error) { console.warn("[AdBanner] render error caught:", e.message); }
  render() { return this.state.crashed ? null : this.props.children; }
}

/**
 * Banner AdMob — usa IDs de prueba en DEV, reales en producción.
 *
 * Banner Unit ID: ca-app-pub-4394857612598690/6430674069
 * En __DEV__ usa los IDs de prueba de Google automáticamente.
 */
const BANNER_UNIT_ID_ANDROID = "ca-app-pub-4394857612598690/6430674069";

const UNIT_ID = __DEV__
  ? TestIds.BANNER
  : Platform.OS === "android"
  ? BANNER_UNIT_ID_ANDROID
  : TestIds.BANNER; // iOS no configurado aún

export function AdBanner() {
  return (
    <AdSafeWrapper>
      <View style={styles.container}>
        <BannerAd
          unitId={UNIT_ID}
          size={BannerAdSize.BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        />
      </View>
    </AdSafeWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#0A1628",
    paddingVertical: 2,
  },
});
