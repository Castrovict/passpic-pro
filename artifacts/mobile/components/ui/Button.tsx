import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import Colors from "@/constants/colors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
  icon,
}: ButtonProps) {
  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const bg =
    variant === "primary"
      ? Colors.cobalt
      : variant === "danger"
      ? Colors.error
      : variant === "secondary"
      ? Colors.silver
      : "transparent";

  const textColor =
    variant === "primary" || variant === "danger"
      ? Colors.white
      : variant === "secondary"
      ? Colors.navy
      : Colors.cobalt;

  const paddingV = size === "sm" ? 10 : size === "lg" ? 18 : 14;
  const paddingH = size === "sm" ? 16 : size === "lg" ? 28 : 22;
  const fontSize = size === "sm" ? 14 : size === "lg" ? 17 : 15;

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          paddingVertical: paddingV,
          paddingHorizontal: paddingH,
          opacity: pressed ? 0.85 : disabled ? 0.45 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        variant === "ghost" && styles.ghost,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? Colors.white : Colors.cobalt}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text
            style={[styles.text, { color: textColor, fontSize }]}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  text: {
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  ghost: {
    borderWidth: 1.5,
    borderColor: Colors.cobalt,
  },
});
