import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Linking,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as ExpoClipboard from 'expo-clipboard';

// ---------- Responsive helpers ----------
const scale = (size: number, width: number) => (width / 375) * size;
const verticalScale = (size: number, height: number) => (height / 812) * size;
const moderateScale = (
  size: number,
  factor: number = 0.5,
  width: number
) => size + (scale(size, width) - size) * factor;

// ---------- Mock data ----------
const ORDER = {
  id: "#01234567985213465",
  bookTitle:
    "NCERT Mathematics Textbook for Class XI Edition 2024 (English Medium)",
  image: "https://ncert.nic.in/textbook/pdf/jemh1cc.jpg",
  sellerName: "John Doe",
  sellerLocation:
    "Action Area I, 1/2, Newtown, New Town, Cha DG Block(Newtown) uttar 24 pargana West Bengal 74......",
  yourAddress:
    "Action Area I, 1/2, Newtown, New Town, Cha DG Block(Newtown) uttar 24 pargana West Bengal 74......",
  note: "Payment will be made hand to hand there.",
  otp: "123456", // Mock OTP for demo - in real app, this comes from seller
};

const OrderDetailsScreen2 = () => {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const styles = createStyles(width, height);

  // State
  const [showUpdates, setShowUpdates] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [shareStatus, setShareStatus] = useState<"pending" | "yes" | "no">("pending");
  
  // Copy Icon logic
  const [isCopied, setIsCopied] = useState(false);

  // OTP States
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const toggleUpdates = () => {
    setShowUpdates(!showUpdates);
  };

  const toggleTerms = () => {
    setShowTerms(!showTerms);
  };

  // ---------- Navigation & Actions ----------
  const handleBackPress = () => {
    router.push("/(screen)/Dashboard");
  };

  const handleHelpPress = () => {
    router.push("/(screen)/Support");
  };

  const handleCopyOrderId = async () => {
    if (isCopied) return;

    await ExpoClipboard.setStringAsync(ORDER.id);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const handleViewLocation = () => {
    const label = "Seller Location";
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@22.5726,88.3639`,
      android: `geo:0,0?q=22.5726,88.3639(${label})`,
    });
    if (url) {
        Linking.openURL(url).catch((err) => console.error("An error occurred", err));
    }
  };

  const handleCall = () => {
    Linking.openURL(`tel:+919876543210`);
  };

  const handleShareResponse = (response: "yes" | "no") => {
    setShareStatus(response);
    console.log(`User selected: ${response}`);
  };

  // Handle OTP Verification - UPDATED to change Delivered step to green tick
  const handleVerifyOtp = () => {
    setIsVerifying(true);
    
    // Simulate API call delay
    setTimeout(() => {
      if (otpInput === ORDER.otp) {
        setOtpVerified(true);
        setShowOtpInput(false);
        Alert.alert("Success", "Order successfully verified with OTP!");
      } else {
        Alert.alert("Error", "Invalid OTP. Please check with seller.");
        setOtpInput("");
      }
      setIsVerifying(false);
    }, 1000);
  };

  // Resend OTP request
  const handleResendOtp = () => {
    Alert.alert("OTP Resent", "New OTP sent to seller for verification.");
    setOtpInput("");
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        {/* ---------- Header ---------- */}
        <LinearGradient
          colors={["#ffffff", "#f2fbfbff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1.2 }}
          style={styles.headerContainer}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.iconButton}
              onPress={handleBackPress}
            >
              <Ionicons name="arrow-back" size={scale(24, width)} color="#000" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Order Details</Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.iconButton}
              onPress={handleHelpPress}
            >
              <Image
                source={require("../../assets/images/needhelp.png")}
                style={styles.helpIcon}
                contentFit="contain"
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ---------- Body Content ---------- */}
        <LinearGradient
          colors={["#E0F7FA", "#E0F7FA"]}
          style={styles.bodyContainer}
        >
          <LinearGradient
            colors={["#ffffffff", "#f2fbfbff"]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.4 }}
          />

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
            keyboardShouldPersistTaps="handled"
          >
            {/* ---------- Book Info ---------- */}
            <View style={styles.bookRow}>
              <View style={styles.bookImageWrapper}>
                <Image
                  source={{ uri: ORDER.image }}
                  style={styles.bookImage}
                  contentFit="contain"
                />
              </View>

              <View style={styles.bookInfo}>
                <Text numberOfLines={3} style={styles.bookTitle}>
                  {ORDER.bookTitle}
                </Text>

                <TouchableOpacity 
                  activeOpacity={0.7} 
                  onPress={handleCopyOrderId}
                  style={styles.orderIdContainer}
                >
                  <Text style={styles.orderIdLabel}>
                    Order <Text style={styles.orderIdText}>{ORDER.id}</Text>{" "}
                  </Text>
                  
                  {isCopied ? (
                    <Ionicons
                      name="checkmark"
                      size={scale(16, width)}
                      color="#00C853"
                      style={{ marginLeft: 4, marginTop: 2 }}
                    />
                  ) : (
                    <Ionicons
                      name="copy-outline"
                      size={scale(14, width)}
                      color="#000"
                      style={{ marginLeft: 4, marginTop: 2 }}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* ---------- Status Card ---------- */}
            <View style={styles.statusCard}>
              <View style={styles.statusContent}>
                <View style={styles.progressRow}>
                  {/* Step 1: Order Placed */}
                  <View style={styles.stepContainer}>
                    <View style={styles.stepIconDone}>
                      <Image
                        source={require("../../assets/images/green-tick.gif")}
                        style={styles.gifIcon}
                        contentFit="contain"
                      />
                    </View>
                    <Text style={styles.stepLabel}>Order Placed</Text>
                  </View>

                  {/* Line 1 */}
                  <View style={styles.progressLineWrapper}>
                    <View style={styles.progressLineFill} />
                  </View>

                  {/* Step 2: Confirmed */}
                  <View style={styles.stepContainer}>
                    <View style={styles.stepIconDone}>
                      <Image
                        source={require("../../assets/images/green-tick.gif")}
                        style={styles.gifIcon}
                        contentFit="contain"
                      />
                    </View>
                    <Text style={styles.stepLabel}>Confirmed</Text>
                  </View>

                  {/* Line 2 */}
                  <View style={styles.progressLineWrapper}>
                    <View style={styles.progressLineFill} />
                  </View>

                  {/* Step 3: Delivered/Verified - UPDATED */}
                  <View style={styles.stepContainer}>
                    <View style={[
                      styles.stepIconDone, 
                      otpVerified && styles.stepIconVerified
                    ]}>
                      <Image
                        source={otpVerified 
                          ? require("../../assets/images/green-tick.gif")  // ✅ CHANGED: Green tick after verification
                          : require("../../assets/images/dot.gif")
                        }
                        style={styles.gifIcon}
                        contentFit="contain"
                      />
                    </View>
                    <Text style={[
                      styles.stepLabel,
                      otpVerified && styles.stepLabelVerified
                    ]}>
                      Delivered
                    </Text>
                  </View>
                </View>

                {/* Expanded Updates */}
                {showUpdates && (
                  <View style={styles.expandedUpdates}>
                    <Text style={styles.updateItem}>
                      • Order delivered successfully (4:30 PM)
                    </Text>
                    <Text style={styles.updateItem}>
                      • Order confirmed by seller (2:15 PM)
                    </Text>
                    {otpVerified && (
                      <Text style={[styles.updateItem, { color: "#2E7D32", fontWeight: "600" }]}>
                        • ✅ Delivery verified with OTP (4:35 PM)
                      </Text>
                    )}
                  </View>
                )}
              </View>

              {/* Footer Link */}
              <View style={styles.statusFooter}>
                <TouchableOpacity activeOpacity={0.7} onPress={toggleUpdates}>
                  <Text style={styles.updateLink}>
                    {showUpdates ? "Hide updates" : "See all updates"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ---------- OTP Verification Card ---------- */}
            {!otpVerified && (
              <View style={styles.otpCard}>
                <View style={styles.otpHeader}>
                  <Ionicons 
                    name="shield-checkmark-outline" 
                    size={scale(24, width)} 
                    color="#00C853" 
                  />
                  <Text style={styles.otpTitle}>Delivery Verification</Text>
                </View>

                <Text style={styles.otpDescription}>
                  Seller will provide a 6-digit OTP at delivery time. Enter it below to complete verification.
                </Text>

                {showOtpInput ? (
                  <View style={styles.otpInputContainer}>
                    <TextInput
                      style={styles.otpInput}
                      value={otpInput}
                      onChangeText={setOtpInput}
                      placeholder="Enter 6-digit OTP"
                      placeholderTextColor="#999"
                      keyboardType="number-pad"
                      maxLength={6}
                      selectTextOnFocus
                    />
                    
                    <TouchableOpacity 
                      style={[
                        styles.otpVerifyButton,
                        (isVerifying || otpInput.length !== 6) && styles.otpVerifyButtonDisabled
                      ]}
                      onPress={handleVerifyOtp}
                      disabled={isVerifying || otpInput.length !== 6}
                    >
                      <Text style={styles.otpVerifyButtonText}>
                        {isVerifying ? "Verifying..." : "Verify OTP"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.resendOtpButton}
                      onPress={handleResendOtp}
                    >
                      <Text style={styles.resendOtpText}>Request New OTP</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.otpStartButton}
                    onPress={() => setShowOtpInput(true)}
                  >
                    <Text style={styles.otpStartButtonText}>
                      Start OTP Verification
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* ---------- Seller Location Card ---------- */}
            <View style={styles.locationCard}>
              <View style={styles.locationContent}>
                <View style={styles.sellerNameSection}>
                  <Text style={styles.sellerLabel}>Seller Name</Text>
                  <Text style={styles.sellerNameText}>{ORDER.sellerName}</Text>
                </View>
                
                <View style={styles.innerDivider} />

                <Text style={styles.addressTitle}>Seller Location</Text>

                <View style={styles.addressRow}>
                  <Ionicons
                    name="location-sharp"
                    size={scale(24, width)}
                    color="#000"
                  />
                  <Text style={styles.addressText} numberOfLines={3}>
                    {ORDER.sellerLocation}
                  </Text>
                </View>
              </View>

              {/* Action Buttons Strip */}
              <View style={styles.cardFooterStrip}>
                <TouchableOpacity
                  style={styles.footerButton}
                  activeOpacity={0.7}
                  onPress={handleViewLocation}
                >
                  <Ionicons name="map" size={scale(16, width)} color="#2979FF" />
                  <Text style={styles.footerButtonTextBlue}>View Location</Text>
                </TouchableOpacity>

                <View style={styles.footerDivider} />

                <TouchableOpacity
                  style={styles.footerButton}
                  activeOpacity={0.7}
                  onPress={handleCall}
                >
                  <Ionicons name="call" size={scale(16, width)} color="#16a04f" />
                  <Text style={styles.footerButtonTextGreen}>Call</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ---------- Your Address Card ---------- */}
            <View style={styles.addressCard}>
              <View style={styles.locationContent}>
                <Text style={styles.addressTitle}>Your Address</Text>

                <View style={styles.addressRow}>
                  <Ionicons
                    name="location-sharp"
                    size={scale(24, width)}
                    color="#000"
                  />
                  <Text style={styles.addressText} numberOfLines={3}>
                    {ORDER.yourAddress}
                  </Text>
                </View>
              </View>

              {/* Dynamic Content based on Share Status */}
              {shareStatus === "pending" ? (
                <>
                  <View style={styles.shareStrip}>
                    <Text style={styles.shareText}>
                      Share your location and phone number with the seller to ensure
                      smooth communication 😊
                    </Text>
                  </View>

                  <View style={styles.cardFooterStripNoBorder}>
                    <TouchableOpacity
                      style={styles.footerButton}
                      activeOpacity={0.7}
                      onPress={() => handleShareResponse("no")}
                    >
                      <Text style={styles.footerButtonTextBlack}>No</Text>
                    </TouchableOpacity>

                    <View style={styles.footerDivider} />

                    <TouchableOpacity
                      style={styles.footerButton}
                      activeOpacity={0.7}
                      onPress={() => handleShareResponse("yes")}
                    >
                      <Text style={styles.footerButtonTextBlack}>Yes</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : shareStatus === "yes" ? (
                <View style={[styles.shareStrip, styles.shareStripSuccess]}>
                  <Text style={styles.shareText}>
                    Great! Your details have been shared with the seller. 👍
                  </Text>
                </View>
              ) : (
                <View style={[styles.shareStrip, styles.shareStripRejected]}>
                  <Text style={styles.shareText}>
                    You chose not to share your details.
                  </Text>
                </View>
              )}
            </View>

            {/* ---------- Terms & Conditions ---------- */}
            <View style={styles.termsCard}>
              <TouchableOpacity
                style={styles.termsHeader}
                activeOpacity={0.7}
                onPress={toggleTerms}
              >
                <Text style={styles.termsTitle}>Terms & Conditions</Text>
                <Ionicons
                  name={showTerms ? "chevron-up" : "chevron-down"}
                  size={scale(20, width)}
                  color="#000"
                />
              </TouchableOpacity>

              {showTerms && (
                <View style={styles.termsBody}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.termsText}>{ORDER.note}</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    </KeyboardAvoidingView>
  );
};

export default OrderDetailsScreen2;

// ---------- Styles ---------- (ALL STYLES REMAIN THE SAME - NO CHANGES NEEDED)
const createStyles = (width: number, height: number) => {
  const s = (size: number) => scale(size, width);
  const vs = (size: number) => verticalScale(size, height);
  const ms = (size: number, factor?: number) =>
    moderateScale(size, factor, width);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
    },

    // Header
    headerContainer: {
      paddingTop: vs(50),
      paddingBottom: vs(15),
      paddingHorizontal: s(16),
      elevation: 2,
      shadowOpacity: 0.05,
      shadowRadius: 3,
      zIndex: 10,
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerTitle: {
      fontSize: ms(18),
      fontWeight: "600",
      color: "#000",
    },
    iconButton: {
      padding: s(4),
    },
    helpIcon: {
      width: s(24),
      height: s(24),
    },

    // Body
    bodyContainer: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingTop: vs(24),
      paddingHorizontal: s(16),
      paddingBottom: vs(30),
    },

    // Book Info
    bookRow: {
      flexDirection: "row",
      marginBottom: vs(20),
      alignItems: "flex-start",
    },
    bookImageWrapper: {
      width: s(60),
      height: s(75),
      borderRadius: ms(8),
      backgroundColor: "#fff",
      justifyContent: "center",
      alignItems: "center",
      padding: s(4),
      marginRight: s(12),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    bookImage: {
      width: "100%",
      height: "100%",
    },
    bookInfo: {
      flex: 1,
      justifyContent: "center",
    },
    bookTitle: {
      fontSize: ms(13),
      fontWeight: "400",
      color: "#000",
      lineHeight: ms(18),
      marginBottom: vs(4),
    },
    
    // Copy ID Interaction Styles
    orderIdContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    orderIdLabel: {
      fontSize: ms(11),
      color: "#666",
    },
    orderIdText: {
      color: "#666",
      fontWeight: "500",
    },

    // Status Card
    statusCard: {
      borderRadius: ms(12),
      borderWidth: 1,
      borderColor: "#003EF9",
      marginBottom: vs(16),
      overflow: "hidden",
    },
    statusContent: {
      padding: s(16),
      paddingBottom: vs(20),
    },
    statusTitle: {
      fontSize: ms(14),
      fontWeight: "500",
      color: "#000",
      marginBottom: vs(20),
      textAlign: "center",
    },
    emoji: {
      fontSize: ms(14),
    },
    

    // Progress Stepper
    progressRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "center",
      paddingHorizontal: s(20),
      gap: s(4),
    },
    stepContainer: {
      alignItems: "center",
      width: s(70),
    },
    stepIconDone: {
      width: s(40),
      height: s(40),
      justifyContent: "center",
      alignItems: "center",
      marginBottom: vs(4),
      zIndex: 2,
    },
    stepIconVerified: {
      borderColor: "#08f71000",
      
    },
    gifIcon: {
      width: "100%",
      height: "100%",
    },
    stepLabel: {
      fontSize: ms(10),
      color: "#555",
      textAlign: "center",
      marginTop: vs(2),
    },
    stepLabelVerified: {
      color: "#2E7D32",
      fontWeight: "600",
    },

    // Progress Lines
    progressLineWrapper: {
      flex: 1,
      height: s(40),
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: -s(10),
      zIndex: 1,
      paddingTop: vs(2),
    },
    progressLineFill: {
      width: "100%",
      height: vs(3),
      backgroundColor: "#6ecc65ff",
      borderRadius: vs(2),
    },

    // Expanded Updates
    expandedUpdates: {
      marginTop: vs(16),
      paddingTop: vs(10),
      borderTopWidth: 1,
      borderTopColor: "rgba(34, 85, 164, 0.1)",
    },
    updateItem: {
      fontSize: ms(11),
      color: "#078bd7ff",
      marginBottom: vs(4),
      paddingLeft: s(10),
    },

    // Status Footer
    statusFooter: {
      borderTopWidth: 0.2,
      borderTopColor: "#003ef959",
      paddingVertical: vs(10),
    },
    updateLink: {
      textAlign: "center",
      fontSize: ms(12),
      color: "#0277BD",
      fontWeight: "500",
    },

    // OTP Card
    otpCard: {
      backgroundColor: "#E8F5E8",
      borderRadius: ms(12),
      borderColor: "#4CAF50",
      borderWidth: 1,
      marginBottom: vs(16),
      padding: s(16),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    otpHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: vs(12),
    },
    otpTitle: {
      fontSize: ms(16),
      fontWeight: "600",
      color: "#000",
      marginLeft: s(10),
    },
    otpDescription: {
      fontSize: ms(13),
      color: "#2E7D32",
      lineHeight: ms(18),
      marginBottom: vs(16),
    },
    otpInputContainer: {
      gap: vs(12),
    },
    otpInput: {
      backgroundColor: "#fff",
      borderRadius: ms(8),
      borderWidth: 1,
      borderColor: "#81C784",
      paddingHorizontal: s(16),
      paddingVertical: vs(14),
      fontSize: ms(16),
      fontWeight: "600",
      letterSpacing: 2,
      textAlign: "center",
    },
    otpVerifyButton: {
      backgroundColor: "#4CAF50",
      borderRadius: ms(8),
      paddingVertical: vs(14),
      alignItems: "center",
    },
    otpVerifyButtonDisabled: {
      backgroundColor: "#A5D6A7",
    },
    otpVerifyButtonText: {
      color: "#fff",
      fontSize: ms(15),
      fontWeight: "600",
    },
    resendOtpButton: {
      alignItems: "center",
    },
    resendOtpText: {
      fontSize: ms(13),
      color: "#2E7D32",
      fontWeight: "500",
    },
    otpStartButton: {
      backgroundColor: "#4CAF50",
      borderRadius: ms(8),
      paddingVertical: vs(16),
      alignItems: "center",
    },
    otpStartButtonText: {
      color: "#fff",
      fontSize: ms(15),
      fontWeight: "600",
    },

    // Location Card & Address Card
    locationCard: {
      backgroundColor: "#defafe9a",
      borderRadius: ms(12),
      borderColor: "#70F3FA",
      borderWidth: 0.5,
      marginBottom: vs(16),
      overflow: "hidden",
    },
    locationContent: {
      padding: s(14),
    },
    addressCard: {
      backgroundColor: "#d4eaedff",
      borderRadius: ms(12),
      borderColor: "#70F3FA",
      marginBottom: vs(16),
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },

    // Seller Name specific styles
    sellerNameSection: {
      marginBottom: vs(12),
    },
    sellerLabel: {
      fontSize: ms(12),
      color: "#555",
      marginBottom: vs(2),
      fontWeight: '400'
    },
    sellerNameText: {
      fontSize: ms(15),
      fontWeight: "600",
      color: "#000",
    },
    innerDivider: {
      height: 1,
      backgroundColor: "#70F3FA",
      marginBottom: vs(12),
    },

    addressTitle: {
      fontSize: ms(15),
      fontWeight: "500",
      color: "#000",
      marginBottom: vs(8),
    },
    addressRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    addressText: {
      flex: 1,
      marginLeft: s(8),
      fontSize: ms(12),
      color: "#333",
      lineHeight: ms(18),
    },

    // Card Footer Strip (View Location / Call)
    cardFooterStrip: {
      flexDirection: "row",
      borderTopWidth: 1,
      borderTopColor: "#80DEEA",
      backgroundColor: "#aef4ffff",
      paddingVertical: vs(12),
    },
    cardFooterStripNoBorder: {
      flexDirection: "row",
      backgroundColor: "#B3E5FC",
      paddingVertical: vs(12),
    },
    footerButton: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: s(6),
    },
    footerButtonTextBlue: {
      fontSize: ms(13),
      fontWeight: "500",
      color: "#2979FF",
    },
    footerButtonTextGreen: {
      fontSize: ms(13),
      fontWeight: "500",
      color: "#00C853",
    },
    footerButtonTextBlack: {
      fontSize: ms(13),
      fontWeight: "500",
      color: "#000",
    },
    footerDivider: {
      width: 1,
      backgroundColor: "#81D4FA",
      marginVertical: vs(2),
    },

    // Share Info Banner
    shareStrip: {
      backgroundColor: "#4DD0E1",
      paddingHorizontal: s(12),
      paddingVertical: vs(12),
      justifyContent: "center",
      alignItems: "center",
    },
    shareStripSuccess: {
      backgroundColor: "#aef4ffff", 
    },
    shareStripRejected: {
      backgroundColor: "#aef4ffff", 
    },
    shareText: {
      fontSize: ms(11),
      color: "#000",
      textAlign: "center",
      lineHeight: ms(16),
      fontWeight: "400",
    },

    // Terms Card
    termsCard: {
      backgroundColor: "#cfedf8ff",
      borderRadius: ms(12),
      paddingHorizontal: s(16),
      paddingVertical: vs(14),
      marginBottom: vs(20),
    },
    termsHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    termsTitle: {
      fontSize: ms(14),
      fontWeight: "500",
      color: "#000",
    },
    termsBody: {
      marginTop: vs(8),
      flexDirection: "row",
      alignItems: "flex-start",
      gap: s(8),
      paddingLeft: s(4),
    },
    bulletDot: {
      width: s(4),
      height: s(4),
      borderRadius: s(2),
      backgroundColor: "#000",
      marginTop: vs(6),
    },
    termsText: {
      flex: 1,
      fontSize: ms(12),
      color: "#333",
      lineHeight: ms(18),
    },
  });
};
