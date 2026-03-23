# PassPic PRO — Data Safety (Play Console)

## Instrucciones de uso
Completa la sección "Seguridad de los datos" en Play Console con las siguientes respuestas. Esta sección es obligatoria desde julio 2022.

---

## Sección 1: Recopilación de datos

### ¿Tu app recopila o comparte algún tipo de datos de usuario?
**Respuesta: SÍ** (debido a AdMob, que usa identificadores publicitarios)

> Nota: Aunque el núcleo de la app no recopila datos personales, Google AdMob recopila automáticamente identificadores de publicidad. Debes declararlos.

---

## Sección 2: Tipos de datos recopilados

### Datos personales
| Tipo de dato | ¿Se recopila? | Notas |
|---|---|---|
| Nombre | No | — |
| Dirección de email | No | — |
| Datos de usuario generados | No | Las fotos NO se almacenan en servidores |
| Identificadores de usuario | No | No hay cuentas de usuario |

### Datos financieros
| Tipo de dato | ¿Se recopila? | Notas |
|---|---|---|
| Información de compra | No | No hay compras en app en v1 |
| Información de pago | No | — |

### Ubicación
| Tipo de dato | ¿Se recopila? | Notas |
|---|---|---|
| Ubicación exacta | No | — |
| Ubicación aproximada | No | — |

### Información de la app
| Tipo de dato | ¿Se recopila? | Notas |
|---|---|---|
| Diagnósticos / informes de fallos | Sí (opcional) | Solo si el usuario acepta diagnósticos de Expo |
| Métricas de rendimiento | No | — |

### Dispositivo y otros identificadores
| Tipo de dato | ¿Se recopila? | Notas |
|---|---|---|
| ID de dispositivo | Sí | **AdMob** usa Android Advertising ID (AAID) |
| Identificadores de publicidad | Sí | **AdMob** — Android Advertising ID (AAID) |

---

## Sección 3: AdMob — Datos de publicidad

Dado que la app integra **Google AdMob** (`react-native-google-mobile-ads`, App ID: `ca-app-pub-4394857612598690~5783806800`), debes declarar:

### Datos recopilados por AdMob:
- **Identificadores de publicidad (AAID)**: Identificador de publicidad de Android usado para personalizar anuncios.
- **Datos de uso de la app**: Interacciones con anuncios (clics, impresiones).
- **Diagnósticos**: Informes de fallos relacionados con el SDK de anuncios.

### Respuestas para Play Console — AdMob:

| Pregunta | Respuesta |
|---|---|
| ¿Estos datos se comparten con terceros? | **Sí** — Se comparten con Google (para personalización de anuncios) |
| ¿Es el uso de estos datos opcional? | **Sí** — El usuario puede resetear/optar fuera del AAID en ajustes de Android |
| ¿Los datos se procesan de forma efímera? | **No** — Google puede retener datos según su política |
| ¿Los datos están cifrados en tránsito? | **Sí** — HTTPS/TLS |
| ¿El usuario puede solicitar eliminación? | **Sí** — Via ajustes de Android > Google > Anuncios > Eliminar ID de publicidad |

---

## Sección 4: Fotos procesadas por la app

Las fotos que el usuario captura o importa se envían a la API del servidor de PassPic PRO exclusivamente para el procesamiento de IA (eliminación de fondo, recorte). Una vez procesadas, las fotos se devuelven al dispositivo del usuario y **no se almacenan en el servidor**. El servidor actúa como procesador efímero: recibe la imagen, la procesa y la descarta inmediatamente. La transmisión se realiza siempre mediante HTTPS/TLS.

| Pregunta | Respuesta |
|---|---|
| ¿Las fotos se almacenan en servidores? | **No** — Solo en el dispositivo del usuario; el servidor las procesa y descarta inmediatamente |
| ¿Las fotos se comparten con terceros? | **No** |
| ¿Las fotos están cifradas en tránsito? | **Sí** — HTTPS/TLS en todas las comunicaciones |
| ¿El usuario puede eliminar sus datos? | **Sí** — Eliminando la app o las fotos de la galería del dispositivo |

