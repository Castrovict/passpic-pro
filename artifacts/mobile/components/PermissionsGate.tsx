import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

interface Permission {
  key: "camera" | "media";
  icon: string;
  title: string;
  description: string;
  required: boolean;
  granted: boolean;
  checking: boolean;
}

interface PermissionsGateProps {
  onGranted: () => void;
}

export function PermissionsGate({ onGranted }: PermissionsGateProps) {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const [permissions, setPermissions] = useState<Permission[]>([
    {
      key: "camera",
      icon: "camera",
      title: "Cámara",
      description:
        "Para tomar fotos directamente desde la app y generar tu foto de pasaporte.",
      required: true,
      granted: false,
      checking: false,
    },
    {
      key: "media",
      icon: "image",
      title: "Fotos y Galería",
      description:
        "Para seleccionar fotos existentes de tu galería y guardar tus fotos de pasaporte.",
      required: true,
      granted: false,
      checking: false,
    },
  ]);

  const [allGranted, setAllGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkScale = useSharedValue(1);
  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  useEffect(() => {
    checkExistingPermissions();
  }, []);

  const checkExistingPermissions = async () => {
    setIsLoading(true);
    try {
      const [cameraStatus, mediaStatus] = await Promise.all([
        ImagePicker.getCameraPermissionsAsync(),
        ImagePicker.getMediaLibraryPermissionsAsync(),
      ]);

      const cameraGranted = cameraStatus.granted;
      const mediaGranted = mediaStatus.granted;

      setPermissions((prev) =>
        prev.map((p) => {
          if (p.key === "camera") return { ...p, granted: cameraGranted };
          if (p.key === "media") return { ...p, granted: mediaGranted };
          return p;
        })
      );

      if (cameraGranted && mediaGranted) {
        setAllGranted(true);
        setTimeout(onGranted, 300);
      }
    } catch (e) {
      console.warn("Permission check failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = async (key: "camera" | "media") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setPermissions((prev) =>
      prev.map((p) => (p.key === key ? { ...p, checking: true } : p))
    );

    try {
      let granted = false;
      if (key === "camera") {
        const result = await ImagePicker.requestCameraPermissionsAsync();
        granted = result.granted;
      } else {
        const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
        granted = result.granted;
      }

      setPermissions((prev) => {
        const updated = prev.map((p) =>
          p.key === key ? { ...p, granted, checking: false } : p
        );
        const allDone = updated.filter((p) => p.required).every((p) => p.granted);
        if (allDone) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          checkScale.value = withSpring(1.15, { damping: 8 }, () => {
            checkScale.value = withSpring(1);
          });
          setAllGranted(true);
          setTimeout(onGranted, 800);
        }
        return updated;
      });
    } catch (e) {
      setPermissions((prev) =>
        prev.map((p) => (p.key === key ? { ...p, checking: false } : p))
      );
    }
  };

  const requestAll = async () => {
    for (const perm of permissions) {
      if (!perm.granted) {
        await requestPermission(perm.key);
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.cobalt} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad + 24 }]}>
      <LinearGradient
        colors={[Colors.navy, Colors.navyMid, "#0D1F3C"]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.top}>
        <View style={styles.iconWrap}>
          <Feather name="shield" size={36} color={Colors.white} />
        </View>
        <Text style={styles.title}>Permisos necesarios</Text>
        <Text style={styles.subtitle}>
          PassPic PRO necesita los siguientes permisos para funcionar correctamente.
          Tu privacidad está protegida — nunca compartimos tus fotos.
        </Text>
      </Animated.View>

      <View style={styles.permList}>
        {permissions.map((perm, i) => (
          <Animated.View
            key={perm.key}
            entering={FadeInDown.delay(200 + i * 120).springify()}
          >
            <Pressable
              onPress={() => !perm.granted && !perm.checking && requestPermission(perm.key)}
              style={({ pressed }) => [
                styles.permCard,
                perm.granted && styles.permCardGranted,
                { opacity: pressed && !perm.granted ? 0.85 : 1 },
              ]}
            >
              <View
                style={[
                  styles.permIcon,
                  perm.granted && styles.permIconGranted,
                ]}
              >
                <Feather
                  name={perm.icon as any}
                  size={22}
                  color={perm.granted ? Colors.white : Colors.cobalt}
                />
              </View>

              <View style={styles.permInfo}>
                <View style={styles.permTitleRow}>
                  <Text style={styles.permTitle}>{perm.title}</Text>
                  {perm.required && !perm.granted && (
                    <View style={styles.requiredTag}>
                      <Text style={styles.requiredText}>Requerido</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.permDesc}>{perm.description}</Text>
              </View>

              <View style={styles.permStatus}>
                {perm.checking ? (
                  <ActivityIndicator color={Colors.cobalt} size="small" />
                ) : perm.granted ? (
                  <Animated.View style={[styles.grantedBadge, checkStyle]}>
                    <Feather name="check" size={14} color={Colors.white} />
                  </Animated.View>
                ) : (
                  <View style={styles.pendingBadge}>
                    <Feather name="chevron-right" size={16} color={Colors.cobalt} />
                  </View>
                )}
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </View>

      <Animated.View entering={FadeInUp.delay(500).springify()} style={styles.bottom}>
        {allGranted ? (
          <View style={styles.allGrantedRow}>
            <Feather name="check-circle" size={20} color={Colors.success} />
            <Text style={styles.allGrantedText}>Todos los permisos otorgados</Text>
          </View>
        ) : (
          <Pressable
            onPress={requestAll}
            style={({ pressed }) => [
              styles.grantBtn,
              { opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
          >
            <LinearGradient
              colors={[Colors.cobalt, Colors.cobaltDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.grantBtnGradient}
            >
              <Feather name="unlock" size={18} color={Colors.white} />
              <Text style={styles.grantBtnText}>Otorgar permisos</Text>
            </LinearGradient>
          </Pressable>
        )}

        <Text style={styles.privacyNote}>
          Puedes cambiar estos permisos en cualquier momento desde los Ajustes de tu dispositivo.
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.navy,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  top: {
    alignItems: "center",
    paddingTop: 32,
    gap: 14,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.cobalt,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    shadowColor: Colors.cobalt,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    color: Colors.white,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    lineHeight: 21,
  },
  permList: {
    gap: 12,
    flex: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  permCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: 16,
    gap: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.12)",
  },
  permCardGranted: {
    backgroundColor: Colors.success + "18",
    borderColor: Colors.success + "40",
  },
  permIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.cobalt + "25",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  permIconGranted: {
    backgroundColor: Colors.success,
  },
  permInfo: {
    flex: 1,
    gap: 4,
  },
  permTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  permTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: Colors.white,
    letterSpacing: -0.2,
  },
  requiredTag: {
    backgroundColor: Colors.cobalt + "40",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  requiredText: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    color: Colors.cobaltLight,
    letterSpacing: 0.2,
  },
  permDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 17,
  },
  permStatus: {
    flexShrink: 0,
  },
  grantedBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  pendingBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.cobalt + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  bottom: {
    gap: 16,
    alignItems: "center",
  },
  grantBtn: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.cobalt,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  grantBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 28,
  },
  grantBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: Colors.white,
    letterSpacing: -0.3,
  },
  allGrantedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  allGrantedText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.success,
  },
  privacyNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    lineHeight: 17,
    paddingHorizontal: 16,
  },
});
