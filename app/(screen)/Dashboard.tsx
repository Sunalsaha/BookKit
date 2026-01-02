import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useLocalSearchParams, router } from "expo-router";

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

// --- Components ---
import BannerCarousel from "../Components/Banner";
import SuggestedBooksCart from "../Components/SuggestedBooksCart";
// Import the Floating Dock (Assuming it's exported from this path)
import { FloatingActionDock } from "../Components/Floatingchip"; 

// --- Constants ---
const NEAR_BOOKS = [
  {
    id: "1",
    title: "NCERT Mathematics Textbook for Class X",
    image: "https://ncert.nic.in/textbook/pdf/jemh1cc.jpg",
    distance: "2.5 km",
    mrp: 2000,
    price: 1509,
  },
  {
    id: "2",
    title: "NCERT Chemistry Class XII",
    image: "https://ncert.nic.in/textbook/pdf/kech1cc.jpg",
    distance: "2 km",
    mrp: 2500,
    price: 1900,
  },
  {
    id: "3",
    title: "NCERT Science Textbook for Class X",
    image: "https://ncert.nic.in/textbook/pdf/jesc1cc.jpg",
    distance: "1.5 km",
    mrp: 1500,
    price: 1000,
  },
  {
    id: "4",
    title: "General English Textbook for All Exams",
    image: "https://ncert.nic.in/textbook/pdf/jehe1cc.jpg",
    distance: "3 km",
    mrp: 2500,
    price: 1899,
  },
  {
    id: "5",
    title: "Flamingo English Textbook for Class XII",
    image: "https://ncert.nic.in/textbook/pdf/lefl1cc.jpg",
    distance: "500 m",
    mrp: 1200,
    price: 899,
  },
];

const TRENDING_BOOKS = [
  {
    id: "1",
    title: "NCERT Physics Class XII Part 1",
    image: "https://ncert.nic.in/textbook/pdf/leph1cc.jpg",
    distance: "1.8 km",
    mrp: 1800,
    price: 1350,
  },
  {
    id: "2",
    title: "NCERT Biology Class XI",
    image: "https://ncert.nic.in/textbook/pdf/lebo1cc.jpg",
    distance: "2.3 km",
    mrp: 1600,
    price: 1200,
  },
  {
    id: "3",
    title: "NCERT History Class X",
    image: "https://ncert.nic.in/textbook/pdf/jehs1cc.jpg",
    distance: "1.2 km",
    mrp: 1400,
    price: 1050,
  },
];

const SUGGESTED_BOOKS = [
  {
    id: "1",
    title: "NCERT Mathematics Textbook for Class X",
    image: "https://ncert.nic.in/textbook/pdf/jemh1cc.jpg",
    distance: "2.5 km",
    mrp: 2000,
    price: 1509,
  },
  {
    id: "2",
    title: "NCERT Chemistry Class XII",
    image: "https://ncert.nic.in/textbook/pdf/kech1cc.jpg",
    distance: "2 km",
    mrp: 2500,
    price: 1900,
  },
  {
    id: "3",
    title: "NCERT Science Textbook for Class X",
    image: "https://ncert.nic.in/textbook/pdf/jesc1cc.jpg",
    distance: "1.5 km",
    mrp: 1500,
    price: 1000,
  },
  {
    id: "4",
    title: "NCERT Physics Class XII Part 1",
    image: "https://ncert.nic.in/textbook/pdf/leph1cc.jpg",
    distance: "1.8 km",
    mrp: 1800,
    price: 1350,
  },
  {
    id: "5",
    title: "NCERT Biology Class XI",
    image: "https://ncert.nic.in/textbook/pdf/lebo1cc.jpg",
    distance: "2.3 km",
    mrp: 1600,
    price: 1200,
  },
  {
    id: "6",
    title: "NCERT History Class X",
    image: "https://ncert.nic.in/textbook/pdf/jehs1cc.jpg",
    distance: "1.2 km",
    mrp: 1400,
    price: 1050,
  },
];

// --- Responsive Utilities ---
const scale = (size: number, width: number) => (width / 375) * size;
const verticalScale = (size: number, height: number) => (height / 812) * size;
const moderateScale = (size: number, factor: number = 0.5, width: number) =>
  size + (scale(size, width) - size) * factor;

