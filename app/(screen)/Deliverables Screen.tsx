import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  StyleSheet,
  StatusBar,
  Linking,
  Platform,
  Alert,
  useWindowDimensions,
  TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft,
  MapPin,
  Phone,
  Clock,
  Navigation,
  Lock
} from 'lucide-react-native';

interface DeliveryItem {
  id: string;
  title: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  pickupLocation: string;
  dropLocation: string;
  status: 'pending' | 'accepted' | 'delivered';
  price: string;
  distance: string;
  image: string;
  otp?: string;
}

const DeliverablesScreen = () => {
  const router = useRouter();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, fontScale } = useWindowDimensions();

  const baseWidth = 375;
  const baseHeight = 667;

  const scale = (size: number) => (SCREEN_WIDTH / baseWidth) * size;
  const verticalScale = (size: number) => (SCREEN_HEIGHT / baseHeight) * size;
  const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([
    {
      id: '1',
      title: 'NCERT Mathematics Class XI',
      orderId: 'ORD-2024-001',
      customerName: 'Rahul Sharma',
      customerPhone: '+919876543210',
      pickupLocation: 'Book Store, Sector 12',
      dropLocation: 'Flat 402, Green Valley Apts, Delhi',
      status: 'pending',
      price: '₹45',
      distance: '2.5 km',
      image: "https://ncert.nic.in/textbook/pdf/kech1cc.jpg",
    },
    {
      id: '2',
      title: 'Physics Vol 1 Class XII',
      orderId: 'ORD-2024-002',
      customerName: 'Priya Verma',
      customerPhone: '+919876543211',
      pickupLocation: 'Central Library',
      dropLocation: 'House 55, Block B, Gurgaon',
      status: 'accepted', 
      price: '₹60',
      distance: '5.2 km',
      image: "https://ncert.nic.in/textbook/pdf/leph1cc.jpg",
      otp: '4532',
    },
  ]);

  const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleAcceptOrder = (id: string) => {
    Alert.alert(
      "Accept Delivery?",
      "Are you sure you want to accept this delivery task?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Accept", 
          onPress: () => {
            const newOTP = generateOTP();
            const updated = deliveries.map(item => 
              item.id === id ? { ...item, status: 'accepted' as const, otp: newOTP } : item
            );
            setDeliveries(updated);
            
            Alert.alert(
              "Order Accepted!",
              `Delivery OTP: ${newOTP}\n\nShare this OTP with the customer for verification.`,
              [{ text: "OK" }]
            );
          } 
        }
      ]
    );
  };

  const handleCancelOrder = (id: string) => {
    Alert.alert(
      "Cancel Delivery?",
      "Are you sure you want to cancel this delivery? This action cannot be undone.",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: () => {
            const updated = deliveries.filter(item => item.id !== id);
            setDeliveries(updated);
          } 
        }
      ]
    );
  };

  const handleCallCustomer = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleOpenMap = (location: string) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${0},${0}`; 
    const label = location;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });
    
    if (url) Linking.openURL(url);
  };

  const styles = createStyles(scale, verticalScale, moderateScale, fontScale);

  return (
    <LinearGradient
      colors={["#ffffffff", "#f2fbfbff"]} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.headerContainer}>
          <View style={styles.topBar}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.push('/(screen)/Profile')} 
            >
              <ArrowLeft color="#000" size={moderateScale(24)} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>My Deliveries</Text>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel}>
            {deliveries.filter(d => d.status === 'pending').length} New Requests
          </Text>

          {deliveries.map((item) => (
            <View key={item.id} style={styles.cardContainer}>
              <View style={styles.cardMain}>
                <View style={styles.imageWrapper}>
                  <Image 
                    source={{ uri: item.image }} 
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                </View>

                <View style={styles.cardInfo}>
                  <View style={styles.statusRow}>
                    <Text style={styles.orderId}>{item.orderId}</Text>
                    <View style={[
                      styles.statusBadge, 
                      item.status === 'accepted' ? styles.statusActive : styles.statusPending
                    ]}>
                      <Text style={[
                        styles.statusText,
                        item.status === 'accepted' ? styles.statusTextActive : styles.statusTextPending
                      ]}>
                        {item.status === 'accepted' ? 'IN PROGRESS' : 'NEW ORDER'}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                  
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Clock size={moderateScale(12)} color="#6b7280" />
                      <Text style={styles.metaText}>{item.distance}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.priceText}>{item.price}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.separator} />

              <View style={styles.actionArea}>
                {item.status === 'pending' ? (
                  <View style={styles.pendingContainer}>
                    <View style={styles.locationPreview}>
                      <MapPin size={moderateScale(16)} color="#6b7280" />
                      <Text style={styles.locationTextPreview} numberOfLines={1}>
                        Pickup: {item.pickupLocation}
                      </Text>
                    </View>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={() => handleCancelOrder(item.id)}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.acceptButton}
                        onPress={() => handleAcceptOrder(item.id)}
                      >
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.activeContainer}>
                    <View style={styles.addressBox}>
                      <View style={styles.addressRow}>
                        <View style={styles.dotStart} />
                        <Text style={styles.addressLabel}>Pickup</Text>
                        <Text style={styles.addressValue} numberOfLines={1}>{item.pickupLocation}</Text>
                      </View>
                      <View style={styles.verticalLine} />
                      <View style={styles.addressRow}>
                        <MapPin size={moderateScale(14)} color="#ef4444" />
                        <Text style={styles.addressLabel}>Drop</Text>
                        <Text style={styles.addressValue} numberOfLines={1}>{item.dropLocation}</Text>
                      </View>
                    </View>

                    <View style={styles.buttonRow}>
                      <TouchableOpacity 
                        style={styles.callButton}
                        onPress={() => handleCallCustomer(item.customerPhone)}
                      >
                        <Phone size={moderateScale(18)} color="#0e7490" />
                        <Text style={styles.callButtonText}>Call</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.navigateButton}
                        onPress={() => handleOpenMap(item.dropLocation)}
                      >
                        <Navigation size={moderateScale(18)} color="#fff" />
                        <Text style={styles.navigateButtonText}>Navigate</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Customer OTP Display Only */}
                    {item.otp && (
                      <View style={styles.otpSection}>
                        <Lock size={moderateScale(20)} color="#059669" />
                        <Text style={styles.otpLabel}>Customer OTP</Text>
                        <Text style={styles.otpValue}>{item.otp}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          ))}
          
          <View style={{ height: verticalScale(80) }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const createStyles = (
  scale: (n: number) => number, 
  verticalScale: (n: number) => number, 
  moderateScale: (n: number) => number,
  fontScale: number
) => StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  headerContainer: {
    paddingHorizontal: scale(20),
    paddingTop: Platform.OS === 'android' ? verticalScale(40) : verticalScale(10),
    paddingBottom: verticalScale(10),
  },
  topBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
  },
  backButton: { marginRight: scale(15) },
  screenTitle: { 
    fontSize: moderateScale(20) / fontScale,
    fontWeight: '600', 
    color: '#000', 
  },
  scrollContent: { padding: scale(20) },
  sectionLabel: {
    fontSize: moderateScale(14) / fontScale,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: verticalScale(12),
    marginLeft: scale(4),
  },
  
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(20),
    padding: scale(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardMain: { 
    flexDirection: 'row', 
    marginBottom: verticalScale(12) 
  },
  imageWrapper: {
    width: scale(65),
    height: scale(80),
    borderRadius: moderateScale(8),
    backgroundColor: '#f3f4f6',
    marginRight: scale(12),
    overflow: 'hidden',
  },
  itemImage: { width: '100%', height: '100%' },
  cardInfo: { flex: 1, justifyContent: 'space-between' },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  orderId: {
    fontSize: moderateScale(11) / fontScale,
    color: '#9ca3af',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(6),
  },
  statusPending: { backgroundColor: '#fff7ed' },
  statusActive: { backgroundColor: '#ecfeff' }, 
  statusText: { fontSize: moderateScale(10) / fontScale, fontWeight: '700' },
  statusTextPending: { color: '#c2410c' },
  statusTextActive: { color: '#0e7490' },
  
  itemTitle: {
    fontSize: moderateScale(15) / fontScale,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: verticalScale(6),
    lineHeight: moderateScale(20),
  },
  metaRow: { flexDirection: 'row', gap: scale(12) },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: scale(4) },
  metaText: { fontSize: moderateScale(12) / fontScale, color: '#6b7280' },
  priceText: { fontSize: moderateScale(14) / fontScale, fontWeight: '700', color: '#059669' },
  
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: verticalScale(10),
  },

  actionArea: { marginTop: verticalScale(4) },
  
  pendingContainer: {
    gap: verticalScale(10),
  },
  locationPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  locationTextPreview: {
    fontSize: moderateScale(13) / fontScale,
    color: '#4b5563',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: scale(12),
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ef4444',
  },
  cancelButtonText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: moderateScale(13) / fontScale,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#000',
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(10),
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: moderateScale(13) / fontScale,
  },

  activeContainer: { gap: verticalScale(12) },
  addressBox: {
    backgroundColor: '#f9fafb',
    padding: scale(12),
    borderRadius: moderateScale(8),
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginBottom: verticalScale(8),
  },
  verticalLine: {
    position: 'absolute',
    left: scale(18.5),
    top: verticalScale(20),
    bottom: verticalScale(20),
    width: 1,
    backgroundColor: '#d1d5db',
    zIndex: -1,
  },
  dotStart: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: '#10b981',
    marginLeft: scale(3),
  },
  addressLabel: {
    fontSize: moderateScale(12) / fontScale,
    color: '#6b7280',
    width: scale(50),
  },
  addressValue: {
    fontSize: moderateScale(13) / fontScale,
    color: '#1f2937',
    fontWeight: '500',
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: scale(12),
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
    paddingVertical: verticalScale(12),
    backgroundColor: '#ecfeff',
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: '#67e8f9',
  },
  callButtonText: {
    color: '#0e7490',
    fontWeight: '600',
    fontSize: moderateScale(14) / fontScale,
  },
  navigateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
    paddingVertical: verticalScale(12),
    backgroundColor: '#0e7490',
    borderRadius: moderateScale(10),
  },
  navigateButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: moderateScale(14) / fontScale,
  },

  // Simple Customer OTP Display
  otpSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
    backgroundColor: '#ecfdf5',
    padding: scale(14),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  otpLabel: {
    fontSize: moderateScale(14) / fontScale,
    fontWeight: '600',
    color: '#059669',
    flex: 1,
  },
  otpValue: {
    fontSize: moderateScale(18) / fontScale,
    fontWeight: '800',
    color: '#059669',
    backgroundColor: '#fff',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(-2),
    borderRadius: moderateScale(6),
    minWidth: scale(50),
    textAlign: 'center',
  },
});

export default DeliverablesScreen;