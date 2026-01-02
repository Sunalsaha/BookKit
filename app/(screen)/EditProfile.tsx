import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  Platform,
  Alert,
  TextInput,
  useWindowDimensions,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

interface ProfileData {
  name: string;
  mobile: string;
  email: string;
  dob: string;
  address: string;
}

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

const PROFILE_IMAGE_KEY = "@profile_image_uri";
const PROFILE_DATA_KEY = "@profile_data";

const ProfileScreen: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => makeStyles(width, height), [width, height]);

  const [profileData, setProfileData] = useState<ProfileData>({
    name: "Soham Biswas",
    mobile: "9700919162",
    email: "Email@gmail.com",
    dob: "30/08/2000",
    address: "Action Area 1 1/2, 2, Newtown, N...",
  });

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState(profileData.email);
  const [editingField, setEditingField] = useState<keyof ProfileData | null>(
    null
  );
  const [isDirty, setIsDirty] = useState(false);

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Image viewer state
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  const inputRefs = useRef<Record<string, TextInput | null>>({});
  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);

  // Load saved data on mount
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const savedImage = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
      const savedData = await AsyncStorage.getItem(PROFILE_DATA_KEY);

      if (savedImage) {
        setAvatarUri(savedImage);
      }

      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setProfileData(parsedData);
        setPendingEmail(parsedData.email);
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
    }
  };

  const handleChange = (field: keyof ProfileData) => {
    if (field === "dob") {
      const parts = profileData.dob.split("/");
      if (parts.length === 3) {
        const date = new Date(
          parseInt(parts[2]),
          parseInt(parts[1]) - 1,
          parseInt(parts[0])
        );
        if (!isNaN(date.getTime())) {
          setSelectedDate(date);
        }
      }
      setShowDatePicker(true);
    } else {
      setEditingField(field);
      setTimeout(() => inputRefs.current[field]?.focus(), 0);
    }
  };

  const stopEditing = () => setEditingField(null);

  const onPressCamera = () => {
    Alert.alert("Profile photo", "Choose an option", [
      { text: "Take photo", onPress: takePhoto },
      { text: "Choose from gallery", onPress: pickFromGallery },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please grant camera permission to take photos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
      setIsDirty(true);
    }
  };

  const pickFromGallery = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please grant gallery permission to select photos."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
      setIsDirty(true);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (date && event.type !== "dismissed") {
      setSelectedDate(date);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;

      setProfileData((p) => ({ ...p, dob: formattedDate }));
      setIsDirty(true);
    } else if (event.type === "dismissed") {
      setShowDatePicker(false);
    }
  };

  const confirmIOSDate = () => {
    setShowDatePicker(false);
  };

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const saveProfile = async () => {
    if (pendingEmail.trim() !== profileData.email.trim()) {
      if (!isValidEmail(pendingEmail)) {
        Alert.alert("Invalid email", "Please enter a valid email address.");
        return;
      }
    }

    try {
      const committedEmail = pendingEmail.trim();
      const nextProfile = { ...profileData, email: committedEmail };

      // Save to AsyncStorage
      await AsyncStorage.setItem(PROFILE_DATA_KEY, JSON.stringify(nextProfile));

      if (avatarUri) {
        await AsyncStorage.setItem(PROFILE_IMAGE_KEY, avatarUri);
      }

      setProfileData(nextProfile);
      console.log("Profile saved successfully", nextProfile, avatarUri);

      setIsDirty(false);
      setEditingField(null);

      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to save profile. Please try again.");
    }
  };

  const isEditing = useMemo(() => editingField !== null, [editingField]);

  return (
    <LinearGradient
      colors={["#ffffffff", "#aff6f6ff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraHeight={Platform.OS === "ios" ? 120 : 150}
        extraScrollHeight={Platform.OS === "ios" ? 120 : 150}
        keyboardOpeningTime={0}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => router.push("/(screen)/Profile")}
          >
            <Ionicons name="arrow-back" size={clamp((width / 375) * 22, 20, 24)} color="black" />
            <Text style={styles.headerText}>Your profile</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.hero}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              <TouchableOpacity
                onPress={() => setImageViewerVisible(true)}
                activeOpacity={0.8}
              >
                <View style={styles.avatarRing}>
                  <Image
                    source={
                      avatarUri
                        ? { uri: avatarUri }
                        : require("../../assets/images/profile.png")
                    }
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editBadge}
                onPress={onPressCamera}
                activeOpacity={0.8}
              >
                <Ionicons name="camera" size={clamp((width / 375) * 16, 14, 18)} color="#11a7ecff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Card Background */}
        <ImageBackground
          source={require("../../assets/images/Editprofile.png")}
          style={styles.formCard}
          imageStyle={styles.formCardImage}
          resizeMode="stretch"
        >
          <View style={styles.formContent}>
            <Field
              styles={styles}
              label="Name"
              value={profileData.name}
              editable={editingField === "name"}
              disabledAction={isEditing && editingField !== "name"}
              onPressChange={() => handleChange("name")}
              onChangeText={(t) => {
                setProfileData((p) => ({ ...p, name: t }));
                setIsDirty(true);
              }}
              inputRef={(r) => (inputRefs.current["name"] = r)}
              onBlur={stopEditing}
            />

            <Field
              styles={styles}
              label="Mobile"
              value={profileData.mobile}
              disabled={true}
              editable={false}
            />

            <Field
              styles={styles}
              label="Email"
              value={
                editingField === "email" ? pendingEmail : profileData.email
              }
              editable={editingField === "email"}
              disabledAction={isEditing && editingField !== "email"}
              onPressChange={() => handleChange("email")}
              onChangeText={(t) => {
                setPendingEmail(t);
                setIsDirty(true);
              }}
              inputRef={(r) => (inputRefs.current["email"] = r)}
              keyboardType="email-address"
              onBlur={stopEditing}
            />

            <Field
              styles={styles}
              label="Date of birth"
              value={profileData.dob}
              editable={false}
              disabledAction={isEditing}
              onPressChange={() => handleChange("dob")}
            />

            <Field
              styles={styles}
              label="Address"
              value={profileData.address}
              editable={editingField === "address"}
              disabledAction={isEditing && editingField !== "address"}
              onPressChange={() => handleChange("address")}
              onChangeText={(t) => {
                setProfileData((p) => ({ ...p, address: t }));
                setIsDirty(true);
              }}
              inputRef={(r) => (inputRefs.current["address"] = r)}
              onBlur={stopEditing}
            />
          </View>
        </ImageBackground>

        {/* Save Profile Button */}
        <TouchableOpacity
          style={[
            styles.updateButton,
            !isDirty && styles.updateButtonDisabled,
          ]}
          activeOpacity={0.85}
          disabled={!isDirty}
          onPress={saveProfile}
        >
          <Ionicons
            name="save-outline"
            size={clamp((width / 375) * 20, 18, 22)}
            color="rgba(255,255,255,0.78)"
            style={styles.saveIcon}
          />
          <Text style={styles.updateButtonText}>Save Profile</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <>
          {Platform.OS === "ios" ? (
            <Modal
              transparent={true}
              animationType="slide"
              visible={showDatePicker}
              onRequestClose={() => setShowDatePicker(false)}
            >
              <Pressable
                style={styles.modalOverlay}
                onPress={() => setShowDatePicker(false)}
              >
                <View style={styles.datePickerContainer}>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.datePickerCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.datePickerTitle}>Select Date</Text>
                    <TouchableOpacity onPress={confirmIOSDate}>
                      <Text style={styles.datePickerConfirm}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    textColor="#000000"
                  />
                </View>
              </Pressable>
            </Modal>
          ) : (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </>
      )}

      {/* Image Viewer Modal */}
      <Modal
        visible={imageViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageViewerVisible(false)}
      >
        <View style={styles.imageViewerContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setImageViewerVisible(false)}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={30} color="#FFFFFF" />
          </TouchableOpacity>
          <Image
            source={
              avatarUri
                ? { uri: avatarUri }
                : require("../../assets/images/profile.png")
            }
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </LinearGradient>
  );
};