const Dashboard = () => {
  const { width, height } = useWindowDimensions();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [selectedLocationTitle, setSelectedLocationTitle] = useState("Home");
  const [liveAddress, setLiveAddress] = useState("Fetching location...");

  // Example dynamic orders data
  const [myOrders] = useState([
    {
      id: "ord_001",
      bookName: "Physics Class 12",
      status: "Out for delivery",
      image: { uri: "https://ncert.nic.in/textbook/pdf/leph1cc.jpg" }, // Dynamic image source
    },
     {
      id: "ord_002",
      bookName: "Chemistry Lab Manual",
      status: "Shipped",
       image: { uri: "https://ncert.nic.in/textbook/pdf/kech1cc.jpg" },
    },
  ]);

  useEffect(() => {
    if (params.selectedAddress) {
      setLiveAddress(params.selectedAddress as string);
      setSelectedLocationTitle((params.addressType as string) || "Home");
    }
  }, [params.selectedAddress, params.addressType]);

  useEffect(() => {
    if (!params.selectedAddress) {
      (async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            setLiveAddress("Location permission denied");
            return;
          }

          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          const { latitude, longitude } = location.coords;

          const addressResponse = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });

          if (addressResponse.length > 0) {
            const addr = addressResponse[0];

            const formattedAddress = [
              addr.name,
              addr.city || addr.district,
              addr.subregion,
              addr.street,
              addr.region,
            ]
              .filter(Boolean)
              .join(", ");

            setLiveAddress(formattedAddress);
          }
        } catch (error) {
          console.log("Location error:", error);
          setLiveAddress("Unable to fetch location");
        }
      })();
    }
  }, [params.selectedAddress]);

  const styles = useMemo(() => createStyles(width, height), [width, height]);

  const suggestedBooksRows = useMemo(() => {
    const rows: Array<typeof SUGGESTED_BOOKS> = [];
    for (let i = 0; i < SUGGESTED_BOOKS.length; i += 2) {
      rows.push(SUGGESTED_BOOKS.slice(i, i + 2) as any);
    }
    return rows;
  }, []);

  const renderBookCard = (item: (typeof NEAR_BOOKS)[number]) => (
    <TouchableOpacity key={item.id} style={styles.bookCard} activeOpacity={0.8}>
      <View style={styles.imageWrapper}>
        <View style={styles.distanceBadge}>
          <Ionicons
            name="location-sharp"
            size={scale(10, width)}
            color="#f90000ff"
          />
          <Text style={styles.distanceText}>{item.distance}</Text>
        </View>

        <View style={styles.imagePlaceholder}>
          <Image
            source={{ uri: item.image }}
            style={styles.bookImage}
            contentFit="cover"
            transition={200}
          />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.bookName} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.mrp}>₹{item.mrp}</Text>
          <Text style={styles.price}>₹{item.price}</Text>
        </View>

        <Text style={styles.buyText}>Buy at ₹{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSuggestedBookCard = (item: (typeof SUGGESTED_BOOKS)[number]) => (
    <TouchableOpacity
      key={item.id}
      style={styles.suggestedBookCard}
      activeOpacity={0.8}
    >
      <View style={styles.imageWrapper}>
        <View style={styles.distanceBadge}>
          <Ionicons
            name="location-sharp"
            size={scale(10, width)}
            color="#f90000ff"
          />
          <Text style={styles.distanceText}>{item.distance}</Text>
        </View>

        <View style={styles.imagePlaceholder}>
          <Image
            source={{ uri: item.image }}
            style={styles.bookImage}
            contentFit="cover"
            transition={200}
          />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.bookName} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.mrp}>₹{item.mrp}</Text>
          <Text style={styles.price}>₹{item.price}</Text>
        </View>

        <Text style={styles.buyText}>Buy at ₹{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <LinearGradient
          colors={["#ffffff", "#f2fbfbff"]}
          style={styles.container}
        >
          {/* --- Header --- */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.locationBox}
                onPress={() => router.push("/(screen)/Location")}
              >
                <Ionicons
                  name="location-sharp"
                  size={scale(16, width)}
                  color="#000"
                />
                <Text style={styles.locationTitle}>
                  {selectedLocationTitle}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={scale(16, width)}
                  color="#000"
                />
              </TouchableOpacity>

              <View style={styles.rightIcons}>
                <TouchableOpacity
                  style={styles.coinBox}
                  activeOpacity={0.7}
                  onPress={() => router.push("/(screen)/gold-coins")}
                >
                  <LinearGradient
                    colors={["#FFD700", "#FFA500"]}
                    style={styles.coinIconWrapper}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialIcons
                      name="currency-rupee"
                      size={scale(16, width)}
                      color="#FFFFFF"
                    />
                  </LinearGradient>
                  <Text style={styles.coinText}>10</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.avatarContainer}
                  onPress={() => router.push("/(screen)/Profile")}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={["#6634C9", "#4e46e5"]}
                    style={styles.avatarBorder}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.avatar}>
                      <Image
                        source={require("../../assets/images/profile.png")}
                        style={styles.profileImage}
                        contentFit="cover"
                      />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.addressText} numberOfLines={1}>
              {liveAddress}
            </Text>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push("/(screen)/SearchScreen")}
            >
              <View style={styles.searchBox}>
                <Ionicons
                  name="search-outline"
                  size={scale(20, width)}
                  color="#00000060"
                />
                <Text style={styles.searchPlaceholder}>
                  Search books, authors, subjects
                </Text>
                <View style={styles.micDivider} />
                <Ionicons
                  name="mic"
                  size={scale(22, width)}
                  color="#000000ff"
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* --- Main Scroll Content --- */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              // IMPORTANT: Add extra padding at the bottom so content isn't hidden behind the floating button
              { paddingBottom: (insets.bottom || 20) + 120 },
            ]}
            style={styles.mainContent}
          >
            <BannerCarousel />

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Books Near Me</Text>
                <TouchableOpacity
                  onPress={() => router.push("/(screen)/BookNearMeScreen")}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="arrow-forward"
                    size={scale(18, width)}
                    color="#000"
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.bookList}
              >
                {NEAR_BOOKS.map((item) => renderBookCard(item))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Trending Books</Text>
                <TouchableOpacity activeOpacity={0.7}>
                  <Ionicons
                    name="arrow-forward"
                    size={scale(18, width)}
                    color="#000"
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.bookList}
              >
                {TRENDING_BOOKS.map((item) => renderBookCard(item))}
              </ScrollView>
            </View>

            <View style={styles.separatedSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Suggested Books</Text>
                <TouchableOpacity activeOpacity={0.7}>
                  <Ionicons
                    name="arrow-forward"
                    size={scale(18, width)}
                    color="#000"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.gridContainer}>
                {suggestedBooksRows.map((row: any, rowIndex) => (
                  <View key={rowIndex} style={styles.suggestedRow}>
                    {row.map((item: any) => renderSuggestedBookCard(item))}
                  </View>
                ))}
              </View>
            </View>

            <SuggestedBooksCart />
          </ScrollView>

          {/* --- Floating Action Dock --- */}
          {/* Positioned absolutely at the bottom */}
          <View 
            style={{ 
              position: 'absolute', 
              bottom: -50, 
              left: 0, 
              right: 0,
              zIndex: 999, 
            }}
            pointerEvents="box-none" // Allows touches to pass through empty space
          >
             <FloatingActionDock  />
          </View>

        </LinearGradient>
      </View>
    </GestureHandlerRootView>
  );
};

