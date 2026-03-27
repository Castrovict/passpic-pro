import { useEffect, useRef } from "react";
import { getInterstitialUnitId } from "../config/admob";

// Carga dinámica para no crashear en Expo Go (donde el módulo nativo no existe)
let InterstitialAd: any = null;
let AdEventType: any = null;
try {
  const admob = require("react-native-google-mobile-ads");
  InterstitialAd = admob.InterstitialAd;
  AdEventType = admob.AdEventType;
} catch (e) {
  console.warn("[AdInterstitial] AdMob no disponible (normal en Expo Go):", (e as Error).message);
}

/**
 * Hook para anuncios intersticiales de AdMob.
 * - En DEV: carga el anuncio de prueba de Google.
 * - En PROD: carga el anuncio real (ID desde config/admob.ts).
 * - En Web / Expo Go sin módulo nativo: showAd() es un no-op seguro.
 *
 * Uso:
 *   const { showAd } = useInterstitialAd();
 *   // Llamar showAd() después de completar una acción importante (ej: guardar foto)
 */
export function useInterstitialAd() {
  const adRef = useRef<any>(null);
  const loadedRef = useRef(false);
  const shownRef = useRef(false);

  const loadAd = () => {
    // Si el módulo nativo no está disponible, no hacer nada
    if (!InterstitialAd || !AdEventType) return;

    try {
      const unitId = getInterstitialUnitId();
      const ad = InterstitialAd.createForAdRequest(unitId, {
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
        // Pre-cargar el siguiente anuncio después de cerrar el actual
        setTimeout(loadAd, 500);
      });

      try {
        ad.load();
      } catch (e) {
        console.warn("[AdInterstitial] load() falló:", e);
      }
      adRef.current = ad;
    } catch (e) {
      console.warn("[AdInterstitial] createForAdRequest falló:", e);
    }
  };

  useEffect(() => {
    loadAd();
    return () => {
      adRef.current = null;
    };
  }, []);

  /** Muestra el anuncio si está cargado. No hace nada si no está disponible. */
  const showAd = () => {
    if (!shownRef.current && loadedRef.current && adRef.current) {
      shownRef.current = true;
      void Promise.resolve(adRef.current.show()).catch((e: Error) => {
        console.warn("[AdInterstitial] show() falló:", e);
        shownRef.current = false;
      });
    }
  };

  return { showAd };
}
