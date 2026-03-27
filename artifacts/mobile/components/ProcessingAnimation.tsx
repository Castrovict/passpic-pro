import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
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

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.6, duration: 600, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.95, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotate, { toValue: 1, duration: 2000, useNativeDriver: true })
    ).start();
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Animated.View style={[styles.ring1, { opacity, transform: [{ scale }] }]} />
        <Animated.View style={[styles.ring2, { opacity, transform: [{ scale }] }]} />
        <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
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

      <Animated.Text style={[styles.stepText, { opacity }]}>
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
