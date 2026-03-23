# Data Safety — Respuestas para Play Console

Este documento contiene las respuestas exactas que debes ingresar en la
sección "Seguridad de los datos" (Data Safety) de Google Play Console.

---

## ¿Tu app recopila o comparte alguno de los tipos de datos de usuarios requeridos?

**→ SÍ** (por Google AdMob)

---

## Tipos de datos recopilados

### Identificadores de dispositivo u otro ID
- **¿Se recopila?** Sí
- **¿Para qué se usa?** Publicidad (Google AdMob recopila el ID de publicidad del dispositivo)
- **¿Es opcional?** No (inherente al uso de AdMob)
- **¿Se comparte?** Sí, con Google AdMob para mostrar anuncios

### Fotos e imágenes
- **¿Se recopila?** Sí (temporalmente durante el procesamiento)
- **¿Para qué se usa?** Funcionalidad de la app (eliminar fondo)
- **¿Es opcional?** No (es la función principal)
- **¿Se comparte?** No (se eliminan del servidor inmediatamente)
- **¿Se procesan de forma efímera?** Sí

---

## Tipos de datos NO recopilados

❌ Nombre
❌ Email o número de teléfono
❌ Dirección
❌ Información de pago
❌ Historial de navegación web
❌ Información de salud o fitness
❌ Mensajes
❌ Contactos
❌ Información de ubicación

---

## Prácticas de seguridad

| Pregunta | Respuesta |
|----------|-----------|
| ¿Los datos están cifrados en tránsito? | **Sí** (HTTPS/TLS) |
| ¿Puedes solicitar borrado de tus datos? | **Sí** (desinstalar la app borra todo) |
| ¿Sigues la política de Familias de Google Play? | **No** (la app no está dirigida a niños) |

---

## Sección de publicidad

**¿La app contiene anuncios?** → Sí

Marcar: "Esta app contiene anuncios"

---

## Notas para completar en Play Console

1. Ve a Play Console → tu app → Presencia en Google Play → Seguridad de los datos
2. Responde "Sí" a "¿Tu app recopila o comparte datos de usuarios?"
3. Selecciona:
   - ✅ Fotos e imágenes (propósito: funcionalidad, efímero)
   - ✅ Identificadores de dispositivo (propósito: publicidad, compartido con AdMob)
4. En Prácticas de seguridad: marcar "Los datos están cifrados en tránsito"
5. En Publicidad: marcar "Esta app contiene anuncios"
6. Guardar y enviar para revisión

---

## Política de privacidad

Debes proporcionar una URL pública con tu política de privacidad.
La pantalla de privacidad ya está implementada en la app (`/privacy`).
Para tener una URL pública, opciones:
- GitHub Pages: crea un repositorio y publica el HTML de la política
- Notion: publica la página como pública
- Google Sites: crea una página gratuita
- Tu propio dominio (recomendado)
