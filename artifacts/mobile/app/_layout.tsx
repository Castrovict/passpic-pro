import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ConsentModal } from "@/components/ConsentModal";
import { PhotoProvider } from "@/context/PhotoContext";
import { LangProvider } from "@/context/LangContext";
import { BgRemovalProvider } from "@/context/BgRemovalContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();
const { width, height } = Dimensions.get("window");

function AnimatedSplash({ onDone }: { onDone: () => void }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Hold for 2.8s then fade out over 0.7s
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 700 }, (finished) => {
        if (finished) runOnJS(onDone)();
      });
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  const wrapStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, wrapStyle, styles.splash]}>
      {/* Background image (marketing) */}
      <Image
        source={require("@/assets/images/splash-brand.png")}
        style={styles.splashBg}
        contentFit="cover"
      />

      {/* Dark gradient overlay — bottom third darker so branding pops */}
      <LinearGradient
        colors={["rgba(10,22,40,0.6)", "rgba(10,22,40,0.35)", "rgba(10,22,40,0.88)"]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Branding — always visible, no enter animations ──────────── */}
      <View style={styles.splashContent}>
        {/* App icon */}
        <View style={styles.splashIconWrap}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.splashIcon}
            contentFit="cover"
          />
        </View>

        {/* App name */}
        <View style={styles.splashTitleWrap}>
          <Text style={styles.splashAppName}>PassPic</Text>
          <View style={styles.splashProBadge}>
            <Text style={styles.splashProText}>PRO</Text>
          </View>
        </View>

        {/* Tagline */}
        <Text style={styles.splashTagline}>
          Foto de pasaporte profesional con IA
        </Text>

        {/* Country flags row */}
        <View style={styles.splashFlags}>
          {["🇲🇽", "🇺🇸", "🇪🇸", "🇧🇷", "🇨🇴", "🇦🇷"].map((f) => (
            <Text key={f} style={styles.splashFlag}>{f}</Text>
          ))}
        </View>

        {/* Dots loader */}
        <View style={styles.splashDots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>
    </Animated.View>
  );
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F4F6FA" },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="photo/[id]"
        options={{
          presentation: "card",
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="country-selector"
        options={{
          presentation: "modal",
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="privacy"
        options={{
          presentation: "card",
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <LangProvider>
              <PhotoProvider>
                <BgRemovalProvider>
                  <RootLayoutNav />
                  <ConsentModal />
                  {!splashDone && (
                    <AnimatedSplash onDone={() => setSplashDone(true)} />
                  )}
                </BgRemovalProvider>
              </PhotoProvider>
            </LangProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  // ── Splash ───────────────────────────────────────────────────────────────
  splash: {
    zIndex: 9999,
    backgroundColor: "#0A1628",
    alignItems: "center",
    justifyContent: "center",
  },
  splashBg: {
    ...StyleSheet.absoluteFillObject,
    width,
    height,
  },
  splashContent: {
    alignItems: "center",
    gap: 0,
    paddingBottom: 60,
  },
  splashIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.18)",
  },
  splashIcon: {
    width: 96,
    height: 96,
  },
  splashTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  splashAppName: {
    fontFamily: "Inter_700Bold",
    fontSize: 38,
    color: "#FFFFFF",
    letterSpacing: -1,
  },
  splashProBadge: {
    backgroundColor: "#C9A227",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "center",
  },
  splashProText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "#0A1628",
    letterSpacing: 1.5,
  },
  splashTagline: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.62)",
    letterSpacing: 0.2,
    marginBottom: 28,
    textAlign: "center",
  },
  splashFlags: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 32,
  },
  splashFlag: {
    fontSize: 22,
  },
  splashDots: {
    flexDirection: "row",
    gap: 7,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  dotActive: {
    backgroundColor: "#C9A227",
    width: 20,
  },
});
