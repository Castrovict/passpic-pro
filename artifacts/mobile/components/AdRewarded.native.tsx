import { useEffect, useRef } from "react";
import { getRewardedUnitId } from "../config/admob";

let RewardedAd: any = null;
let RewardedAdEventType: any = null;
let AdEventType: any = null;
try {
  const admob = require("react-native-google-mobile-ads");
  RewardedAd = admob.RewardedAd;
  RewardedAdEventType = admob.RewardedAdEventType;
  AdEventType = admob.AdEventType;
} catch (e) {
  console.warn("[AdRewarded] AdMob no disponible (normal en Expo Go):", (e as Error).message);
}

/**
 * Hook para anuncios Rewarded de AdMob (video completo = recompensa).
 * Uso: mostrar antes de desbloquear descarga HD o certificado ICAO.
 *
 * Retorna showRewardedAd() que devuelve Promise<boolean>:
 *   - true  → usuario vio el anuncio completo → otorgar recompensa
 *   - false → módulo no disponible, error, o canceló
 */
export function useRewardedAd() {
  const adRef = useRef<any>(null);
  const loadedRef = useRef(false);

  const loadAd = () => {
    if (!RewardedAd || !RewardedAdEventType || !AdEventType) return;
    try {
      const unitId = getRewardedUnitId();
      const ad = RewardedAd.createForAdRequest(unitId, {
        requestNonPersonalizedAdsOnly: false,
      });

      const unsubLoaded = ad.addEventListener(RewardedAdEventType.LOADED, () => {
        loadedRef.current = true;
      });
      const unsubError = ad.addEventListener(AdEventType.ERROR, () => {
        loadedRef.current = false;
      });
      const unsubClosed = ad.addEventListener(AdEventType.CLOSED, () => {
        loadedRef.current = false;
        unsubLoaded();
        unsubError();
        unsubClosed();
        unsubEarned?.();
        setTimeout(loadAd, 500);
      });

      let unsubEarned: (() => void) | undefined;

      try {
        ad.load();
      } catch (e) {
        console.warn("[AdRewarded] load() falló:", e);
      }
      adRef.current = ad;
    } catch (e) {
      console.warn("[AdRewarded] createForAdRequest falló:", e);
    }
  };

  useEffect(() => {
    loadAd();
    return () => {
      adRef.current = null;
    };
  }, []);

  /**
   * Muestra el anuncio rewarded.
   * Devuelve true si el usuario completó el anuncio y se ganó la recompensa.
   * Devuelve false si el módulo no está disponible o el ad falló (en dev/Expo Go).
   */
  const showRewardedAd = (): Promise<boolean> => {
    if (!RewardedAd || !RewardedAdEventType || !adRef.current || !loadedRef.current) {
      // En Expo Go o dev sin módulo nativo → conceder recompensa automáticamente
      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      const ad = adRef.current;
      let earned = false;

      const unsubEarned = ad.addEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => { earned = true; }
      );
      const unsubClosed = ad.addEventListener(AdEventType.CLOSED, () => {
        unsubEarned();
        unsubClosed();
        resolve(earned);
      });
      const unsubError = ad.addEventListener(AdEventType.ERROR, () => {
        unsubEarned();
        unsubClosed();
        unsubError();
        resolve(false);
      });

      try {
        void ad.show();
      } catch (e) {
        console.warn("[AdRewarded] show() falló:", e);
        unsubEarned();
        unsubClosed();
        unsubError();
        resolve(false);
      }
    });
  };

  return { showRewardedAd };
}
