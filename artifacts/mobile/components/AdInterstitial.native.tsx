import { useEffect, useRef } from "react";
import { Platform } from "react-native";

let InterstitialAd: any = null;
let AdEventType: any = null;
let TestIds: any = null;
try {
  const admob = require("react-native-google-mobile-ads");
  InterstitialAd = admob.InterstitialAd;
  AdEventType = admob.AdEventType;
  TestIds = admob.TestIds;
} catch (e) {
  console.warn("[AdInterstitial] AdMob not available:", e);
}

const INTERSTITIAL_UNIT_ID_ANDROID = "ca-app-pub-4394857612598690/4880821071";

export function useInterstitialAd() {
  const adRef = useRef<any>(null);
  const loadedRef = useRef(false);
  const shownRef = useRef(false);

  const loadAd = () => {
    if (!InterstitialAd || !AdEventType || !TestIds) return;
    try {
      const UNIT_ID = __DEV__
        ? TestIds.INTERSTITIAL
        : Platform.OS === "android"
        ? INTERSTITIAL_UNIT_ID_ANDROID
        : TestIds.INTERSTITIAL;

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
        setTimeout(loadAd, 500);
      });

      try { ad.load(); } catch (e) { console.warn("[AdInterstitial] load() failed:", e); }
      adRef.current = ad;
    } catch (e) {
      console.warn("[AdInterstitial] createForAdRequest failed:", e);
    }
  };

  useEffect(() => {
    loadAd();
    return () => { adRef.current = null; };
  }, []);

  const showAd = () => {
    if (!shownRef.current && loadedRef.current && adRef.current) {
      shownRef.current = true;
      void Promise.resolve(adRef.current.show()).catch((e: Error) => {
        console.warn("[AdInterstitial] show() failed:", e);
        shownRef.current = false;
      });
    }
  };

  return { showAd };
}
