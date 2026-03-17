import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, View, Text } from "react-native";
import Colors from "@/constants/colors";

const TEST_BANNER_ID =
  Platform.OS === "android"
    ? "ca-app-pub-3940256099942544/6300978111"
    : "ca-app-pub-3940256099942544/2934735716";

export function AdBanner() {
  const [BannerComponent, setBannerComponent] = useState<React.ComponentType<any> | null>(null);
  const [BannerAdSize, setBannerAdSize] = useState<any>(null);
  const [adFailed, setAdFailed] = useState(false);

  useEffect(() => {
    try {
      const ads = require("react-native-google-mobile-ads");
      setBannerComponent(() => ads.BannerAd);
      setBannerAdSize(ads.BannerAdSize?.BANNER ?? "BANNER");
    } catch {
      setAdFailed(true);
    }
  }, []);

  if (adFailed || !BannerComponent) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Publicidad</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BannerComponent
        unitId={TEST_BANNER_ID}
        size={BannerAdSize}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdFailedToLoad={() => setAdFailed(true)}
      />
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
  placeholderText: {
    color: "rgba(255,255,255,0.25)",
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontFamily: "Inter_400Regular",
  },
});
