import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CountryFormat, COUNTRY_FORMATS } from "@/constants/countries";

export interface ProcessedPhoto {
  id: string;
  originalUri: string;
  processedUri: string | null;
  countryCode: string;
  countryName: string;
  status: "pending" | "processing" | "done" | "error";
  errorMessage?: string;
  createdAt: number;
  validationResults?: ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  checks: {
    label: string;
    passed: boolean;
    message: string;
  }[];
  score: number;
}

interface PhotoContextValue {
  photos: ProcessedPhoto[];
  selectedCountry: CountryFormat;
  setSelectedCountry: (country: CountryFormat) => void;
  addPhoto: (photo: Omit<ProcessedPhoto, "id" | "createdAt">) => Promise<string>;
  updatePhoto: (id: string, updates: Partial<ProcessedPhoto>) => void;
  deletePhoto: (id: string) => void;
  getPhoto: (id: string) => ProcessedPhoto | undefined;
}

const PhotoContext = createContext<PhotoContextValue | null>(null);

const STORAGE_KEY = "@passpic_photos";
const COUNTRY_KEY = "@passpic_country";

export function PhotoProvider({ children }: { children: React.ReactNode }) {
  const [photos, setPhotos] = useState<ProcessedPhoto[]>([]);
  const [selectedCountry, setSelectedCountryState] = useState<CountryFormat>(
    COUNTRY_FORMATS[0]
  );

  useEffect(() => {
    const load = async () => {
      try {
        const [photosData, countryCode] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(COUNTRY_KEY),
        ]);
        if (photosData) {
          setPhotos(JSON.parse(photosData));
        }
        if (countryCode) {
          const found = COUNTRY_FORMATS.find((c) => c.code === countryCode);
          if (found) setSelectedCountryState(found);
        }
      } catch (e) {
        console.warn("Failed to load storage", e);
      }
    };
    load();
  }, []);

  const savePhotos = useCallback(async (updated: ProcessedPhoto[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to save photos", e);
    }
  }, []);

  const setSelectedCountry = useCallback(async (country: CountryFormat) => {
    setSelectedCountryState(country);
    try {
      await AsyncStorage.setItem(COUNTRY_KEY, country.code);
    } catch (e) {
      console.warn("Failed to save country", e);
    }
  }, []);

  const addPhoto = useCallback(
    async (photo: Omit<ProcessedPhoto, "id" | "createdAt">) => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newPhoto: ProcessedPhoto = {
        ...photo,
        id,
        createdAt: Date.now(),
      };
      setPhotos((prev) => {
        const updated = [newPhoto, ...prev];
        savePhotos(updated);
        return updated;
      });
      return id;
    },
    [savePhotos]
  );

  const updatePhoto = useCallback(
    (id: string, updates: Partial<ProcessedPhoto>) => {
      setPhotos((prev) => {
        const updated = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
        savePhotos(updated);
        return updated;
      });
    },
    [savePhotos]
  );

  const deletePhoto = useCallback(
    (id: string) => {
      setPhotos((prev) => {
        const updated = prev.filter((p) => p.id !== id);
        savePhotos(updated);
        return updated;
      });
    },
    [savePhotos]
  );

  const getPhoto = useCallback(
    (id: string) => photos.find((p) => p.id === id),
    [photos]
  );

  const value = useMemo(
    () => ({
      photos,
      selectedCountry,
      setSelectedCountry,
      addPhoto,
      updatePhoto,
      deletePhoto,
      getPhoto,
    }),
    [photos, selectedCountry, setSelectedCountry, addPhoto, updatePhoto, deletePhoto, getPhoto]
  );

  return <PhotoContext.Provider value={value}>{children}</PhotoContext.Provider>;
}

export function usePhotos() {
  const ctx = useContext(PhotoContext);
  if (!ctx) throw new Error("usePhotos must be used within PhotoProvider");
  return ctx;
}
