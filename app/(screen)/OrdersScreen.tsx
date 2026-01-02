import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  StatusBar,
  Modal,
  Pressable,
  useWindowDimensions,
  PixelRatio,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  SlidersHorizontal,
  ChevronRight,
  ArrowLeft,
  X,
  Calendar,
  CheckCircle2,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface Order {
  id: string;
  title: string;
  orderNumber: string;
  status: string;
  statusColor: string;
  image: string;
  showFeedback: boolean;
  feedbackSubmitted: boolean;
  feedbackText?: string;
  date: Date;
}

const BASE_WIDTH = 375;
const BASE_HEIGHT = 667;

const OrdersScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  // Responsive scaling helpers (dynamic, based on current window size)
  const s = (size: number) => (width / BASE_WIDTH) * size;
  const vs = (size: number) => (height / BASE_HEIGHT) * size;
  const ms = (size: number, factor = 0.5) => size + (s(size) - size) * factor;

  // Font size helper (keeps text readable across DP + device sizes; avoids dividing by fontScale)
  const rf = (size: number) => {
    const scaled = size * (width / BASE_WIDTH);
    return Math.round(PixelRatio.roundToNearestPixel(scaled));
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isFeedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewText, setReviewText] = useState('');

  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDateRange, setSelectedDateRange] = useState('All Time');

  const initialOrders: Order[] = useMemo(
    () => [
      {
        id: '1',
        title: 'NCERT Mathematics Textbook for Class XI Edition 2024 (English...',
        orderNumber: '1023456788213465',
        status: 'Conformed by seller',
        statusColor: '#059669',
        image: 'https://ncert.nic.in/textbook/pdf/kech1cc.jpg',
        showFeedback: false,
        feedbackSubmitted: false,
        date: new Date('2024-12-15'),
      },
      {
        id: '2',
        title: 'NCERT Chemistry Textbook for Class XI Edition 2024 (English...',
        orderNumber: '1023456788213465',
        status: 'Delivered',
        statusColor: '#059669',
        image: 'https://ncert.nic.in/textbook/pdf/jehe1cc.jpg',
        showFeedback: true,
        feedbackSubmitted: false,
        feedbackText: 'Share your experience about the book',
        date: new Date('2024-11-20'),
      },
      {
        id: '3',
        title: 'NCERT Science Textbook for Class XI Edition 2024 (English...',
        orderNumber: '1023456788213465',
        status: 'Delivered',
        statusColor: '#059669',
        image: 'https://ncert.nic.in/textbook/pdf/jesc1cc.jpg',
        showFeedback: true,
        feedbackSubmitted: false,
        feedbackText: 'Share your experience about the book',
        date: new Date('2024-06-10'),
      },
      {
        id: '4',
        title: 'NCERT Physics Textbook for Class XII Edition 2024 (English...',
        orderNumber: '1023456788213466',
        status: 'Pending',
        statusColor: '#f59e0b',
        image: 'https://ncert.nic.in/textbook/pdf/leph1cc.jpg',
        showFeedback: false,
        feedbackSubmitted: false,
        date: new Date('2024-12-18'),
      },
      {
        id: '5',
        title: 'NCERT Biology Textbook for Class XII Edition 2024 (English...',
        orderNumber: '1023456788213467',
        status: 'Cancelled',
        statusColor: '#ef4444',
        image: 'https://ncert.nic.in/textbook/pdf/lebo1cc.jpg',
        showFeedback: false,
        feedbackSubmitted: false,
        date: new Date('2024-10-05'),
      },
    ],
    []
  );

  const [allOrders, setAllOrders] = useState<Order[]>(initialOrders);
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  useEffect(() => {
    applyAllFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedStatus, selectedDateRange, allOrders]);

  const applyAllFilters = () => {
    let filteredData: Order[] = [...allOrders];

    // Search
    if (searchQuery.trim() !== '') {
      const searchLower = searchQuery.toLowerCase();
      filteredData = filteredData.filter((order) => {
        return (
          order.title.toLowerCase().includes(searchLower) ||
          order.orderNumber.toLowerCase().includes(searchLower) ||
          order.status.toLowerCase().includes(searchLower)
        );
      });
    }

    // Status
    if (selectedStatus !== 'All') {
      filteredData = filteredData.filter((order) => {
        if (selectedStatus === 'Conformed') {
          return order.status.toLowerCase().includes('conformed');
        }
        return order.status.toLowerCase() === selectedStatus.toLowerCase();
      });
    }

    // Date range
    if (selectedDateRange !== 'All Time') {
      const now = new Date();

      filteredData = filteredData.filter((order) => {
        const orderDate = order.date;

        switch (selectedDateRange) {
          case 'Last 30 Days': {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(now.getDate() - 30);
            return orderDate >= thirtyDaysAgo;
          }
          case 'Last 6 Months': {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(now.getMonth() - 6);
            return orderDate >= sixMonthsAgo;
          }
          case '2024':
            return orderDate.getFullYear() === 2024;
          default:
            return true;
        }
      });
    }

    setOrders(filteredData);
  };

  const handleFeedbackPress = (order: Order) => {
    if (!order.feedbackSubmitted) {
      setSelectedOrder(order);
      setFeedbackModalVisible(true);
    }
  };

  const handleFeedbackSubmit = () => {
    if (!selectedOrder) return;

    const updater = (order: Order) =>
      order.id === selectedOrder.id
        ? {
            ...order,
            feedbackSubmitted: true,
            feedbackText: 'Thank you for your feedback',
          }
        : order;

    setAllOrders((prev) => prev.map(updater));
    setFeedbackModalVisible(false);
    setSelectedOrder(null);
    setReviewText('');
  };

  const applyFilters = () => setFilterModalVisible(false);

  const resetFilters = () => {
    setSelectedStatus('All');
    setSelectedDateRange('All Time');
    setSearchQuery('');
  };

  const handleBack = () => {
    router.push('/(screen)/Profile');
  };

  const handleOrderPress = (order: Order) => {
    router.push({
      pathname: '/(screen)/OrderDetailsScreen',
      params: {
        orderId: order.id,
        orderTitle: order.title,
        orderNumber: order.orderNumber,
        orderStatus: order.status,
        orderImage: order.image,
      },
    });
  };

  const styles = useMemo(
    () => createStyles({ s, vs, ms, rf, width, height, insetsTop: insets.top, searchFocused }),
    [width, height, insets.top, searchFocused]
  );

  return (
    <LinearGradient
      colors={['#ffffffff', '#f2fbfbff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.headerContainer}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              accessibilityLabel="Go back to profile"
              accessibilityRole="button"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft color="#000" size={ms(24)} strokeWidth={2.5} />
            </TouchableOpacity>

            <Text style={styles.screenTitle}>My Orders</Text>
          </View>

          <View style={styles.bannerContainer}>
            <Image
              source={require('../../assets/images/order.png')}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </View>

          {/* Search + Filter */}
          <View style={styles.searchContainer}>
            <View style={[styles.searchBox, searchFocused && styles.searchBoxFocused]}>
              <Search color={searchFocused ? '#003EF9' : '#00000060'} size={ms(20)} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search orders, books, status"
                placeholderTextColor="#00000060"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                accessibilityLabel="Search orders"
                returnKeyType="search"
              />

              {searchQuery !== '' ? (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearIconButton}
                  accessibilityLabel="Clear search"
                  accessibilityRole="button"
                >
                  <X color="#00000060" size={ms(18)} />
                </TouchableOpacity>
              ) : (
                <View style={styles.micDivider} />
              )}
            </View>

            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setFilterModalVisible(true)}
              accessibilityLabel="Open filters"
              accessibilityRole="button"
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F0FDFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.filterButtonGradient}
              >
                <SlidersHorizontal color="#003EF9" size={ms(22)} strokeWidth={2.5} />
                {(selectedStatus !== 'All' || selectedDateRange !== 'All Time') && (
                  <View style={styles.filterBadge} />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Active Filters */}
          {(selectedStatus !== 'All' || selectedDateRange !== 'All Time') && (
            <View style={styles.activeFiltersContainer}>
              <View style={styles.activeFiltersHeader}>
                <Text style={styles.activeFiltersLabel}>Active Filters</Text>
                <TouchableOpacity onPress={resetFilters}>
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.activeFiltersChips}>
                {selectedStatus !== 'All' && (
                  <View style={styles.activeFilterChip}>
                    <Text style={styles.activeFilterChipText}>{selectedStatus}</Text>
                    <TouchableOpacity onPress={() => setSelectedStatus('All')}>
                      <X color="#0e7490" size={ms(14)} strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                )}

                {selectedDateRange !== 'All Time' && (
                  <View style={styles.activeFilterChip}>
                    <Text style={styles.activeFilterChipText}>{selectedDateRange}</Text>
                    <TouchableOpacity onPress={() => setSelectedDateRange('All Time')}>
                      <X color="#0e7490" size={ms(14)} strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}

          <View style={styles.separator} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Results Count */}
          <View style={styles.resultsHeader}>
            <View style={styles.resultsCountContainer}>
              
              <Text style={styles.resultsCount}>
                {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
              </Text>
            </View>

            {!!searchQuery && (
              <View style={styles.searchingForContainer}>
                <Text style={styles.searchingForText}>
                  for "{searchQuery.length > 15 ? searchQuery.substring(0, 15) + '...' : searchQuery}
                  "
                </Text>
              </View>
            )}
          </View>

          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIconContainer}>
                <Text style={styles.emptyStateIcon}>🔍</Text>
              </View>
              <Text style={styles.emptyStateText}>No orders found</Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery ? `No results for "${searchQuery}"` : 'Try adjusting your filters'}
              </Text>

              <TouchableOpacity style={styles.resetButton} onPress={resetFilters} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#67e8f9', '#22d3ee']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.resetButtonGradient}
                >
                  <Text style={styles.resetButtonText}>Reset Filters</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            orders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.cardContainer}
                onPress={() => handleOrderPress(order)}
                activeOpacity={0.85}
                accessibilityLabel={`View order ${order.orderNumber}`}
                accessibilityRole="button"
              >
                <LinearGradient
                  colors={['#ffffff', '#fafafa']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardMain}>
                    <View style={styles.bookCoverWrapper}>
                      <Image source={{ uri: order.image }} style={styles.bookImage} resizeMode="cover" />
                    </View>

                    <View style={styles.cardInfo}>
                      <Text style={styles.bookTitle} numberOfLines={2}>
                        {order.title}
                      </Text>

                      <View style={styles.orderNumberRow}>
                        <Text style={styles.orderNumberLabel}>Order ID:</Text>
                        <Text style={styles.orderNumber}>#{order.orderNumber.substring(0, 12)}...</Text>
                      </View>

                      <View style={styles.statusRow}>
                        <View style={[styles.statusDot, { backgroundColor: order.statusColor }]} />
                        <Text style={[styles.statusText, { color: order.statusColor }]}>{order.status}</Text>
                      </View>
                    </View>

                    <View style={styles.detailsArrow}>
                      <ChevronRight color="#003EF9" size={ms(22)} strokeWidth={2.5} />
                    </View>
                  </View>

                  {order.showFeedback && (
                    <View style={styles.feedbackContainer}>
                      <TouchableOpacity
                        style={[styles.feedbackBtn, order.feedbackSubmitted && styles.feedbackBtnDisabled]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleFeedbackPress(order);
                        }}
                        disabled={order.feedbackSubmitted}
                        accessibilityLabel="Share feedback"
                        accessibilityRole="button"
                        activeOpacity={0.85}
                      >
                        <LinearGradient
                          colors={order.feedbackSubmitted ? ['#e5e7eb', '#e5e7eb'] : ['#ecfeff', '#cffafe']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.feedbackBtnGradient}
                        >
                          <Text style={styles.feedbackIcon}>{order.feedbackSubmitted ? '✓' : '💬'}</Text>
                          <Text
                            style={[
                              styles.feedbackBtnText,
                              order.feedbackSubmitted && styles.feedbackBtnTextDisabled,
                            ]}
                          >
                            {order.feedbackText}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))
          )}

          <View style={{ height: vs(40) }} />
        </ScrollView>

        {/* Filter Modal */}
        <Modal
          animationType="slide"
          transparent
          visible={isFilterModalVisible}
          onRequestClose={() => setFilterModalVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setFilterModalVisible(false)}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filter Orders</Text>
                <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                  <X color="#333" size={ms(24)} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalBody}>
                  <View style={styles.filterSection}>
                    <View style={styles.sectionHeader}>
                      <CheckCircle2 size={ms(18)} color="#0e7490" style={styles.sectionIcon} />
                      <Text style={styles.sectionTitle}>Order Status</Text>
                    </View>

                    <View style={styles.chipContainer}>
                      {['All', 'Conformed', 'Delivered', 'Pending', 'Cancelled'].map((status) => (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.filterChip,
                            selectedStatus === status && styles.filterChipSelected,
                          ]}
                          onPress={() => setSelectedStatus(status)}
                          activeOpacity={0.85}
                        >
                          <Text
                            style={[
                              styles.filterChipText,
                              selectedStatus === status && styles.filterChipTextSelected,
                            ]}
                          >
                            {status}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.filterSection}>
                    <View style={styles.sectionHeader}>
                      <Calendar size={ms(18)} color="#0e7490" style={styles.sectionIcon} />
                      <Text style={styles.sectionTitle}>Date Range</Text>
                    </View>

                    <View style={styles.chipContainer}>
                      {['All Time', 'Last 30 Days', 'Last 6 Months', '2024'].map((date) => (
                        <TouchableOpacity
                          key={date}
                          style={[
                            styles.filterChip,
                            selectedDateRange === date && styles.filterChipSelected,
                          ]}
                          onPress={() => setSelectedDateRange(date)}
                          activeOpacity={0.85}
                        >
                          <Text
                            style={[
                              styles.filterChipText,
                              selectedDateRange === date && styles.filterChipTextSelected,
                            ]}
                          >
                            {date}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.modalFooter}>
                    <TouchableOpacity style={styles.resetFiltersButton} onPress={resetFilters} activeOpacity={0.85}>
                      <Text style={styles.resetFiltersButtonText}>Reset All</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.applyButton} onPress={applyFilters} activeOpacity={0.85}>
                      <LinearGradient
                        colors={['#feffffff', '#ffffffff']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.applyButtonGradient}
                      >
                        <Text style={styles.applyButtonText}>Apply Filters</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Feedback Modal */}
        <Modal
          animationType="fade"
          transparent
          visible={isFeedbackModalVisible}
          onRequestClose={() => setFeedbackModalVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setFeedbackModalVisible(false)}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Share Your Experience</Text>
                <TouchableOpacity onPress={() => setFeedbackModalVisible(false)}>
                  <X color="#333" size={ms(24)} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.feedbackBookTitle}>{selectedOrder?.title}</Text>

                <TextInput
                  style={styles.feedbackInput}
                  placeholder="Write your review here..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  value={reviewText}
                  onChangeText={setReviewText}
                  textAlignVertical="top"
                />

                <TouchableOpacity style={styles.submitButton} onPress={handleFeedbackSubmit} activeOpacity={0.85}>
                  <LinearGradient
                    colors={['#67e8f9', '#22d3ee']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.submitButtonGradient}
                  >
                    <Text style={styles.submitButtonText}>Submit Feedback</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

