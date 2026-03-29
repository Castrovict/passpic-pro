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

import { Platform } from "react-native";

// ─── Banner Ad Unit IDs ───────────────────────────────────────────────────────
export const BANNER_AD_UNIT_ID = {
  /** Test ID oficial de Google — usado en DEV (__DEV__ === true) */
  test: "ca-app-pub-3940256099942544/6300978111",
  /** ID de producción Android */
  android: "ca-app-pub-4394857612598690/6430674069",
  /** TODO: Crear unidad Banner en AdMob Console para iOS */
  ios: "ca-app-pub-3940256099942544/6300978111",
};

// ─── Interstitial Ad Unit IDs ─────────────────────────────────────────────────
export const INTERSTITIAL_AD_UNIT_ID = {
  /** Test ID oficial de Google — usado en DEV (__DEV__ === true) */
  test: "ca-app-pub-3940256099942544/1033173712",
  /** ID de producción Android */
  android: "ca-app-pub-4394857612598690/4880821071",
  /** TODO: Crear unidad Interstitial en AdMob Console para iOS */
  ios: "ca-app-pub-3940256099942544/1033173712",
};

// ─── Rewarded Ad Unit IDs ─────────────────────────────────────────────────────
// Rewarded ads: se muestran cuando el usuario quiere desbloquear descarga HD.
// Mayor eCPM que banner (~$5-15 CPM Tier 1 vs ~$0.5-2 banner).
export const REWARDED_AD_UNIT_ID = {
  /** Test ID oficial de Google — usado en DEV (__DEV__ === true) */
  test: "ca-app-pub-3940256099942544/5224354917",
  /** TODO: Crear unidad "Rewarded" en AdMob Console → Copiar ID aquí */
  android: "ca-app-pub-3940256099942544/5224354917",
  /** TODO: Crear unidad "Rewarded" en AdMob Console iOS → Copiar ID aquí */
  ios: "ca-app-pub-3940256099942544/5224354917",
};

// ─── Helpers para obtener el ID correcto según plataforma y entorno ───────────

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

export function getRewardedUnitId(): string {
  if (__DEV__) return REWARDED_AD_UNIT_ID.test;
  return Platform.OS === "ios"
    ? REWARDED_AD_UNIT_ID.ios
    : REWARDED_AD_UNIT_ID.android;
}
