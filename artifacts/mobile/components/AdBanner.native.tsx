import React, { Component, ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";

let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;
try {
  const admob = require("react-native-google-mobile-ads");
  BannerAd = admob.BannerAd;
  BannerAdSize = admob.BannerAdSize;
  TestIds = admob.TestIds;
} catch (e) {
  console.warn("[AdBanner] AdMob not available:", e);
}

class AdSafeWrapper extends Component<{ children: ReactNode }, { crashed: boolean }> {
  state = { crashed: false };
  static getDerivedStateFromError() { return { crashed: true }; }
  componentDidCatch(e: Error) { console.warn("[AdBanner] render error caught:", e.message); }
  render() { return this.state.crashed ? null : this.props.children; }
}

const BANNER_UNIT_ID_ANDROID = "ca-app-pub-4394857612598690/6430674069";

export function AdBanner() {
  if (!BannerAd || !BannerAdSize || !TestIds) return null;

  const UNIT_ID = __DEV__
    ? TestIds.BANNER
    : Platform.OS === "android"
    ? BANNER_UNIT_ID_ANDROID
    : TestIds.BANNER;

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