function Field({
  styles,
  label,
  value,
  disabled,
  editable,
  onPressChange,
  onChangeText,
  inputRef,
  onBlur,
  disabledAction,
  keyboardType,
}: {
  styles: ReturnType<typeof makeStyles>;
  label: string;
  value: string;
  disabled?: boolean;
  editable?: boolean;
  onPressChange?: () => void;
  onChangeText?: (t: string) => void;
  inputRef?: (r: TextInput | null) => void;
  onBlur?: () => void;
  disabledAction?: boolean;
  keyboardType?: "default" | "phone-pad" | "email-address";
}) {
  return (
    <View style={styles.fieldWrap}>
      <View style={styles.floatingLabel}>
        <Text style={styles.floatingLabelText}>{label}</Text>
      </View>

      <View style={[styles.boxRow, disabled && styles.boxRowDisabled]}>
        {editable && !disabled ? (
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            style={styles.boxInput}
            onBlur={onBlur}
            keyboardType={keyboardType || "default"}
            returnKeyType="done"
            autoCapitalize="none"
          />
        ) : (
          <Text
            style={[styles.boxValue, disabled && styles.boxValueDisabled]}
            numberOfLines={1}
          >
            {value}
          </Text>
        )}

        {!disabled && (
          <TouchableOpacity
            onPress={onPressChange}
            hitSlop={10}
            disabled={!!disabledAction}
            style={disabledAction ? styles.changeDisabledWrap : undefined}
          >
            <Text style={styles.changeButton}>CHANGE</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const makeStyles = (width: number, height: number) => {
  // Responsive scaling based on screen width (375 is baseline iPhone)
  const scale = (size: number) => (width / 375) * size;
  const verticalScale = (size: number) => (height / 812) * size;
  const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

  // Screen size breakpoints for better categorization
  const isSmallDevice = width < 375; // iPhone SE, small Android
  const isMediumDevice = width >= 375 && width < 414; // iPhone 12/13/14
  const isLargeDevice = width >= 414; // iPhone Pro Max, large Android

  // Dynamic sizing constants - OPTIMIZED FOR NO SCROLL
  const PROFILE_IMAGE_SIZE = clamp(scale(110), 90, 130);
  const topPad = clamp(verticalScale(35), 25, 50);
  const sidePad = clamp(scale(16), 14, 24);
  const heroHeight = clamp(verticalScale(130), 100, 160);
  const avatarOverlap = clamp(scale(50), 40, 65);

  return StyleSheet.create({
    container: { flex: 1 },

    scrollContent: {
      paddingHorizontal: sidePad,
      paddingTop: topPad,
      paddingBottom: clamp(verticalScale(25), 20, 40),
    },

    header: { 
      marginBottom: clamp(scale(6), 4, 10),
      width: '100%',
    },

    backButton: { 
      flexDirection: "row", 
      alignItems: "center",
      minHeight: 44,
      paddingVertical: 6,
    },

    headerText: {
      fontSize: clamp(moderateScale(18), 16, 22),
      fontWeight: "800",
      color: "#000",
      marginLeft: clamp(scale(8), 6, 12),
      flexShrink: 1,
    },

    hero: {
      height: heroHeight,
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      marginBottom: clamp(scale(6), 4, 10),
      marginTop: clamp(verticalScale(10), 6, 20),
      width: '100%',
    },

    avatarContainer: {
      alignItems: "center",
      justifyContent: "center",
      zIndex: 20,
      transform: [{ translateY: avatarOverlap }],
    },

    avatarWrapper: { position: "relative" },

    avatarRing: {
      width: PROFILE_IMAGE_SIZE,
      height: PROFILE_IMAGE_SIZE,
      borderRadius: PROFILE_IMAGE_SIZE / 2,
      borderWidth: clamp(scale(3), 2.5, 4),
      borderColor: "rgba(102, 52, 201, 0.55)",
      backgroundColor: "rgba(255,255,255,0.65)",
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
    },

    profileImage: { 
      width: "100%", 
      height: "100%",
    },

    editBadge: {
      position: "absolute",
      right: clamp(scale(4), 2, 8),
      bottom: clamp(scale(6), 4, 10),
      width: clamp(scale(32), 28, 36),
      height: clamp(scale(32), 28, 36),
      borderRadius: clamp(scale(32), 28, 36) / 2,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.25)",
      alignItems: "center",
      justifyContent: "center",
    },

    formCard: {
      minHeight: clamp(verticalScale(420), 380, 150),
      marginBottom: clamp(scale(2), 1, 4),
      overflow: "hidden",
      width: '100%',
    },

    formCardImage: { 
      borderRadius: clamp(scale(14), 12, 18),
    },

    formContent: {
      flex: 1,
      paddingHorizontal: clamp(scale(20), 16, 38),
      paddingTop: clamp(verticalScale(85), 100, 280),
      paddingBottom: clamp(verticalScale(25), 20, 40),
    },

    fieldWrap: {
      marginBottom: clamp(verticalScale(14), 12, 20),
      marginTop: clamp(scale(2), 1, 4),
      position: "relative",
      width: '100%',
    },

    floatingLabel: {
      position: "absolute",
      left: clamp(scale(14), 12, 18),
      top: -8,
      paddingHorizontal: clamp(scale(8), 6, 10),
      backgroundColor: "#FFFFFFFF",
      borderRadius: clamp(scale(6), 5, 8),
      zIndex: 2,
      borderWidth: 1,
      borderColor: "#44D6FF",
    },

    floatingLabelText: {
      fontSize: clamp(moderateScale(10), 9, 12),
      fontWeight: "700",
      color: "rgba(0,0,0,0.65)",
    },

    boxRow: {
      minHeight: clamp(verticalScale(48), 42, 54),
      borderRadius: clamp(scale(10), 9, 13),
      borderWidth: 1,
      borderColor: "#44D6FF",
      backgroundColor: "rgba(255, 255, 255, 0.36)",
      paddingHorizontal: clamp(scale(14), 12, 18),
      paddingVertical: clamp(scale(5), 3, 7),
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      width: '100%',
    },

    boxRowDisabled: {
      borderColor: "rgba(120,120,120,0.35)",
      backgroundColor: "rgba(120,120,120,0.42)",
    },

    boxValue: {
      flex: 1,
      marginRight: clamp(scale(12), 8, 16),
      fontSize: clamp(moderateScale(15), 13, 17),
      fontWeight: "400",
      color: "#0B0B0B",
    },

    boxValueDisabled: { 
      color: "rgba(255,255,255,0.88)" 
    },

    boxInput: {
      flex: 1,
      marginRight: clamp(scale(12), 8, 16),
      fontSize: clamp(moderateScale(15), 13, 17),
      fontWeight: "400",
      color: "#0B0B0B",
      paddingVertical: Platform.OS === "ios" 
        ? clamp(scale(8), 6, 12) 
        : clamp(scale(4), 2, 8),
      minHeight: Platform.OS === "android" ? 40 : 42,
    },

    changeButton: {
      fontSize: clamp(moderateScale(11), 10, 13),
      color: "#EF4444",
      fontWeight: "800",
      letterSpacing: clamp(scale(0.6), 0.5, 0.8),
      paddingHorizontal: clamp(scale(6), 4, 8),
      paddingVertical: 4,
    },

    changeDisabledWrap: { opacity: 0.35 },

    updateButton: {
      height: clamp(verticalScale(50), 46, 58),
      borderRadius: clamp(scale(12), 10, 16),
      backgroundColor: "rgba(20, 218, 232, 0.9)",
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.08)",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      marginTop: clamp(verticalScale(8), 6, 14),
      width: '100%',
      ...Platform.select({
        android: { elevation: 3 },
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
        },
      }),
    },

    updateButtonDisabled: { opacity: 0.45 },

    saveIcon: {
      marginRight: clamp(scale(10), 8, 12),
    },

    updateButtonText: {
      fontSize: clamp(moderateScale(16), 14, 19),
      fontWeight: "700",
      color: "rgba(255,255,255,0.78)",
    },

    // Date Picker Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },

    datePickerContainer: {
      backgroundColor: "#FFFFFF",
      borderTopLeftRadius: clamp(scale(20), 18, 26),
      borderTopRightRadius: clamp(scale(20), 18, 26),
      paddingBottom: Platform.OS === "ios" ? clamp(verticalScale(30), 20, 40) : clamp(scale(20), 16, 28),
    },

    datePickerHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: clamp(scale(20), 16, 28),
      paddingVertical: clamp(verticalScale(16), 12, 20),
      borderBottomWidth: 1,
      borderBottomColor: "#E5E5E5",
    },

    datePickerTitle: {
      fontSize: clamp(moderateScale(17), 15, 20),
      fontWeight: "600",
      color: "#000000",
    },

    datePickerCancel: {
      fontSize: clamp(moderateScale(16), 14, 18),
      color: "#EF4444",
      fontWeight: "600",
    },

    datePickerConfirm: {
      fontSize: clamp(moderateScale(16), 14, 18),
      color: "#14DAE8",
      fontWeight: "600",
    },

    // Image Viewer Styles
    imageViewerContainer: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.95)",
      justifyContent: "center",
      alignItems: "center",
    },

    closeButton: {
      position: "absolute",
      top: Platform.OS === "ios" 
        ? clamp(verticalScale(55), 45, 70) 
        : clamp(verticalScale(35), 28, 45),
      right: clamp(scale(20), 16, 28),
      zIndex: 10,
      width: clamp(scale(44), 40, 50),
      height: clamp(scale(44), 40, 50),
      borderRadius: clamp(scale(44), 40, 50) / 2,
      backgroundColor: "rgba(255,255,255,0.2)",
      justifyContent: "center",
      alignItems: "center",
    },

    fullScreenImage: {
      width: width * 0.9,
      height: height * 0.65,
      maxWidth: 600,
      maxHeight: 800,
    },
  });
};

export default ProfileScreen;
