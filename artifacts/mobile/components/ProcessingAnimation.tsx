import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useLang } from "@/context/LangContext";
import { hasRemoveBgKey } from "@/utils/removeBackground";

const STEPS_EN = [
  "Detecting face...",
  "AI background removal...",
  "Applying white background...",
  "Validating quality...",
  "Finalizing photo...",
];

const STEPS_ES = [
  "Detectando rostro...",
  "Eliminando fondo con IA...",
  "Aplicando fondo blanco...",
  "Validando calidad...",
  "Finalizando foto...",
];

interface ProcessingAnimationProps {
  step?: number;
}

export function ProcessingAnimation({ step = 0 }: ProcessingAnimationProps) {
  const { lang } = useLang();
  const STEPS = lang === "es" ? STEPS_ES : STEPS_EN;
  const aiEnabled = hasRemoveBgKey();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);
  const rotate = useSharedValue(0);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 600 }), withTiming(0.6, { duration: 600 })),
      -1,
      false
    );
    scale.value = withRepeat(
      withSequence(withTiming(1, { duration: 800 }), withTiming(0.95, { duration: 800 })),
      -1,
      true
    );
    rotate.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Animated.View style={[styles.ring1, pulseStyle]} />
        <Animated.View style={[styles.ring2, pulseStyle]} />
        <Animated.View style={[styles.spinner, spinStyle]}>
          <View style={styles.spinnerDot} />
        </Animated.View>
        <View style={styles.iconCenter}>
          <View style={styles.iconInner} />
        </View>
      </View>

      {aiEnabled && (
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>✦ AI</Text>
        </View>
      )}

      <Animated.Text style={[styles.stepText, { opacity: opacity.value }]}>
        {STEPS[Math.min(step, STEPS.length - 1)]}
      </Animated.Text>
      <View style={styles.dotsRow}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i <= step && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 20,
    paddingVertical: 40,
  },
  iconWrap: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  ring1: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: Colors.cobalt + "30",
  },
  ring2: {
    position: "absolute",
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1.5,
    borderColor: Colors.cobalt + "50",
  },
  spinner: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  spinnerDot: {
    position: "absolute",
    top: 0,
    left: 28,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.cobalt,
    marginLeft: -4,
  },
  iconCenter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cobalt,
    alignItems: "center",
    justifyContent: "center",
  },
  iconInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2.5,
    borderColor: Colors.white,
  },
  aiBadge: {
    backgroundColor: Colors.cobalt,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  aiBadgeText: {
    color: Colors.white,
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  stepText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: Colors.navy,
    letterSpacing: -0.2,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.silver,
  },
  dotActive: {
    backgroundColor: Colors.cobalt,
    width: 16,
  },
});
