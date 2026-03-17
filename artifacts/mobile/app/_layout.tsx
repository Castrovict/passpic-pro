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
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PhotoProvider } from "@/context/PhotoContext";
import { LangProvider } from "@/context/LangContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();
const { width, height } = Dimensions.get("window");

function AnimatedSplash({ onDone }: { onDone: () => void }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 700 }, (finished) => {
        if (finished) runOnJS(onDone)();
      });
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, animStyle, styles.splash]}>
      <Image
        source={require("@/assets/images/splash-brand.png")}
        style={styles.splashImage}
        contentFit="cover"
      />
      <View style={styles.splashOverlay} />
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
            <KeyboardProvider>
              <LangProvider>
                <PhotoProvider>
                  <RootLayoutNav />
                  {!splashDone && (
                    <AnimatedSplash onDone={() => setSplashDone(true)} />
                  )}
                </PhotoProvider>
              </LangProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    zIndex: 9999,
    backgroundColor: "#0A1628",
  },
  splashImage: {
    width,
    height,
    position: "absolute",
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,22,40,0.18)",
  },
});
