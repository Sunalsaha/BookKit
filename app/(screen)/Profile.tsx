import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, useWindowDimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, ShoppingCart, Truck, Star, ThumbsUp, Info, Edit, AlertCircle, Settings, LogOut, ArrowLeft, Clock } from 'lucide-react-native';
import { router } from 'expo-router';


const ProfileScreen = () => {
  const { width, height } = useWindowDimensions();
  const styles = createStyles(width, height);
  
  const navigateToComingSoon = () => {
    router.push("/(screen)/ComingSoon");
  };

  const navigateToLogin = () => {
    router.push('/(auth)/Login');
  };

  // Logout confirmation handler
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // Add any logout logic here (clear storage, etc.)
            navigateToLogin();
          },
        },
      ],
      { cancelable: true }
    );
  };
  
  return (
    <LinearGradient
      colors={["#ffffffff", "#f2fbfbff"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Back Button - Moved down and navigates to Dashboard */}
        <TouchableOpacity 
          style={styles.backButton} 
          activeOpacity={0.7}
          onPress={() => router.push("/(screen)/Dashboard")}
        >
          <ArrowLeft color="#000" size={scale(24, width)} />
        </TouchableOpacity>


        {/* Profile Card with Background Image - Clickable to Edit Profile */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push("/(screen)/EditProfile")}
        >
          <View style={styles.profileCardWrapper}>
            <LinearGradient
              colors={['#adfcfcff', '#E0E7FF']}
              start={{ x: 1, y: 1 }}
              end={{ x: 0, y: 0 }}
              style={styles.profileCard}
            >
              {/* Background Decorative Image */}
              <Image
                source={require("../../assets/images/page.png")}
                style={styles.backgroundDecoration}
                resizeMode="contain"
              />
              
              {/* Profile Header */}
              <View style={styles.profileHeader}>
                <View style={styles.profileInfo}>
                  <View style={styles.avatarContainer}>
                    <LinearGradient
                      colors={["#6634C9", "#4e46e5"]}
                      style={styles.avatarBorder}
                    >
                      <View style={styles.avatar}>
                        <Image 
                          source={require("../../assets/images/profile.png")} 
                          style={styles.profileImage}
                          resizeMode="cover"
                        />
                      </View>
                    </LinearGradient>
                  </View>
                  
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>Your Name</Text>
                    <Text style={styles.userPhone}> 973302813</Text>
                    <Text style={styles.userAddress}>
                      Action Area I, I/2, Newtown, New Town, Cha...
                    </Text>
                    <Text style={styles.editProfile}>Edit profile</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>


            {/* Gold Coins Section - Clickable to navigate to gold-coins page */}
            <TouchableOpacity 
              style={styles.coinsCard}
              activeOpacity={0.8}
              onPress={() => router.push("/(screen)/gold-coins")}
            >
              <View style={styles.coinsContainer}>
                <View style={styles.coinsLeft}>
                  <View style={styles.coinIcon}>
                    <Text style={styles.coinCurrency}>₹</Text>
                  </View>
                  <Text style={styles.goldCoinsText}>Gold Coins</Text>
                </View>
                <View style={styles.savedBadge}>
                  <Text style={styles.savedText}>Saved ₹1,900</Text>
                  <ChevronRight color="#D97706" size={scale(20, width)} strokeWidth={3} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>


        {/* Action Buttons */}
        <View style={styles.actionGrid}>
          {/* My Orders - With custom icon and navigates to Orders */}
          <TouchableOpacity 
            style={styles.actionButtonWrapper} 
            activeOpacity={0.7}
            onPress={() => router.push("/(screen)/OrdersScreen")}
          >
            <LinearGradient
              colors={['#d7ffffff', '#d7ffffff']}
              style={styles.actionButton}
            >
              <Image 
                source={require("../../assets/images/Orders_Icon.png")} 
                style={styles.actionIcon}
                resizeMode="contain"
              />
              <Text style={styles.actionText}>My Orders</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          {/* Sell books */}
          <TouchableOpacity 
            style={styles.actionButtonWrapper} 
            activeOpacity={0.7}
            onPress={() => router.push("/(screen)/Sellbook1")}
          >
            <LinearGradient
              colors={['#d7ffffff', '#d7ffffff']}
              style={styles.actionButton}
            >
              <Image 
                source={require("../../assets/images/Sellbook.png")} 
                style={styles.actionIcon}
                resizeMode="contain"
              />
              <Text style={styles.actionText}>Sell books</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          {/* Deliverables - With custom icon and navigates to Deliverables */}
          <TouchableOpacity 
            style={styles.actionButtonWrapper} 
            activeOpacity={0.8}
            onPress={() => router.push("/(screen)/Deliverables Screen")}
          >
            <LinearGradient
              colors={['#d7ffffff', '#d7ffffff']}
              style={styles.actionButton}
            >
              <Image 
                source={require("../../assets/images/Deliverables_Icon.png")} 
                style={styles.actionIcon}
                resizeMode="contain"
              />
              <Text style={styles.actionText}>Deliverables</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          {/* Need help */}
          <TouchableOpacity 
            style={styles.actionButtonWrapper} 
            activeOpacity={0.7}
            onPress={() => router.push("/(screen)/Support")}
          >
            <LinearGradient
              colors={['#d7ffffff', '#d7ffffff']}
              style={styles.actionButton}
            >
              <Image 
                source={require("../../assets/images/needhelp.png")} 
                style={styles.actionIcon}
                resizeMode="contain"
              />
              <Text style={styles.actionText}>Need help?</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>


        {/* Menu List */}
        <View style={styles.menuContainer}>
          <MenuItem 
            icon={<Star color="#232323ff" size={scale(24, width)} />} 
            label="Your rating" 
            badge="⭐ 453"
            width={width}
            onPress={navigateToComingSoon}
          />
          <MenuItem icon={<ThumbsUp color="#232323ff" size={scale(24, width)} />} label="Your feedback" width={width} onPress={navigateToComingSoon}/>
          <MenuItem icon={<Clock color="#232323ff" size={scale(24, width)} />} label="Sell Book History" width={width} onPress={navigateToComingSoon}/>
          <MenuItem icon={<Info color="#232323ff" size={scale(24, width)} />} label="About" width={width} onPress={navigateToComingSoon}/>
          <MenuItem icon={<Edit color="#232323ff" size={scale(24, width)} />} label="Send feedback" width={width} onPress={navigateToComingSoon}/>
          <MenuItem icon={<AlertCircle color="#232323ff" size={scale(24, width)} />} label="Report" width={width} onPress={navigateToComingSoon}/>
          <MenuItem icon={<Settings color="#232323ff" size={scale(24, width)} />} label="Settings" width={width} onPress={navigateToComingSoon}/>
          <MenuItem icon={<LogOut color="#232323ff" size={scale(24, width)} />} label="Logout" isLast width={width} onPress={handleLogout} />
        </View>
      </ScrollView>
    </LinearGradient>
  );
};


interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  isLast?: boolean;
  width: number;
  onPress?: () => void;
}


const MenuItem: React.FC<MenuItemProps> = ({ icon, label, badge, isLast, width, onPress }) => {
  const styles = createMenuStyles(width);
  
  return (
    <TouchableOpacity 
      style={[styles.menuItem, !isLast && styles.menuItemBorder]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIcon}>{icon}</View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <ChevronRight color="#0f0f0fff" size={scale(20, width)} />
      </View>
    </TouchableOpacity>
  );
};


// Responsive scaling functions
const scale = (size: number, width: number) => (width / 375) * size;
const verticalScale = (size: number, height: number) => (height / 812) * size;
const moderateScale = (size: number, width: number, factor = 0.5) => 
  size + (scale(size, width) - size) * factor;


const createStyles = (width: number, height: number) => {
  const CARD_PADDING = scale(16, width);
  const CARD_WIDTH = width - (CARD_PADDING * 2);
  
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    contentContainer: {
      padding: CARD_PADDING,
      paddingBottom: verticalScale(40, height),
    },
    backButton: {
      marginBottom: verticalScale(20, height),
      marginTop: verticalScale(12, height),
      padding: scale(8, width),
      alignSelf: 'flex-start',
    },
    profileCardWrapper: {
      marginBottom: verticalScale(16, height),
      width: CARD_WIDTH,
      alignSelf: 'center',
    },
    profileCard: {
      width: '100%',
      minHeight: verticalScale(180, height),
      borderTopLeftRadius: moderateScale(24, width),
      borderTopRightRadius: moderateScale(24, width),
      padding: scale(20, width),
      overflow: 'hidden',
      position: 'relative',
    },
    backgroundDecoration: {
      position: 'absolute',
      right: scale(-15, width),
      top: 0,
      bottom: verticalScale(10, height),
      width: width,
      height: '100%',
      opacity: 1,
    },
    profileHeader: {
      zIndex: 1,
    },
    profileInfo: {
      flexDirection: 'row',
      gap: scale(16, width),
      alignItems: 'flex-start',
      flexWrap: 'wrap',
    },
    avatarContainer: {
      marginTop: verticalScale(4, height),
    },
    avatarBorder: {
      width: scale(90, width),
      height: scale(90, width),
      borderRadius: scale(45, width),
      justifyContent: 'center',
      alignItems: 'center',
      padding: scale(3, width),
    },
    avatar: {
      width: scale(84, width),
      height: scale(84, width),
      borderRadius: scale(42, width),
      backgroundColor: '#E0E7FF',
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileImage: {
      width: '100%',
      height: '100%',
    },
    userDetails: {
      flex: 1,
      justifyContent: 'center',
      minWidth: scale(150, width),
    },
    userName: {
      fontSize: moderateScale(22, width, 0.3),
      fontWeight: 'bold',
      color: '#000',
      marginBottom: verticalScale(4, height),
    },
    userPhone: {
      fontSize: moderateScale(13, width, 0.3),
      color: '#4B5563',
      marginBottom: verticalScale(2, height),
    },
    userAddress: {
      fontSize: moderateScale(12, width, 0.3),
      color: '#6B7280',
      marginBottom: verticalScale(4, height),
    },
    editProfile: {
      fontSize: moderateScale(12, width, 0.3),
      color: '#2563EB',
      fontWeight: '600',
    },
    coinsCard: {
      width: '100%',
      backgroundColor: '#d7ffffff',
      borderBottomLeftRadius: moderateScale(15, width),
      borderBottomRightRadius: moderateScale(15, width),
      paddingHorizontal: scale(10, width),
      paddingVertical: verticalScale(12, height),
      borderWidth: scale(2, width),
      borderTopWidth: scale(1, width),
      borderColor: '#adfcfcff',
      marginTop: verticalScale(-49, height),
    },
    coinsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: scale(8, width),
    },
    coinsLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(10, width),
    },
    coinIcon: {
      width: scale(36, width),
      height: scale(36, width),
      borderRadius: scale(18, width),
      backgroundColor: '#FCD34D',
      justifyContent: 'center',
      alignItems: 'center',
    },
    coinCurrency: {
      fontSize: moderateScale(22, width, 0.3),
      fontWeight: 'bold',
      color: '#fff',
    },
    goldCoinsText: {
      fontSize: moderateScale(16, width, 0.3),
      fontWeight: '600',
      color: '#D97706',
    },
    savedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FEF3C7',
      paddingHorizontal: scale(16, width),
      paddingVertical: verticalScale(8, height),
      borderRadius: moderateScale(20, width),
      gap: scale(6, width),
      borderWidth: scale(2, width),
      borderColor: '#F59E0B',
    },
    savedText: {
      fontSize: moderateScale(14, width, 0.3),
      fontWeight: '700',
      color: '#D97706',
    },
    actionGrid: {
      flexDirection: 'row',
      gap: scale(12, width),
      marginBottom: verticalScale(16, height),
      width: CARD_WIDTH,
      alignSelf: 'center',
    },
    actionButtonWrapper: {
      flex: 1,
      minWidth: scale(70, width),
    },
    actionButton: {
      borderRadius: moderateScale(12, width),
      padding: scale(16, width),
      alignItems: 'center',
      gap: verticalScale(8, height),
      minHeight: verticalScale(100, height),
      justifyContent: 'center',
     shadowColor: "#007cf9ff",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 1.5,
      borderColor: "#31c8ff16",
    },
    actionIcon: {
      width: scale(32, width),
      height: scale(32, width),
    },
    actionText: {
      fontSize: moderateScale(11, width, 0.3),
      fontWeight: '600',
      color: '#000000ff',
      textAlign: 'center',
    },
    menuContainer: {
      backgroundColor: '#d7ffffff',
      borderRadius: moderateScale(12, width),
      overflow: 'hidden',
       shadowColor: "#007cf9ff",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 1.5,
      borderColor: "#31c8ff20",
    },
  });
};


const createMenuStyles = (width: number) => {
  return StyleSheet.create({
    menuItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: scale(24, width),
      paddingVertical: scale(16, width),
    },
    menuItemBorder: {
      borderBottomWidth: 0.5,
      borderBottomColor: '#1188ff1a',
    },
    menuItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(12, width),
      flex: 1,
    },
    menuIcon: {
      width: scale(24, width),
      height: scale(24, width),
    },
    menuLabel: {
      fontSize: moderateScale(16, width, 0.3),
      fontWeight: '500',
      color: '#232323ff',
    },
    menuItemRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(8, width),
    },
    badge: {
      backgroundColor: 'rgba(251, 251, 251, 0.69)',
      paddingHorizontal: scale(12, width),
      paddingVertical: scale(4, width),
      borderRadius: moderateScale(12, width),
    },
    badgeText: {
      fontSize: moderateScale(14, width, 0.3),
      fontWeight: '600',
      color: '#2b2b2bff',
    },
  });
};


export default ProfileScreen;
