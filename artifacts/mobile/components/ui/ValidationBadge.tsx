import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { getScoreColor, getScoreLabel } from "@/utils/photoProcessing";

interface ValidationBadgeProps {
  score: number;
  size?: "sm" | "md";
}

export function ValidationBadge({ score, size = "md" }: ValidationBadgeProps) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const iconSize = size === "sm" ? 12 : 14;
  const fontSize = size === "sm" ? 11 : 12;

  return (
    <View style={[styles.badge, { backgroundColor: color + "20" }]}>
      <Feather
        name={score >= 80 ? "check-circle" : score >= 60 ? "alert-circle" : "x-circle"}
        size={iconSize}
        color={color}
      />
      <Text style={[styles.label, { color, fontSize }]}>{label}</Text>
    </View>
  );
}

interface CheckRowProps {
  label: string;
  passed: boolean;
  message: string;
}

export function CheckRow({ label, passed, message }: CheckRowProps) {
  return (
    <View style={styles.checkRow}>
      <View
        style={[
          styles.checkIcon,
          { backgroundColor: passed ? Colors.success + "20" : Colors.error + "20" },
        ]}
      >
        <Feather
          name={passed ? "check" : "x"}
          size={14}
          color={passed ? Colors.success : Colors.error}
        />
      </View>
      <View style={styles.checkText}>
        <Text style={styles.checkLabel}>{label}</Text>
        <Text style={styles.checkMessage}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 8,
  },
  checkIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkText: {
    flex: 1,
    gap: 2,
  },
  checkLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.navy,
    letterSpacing: -0.2,
  },
  checkMessage: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 18,
  },
});
