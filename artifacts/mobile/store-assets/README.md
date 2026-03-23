# PassPic PRO — Play Store Assets

Todos los recursos para publicar PassPic PRO en Google Play Store.

## Estructura de archivos

```
store-assets/
├── README.md                    ← Este archivo (índice)
├── icon-512.png                 ← Ícono de alta resolución 512×512 px
├── feature-graphic.png          ← Feature Graphic 1024×500 px
├── screenshot-1-home.png        ← Screenshot: Pantalla principal
├── screenshot-2-camera.png      ← Screenshot: Cámara con guía ICAO
├── screenshot-3-result.png      ← Screenshot: Resultado fondo blanco
├── screenshot-4-countries.png   ← Screenshot: Selector de países
├── listing-es.md               ← Textos del listing en Español
├── listing-en.md               ← Textos del listing en Inglés
└── data-safety.md              ← Guía completa Data Safety Play Console
```

## Checklist de publicación en Play Console

### Gráficos
- [ ] **Ícono de la app** → `icon-512.png` (512×512 px, PNG, sin transparencia) ✅
- [ ] **Feature Graphic** → `feature-graphic.png` (1024×500 px, PNG) ✅
- [ ] **Screenshots** → 4 capturas de pantalla en formato 9:16 ✅

### Listing (Ficha de Play Store)
- [ ] Nombre de la app (máx. 30 chars): `PassPic PRO - Foto Pasaporte IA`
- [ ] Descripción corta ES (≤80 chars): `Foto de pasaporte y visa con IA. Cumple normas ICAO. 154+ países.`
- [ ] Descripción larga ES (≤4000 chars): Ver `listing-es.md`
- [ ] Nombre EN: `PassPic PRO - AI Passport Photo`
- [ ] Descripción corta EN (≤80 chars): `AI passport & visa photos. ICAO compliant. 154+ countries. Instant results.`
- [ ] Descripción larga EN (≤4000 chars): Ver `listing-en.md`

### Configuración de la app
- [ ] **Categoría**: Fotografía (Photography)
- [ ] **Clasificación de contenido**: Todos / Everyone (PEGI 3)
- [ ] **Tags ASO**: passport photo, visa photo, id photo, biometric photo, ICAO

### Data Safety (Seguridad de los datos)
- [ ] Completar formulario según `data-safety.md`
- [ ] Datos recopilados: Solo identificadores publicitarios (AdMob)
- [ ] Datos compartidos con terceros: Sí (Google AdMob)
- [ ] Cifrado en tránsito: Sí (HTTPS)
- [ ] Eliminación de datos: Sí (vía ajustes Android)

### Clasificación de contenido
- [ ] Completar cuestionario IARC en Play Console
- [ ] Resultado esperado: PEGI 3 / Everyone

### Política de privacidad
- [ ] URL requerida: `https://passpic.pro/privacy-policy`
- [ ] Contenido mínimo documentado en `data-safety.md`

## Dimensiones de referencia

| Asset | Dimensiones | Formato | Notas |
|---|---|---|---|
| Ícono app | 512×512 px | PNG | Sin transparencia, fondo #0A1628 |
| Feature Graphic | 1024×500 px | PNG | Mínimo 1024×500, máx 3840×2160 |
| Screenshots | 1080×1920 px | PNG/JPG | Mínimo 320px, máx 3840px por lado |
| Screenshots alt | 1080×2340 px | PNG/JPG | Para pantallas altas (21:9) |