function createStyles({
  s,
  vs,
  ms,
  rf,
  width,
  height,
  insetsTop,
  searchFocused,
}: {
  s: (n: number) => number;
  vs: (n: number) => number;
  ms: (n: number, f?: number) => number;
  rf: (n: number) => number;
  width: number;
  height: number;
  insetsTop: number;
  searchFocused: boolean;
}) {
  const isSmallPhone = width < 360;

  return StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },

    headerContainer: {
      paddingHorizontal: s(isSmallPhone ? 14 : 20),
      paddingTop: Platform.OS === 'android' ? vs(12) + insetsTop * 0.15 : vs(8),
      paddingBottom: 0,
    },

    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: vs(18),
    },

    backButton: {
      marginRight: s(12),
      padding: s(4),
    },

    screenTitle: {
      fontSize: rf(20),
      fontWeight: '700',
      color: '#000',
      letterSpacing: 0.5,
    },

    bannerContainer: {
      width: '100%',
      height: vs(isSmallPhone ? 120 : 140),
      borderRadius: ms(16),
      overflow: 'hidden',
      marginBottom: vs(18),
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      backgroundColor: '#fff',
    },

    bannerImage: { width: '100%', height: '100%' },

    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: vs(14),
    },

    searchBox: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: ms(28),
      paddingHorizontal: s(14),
      height: vs(50),
      shadowColor: '#003EF9',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 1.5,
      borderColor: searchFocused ? '#5d85ffff' : '#003EF920',
    },

    searchBoxFocused: {
      shadowOpacity: 0.2,
      elevation: 8,
    },

    searchInput: {
      flex: 1,
      marginLeft: s(10),
      fontSize: rf(15),
      color: '#000',
      fontWeight: '500',
      paddingVertical: 0,
    },

    clearIconButton: {
      padding: s(4),
    },

    micDivider: {
      width: 1,
      height: '60%',
      backgroundColor: '#ffffff0d',
      marginLeft: s(12),
    },

    filterButton: {
      width: ms(54),
      height: vs(50),
      borderRadius: ms(16),
      overflow: 'hidden',
      elevation: 4,
      shadowColor: '#8daaffff',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      marginLeft: s(10),
    },

    filterButtonGradient: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: '#003EF920',
      borderRadius: ms(16),
      position: 'relative',
    },

    filterBadge: {
      position: 'absolute',
      top: ms(10),
      right: ms(10),
      width: ms(10),
      height: ms(10),
      borderRadius: ms(5),
      backgroundColor: '#ef4444',
      borderWidth: 2,
      borderColor: '#FFFFFF',
    },

    activeFiltersContainer: {
      marginBottom: vs(14),
      paddingHorizontal: s(2),
    },

    activeFiltersHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: vs(8),
    },

    activeFiltersLabel: {
      fontSize: rf(12),
      fontWeight: '700',
      color: '#374151',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    activeFiltersChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },

    activeFilterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: s(12),
      paddingVertical: vs(6),
      borderRadius: ms(20),
      backgroundColor: '#ecfeff',
      borderWidth: 1.5,
      borderColor: '#67e8f9',
      marginRight: s(8),
      marginBottom: vs(8),
    },

    activeFilterChipText: {
      fontSize: rf(12),
      color: '#0e7490',
      fontWeight: '600',
      marginRight: s(6),
    },

    clearAllText: {
      fontSize: rf(12),
      color: '#ef4444',
      fontWeight: '700',
      textDecorationLine: 'underline',
    },

    separator: {
      height: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.08)',
      width: '100%',
      marginTop: vs(4),
    },

    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: s(isSmallPhone ? 14 : 20), paddingTop: vs(16) },

    resultsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: vs(16),
      flexWrap: 'wrap',
    },

    resultsCountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    

    resultsIconText: {
      fontSize: rf(16),
    },

    resultsCount: {
      fontSize: rf(15),
      fontWeight: '700',
      color: '#0e7490',
    },

    searchingForContainer: {
      paddingHorizontal: s(12),
      paddingVertical: vs(4),
      backgroundColor: '#f0fdff',
      borderRadius: ms(12),
      marginTop: vs(8),
    },

    searchingForText: {
      fontSize: rf(12),
      color: '#0e7490',
      fontStyle: 'italic',
    },

    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: vs(80),
      paddingHorizontal: s(12),
    },

    emptyStateIconContainer: {
      width: ms(100),
      height: ms(100),
      borderRadius: ms(50),
      backgroundColor: '#f0fdff',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: vs(20),
    },

    emptyStateIcon: {
      fontSize: rf(50),
    },

    emptyStateText: {
      fontSize: rf(20),
      fontWeight: '700',
      color: '#374151',
      marginBottom: vs(8),
      textAlign: 'center',
    },

    emptyStateSubtext: {
      fontSize: rf(14),
      color: '#6b7280',
      marginBottom: vs(24),
      textAlign: 'center',
    },

    resetButton: {
      borderRadius: ms(12),
      overflow: 'hidden',
      elevation: 3,
      shadowColor: '#67e8f9',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },

    resetButtonGradient: {
      paddingHorizontal: s(32),
      paddingVertical: vs(14),
    },

    resetButtonText: {
      fontSize: rf(15),
      fontWeight: '700',
      color: '#0e7490',
    },

    cardContainer: {
      marginBottom: vs(16),
      borderRadius: ms(16),
      overflow: 'hidden',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },

    cardGradient: {
      padding: s(16),
      borderWidth: 1,
      borderColor: '#f3f4f6',
      borderRadius: ms(16),
    },

    cardMain: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },

    bookCoverWrapper: {
      width: s(75),
      height: vs(95),
      borderRadius: ms(10),
      overflow: 'hidden',
      marginRight: s(14),
      backgroundColor: '#f0f0f0',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },

    bookImage: { width: '100%', height: '100%' },

    cardInfo: {
      flex: 1,
      justifyContent: 'center',
    },

    bookTitle: {
      fontSize: rf(14),
      fontWeight: '600',
      color: '#1f2937',
      lineHeight: rf(20),
      marginBottom: vs(6),
    },

    orderNumberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: vs(6),
    },

    orderNumberLabel: {
      fontSize: rf(11),
      color: '#6b7280',
      fontWeight: '500',
      marginRight: s(4),
    },

    orderNumber: {
      fontSize: rf(11),
      color: '#9ca3af',
      fontWeight: '600',
    },

    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    statusDot: {
      width: ms(8),
      height: ms(8),
      borderRadius: ms(4),
      marginRight: s(6),
    },

    statusText: {
      fontSize: rf(12),
      fontWeight: '700',
    },

    detailsArrow: {
      padding: s(8),
      alignSelf: 'center',
      backgroundColor: '#f0fdff',
      borderRadius: ms(8),
      marginLeft: s(8),
    },

    feedbackContainer: {
      marginTop: vs(14),
      borderTopWidth: 1,
      borderTopColor: '#f3f4f6',
      paddingTop: vs(14),
    },

    feedbackBtn: {
      borderRadius: ms(12),
      overflow: 'hidden',
    },

    feedbackBtnDisabled: {
      opacity: 0.6,
    },

    feedbackBtnGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: vs(12),
      borderWidth: 1.5,
      borderColor: '#cffafe',
      borderRadius: ms(12),
      paddingHorizontal: s(10),
    },

    feedbackIcon: {
      marginRight: s(8),
      fontSize: rf(16),
    },

    feedbackBtnText: {
      fontSize: rf(13),
      fontWeight: '700',
      color: '#0e7490',
      textAlign: 'center',
    },

    feedbackBtnTextDisabled: {
      color: '#6b7280',
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'flex-end',
    },

    modalContent: {
      width: '100%',
      backgroundColor: 'white',
      borderTopLeftRadius: ms(24),
      borderTopRightRadius: ms(24),
      padding: s(20),
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      maxHeight: height * 0.82,
    },

    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: vs(20),
      paddingBottom: vs(14),
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },

    modalTitle: {
      fontSize: rf(20),
      fontWeight: '700',
      color: '#1f2937',
    },

    modalBody: {},

    filterSection: {
      marginBottom: vs(20),
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: vs(10),
    },

    sectionIcon: { opacity: 0.8, marginRight: s(10) },

    sectionTitle: {
      fontSize: rf(16),
      fontWeight: '700',
      color: '#374151',
    },

    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },

    filterChip: {
      paddingHorizontal: s(18),
      paddingVertical: vs(10),
      borderRadius: ms(24),
      backgroundColor: '#f9fafb',
      borderWidth: 1.5,
      borderColor: '#e5e7eb',
      marginRight: s(10),
      marginBottom: vs(10),
    },

    filterChipSelected: {
      backgroundColor: '#ecfeff',
      borderColor: '#67e8f9',
    },

    filterChipText: {
      fontSize: rf(14),
      color: '#6b7280',
      fontWeight: '500',
    },

    filterChipTextSelected: {
      color: '#0e7490',
      fontWeight: '700',
    },

    modalFooter: {
      flexDirection: 'row',
      marginTop: vs(10),
    },

    resetFiltersButton: {
      flex: 1,
      backgroundColor: '#f9fafb',
      padding: s(16),
      borderRadius: ms(14),
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: '#e5e7eb',
      marginRight: s(12),
    },

    resetFiltersButtonText: {
      fontSize: rf(16),
      fontWeight: '700',
      color: '#6b7280',
    },

    applyButton: {
      flex: 1,
      borderRadius: ms(14),
      overflow: 'hidden',
      elevation: 3,
      shadowColor: '#67e8f9',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },

    applyButtonGradient: {
      padding: s(16),
      alignItems: 'center',
    },

    applyButtonText: {
      fontSize: rf(16),
      fontWeight: '700',
      color: '#0e7490',
    },

    feedbackBookTitle: {
      fontSize: rf(16),
      fontWeight: '600',
      marginBottom: vs(12),
      textAlign: 'center',
      color: '#374151',
    },

    feedbackInput: {
      height: vs(130),
      borderWidth: 1.5,
      borderColor: '#e5e7eb',
      borderRadius: ms(14),
      padding: s(14),
      backgroundColor: '#f9fafb',
      marginBottom: vs(20),
      fontSize: rf(14),
      color: '#1f2937',
    },

    submitButton: {
      borderRadius: ms(14),
      overflow: 'hidden',
      elevation: 3,
      shadowColor: '#67e8f9',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },

    submitButtonGradient: {
      padding: s(16),
      alignItems: 'center',
    },

    submitButtonText: {
      fontSize: rf(16),
      fontWeight: '700',
      color: '#0e7490',
    },
  });
}

export default OrdersScreen;
