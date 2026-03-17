import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { COUNTRY_FORMATS, CountryFormat } from "@/constants/countries";
import { usePhotos } from "@/context/PhotoContext";
import { useLang } from "@/context/LangContext";
import { AdBanner } from "@/components/AdBanner";

// ── Region definitions ─────────────────────────────────────────────────────
const REGIONS = [
  { key: "centroam",   es: "🌎 Centroamérica",        en: "🌎 Central America",      codes: ["MX","GT","BZ","HN","SV","NI","CR","PA"] },
  { key: "caribe",     es: "🌊 Caribe",                en: "🌊 Caribbean",             codes: ["CU","DO","HT","PR","JM","TT","BB","BS","LC","VC","GD","AG","KN","DM","AW","CW"] },
  { key: "sudamerica", es: "🌎 Sudamérica",            en: "🌎 South America",         codes: ["CO","VE","EC","PE","BR","BO","PY","CL","AR","UY","GY","SR"] },
  { key: "north",      es: "🌎 Norteamérica",          en: "🌎 North America",         codes: ["US","CA"] },
  { key: "europeW",    es: "🌍 Europa Occidental",     en: "🌍 Western Europe",        codes: ["UK","EU","DE","FR","IT","ES","PT","NL","BE","CH","AT","LU","IE","MC"] },
  { key: "europeN",    es: "🌍 Europa Nórdica",        en: "🌍 Northern Europe",       codes: ["SE","NO","DK","FI","IS"] },
  { key: "europeE",    es: "🌍 Europa Oriental",       en: "🌍 Eastern Europe",        codes: ["PL","CZ","SK","HU","RO","BG","HR","RS","SI","BA","ME","MK","AL","GR","RU","UA","BY","MD","LT","LV","EE","GE","AM","AZ"] },
  { key: "mideast",    es: "🌍 Oriente Medio",         en: "🌍 Middle East",           codes: ["AE","SA","TR","IL","IR","IQ","JO","LB","SY","KW","QA","BH","OM","YE"] },
  { key: "nafr",       es: "🌍 Norte de África",       en: "🌍 North Africa",          codes: ["EG","MA","DZ","TN","LY","SD"] },
  { key: "ssafr",      es: "🌍 África Subsahariana",   en: "🌍 Sub-Saharan Africa",   codes: ["NG","ZA","KE","ET","GH","TZ","UG","ZM","ZW","MZ","AO","CM","CI","SN","ML","BF","MG","RW"] },
  { key: "southasia",  es: "🌏 Asia del Sur",          en: "🌏 South Asia",            codes: ["IN","PK","BD","LK","NP","AF"] },
  { key: "eastasia",   es: "🌏 Asia del Este",         en: "🌏 East & SE Asia",        codes: ["CN","JP","KR","KP","TW","HK","MN","SG","MY","ID","PH","TH","VN","MM","KH","LA","BN","TL"] },
  { key: "centralasia",es: "🌏 Asia Central",          en: "🌏 Central Asia",          codes: ["KZ","UZ","TM","KG","TJ"] },
  { key: "oceania",    es: "🌏 Oceanía",               en: "🌏 Oceania",               codes: ["AU","NZ","FJ","PG","WS","TO"] },
];

// Group items into rows of N columns
function toRows<T>(items: T[], cols: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += cols) {
    rows.push(items.slice(i, i + cols));
  }
  return rows;
}

const COLS = 3;

