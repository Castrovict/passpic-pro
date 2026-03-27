import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Linking from "expo-linking";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useLang } from "@/context/LangContext";

export const PRIVACY_POLICY_URL = "https://passpicpro.app/privacy";

// ── Privacy policy content (bilingual) ───────────────────────────────────────
const POLICY = {
  es: {
    title: "Política de Privacidad",
    updated: "Última actualización: marzo 2025",
    sections: [
      {
        heading: "1. Información que recopilamos",
        body: "PassPic PRO NO recopila ni almacena información personal identificable. Las fotos que tomas o subes se procesan localmente en tu dispositivo o en nuestro servidor de procesamiento y NO se guardan en ningún servidor permanente.",
      },
      {
        heading: "2. Uso de la cámara y galería",
        body: "Solicitamos acceso a tu cámara para tomar fotos de pasaporte directamente desde la app. Solicitamos acceso a tu galería para que puedas seleccionar fotos existentes y guardar tus fotos procesadas. Estas fotos nunca se comparten con terceros sin tu consentimiento explícito.",
      },
      {
        heading: "3. Procesamiento de imágenes",
        body: "Las imágenes se envían a nuestro servidor de procesamiento únicamente para eliminar el fondo usando inteligencia artificial. Este procesamiento es temporal — las imágenes se eliminan del servidor inmediatamente después del procesamiento. No conservamos copias de tus fotos.",
      },
      {
        heading: "4. Publicidad (Google AdMob)",
        body: "PassPic PRO muestra anuncios a través de Google AdMob. AdMob puede recopilar identificadores de dispositivo y datos de uso para mostrar anuncios relevantes. Puedes desactivar la personalización de anuncios en los ajustes de tu cuenta de Google. Consulta la política de privacidad de Google en: https://policies.google.com/privacy",
      },
      {
        heading: "5. Almacenamiento local",
        body: "Las fotos procesadas se guardan únicamente en tu dispositivo (galería o almacenamiento interno de la app). Usamos AsyncStorage para recordar tus preferencias de idioma y país seleccionado. No enviamos estos datos a ningún servidor.",
      },
      {
        heading: "6. No compartimos tus datos",
        body: "NO vendemos, alquilamos ni compartimos tu información personal con terceros. No utilizamos tus fotos para entrenar modelos de inteligencia artificial ni para ningún otro propósito más allá del procesamiento inmediato de tu foto de pasaporte.",
      },
      {
        heading: "7. Seguridad",
        body: "Todas las comunicaciones entre la app y nuestro servidor de procesamiento se realizan mediante conexiones HTTPS cifradas. Sin embargo, ningún sistema de transmisión de datos es 100% seguro. Te recomendamos no subir fotos con información sensible adicional más allá de lo necesario para una foto de pasaporte.",
      },
      {
        heading: "8. Menores de edad",
        body: "PassPic PRO no está dirigida a menores de 13 años. No recopilamos conscientemente información de menores. Si eres padre/madre y crees que tu hijo ha proporcionado información personal, contáctanos para eliminarla.",
      },
      {
        heading: "9. Tus derechos",
        body: "Tienes el derecho de: (a) acceder a tus datos, (b) solicitar la eliminación de cualquier dato, (c) retirar el consentimiento en cualquier momento desinstalando la app. Para ejercer estos derechos, contáctanos en: soporte@passpicpro.app",
      },
      {
        heading: "10. Cambios a esta política",
        body: "Podemos actualizar esta política ocasionalmente. Te notificaremos de cambios importantes mediante una notificación en la app. El uso continuado de la app después de los cambios constituye aceptación de la nueva política.",
      },
      {
        heading: "11. Contacto",
        body: "Si tienes preguntas sobre esta política de privacidad, contáctanos:\n\nEmail: soporte@passpicpro.app\nAplicación: PassPic PRO\nDesarrollado con IA — sin almacenamiento de datos personales.",
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: "Last updated: March 2025",
    sections: [
      {
        heading: "1. Information We Collect",
        body: "PassPic PRO does NOT collect or store personally identifiable information. Photos you take or upload are processed locally on your device or on our processing server and are NOT stored on any permanent server.",
      },
      {
        heading: "2. Camera and Gallery Access",
        body: "We request camera access to take passport photos directly in the app. We request gallery access so you can select existing photos and save your processed passport photos. These photos are never shared with third parties without your explicit consent.",
      },
      {
        heading: "3. Image Processing",
        body: "Images are sent to our processing server solely to remove the background using artificial intelligence. This processing is temporary — images are deleted from the server immediately after processing. We do not retain copies of your photos.",
      },
      {
        heading: "4. Advertising (Google AdMob)",
        body: "PassPic PRO displays ads through Google AdMob. AdMob may collect device identifiers and usage data to show relevant ads. You can opt out of personalized ads in your Google account settings. See Google's privacy policy at: https://policies.google.com/privacy",
      },
      {
        heading: "5. Local Storage",
        body: "Processed photos are saved only on your device (gallery or app internal storage). We use AsyncStorage to remember your language preference and selected country. We do not send this data to any server.",
      },
      {
        heading: "6. We Do Not Share Your Data",
        body: "We do NOT sell, rent, or share your personal information with third parties. We do not use your photos to train AI models or for any purpose beyond the immediate processing of your passport photo.",
      },
      {
        heading: "7. Security",
        body: "All communications between the app and our processing server use HTTPS encrypted connections. However, no data transmission system is 100% secure. We recommend not uploading photos with additional sensitive information beyond what is needed for a passport photo.",
      },
      {
        heading: "8. Children",
        body: "PassPic PRO is not directed at children under 13. We do not knowingly collect information from children. If you are a parent and believe your child has provided personal information, contact us to have it removed.",
      },
      {
        heading: "9. Your Rights",
        body: "You have the right to: (a) access your data, (b) request deletion of any data, (c) withdraw consent at any time by uninstalling the app. To exercise these rights, contact us at: support@passpicpro.app",
      },
      {
        heading: "10. Changes to This Policy",
        body: "We may update this policy occasionally. We will notify you of important changes via an in-app notification. Continued use of the app after changes constitutes acceptance of the new policy.",
      },
      {
        heading: "11. Contact",
        body: "If you have questions about this privacy policy, contact us:\n\nEmail: support@passpicpro.app\nApp: PassPic PRO\nBuilt with AI — no personal data stored.",
      },
    ],
  },
};

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const { lang } = useLang();
  const policy = POLICY[lang];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.navy, Colors.navyLight]}
        style={styles.headerGradient}
      />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
          hitSlop={12}
        >
          <Feather name="arrow-left" size={22} color={Colors.white} />
        </Pressable>
        <Text style={styles.topBarTitle}>{policy.title}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header card */}
        <View style={styles.headerCard}>
          <View style={styles.shieldRow}>
            <View style={styles.shieldIcon}>
              <Feather name="shield" size={28} color={Colors.cobalt} />
            </View>
            <View style={styles.headerTextCol}>
              <Text style={styles.headerCardTitle}>{policy.title}</Text>
              <Text style={styles.headerCardSub}>{policy.updated}</Text>
            </View>
          </View>
          <View style={styles.noDividerLine} />
          <View style={styles.summaryRow}>
            {[
              { icon: "lock", label: lang === "es" ? "Sin datos personales" : "No personal data" },
              { icon: "image", label: lang === "es" ? "Fotos no almacenadas" : "Photos not stored" },
              { icon: "eye-off", label: lang === "es" ? "Sin rastreo" : "No tracking" },
            ].map((item) => (
              <View key={item.label} style={styles.summaryItem}>
                <Feather name={item.icon as any} size={16} color={Colors.cobalt} />
                <Text style={styles.summaryLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Policy sections */}
        {policy.sections.map((section, i) => (
          <View
            key={section.heading}
            style={styles.sectionCard}
          >
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Feather name="check-circle" size={16} color={Colors.success} />
          <Text style={styles.footerText}>
            {lang === "es"
              ? "Al usar PassPic PRO aceptas esta política de privacidad."
              : "By using PassPic PRO you accept this privacy policy."}
          </Text>
        </View>

        {/* Public URL link */}
        <View style={styles.urlCard}>
          <Feather name="globe" size={15} color={Colors.cobalt} />
          <View style={styles.urlTextWrap}>
            <Text style={styles.urlLabel}>
              {lang === "es" ? "Versión web pública:" : "Public web version:"}
            </Text>
            <Pressable onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}>
              <Text style={styles.urlLink}>{PRIVACY_POLICY_URL}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.offWhite },
  headerGradient: {
    position: "absolute", top: 0, left: 0, right: 0, height: 160,
  },
  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 16,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center",
  },
  topBarTitle: {
    fontFamily: "Inter_700Bold", fontSize: 17, color: Colors.white, letterSpacing: -0.3,
  },
  scroll: {
    paddingHorizontal: 20, paddingTop: 12,
  },
  headerCard: {
    backgroundColor: Colors.white, borderRadius: 18, padding: 18, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  shieldRow: {
    flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 14,
  },
  shieldIcon: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: Colors.cobalt + "12", alignItems: "center", justifyContent: "center",
  },
  headerTextCol: { flex: 1 },
  headerCardTitle: {
    fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.navy, letterSpacing: -0.4,
  },
  headerCardSub: {
    fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.muted, marginTop: 2,
  },
  noDividerLine: {
    height: 1, backgroundColor: Colors.silver, marginBottom: 14,
  },
  summaryRow: {
    flexDirection: "row", justifyContent: "space-between",
  },
  summaryItem: {
    flex: 1, alignItems: "center", gap: 6,
  },
  summaryLabel: {
    fontFamily: "Inter_500Medium", fontSize: 10, color: Colors.navy,
    textAlign: "center", lineHeight: 14,
  },
  sectionCard: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 16, marginBottom: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  sectionHeading: {
    fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.navy,
    letterSpacing: -0.2, marginBottom: 8,
  },
  sectionBody: {
    fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.muted,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: Colors.success + "12", borderRadius: 12, padding: 14, marginTop: 6,
  },
  footerText: {
    flex: 1, fontFamily: "Inter_400Regular", fontSize: 13,
    color: Colors.navy, lineHeight: 19,
  },
  urlCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: Colors.cobalt + "0F", borderRadius: 12, padding: 14,
    marginTop: 10, marginBottom: 8,
    borderWidth: 1, borderColor: Colors.cobalt + "20",
  },
  urlTextWrap: { flex: 1 },
  urlLabel: {
    fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.muted, marginBottom: 3,
  },
  urlLink: {
    fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.cobalt,
    textDecorationLine: "underline",
  },
});
