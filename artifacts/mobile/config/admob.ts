/**
 * AdMob Configuration — PassPic PRO
 *
 * DEV mode:  Se usan los Test IDs de Google automáticamente.
 * PROD mode: Se usan los IDs reales de producción.
 *
 * Fuente de IDs:
 *   Google AdMob Console → https://apps.admob.com
 *   App: PassPic PRO | Package: com.passpic.pro
 */

// ─── App IDs (van en app.json → plugins, NO se usan en JS) ───────────────────
//   Android: ca-app-pub-4394857612598690~5783806800  ← ID REAL de producción
//   iOS:     TODO: REEMPLAZAR ID REAL — obtener en AdMob Console para iOS

// ─── Banner Ad Unit IDs ───────────────────────────────────────────────────────
export const BANNER_AD_UNIT_ID = {
  /** Test ID oficial de Google — usado en DEV (__DEV__ === true) */
  test: "ca-app-pub-3940256099942544/6300978111",

  /** TODO: REEMPLAZAR ID REAL — ID de producción Android */
  android: "ca-app-pub-4394857612598690/6430674069",

  /** TODO: REEMPLAZAR ID REAL — Crear unidad Banner en AdMob Console para iOS */
  ios: "ca-app-pub-3940256099942544/6300978111", // ← usando test ID hasta tener ID iOS real
};

// ─── Interstitial Ad Unit IDs ─────────────────────────────────────────────────
export const INTERSTITIAL_AD_UNIT_ID = {
  /** Test ID oficial de Google — usado en DEV (__DEV__ === true) */
  test: "ca-app-pub-3940256099942544/1033173712",

  /** TODO: REEMPLAZAR ID REAL — ID de producción Android */
  android: "ca-app-pub-4394857612598690/4880821071",

  /** TODO: REEMPLAZAR ID REAL — Crear unidad Interstitial en AdMob Console para iOS */
  ios: "ca-app-pub-3940256099942544/1033173712", // ← usando test ID hasta tener ID iOS real
};

// ─── Helper para obtener el ID correcto según plataforma y entorno ────────────
import { Platform } from "react-native";

export function getBannerUnitId(): string {
  if (__DEV__) return BANNER_AD_UNIT_ID.test;
  return Platform.OS === "ios" ? BANNER_AD_UNIT_ID.ios : BANNER_AD_UNIT_ID.android;
}

export function getInterstitialUnitId(): string {
  if (__DEV__) return INTERSTITIAL_AD_UNIT_ID.test;
  return Platform.OS === "ios"
    ? INTERSTITIAL_AD_UNIT_ID.ios
    : INTERSTITIAL_AD_UNIT_ID.android;
}
