import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { usePhotos } from "@/context/PhotoContext";
import { PhotoHistoryCard } from "@/components/PhotoHistoryCard";
import { Button } from "@/components/ui/Button";
import { useLang } from "@/context/LangContext";

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { photos, deletePhoto } = usePhotos();
  const { t } = useLang();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  const handleDelete = (id: string) => {
    Alert.alert(t.deletePhoto, t.deleteConfirm, [
      { text: t.cancel, style: "cancel" },
      {
        text: t.delete,
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          deletePhoto(id);
        },
      },
    ]);
  };

  const donePhotos = photos.filter((p) => p.status === "done");
  const processingPhotos = photos.filter((p) => p.status === "processing");

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.navy, Colors.navyLight, Colors.offWhite]}
        locations={[0, 0.35, 1]}
        style={styles.gradient}
      />

      <FlatList
        data={photos}
        keyExtractor={(p) => p.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: topPad + 12, paddingBottom: isWeb ? 120 : 100 },
        ]}
        ListHeaderComponent={
          <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.header}>
            <View>
              <Text style={styles.title}>{t.myPhotosTitle}</Text>
              <Text style={styles.subtitle}>
                {photos.length === 0
                  ? t.noPhotos
                  : t.completedProcessing(donePhotos.length, processingPhotos.length)}
              </Text>
            </View>
            {photos.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{photos.length}</Text>
              </View>
            )}
          </Animated.View>
        }
        ListEmptyComponent={
          <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Feather name="image" size={36} color={Colors.muted} />
            </View>
            <Text style={styles.emptyTitle}>{t.noPhotos}</Text>
            <Text style={styles.emptyText}>{t.noPhotosDesc}</Text>
            <Button
              title={t.takeFirstPhoto}
              onPress={() => router.navigate("/")}
              style={styles.emptyBtn}
              icon={<Feather name="camera" size={16} color={Colors.white} />}
            />
          </Animated.View>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(100 + index * 60).springify()}>
            <PhotoHistoryCard photo={item} onDelete={handleDelete} />
          </Animated.View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 250,
  },
  listContent: {
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    marginBottom: 20,
    paddingTop: 8,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: Colors.white,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: Colors.cobalt,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: Colors.white,
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 60,
    gap: 12,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.navy,
    letterSpacing: -0.3,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.muted,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: 8,
    paddingHorizontal: 28,
  },
});
