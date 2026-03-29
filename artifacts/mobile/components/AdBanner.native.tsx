import React, { Component, ReactNode } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { getBannerUnitId } from "../config/admob";

let BannerAd: any = null;
let BannerAdSize: any = null;
try {
  const admob = require("react-native-google-mobile-ads");
  BannerAd = admob.BannerAd;
  BannerAdSize = admob.BannerAdSize;
} catch (e) {
  console.warn("[AdBanner] AdMob no disponible (normal en Expo Go):", (e as Error).message);
}

class AdSafeWrapper extends Component<{ children: ReactNode }, { crashed: boolean }> {
  state = { crashed: false };
  static getDerivedStateFromError() {
    return { crashed: true };
  }
  componentDidCatch(e: Error) {
    console.warn("[AdBanner] render error capturado:", e.message);
  }
  render() {
    return this.state.crashed ? null : this.props.children;
  }
}

/**
 * Adaptive Anchored Banner — máxima cobertura en cualquier pantalla.
 *
 * ANCHORED_ADAPTIVE_BANNER ajusta automáticamente la altura según el ancho
 * del dispositivo, maximizando el eCPM en pantallas grandes (tablets, plegables).
 * Google recomienda este formato sobre el banner fijo estándar (320×50).
 *
 * En DEV: muestra banner de prueba de Google.
 * En PROD: muestra banner real (ID desde config/admob.ts).
 * En Web / Expo Go sin módulo nativo: no renderiza nada.
 */
export function AdBanner() {
  if (!BannerAd || !BannerAdSize) return null;

  const unitId = getBannerUnitId();
  const screenWidth = Dimensions.get("window").width;

  // ANCHORED_ADAPTIVE_BANNER usa el ancho de pantalla para calcular altura óptima.
  // En pantallas estrechas (~360px) → ~50px. En tablets (~768px) → ~90px.
  const adSize = BannerAdSize.ANCHORED_ADAPTIVE_BANNER ?? BannerAdSize.BANNER;

  return (
    <AdSafeWrapper>
      <View style={[styles.container, { width: screenWidth }]}>
        <BannerAd
          unitId={unitId}
          size={adSize}
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