export default Dashboard;

// --- Styles ---
const createStyles = (width: number, height: number) => {
  const s = (size: number) => scale(size, width);
  const vs = (size: number) => verticalScale(size, height);
  const ms = (size: number, factor?: number) =>
    moderateScale(size, factor, width);

  const cardGap = s(12);
  const cardW = s(160);
  const gutter = s(16);

  return StyleSheet.create({
    container: { flex: 1 },
    header: {
      paddingTop: vs(50),
      paddingHorizontal: gutter,
      paddingBottom: vs(14),
      minHeight: vs(150),
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    locationBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: s(2),
    },
    locationTitle: {
      fontSize: ms(16),
      fontWeight: "bold",
      color: "#000000",
      marginHorizontal: s(1),
    },
    addressText: {
      fontSize: ms(12),
      color: "#000000E0",
      marginTop: vs(1),
      fontWeight: "400",
      marginBottom: vs(10),
      width: "70%",
    },
    rightIcons: {
      flexDirection: "row",
      alignItems: "center",
      gap: s(12),
    },
    coinBox: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: s(12),
      paddingVertical: vs(6),
      borderRadius: ms(20),
      borderWidth: 2,
      borderColor: "#6634c9a2",
    },
    coinIconWrapper: {
      width: s(26),
      height: s(26),
      borderRadius: s(13),
      justifyContent: "center",
      alignItems: "center",
      marginRight: s(6),
      shadowColor: "#FFA500",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.4,
      shadowRadius: 2,
      elevation: 3,
    },
    coinText: {
      fontSize: ms(16),
      fontWeight: "800",
      color: "#000000",
      letterSpacing: 0.5,
    },
    avatarContainer: {
      shadowColor: "#6634C9",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    avatarBorder: {
      width: s(48),
      height: s(48),
      borderRadius: s(24),
      justifyContent: "center",
      alignItems: "center",
      padding: 2,
    },
    avatar: {
      width: s(44),
      height: s(44),
      borderRadius: s(22),
      backgroundColor: "#E0E7FF",
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
    },
    profileImage: { width: "100%", height: "100%" },
    searchBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FFFFFF",
      borderRadius: ms(28),
      paddingHorizontal: gutter,
      height: vs(50),
      shadowColor: "#003EF9",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 1.5,
      borderColor: "#003EF920",
    },
    searchPlaceholder: {
      flex: 1,
      marginLeft: s(10),
      fontSize: ms(15),
      color: "#00000060",
      fontWeight: "500",
    },
    micDivider: {
      width: 1,
      height: "60%",
      backgroundColor: "#00000015",
      marginHorizontal: s(12),
    },
    mainContent: { flex: 1 },
    scrollContent: { paddingBottom: vs(20) },
    section: { marginTop: vs(20) },
    separatedSection: {
      marginTop: vs(30),
      backgroundColor: "#efe9e97e",
      borderRadius: ms(16),
      marginHorizontal: 5,
      paddingVertical: vs(15),
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: gutter,
      marginBottom: vs(10),
    },
    sectionTitle: {
      fontSize: ms(16),
      fontWeight: "bold",
      color: "#000",
    },
    bookList: {
      paddingHorizontal: s(15),
      paddingBottom: vs(5),
    },
    bookCard: {
      width: cardW,
      marginRight: cardGap,
      backgroundColor: "#fff",
      borderRadius: ms(12),
      padding: s(8),
      elevation: 4,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    imageWrapper: {
      position: "relative",
      height: vs(140),
      marginBottom: vs(10),
    },
    distanceBadge: {
      position: "absolute",
      top: s(10),
      left: s(10),
      zIndex: 10,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fff",
      paddingHorizontal: s(8),
      paddingVertical: s(4),
      borderRadius: ms(20),
      gap: s(4),
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    distanceText: {
      fontSize: ms(10),
      fontWeight: "700",
      color: "#f91500ff",
    },
    imagePlaceholder: {
      width: "100%",
      height: "100%",
      borderRadius: ms(8),
      overflow: "hidden",
      backgroundColor: "#F1F5F9",
    },
    bookImage: { width: "100%", height: "100%" },
    infoContainer: { paddingHorizontal: s(2) },
    bookName: {
      fontSize: ms(13),
      fontWeight: "600",
      color: "#0F172A",
      marginBottom: vs(6),
      lineHeight: ms(18),
      height: ms(36),
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: vs(6),
    },
    mrp: {
      fontSize: ms(12),
      color: "#94A3B8",
      textDecorationLine: "line-through",
      fontWeight: "500",
    },
    price: {
      fontSize: ms(14),
      color: "#0F172A",
      fontWeight: "700",
    },
    buyText: {
      fontSize: ms(12),
      color: "#003EF9",
      fontWeight: "700",
    },
    gridContainer: { paddingHorizontal: gutter },
    suggestedRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: vs(12),
    },
    suggestedBookCard: {
      width: (width - gutter * 2 - s(16)) / 2,
      backgroundColor: "#fff",
      borderRadius: ms(12),
      padding: s(8),
      elevation: 4,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
  });
};
