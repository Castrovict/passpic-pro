import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from "react-native-google-mobile-ads";

/**
 * Hook de interstitial AdMob.
 * Pre-carga el anuncio al montar y expone showAd().
 *
 * Interstitial Unit ID: ca-app-pub-4394857612598690/4880821071
 * En __DEV__ usa los IDs de prueba de Google automáticamente.
 */
const INTERSTITIAL_UNIT_ID_ANDROID = "ca-app-pub-4394857612598690/4880821071";

const UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.OS === "android"
  ? INTERSTITIAL_UNIT_ID_ANDROID
  : TestIds.INTERSTITIAL;

export function useInterstitialAd() {
  const adRef = useRef<InterstitialAd | null>(null);
  const loadedRef = useRef(false);
  const shownRef = useRef(false);

  const loadAd = () => {
    const ad = InterstitialAd.createForAdRequest(UNIT_ID, {
      requestNonPersonalizedAdsOnly: false,
    });

    const unsubLoaded = ad.addEventListener(AdEventType.LOADED, () => {
      loadedRef.current = true;
    });

    const unsubError = ad.addEventListener(AdEventType.ERROR, () => {
      loadedRef.current = false;
    });

    const unsubClosed = ad.addEventListener(AdEventType.CLOSED, () => {
      loadedRef.current = false;
      shownRef.current = false;
      unsubLoaded();
      unsubError();
      unsubClosed();
      // Pre-carga el siguiente
      setTimeout(loadAd, 500);
    });

    ad.load();
    adRef.current = ad;
  };

  useEffect(() => {
    loadAd();
    return () => {
      adRef.current = null;
    };
  }, []);

  const showAd = () => {
    if (!shownRef.current && loadedRef.current && adRef.current) {
      shownRef.current = true;
      try {
        adRef.current.show();
      } catch (e) {
        console.warn("[AdInterstitial] show() failed:", e);
        shownRef.current = false;
      }
    }
  };

  return { showAd };
}