---

## Sección 5: Resumen de respuestas para el formulario de Play Console

### Paso 1 — Recopilación y uso de datos
- **¿Tu app recopila o comparte datos de usuario requeridos para funcionar?** → **Sí**

### Paso 2 — Tipos de datos
Marcar solo:
- ✅ **Identificadores de dispositivo o de otro tipo** → Android Advertising ID (por AdMob)

NO marcar:
- ❌ Datos personales (nombre, email, etc.)
- ❌ Datos financieros
- ❌ Salud y ejercicio
- ❌ Mensajes
- ❌ Ubicación
- ❌ Contactos

### Paso 3 — Uso de datos (para cada tipo marcado)

**Android Advertising ID:**
- Finalidad: **Publicidad o marketing**
- ¿Es obligatorio? → **Sí** (necesario para mostrar anuncios)
- ¿Se comparte con terceros? → **Sí** (Google AdMob)
- ¿Se cifra en tránsito? → **Sí**
- ¿El usuario puede optar fuera? → **Sí**

### Paso 4 — Prácticas de seguridad
- ✅ **Los datos se cifran en tránsito** — Todos los datos se transmiten de forma segura mediante HTTPS
- ✅ **El usuario puede solicitar la eliminación de datos** — Instrucciones en política de privacidad
- ❌ **No seguimos la política de Familias de Google Play** (app no destinada a menores)

---

## Política de Privacidad (URL requerida)

Debes publicar una política de privacidad y enlazarla en Play Console. URL sugerida: `https://passpic.pro/privacy-policy`

### Contenido mínimo requerido en la Política de Privacidad:
1. Qué datos se recopilan (AAID via AdMob)
2. Cómo se usan (personalización de anuncios)
3. Con quién se comparten (Google)
4. Cómo puede el usuario optar fuera (ajustes de Android)
5. Cómo contactar para eliminar datos (email de soporte)
6. Fecha de última actualización

---

## Clasificación de contenido

### Cuestionario IARC (International Age Rating Coalition)
Responde el cuestionario en Play Console → Clasificación de contenido:

| Pregunta | Respuesta |
|---|---|
| ¿Contiene violencia? | No |
| ¿Contiene contenido sexual? | No |
| ¿Contiene lenguaje ofensivo? | No |
| ¿Promueve el juego de azar? | No |
| ¿Es una app de redes sociales? | No |
| ¿Permite interacción con usuarios? | No |
| ¿Comparte ubicación? | No |
| ¿Permite compras digitales? | No |

**Resultado esperado:** Clasificación **PEGI 3 / Everyone** para todas las regiones.

---

## Categoría de App

- **Categoría principal:** Fotografía (Photography)
- **Etiqueta adicional:** Herramientas (Tools) — opcional, mejora visibilidad

---

## Tags / Keywords ASO (App Store Optimization)

### Español (para mercados hispanohablantes)
```
foto pasaporte, foto visa, foto dni, pasaporte foto, foto carnet, 
foto documento, foto oficial, foto biometrica, foto icao, 
foto 3x4, foto 35x45, foto 2x2 pulgadas, foto pasaporte ia, 
app foto pasaporte, foto pasaporte instantanea, foto id, 
foto para pasaporte, foto para visa, foto para dni
```

### Inglés (para mercados internacionales)
```
passport photo, visa photo, id photo, passport picture, 
biometric photo, ICAO photo, 2x2 photo, 35x45mm photo, 
passport photo maker, passport photo app, ai passport photo, 
instant passport photo, passport photo generator, id card photo, 
driver license photo, photo for passport, white background photo
```

### Tags de Play Store (máximo 5 tags oficiales)
1. passport photo
2. visa photo
3. id photo
4. biometric photo
5. ICAO
