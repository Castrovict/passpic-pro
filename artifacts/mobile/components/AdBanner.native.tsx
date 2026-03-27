import React, { Component, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { getBannerUnitId } from "../config/admob";

// Carga dinámica para no crashear en Expo Go (donde el módulo nativo no existe)
let BannerAd: any = null;
let BannerAdSize: any = null;
try {
  const admob = require("react-native-google-mobile-ads");
  BannerAd = admob.BannerAd;
  BannerAdSize = admob.BannerAdSize;
} catch (e) {
  console.warn("[AdBanner] AdMob no disponible (normal en Expo Go):", (e as Error).message);
}

/** Error boundary para atrapar crashes del WebView de AdMob */
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
 * Banner publicitario de AdMob.
 * - En DEV: muestra el banner de prueba de Google.
 * - En PROD: muestra el banner real (ID desde config/admob.ts).
 * - En Web / Expo Go sin módulo nativo: no renderiza nada (evita errores).
 */
export function AdBanner() {
  // Si el módulo nativo no cargó, retornamos null silenciosamente
  if (!BannerAd || !BannerAdSize) return null;

  const unitId = getBannerUnitId();

  return (
    <AdSafeWrapper>
      <View style={styles.container}>
        <BannerAd
          unitId={unitId}
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
