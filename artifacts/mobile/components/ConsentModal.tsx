import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Colors from "@/constants/colors";
import { useLang } from "@/context/LangContext";

const CONSENT_KEY = "@passpic_consent_v1";

const CONTENT = {
  es: {
    title: "Tu privacidad es nuestra prioridad",
    subtitle: "Antes de comenzar, revisa cómo usamos tu información.",
    points: [
      {
        icon: "camera",
        heading: "Cámara y galería",
        body: "Usamos la cámara para tomar tu foto de pasaporte. Accedemos a la galería para seleccionar y guardar fotos. Nunca compartimos tus fotos con terceros.",
      },
      {
        icon: "zap",
        heading: "Procesamiento con IA",
        body: "Tu foto se envía a nuestro servidor únicamente para eliminar el fondo. La imagen se elimina del servidor de inmediato — no guardamos copias.",
      },
      {
        icon: "tv",
        heading: "Publicidad (Google AdMob)",
        body: "Mostramos anuncios a través de Google AdMob. AdMob puede recopilar identificadores de dispositivo para mostrar anuncios relevantes.",
      },
      {
        icon: "shield",
        heading: "Sin datos personales",
        body: "No recopilamos nombre, correo, ni ninguna información personal. No hay cuentas. Tus fotos son tuyas.",
      },
    ],
    accept: "Entiendo y acepto",
    viewPolicy: "Ver Política de Privacidad completa",
    required:
      "Debes aceptar la política de privacidad para usar PassPic PRO.",
  },
  en: {
    title: "Your privacy is our priority",
    subtitle: "Before you begin, review how we use your information.",
    points: [
      {
        icon: "camera",
        heading: "Camera & gallery",
        body: "We use the camera to take your passport photo. We access your gallery to select and save photos. We never share your photos with third parties.",
      },
      {
        icon: "zap",
        heading: "AI Processing",
        body: "Your photo is sent to our server only to remove the background. The image is immediately deleted from the server — we do not keep copies.",
      },
      {
        icon: "tv",
        heading: "Advertising (Google AdMob)",
        body: "We display ads through Google AdMob. AdMob may collect device identifiers to show relevant ads.",
      },
      {
        icon: "shield",
        heading: "No personal data",
        body: "We do not collect names, email addresses, or any personal information. No accounts. Your photos are yours.",
      },
    ],
    accept: "I understand and agree",
    viewPolicy: "View full Privacy Policy",
    required: "You must accept the privacy policy to use PassPic PRO.",
  },
};

export function ConsentModal() {
  const { lang } = useLang();
  const c = CONTENT[lang];
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CONSENT_KEY).then((v) => {
      if (!v) setVisible(true);
    });
  }, []);

  const handleAccept = async () => {
    if (!checked) {
      setShowError(true);
      return;
    }
    await AsyncStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const handleViewPolicy = () => {
    router.push("/privacy");
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      {/* Backdrop */}
      <View style={styles.backdrop}>
        <LinearGradient
          colors={["rgba(10,22,40,0.88)", "rgba(10,22,40,0.96)"]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Sheet */}
      <View style={styles.sheetWrap} pointerEvents="box-none">
        <View style={styles.sheet}>
          {/* Header stripe */}
          <LinearGradient
            colors={[Colors.cobalt, Colors.cobaltDark]}
            style={styles.sheetHeader}
          >
            <View style={styles.shieldCircle}>
              <Feather name="shield" size={26} color={Colors.white} />
            </View>
            <Text style={styles.sheetTitle}>{c.title}</Text>
            <Text style={styles.sheetSub}>{c.subtitle}</Text>
          </LinearGradient>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Permission points */}
            {c.points.map((point, i) => (
              <View
                key={point.heading}
                style={styles.pointRow}
              >
                <View style={styles.pointIcon}>
                  <Feather name={point.icon as any} size={16} color={Colors.cobalt} />
                </View>
                <View style={styles.pointText}>
                  <Text style={styles.pointHeading}>{point.heading}</Text>
                  <Text style={styles.pointBody}>{point.body}</Text>
                </View>
              </View>
            ))}

            {/* Privacy policy link */}
            <Pressable
              onPress={handleViewPolicy}
              style={({ pressed }) => [styles.policyLink, { opacity: pressed ? 0.65 : 1 }]}
            >
              <Feather name="external-link" size={13} color={Colors.cobalt} />
              <Text style={styles.policyLinkText}>{c.viewPolicy}</Text>
            </Pressable>

            {/* Checkbox row */}
            <Pressable
              onPress={() => {
                setChecked((prev) => !prev);
                if (!checked) setShowError(false);
              }}
              style={({ pressed }) => [styles.checkRow, { opacity: pressed ? 0.7 : 1 }]}
            >
              <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                {checked && <Feather name="check" size={13} color={Colors.white} />}
              </View>
              <Text style={styles.checkLabel}>
                {lang === "es"
                  ? "He leído y acepto la Política de Privacidad"
                  : "I have read and agree to the Privacy Policy"}
              </Text>
            </Pressable>

            {showError && (
              <View style={styles.errorRow}>
                <Feather name="alert-circle" size={13} color={Colors.error} />
                <Text style={styles.errorText}>{c.required}</Text>
              </View>
            )}
          </ScrollView>

          {/* Accept button */}
          <View style={styles.btnWrap}>
            <Pressable
              onPress={handleAccept}
              style={({ pressed }) => [
                styles.acceptBtn,
                { opacity: pressed ? 0.88 : 1 },
              ]}
            >
              <LinearGradient
                colors={[Colors.cobalt, Colors.cobaltDark]}
                style={styles.acceptGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Feather name="check-circle" size={18} color={Colors.white} />
                <Text style={styles.acceptText}>{c.accept}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetWrap: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "92%",
    overflow: "hidden",
  },
  sheetHeader: {
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 24,
    gap: 10,
  },
  shieldCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  sheetTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.white,
    textAlign: "center",
    letterSpacing: -0.4,
  },
  sheetSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.72)",
    textAlign: "center",
    lineHeight: 18,
  },
  scrollArea: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  pointRow: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: Colors.offWhite,
    borderRadius: 12,
    padding: 12,
  },
  pointIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: Colors.cobalt + "14",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  pointText: {
    flex: 1,
    gap: 3,
  },
  pointHeading: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.navy,
  },
  pointBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.muted,
    lineHeight: 17,
  },
  policyLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingVertical: 4,
    marginTop: 2,
  },
  policyLinkText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.cobalt,
    textDecorationLine: "underline",
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    marginTop: 4,
    paddingVertical: 6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.silverMid,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: Colors.cobalt,
    borderColor: Colors.cobalt,
  },
  checkLabel: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.navy,
    lineHeight: 19,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.errorLight,
    borderRadius: 8,
    padding: 10,
  },
  errorText: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.error,
    lineHeight: 17,
  },
  btnWrap: {
    padding: 20,
    paddingBottom: 32,
  },
  acceptBtn: {
    borderRadius: 16,
    overflow: "hidden",
  },
  acceptGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  acceptText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.white,
    letterSpacing: -0.2,
  },
});
