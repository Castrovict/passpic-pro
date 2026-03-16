import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { COUNTRY_FORMATS, CountryFormat } from "@/constants/countries";
import { usePhotos } from "@/context/PhotoContext";
import { formatDimensions } from "@/utils/photoProcessing";

export default function CountrySelectorScreen() {
  const insets = useSafeAreaInsets();
  const { selectedCountry, setSelectedCountry } = usePhotos();
  const [search, setSearch] = useState("");
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const filtered = useMemo(() => {
    if (!search.trim()) return COUNTRY_FORMATS;
    const q = search.toLowerCase();
    return COUNTRY_FORMATS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [search]);

  const handleSelect = (country: CountryFormat) => {
    Haptics.selectionAsync();
    setSelectedCountry(country);
    router.back();
  };

  return (
    <View style={[styles.container, { paddingBottom: bottomPad }]}>
      <Animated.View
        entering={FadeInDown.delay(50).springify()}
        style={[styles.header, { paddingTop: topPad + 12 }]}
      >
        <View style={styles.headerTop}>
          <Text style={styles.title}>Select Country</Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.6 : 1 }]}
            hitSlop={12}
          >
            <Feather name="x" size={20} color={Colors.navy} />
          </Pressable>
        </View>

        <View style={styles.searchWrap}>
          <Feather name="search" size={16} color={Colors.muted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search country..."
            placeholderTextColor={Colors.muted}
            style={styles.searchInput}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Feather name="x-circle" size={16} color={Colors.muted} />
            </Pressable>
          )}
        </View>
      </Animated.View>

      <FlatList
        data={filtered}
        keyExtractor={(c) => c.code}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="globe" size={32} color={Colors.muted} />
            <Text style={styles.emptyText}>No countries found for "{search}"</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const isSelected = selectedCountry.code === item.code;
          return (
            <Animated.View entering={FadeInDown.delay(Math.min(index * 30, 300)).springify()}>
              <Pressable
                onPress={() => handleSelect(item)}
                style={({ pressed }) => [
                  styles.countryRow,
                  isSelected && styles.countryRowSelected,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Text style={styles.flag}>{item.flag}</Text>
                <View style={styles.countryInfo}>
                  <Text
                    style={[
                      styles.countryName,
                      isSelected && styles.countryNameSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text style={styles.countrySpec}>
                    {formatDimensions(item.widthMm, item.heightMm)} · {item.dpi}dpi
                  </Text>
                </View>
                {isSelected && (
                  <Feather name="check" size={18} color={Colors.cobalt} />
                )}
              </Pressable>
            </Animated.View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: Colors.navy,
    letterSpacing: -0.4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.offWhite,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.offWhite,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.silver,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.navy,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginBottom: 8,
    gap: 14,
    borderWidth: 1.5,
    borderColor: Colors.silver,
  },
  countryRowSelected: {
    borderColor: Colors.cobalt,
    backgroundColor: Colors.cobalt + "06",
  },
  flag: {
    fontSize: 28,
  },
  countryInfo: {
    flex: 1,
    gap: 2,
  },
  countryName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.navy,
    letterSpacing: -0.2,
  },
  countryNameSelected: {
    color: Colors.cobalt,
  },
  countrySpec: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.muted,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.muted,
    textAlign: "center",
  },
});
