import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Responsive scaling functions
const scale = (size: number, width: number) => (width / 375) * size;
const verticalScale = (size: number, height: number) => (height / 812) * size;
const moderateScale = (size: number, factor: number = 0.5, width: number) =>
  size + (scale(size, width) - size) * factor;

interface Address {
  address: string;
  phone: string;
  distance: number;
}

const LocationSelectScreen = () => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const handleUseCurrentLocation = () => {
    router.push('/(screen)/UserCurrentLocation');
  };

  const handleBack = () => {
    router.push('/(screen)/Dashboard');
  };

  const handleAddressSelect = (address: Address) => {
    // Navigate back to Dashboard with the selected address
    router.push({
      pathname: '/(screen)/Dashboard',
      params: {
        selectedAddress: address.address,
        addressType: 'Home',
      },
    });
  };

  const styles = createStyles(width, height, insets);

  return (
    <LinearGradient
      colors={['#ffffffff', '#f2fbfbff']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={scale(28, width)} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select a location</Text>
      </View>

      {/* Dashboard-Style Search Bar */}
      <TouchableOpacity activeOpacity={0.9}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={scale(20, width)} color="#00000060" />
          <Text style={styles.searchPlaceholder}>
            Search for area, street name...
          </Text>
          <View style={styles.micDivider} />
          <Ionicons name="mic" size={scale(22, width)} color="#000000ff" />
        </View>
      </TouchableOpacity>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Use Current Location */}
        <TouchableOpacity 
          style={styles.optionCard}
          onPress={handleUseCurrentLocation}
          activeOpacity={0.7}
        >
          <View style={styles.optionLeft}>
            <Ionicons name="locate" size={scale(24, width)} color="#003EF9" />
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Use current location</Text>
              <Text style={styles.optionSubtitle}>Rath Bazar, Lalgola</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={scale(24, width)} color="#000" />
        </TouchableOpacity>

        {/* Add Address */}
        <TouchableOpacity style={styles.optionCard} activeOpacity={0.7}>
          <View style={styles.optionLeft}>
            <Ionicons name="add-circle-outline" size={scale(24, width)} color="#003EF9" />
            <Text style={[styles.optionTitle, styles.addAddressTitle]}>Add Address</Text>
          </View>
          <Ionicons name="chevron-forward" size={scale(24, width)} color="#000" />
        </TouchableOpacity>

        {/* Saved Addresses Header */}
        <Text style={styles.sectionTitle}>SAVED ADDRESSES</Text>

        {/* Saved Address Cards */}
        {savedAddresses.map((address, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.addressCard}
            activeOpacity={0.7}
            onPress={() => handleAddressSelect(address)}
          >
            <View style={styles.addressHeader}>
              <View style={styles.homeIconContainer}>
                <Ionicons name="home" size={scale(22, width)} color="#003EF9" />
              </View>
              <View style={styles.addressInfo}>
                <Text style={styles.addressTitle}>Home</Text>
                <Text style={styles.addressText} numberOfLines={2}>
                  {address.address}
                </Text>
                <Text style={styles.phoneText}>
                  Phone number: {address.phone}
                </Text>
              </View>
              <View style={styles.distanceBadge}>
                <Ionicons name="location-sharp" size={scale(10, width)} color="#f90000ff" />
                <Text style={styles.distanceText}>{address.distance} km</Text>
              </View>
            </View>
            <View style={styles.addressActions}>
             
              
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

const savedAddresses: Address[] = [
  {
    address: 'Station, Barrackpoore Railway Station, Barrackpoore',
    phone: '+91-9733019162',
    distance: 185,
  },
  {
    address: 'panchavati homestay, Prantik, India',
    phone: '+91-6289896305',
    distance: 100,
  },
  {
    address: 'B, Airport Area Barrackpoore',
    phone: '+91-9733019162',
    distance: 183,
  },
];

const createStyles = (width: number, height: number, insets: any) => {
  const s = (size: number) => scale(size, width);
  const vs = (size: number) => verticalScale(size, height);
  const ms = (size: number, factor?: number) => moderateScale(size, factor, width);

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: s(16),
      paddingTop: insets.top + vs(10),
      paddingBottom: vs(12),
    },
    headerTitle: {
      fontSize: ms(22),
      fontWeight: 'bold',
      color: '#000000',
      marginLeft: s(12),
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: ms(28),
      paddingHorizontal: s(16),
      height: vs(50),
      marginHorizontal: s(16),
      marginBottom: vs(20),
      shadowColor: '#003EF9',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 1.5,
      borderColor: '#003EF920',
    },
    searchPlaceholder: {
      flex: 1,
      marginLeft: s(10),
      fontSize: ms(15),
      color: '#00000060',
      fontWeight: '500',
    },
    micDivider: {
      width: 1,
      height: '60%',
      backgroundColor: '#00000015',
      marginHorizontal: s(12),
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: s(16),
      paddingBottom: insets.bottom + vs(20),
    },
    optionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#FFFFFF',
      padding: s(16),
      borderRadius: ms(12),
      marginBottom: vs(12),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    optionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    optionTextContainer: {
      marginLeft: s(12),
      flex: 1,
    },
    optionTitle: {
      fontSize: ms(16),
      fontWeight: '600',
      color: '#000000',
    },
    addAddressTitle: {
      marginLeft: s(12),
    },
    optionSubtitle: {
      fontSize: ms(13),
      color: '#64748b',
      marginTop: vs(2),
    },
    sectionTitle: {
      fontSize: ms(12),
      fontWeight: '700',
      color: '#64748b',
      marginTop: vs(24),
      marginBottom: vs(16),
      letterSpacing: 1.2,
    },
    addressCard: {
      backgroundColor: '#FFFFFF',
      padding: s(12),
      borderRadius: ms(12),
      marginBottom: vs(10),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    addressHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    homeIconContainer: {
      width: s(40),
      height: s(40),
      backgroundColor: '#EFF6FF',
      borderRadius: s(20),
      justifyContent: 'center',
      alignItems: 'center',
    },
    addressInfo: {
      flex: 1,
      marginLeft: s(10),
      marginRight: s(6),
    },
    addressTitle: {
      fontSize: ms(15),
      fontWeight: '700',
      color: '#0F172A',
      marginBottom: vs(3),
    },
    addressText: {
      fontSize: ms(13),
      color: '#475569',
      marginBottom: vs(3),
      lineHeight: ms(18),
    },
    phoneText: {
      fontSize: ms(12),
      color: '#64748b',
    },
    distanceBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FEF2F2',
      paddingHorizontal: s(6),
      paddingVertical: vs(4),
      borderRadius: ms(16),
      gap: s(3),
      alignSelf: 'flex-start',
    },
    distanceText: {
      fontSize: ms(10),
      color: '#f91500ff',
      fontWeight: '700',
    },
    addressActions: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      marginTop: vs(12),
      gap: s(12),
    },
    
  });
};

export default LocationSelectScreen;
