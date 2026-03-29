# PassPic PRO — Workspace

## Estado del Proyecto (al 29 Mar 2026)

La app está **completa y probada en Expo Go**. Siguiente paso: build APK cuando la cuota EAS se renueve el **1 Abril 2026**.

---

## Mobile App (PassPic PRO)

**Expo React Native** app en `artifacts/mobile/`:

- **154+ países** organizados por región (Latinoamérica, Europa, Asia, Oriente Medio, África, Oceanía)
- **Idioma ES/EN** — toggle persistido en AsyncStorage via `LangContext`
- **Cámara in-app** via `expo-camera` + `CameraModal` — toggle frontal/trasera
  - Guía visual ICAO: óvalo blanco + línea de ojos amarilla ("OJOS") al 35% desde arriba + checklist estático de posición
  - El obturador **solo dispara cuando el usuario lo presiona** — sin auto-disparo ni capturas periódicas
  - `useFocusEffect` cierra la cámara al cambiar de tab (ahorra batería)
  - Permisos totalmente localizados (ES/EN) via `PermissionsGate`
- **Galería** via `expo-image-picker` — permisos pedidos contextualmente
- **Fondo blanco gratuito** — motor ONNX local `@imgly/background-removal-node` + `sharp`, sin API key ni costo
  - Endpoint `POST /api/remove-bg` con `sharp` para compositar PNG transparente sobre blanco → JPEG
  - Primera ejecución: ~2-3 min (descarga modelo). Las siguientes son rápidas.
  - `removeBackground.ts` tiene timeout 30s/90s + callback `onRetrying()`
  - Archivo caché temporal eliminado tras `saveToLibraryAsync`
- **Validación de calidad simulada** con puntuación y checks ICAO
- **AdMob** — `react-native-google-mobile-ads` con monetización global:
  - `config/admob.ts` — IDs centralizados con auto-switch DEV/PROD
  - `AdBanner.native.tsx` — Adaptive Anchored Banner
  - `AdInterstitial.native.tsx` — se dispara 2s después de procesar foto
  - `AdRewarded.native.tsx` — desbloquea descarga HD (modelo "prueba y paga")
  - Android App ID PROD: `ca-app-pub-4394857612598690~5783806800`
  - Banner PROD: `ca-app-pub-4394857612598690/6430674069`
  - Interstitial PROD: `ca-app-pub-4394857612598690/4880821071`
  - TODO: Crear unidad Rewarded en AdMob Console → copiar ID en `config/admob.ts`
  - TODO: Crear unidades iOS → copiar IDs en `config/admob.ts`
- **Certificado ICAO** — modal compartible con puntuación, checks y specs por país (score ≥ 60)
  - Botón "Compartir Certificado" usa `Share` importado estáticamente desde `react-native`
- **Flujo "Ver Anuncio → HD"** — botón gold en Document Preview Modal; rewarded ad → guarda en galería

---

## Cuentas y Credenciales

- **Expo account**: victorcastro / vecrec46@gmail.com
- **projectId**: `ff98d1ca-932d-459c-96ab-67f53afdfce2`
- **EXPO_TOKEN**: `WoxjzWVOIVGB_ES7HS4C-YuFSUSjajB9JDoAbn5Z`
- **API desplegada**: `https://workspace--vecrec46.replit.app`
- **AdMob App ID Android**: `ca-app-pub-4394857612598690~5783806800`
- **GitHub repo**: `github.com/Castrovict/passpic-pro`

---

## Próximos Pasos (cuando haya cuota EAS el 1 Abril 2026)

### Opción A — EAS Build (recomendada)

```bash
cd artifacts/mobile && EXPO_TOKEN=WoxjzWVOIVGB_ES7HS4C-YuFSUSjajB9JDoAbn5Z EAS_NO_VCS=1 eas build --platform android --profile preview --non-interactive
```

- `preview` → APK para probar en dispositivo real
- `production` → AAB para publicar en Google Play
- Ambos perfiles están configurados en `eas.json`

### Opción B — GitHub Actions (sin cuota EAS)

- Crear archivo `.github/workflows/android-apk.yml` en el repo via GitHub web UI
- Añadir secret `EXPO_TOKEN` en Settings → Secrets del repo
- Usar `pnpm install --no-frozen-lockfile` en el workflow

---

## API Server

- Puerto: `8080` (variable `PORT`)
- Endpoints relevantes:
  - `POST /api/remove-bg` — elimina fondo con ONNX, devuelve JPEG con fondo blanco
  - `POST /api/analyze-face` — análisis YCbCr (disponible pero no usado desde la cámara)

---

## Archivos Importantes

```
artifacts/mobile/
├── app.json                     # Config Expo: AdMob plugin, permisos, projectId, assets
├── eas.json                     # Perfiles EAS: preview (APK) + production (AAB)
├── config/admob.ts              # IDs AdMob centralizados
├── context/LangContext.tsx      # Todas las traducciones ES/EN
├── context/PhotoContext.tsx     # Estado global de fotos
├── utils/removeBackground.ts    # Cliente HTTP remove-bg con retry y timeouts
├── utils/photoProcessing.ts     # Validación ICAO simulada
├── constants/countries.ts       # 154+ formatos de foto por país
├── components/
│   ├── CameraModal.tsx          # Cámara in-app con guía ICAO
│   ├── PermissionsGate.tsx      # Permisos localizados
│   ├── AdBanner.native.tsx      # Banner AdMob adaptativo
│   ├── AdInterstitial.native.tsx
│   └── AdRewarded.native.tsx
└── app/
    ├── (tabs)/index.tsx         # Pantalla principal (selector de país + cámara)
    └── photo/[id].tsx           # Resultado: foto procesada + certificado ICAO
```

---

## Workspace

### Overview

pnpm workspace monorepo con TypeScript. Cada paquete gestiona sus propias dependencias.

### Stack

- **Monorepo**: pnpm workspaces
- **Node.js**: 24
- **TypeScript**: 5.9
- **API**: Express 5
- **DB**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (desde OpenAPI spec)

### Notas Técnicas

- `expo-file-system` siempre importar desde `expo-file-system/legacy`
- `Share` de react-native debe importarse **estáticamente** (no con dynamic import)
- `_layout.tsx` usa `AnimatedSplash` con Reanimated — no tocar
- El modelo ONNX de remove-bg se descarga solo la primera vez (~2-3 min)
