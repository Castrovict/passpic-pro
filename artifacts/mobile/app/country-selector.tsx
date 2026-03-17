import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  SectionList,
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
import { useLang } from "@/context/LangContext";
import { formatDimensions } from "@/utils/photoProcessing";
import { AdBanner } from "@/components/AdBanner";

const REGIONS: { key: string; label_es: string; label_en: string; codes: string[] }[] = [
  {
    key: "centroam",
    label_es: "🌎 Centroamérica",
    label_en: "🌎 Central America",
    codes: ["MX","GT","BZ","HN","SV","NI","CR","PA"],
  },
  {
    key: "caribe",
    label_es: "🌊 Caribe",
    label_en: "🌊 Caribbean",
    codes: ["CU","DO","HT","PR","JM","TT","BB","BS","LC","VC","GD","AG","KN","DM","AW","CW"],
  },
  {
    key: "sudamerica",
    label_es: "🌎 Sudamérica",
    label_en: "🌎 South America",
    codes: ["CO","VE","EC","PE","BR","BO","PY","CL","AR","UY","GY","SR"],
  },
  {
    key: "north",
    label_es: "🌎 Norteamérica",
    label_en: "🌎 North America",
    codes: ["US","CA"],
  },
  {
    key: "europeW",
    label_es: "🌍 Europa Occidental",
    label_en: "🌍 Western Europe",
    codes: ["UK","EU","DE","FR","IT","ES","PT","NL","BE","CH","AT","LU","IE","MC"],
  },
  {
    key: "europeN",
    label_es: "🌍 Europa Nórdica",
    label_en: "🌍 Northern Europe",
    codes: ["SE","NO","DK","FI","IS"],
  },
  {
    key: "europeE",
    label_es: "🌍 Europa Oriental",
    label_en: "🌍 Eastern Europe",
    codes: ["PL","CZ","SK","HU","RO","BG","HR","RS","SI","BA","ME","MK","AL","GR","RU","UA","BY","MD","LT","LV","EE","GE","AM","AZ"],
  },
  {
    key: "mideast",
    label_es: "🌍 Oriente Medio",
    label_en: "🌍 Middle East",
    codes: ["AE","SA","TR","IL","IR","IQ","JO","LB","SY","KW","QA","BH","OM","YE"],
  },
  {
    key: "nafr",
    label_es: "🌍 Norte de África",
    label_en: "🌍 North Africa",
    codes: ["EG","MA","DZ","TN","LY","SD"],
  },
  {
    key: "ssafr",
    label_es: "🌍 África Subsahariana",
    label_en: "🌍 Sub-Saharan Africa",
    codes: ["NG","ZA","KE","ET","GH","TZ","UG","ZM","ZW","MZ","AO","CM","CI","SN","ML","BF","MG","RW"],
  },
  {
    key: "southasia",
    label_es: "🌏 Asia del Sur",
    label_en: "🌏 South Asia",
    codes: ["IN","PK","BD","LK","NP","AF"],
  },
  {
    key: "eastasia",
    label_es: "🌏 Asia del Este y Sudeste",
    label_en: "🌏 East & Southeast Asia",
    codes: ["CN","JP","KR","KP","TW","HK","MN","SG","MY","ID","PH","TH","VN","MM","KH","LA","BN","TL"],
  },
  {
    key: "centralasia",
    label_es: "🌏 Asia Central",
    label_en: "🌏 Central Asia",
    codes: ["KZ","UZ","TM","KG","TJ"],
  },
  {
    key: "oceania",
    label_es: "🌏 Oceanía",
    label_en: "🌏 Oceania",
    codes: ["AU","NZ","FJ","PG","WS","TO"],
  },
];

export default function CountrySelectorScreen() {
  const insets = useSafeAreaInsets();
  const { selectedCountry, setSelectedCountry } = usePhotos();
  const { lang } = useLang();
  const [search, setSearch] = useState("");
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const countryMap = useMemo(() => {
    const m: Record<string, CountryFormat> = {};
    COUNTRY_FORMATS.forEach((c) => { m[c.code] = c; });
    return m;
  }, []);

  const sections = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q) {
      const results = COUNTRY_FORMATS.filter(
        (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
      );
      if (!results.length) return [];
      return [{ title: lang === "es" ? "Resultados" : "Results", data: results }];
    }

    return REGIONS.map((r) => ({
      title: lang === "es" ? r.label_es : r.label_en,
      data: r.codes.map((code) => countryMap[code]).filter(Boolean) as CountryFormat[],
    })).filter((s) => s.data.length > 0);
  }, [search, lang, countryMap]);

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
          <Text style={styles.title}>
            {lang === "es" ? "Seleccionar País" : "Select Country"}
          </Text>
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
            placeholder={lang === "es" ? "Buscar país..." : "Search country..."}
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

      <SectionList
        sections={sections}
        keyExtractor={(c) => c.code}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="globe" size={32} color={Colors.muted} />
            <Text style={styles.emptyText}>
              {lang === "es"
                ? `No se encontraron países para "${search}"`
                : `No countries found for "${search}"`}
            </Text>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item, index }) => {
          const isSelected = selectedCountry.code === item.code;
          return (
            <Animated.View entering={FadeInDown.delay(Math.min(index * 20, 200)).springify()}>
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
                  <Text style={[styles.countryName, isSelected && styles.countryNameSelected]}>
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

      <AdBanner />
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
    paddingTop: 8,
    paddingBottom: 24,
  },
  sectionHeader: {
    paddingTop: 18,
    paddingBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: Colors.cobalt,
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 6,
    gap: 12,
    borderWidth: 1.5,
    borderColor: Colors.silver,
  },
  countryRowSelected: {
    borderColor: Colors.cobalt,
    backgroundColor: Colors.cobalt + "06",
  },
  flag: {
    fontSize: 26,
  },
  countryInfo: {
    flex: 1,
    gap: 2,
  },
  countryName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.navy,
    letterSpacing: -0.2,
  },
  countryNameSelected: {
    color: Colors.cobalt,
  },
  countrySpec: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
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
