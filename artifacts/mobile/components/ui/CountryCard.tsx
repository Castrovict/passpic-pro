import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { CountryFormat } from "@/constants/countries";
import { formatDimensions } from "@/utils/photoProcessing";

interface CountryCardProps {
  country: CountryFormat;
  selected: boolean;
  onPress: (country: CountryFormat) => void;
}

export function CountryCard({ country, selected, onPress }: CountryCardProps) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress(country);
      }}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
    >
      <View style={styles.top}>
        <Text style={styles.flag}>{country.flag}</Text>
        {selected && (
          <View style={styles.selectedDot} />
        )}
      </View>
      <Text style={[styles.name, selected && styles.nameSelected]} numberOfLines={2}>
        {country.name}
      </Text>
      <Text style={styles.dims}>{formatDimensions(country.widthMm, country.heightMm)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 100,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: Colors.silver,
    gap: 4,
  },
  cardSelected: {
    borderColor: Colors.cobalt,
    backgroundColor: Colors.cobalt + "08",
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  flag: {
    fontSize: 24,
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.cobalt,
  },
  name: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: Colors.navy,
    letterSpacing: -0.1,
    lineHeight: 16,
  },
  nameSelected: {
    color: Colors.cobalt,
  },
  dims: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.muted,
  },
});
