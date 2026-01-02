import React, { useMemo, useState, useEffect } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  Animated,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";

type SortKey = "distanceAsc" | "priceAsc" | "priceDesc" | "titleAsc" | "newest";

type Params = {
  currentSort?: SortKey;
};

export default function SortScreen() {
  const params = useLocalSearchParams<Params>();
  const initialSort: SortKey = (params.currentSort as SortKey) || "distanceAsc";
  const [local, setLocal] = useState<SortKey>(initialSort);

  const { height, width } = useWindowDimensions();
  
  // Animation values
  const slideAnim = React.useRef(new Animated.Value(height)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide up animation
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.back();
    });
  };

  const options: { key: SortKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = useMemo(
    () => [
      { key: "distanceAsc", label: "Relevance", icon: "trending-up" },
      { key: "priceAsc", label: "Popularity", icon: "flame" },
      { key: "priceDesc", label: "Price -- Low to High", icon: "arrow-down" },
      { key: "titleAsc", label: "Price -- High to Low", icon: "arrow-up" },
      { key: "newest", label: "Newest First", icon: "time" },
    ],
    []
  );

  const scale = (size: number) => (width / 375) * size;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated blur background */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleClose}
          accessible={false}
        >
          <BlurView 
            intensity={25} 
            tint="dark" 
            style={StyleSheet.absoluteFill} 
          />
        </Pressable>
      </Animated.View>

      {/* Animated bottom sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [{ translateY: slideAnim }],
            width: width,
          },
        ]}
      >
        {/* Drag handle */}
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { width: scale(40) }]} />
        </View>

        {/* Header with close button */}
        <View style={styles.header}>
          <Text style={[styles.title, { fontSize: scale(14) }]}>SORT BY</Text>
          <Pressable onPress={handleClose} hitSlop={12}>
            <Ionicons name="close" size={scale(24)} color="#64748B" />
          </Pressable>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {options.map((o, idx) => {
            const selected = o.key === local;
            const isLast = idx === options.length - 1;
            return (
              <Pressable
                key={o.key}
                style={[
                  styles.row,
                  isLast && styles.rowLast,
                  selected && styles.rowSelected,
                ]}
                onPress={() => {
                  setLocal(o.key);
                  // Smooth transition back
                  setTimeout(() => {
                    router.push({
                      pathname: "/(screen)/BookNearMeScreen",
                      params: { selectedSort: o.key },
                    });
                  }, 150);
                }}
                android_ripple={{ color: "#E0F2FE" }}
              >
                <View style={styles.rowContent}>
                  <Ionicons 
                    name={o.icon} 
                    size={scale(20)} 
                    color={selected ? "#003EF9" : "#64748B"} 
                  />
                  <Text style={[
                    styles.rowText,
                    { fontSize: scale(16) },
                    selected && styles.rowTextSelected
                  ]}>
                    {o.label}
                  </Text>
                </View>
                
                {/* Radio button */}
                <View
                  style={[
                    styles.radio,
                    { width: scale(22), height: scale(22), borderRadius: scale(11) },
                    selected && styles.radioSelected,
                  ]}
                >
                  {selected && (
                    <View style={[
                      styles.radioDot,
                      { width: scale(10), height: scale(10), borderRadius: scale(5) }
                    ]} />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Bottom safe area */}
        <View style={styles.bottomSpacer} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },

  handleContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },

  handle: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  title: {
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: 0.5,
  },

  optionsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  row: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    marginBottom: 4,
  },

  rowSelected: {
    backgroundColor: "#E0F2FE",
  },

  rowLast: {
    marginBottom: 0,
  },

  rowContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  rowText: {
    fontWeight: "600",
    color: "#0F172A",
  },

  rowTextSelected: {
    color: "#003EF9",
    fontWeight: "700",
  },

  radio: {
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },

  radioSelected: {
    borderColor: "#003EF9",
    backgroundColor: "#E0F2FE",
  },

  radioDot: {
    backgroundColor: "#003EF9",
  },

  bottomSpacer: {
    height: 24,
  },
});
