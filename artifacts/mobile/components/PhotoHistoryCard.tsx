import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { COUNTRY_FORMATS } from "@/constants/countries";
import { ProcessedPhoto } from "@/context/PhotoContext";
import { formatDate, getScoreColor } from "@/utils/photoProcessing";
import { ValidationBadge } from "@/components/ui/ValidationBadge";

interface PhotoHistoryCardProps {
  photo: ProcessedPhoto;
  onDelete: (id: string) => void;
}

export function PhotoHistoryCard({ photo, onDelete }: PhotoHistoryCardProps) {
  const country = COUNTRY_FORMATS.find((c) => c.code === photo.countryCode);

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        router.push({ pathname: "/photo/[id]", params: { id: photo.id } });
      }}
      style={({ pressed }) => [
        styles.card,
        { opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] },
      ]}
    >
      <View style={styles.imageContainer}>
        {photo.processedUri ? (
          <Image
            source={{ uri: photo.processedUri }}
            style={styles.image}
            contentFit="cover"
          />
        ) : photo.originalUri ? (
          <Image
            source={{ uri: photo.originalUri }}
            style={styles.image}
            contentFit="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Feather name="image" size={20} color={Colors.muted} />
          </View>
        )}
        {photo.status === "processing" && (
          <View style={styles.processingOverlay}>
            <Feather name="loader" size={18} color={Colors.white} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.countryRow}>
            <Text style={styles.flag}>{country?.flag ?? "🌍"}</Text>
            <Text style={styles.countryName}>{photo.countryName}</Text>
          </View>
          <Text style={styles.date}>{formatDate(photo.createdAt)}</Text>
        </View>

        {photo.validationResults && (
          <View style={styles.footer}>
            <ValidationBadge score={photo.validationResults.score} size="sm" />
            <Text style={styles.score}>
              {photo.validationResults.score}% quality
            </Text>
          </View>
        )}

        {photo.status === "error" && (
          <Text style={styles.errorText}>{photo.errorMessage ?? "Processing failed"}</Text>
        )}

        {photo.status === "processing" && (
          <Text style={styles.processingText}>Processing...</Text>
        )}
      </View>

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onDelete(photo.id);
        }}
        style={styles.deleteBtn}
        hitSlop={12}
      >
        <Feather name="trash-2" size={16} color={Colors.muted} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    width: 56,
    height: 68,
    borderRadius: 10,
    overflow: "hidden",
    flexShrink: 0,
    backgroundColor: Colors.offWhite,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  flag: {
    fontSize: 16,
  },
  countryName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.navy,
    letterSpacing: -0.2,
    flex: 1,
  },
  date: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.muted,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  score: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.muted,
  },
  errorText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.error,
  },
  processingText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.cobalt,
  },
  deleteBtn: {
    padding: 6,
  },
});