export default function CountrySelectorScreen() {
  const insets = useSafeAreaInsets();
  const { selectedCountry, setSelectedCountry } = usePhotos();
  const { lang, t } = useLang();
  const [search, setSearch] = useState("");
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const listRef = useRef<SectionList>(null);
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const countryMap = useMemo(() => {
    const m: Record<string, CountryFormat> = {};
    COUNTRY_FORMATS.forEach((c) => { m[c.code] = c; });
    return m;
  }, []);

  // Build sections of ROW arrays (each row = up to COLS countries)
  const sections = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (q) {
      const results = COUNTRY_FORMATS.filter(
        (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
      );
      if (!results.length) return [];
      return [{
        key: "search",
        title: lang === "es" ? `Resultados (${results.length})` : `Results (${results.length})`,
        data: toRows(results, COLS),
      }];
    }

    const regionList = activeRegion
      ? REGIONS.filter((r) => r.key === activeRegion)
      : REGIONS;

    return regionList
      .map((r) => {
        const countries = r.codes.map((code) => countryMap[code]).filter(Boolean) as CountryFormat[];
        return {
          key: r.key,
          title: `${lang === "es" ? r.es : r.en}  (${countries.length})`,
          data: toRows(countries, COLS),
        };
      })
      .filter((s) => s.data.length > 0);
  }, [search, lang, countryMap, activeRegion]);

  const handleSelect = (country: CountryFormat) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCountry(country);
    router.back();
  };

  const handleRegionTab = (key: string) => {
    Haptics.selectionAsync();
    setActiveRegion((prev) => (prev === key ? null : key));
    setSearch("");
  };

  const totalVisible = sections.reduce((n, s) => n + s.data.flat().length, 0);

  return (
    <View style={[styles.container, { paddingBottom: bottomPad }]}>
      {/* ── Header ───────────────────────────────────────────── */}
      <LinearGradient
        colors={[Colors.navy, Colors.navyLight ?? "#0D2045"]}
        style={[styles.headerGrad, { paddingTop: topPad + 8 }]}
      >
        <Animated.View entering={FadeIn.delay(60)} style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>{t.selectCountry}</Text>
            <Text style={styles.headerSub}>
              {totalVisible} {t.countriesAvailable}
            </Text>
          </View>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.6 : 1 }]}
            hitSlop={12}
          >
            <Feather name="x" size={20} color="rgba(255,255,255,0.9)" />
          </Pressable>
        </Animated.View>

        {/* Search bar */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.searchWrap}>
          <Feather name="search" size={15} color="rgba(255,255,255,0.6)" />
          <TextInput
            value={search}
            onChangeText={(val) => { setSearch(val); setActiveRegion(null); }}
            placeholder={t.searchCountry}
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={styles.searchInput}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Feather name="x-circle" size={15} color="rgba(255,255,255,0.5)" />
            </Pressable>
          )}
        </Animated.View>

        {/* Region filter chips */}
        {!search && (
          <Animated.View entering={FadeIn.delay(140)}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {REGIONS.map((r) => {
                const isActive = activeRegion === r.key;
                return (
                  <Pressable
                    key={r.key}
                    onPress={() => handleRegionTab(r.key)}
                    style={[styles.chip, isActive && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                      {lang === "es" ? r.es : r.en}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        )}
      </LinearGradient>

      {/* ── Country grid ─────────────────────────────────────── */}
      <SectionList
        ref={listRef}
        sections={sections}
        keyExtractor={(row, idx) => row.map((c) => c.code).join("-") + idx}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🌍</Text>
            <Text style={styles.emptyText}>
              {lang === "es"
                ? `No se encontraron países para "${search}"`
                : `No countries found for "${search}"`}
            </Text>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <Animated.View entering={FadeInDown.springify()} style={styles.sectionHeader}>
            <View style={styles.sectionTitleBar} />
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </Animated.View>
        )}
        renderItem={({ item: row }) => (
          <View style={styles.gridRow}>
            {row.map((country) => {
              const isSelected = selectedCountry.code === country.code;
              return (
                <Pressable
                  key={country.code}
                  onPress={() => handleSelect(country)}
                  style={({ pressed }) => [
                    styles.card,
                    isSelected && styles.cardSelected,
                    { opacity: pressed ? 0.78 : 1 },
                  ]}
                >
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Feather name="check" size={10} color="#fff" />
                    </View>
                  )}
                  <Text style={styles.cardFlag}>{country.flag}</Text>
                  <Text
                    style={[styles.cardName, isSelected && styles.cardNameSelected]}
                    numberOfLines={2}
                  >
                    {country.name}
                  </Text>
                  <Text style={styles.cardSpec}>
                    {country.widthMm}×{country.heightMm}mm
                  </Text>
                </Pressable>
              );
            })}
            {/* Fill empty cells in last row */}
            {row.length < COLS &&
              Array(COLS - row.length).fill(null).map((_, i) => (
                <View key={`empty-${i}`} style={styles.cardEmpty} />
              ))}
          </View>
        )}
      />

      <AdBanner />
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const CARD_GAP = 8;
const SIDE_PAD = 16;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F8",
  },

  // Header
  headerGrad: {
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },
  headerSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  // Search
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#FFFFFF",
  },

  // Region chips
  chipsRow: {
    gap: 7,
    paddingRight: 4,
    paddingBottom: 2,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  chipActive: {
    backgroundColor: Colors.cobalt,
    borderColor: Colors.cobalt,
  },
  chipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },

  // List
  list: {
    paddingHorizontal: SIDE_PAD,
    paddingTop: 6,
    paddingBottom: 20,
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitleBar: {
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: Colors.cobalt,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: Colors.navy,
    flex: 1,
  },

  // Grid row
  gridRow: {
    flexDirection: "row",
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },

  // Country card
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 5,
    borderWidth: 1.5,
    borderColor: "#E4E8F0",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardSelected: {
    borderColor: Colors.cobalt,
    backgroundColor: Colors.cobalt + "08",
    shadowColor: Colors.cobalt,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  cardEmpty: {
    flex: 1,
  },
  checkBadge: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.cobalt,
    alignItems: "center",
    justifyContent: "center",
  },
  cardFlag: {
    fontSize: 34,
    lineHeight: 40,
  },
  cardName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: Colors.navy,
    textAlign: "center",
    lineHeight: 15,
  },
  cardNameSelected: {
    color: Colors.cobalt,
  },
  cardSpec: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: Colors.muted,
    textAlign: "center",
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 14,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.muted,
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
