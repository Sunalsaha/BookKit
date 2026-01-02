import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  useWindowDimensions,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
  FlatList,
  PixelRatio,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';


// Enhanced scaling functions with better device support
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;


const scale = (size: number, width: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number, height: number) => (height / guidelineBaseHeight) * size;
const moderateScale = (size: number, width: number, factor = 0.5) => 
  size + (scale(size, width) - size) * factor;


// Improved normalize function for better pixel density handling
const normalize = (size: number, width: number) => {
  const newSize = moderateScale(size, width);
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 1;
};


const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));


const SAVED_LOCATIONS = [
  {
    id: '1',
    name: 'Home',
    address: 'Action Area I 1/2, Newtown, New Town, Cha DG Black(Newtown) uttar 24 pargana West Bengal 74.....',
    icon: 'home',
  },
  {
    id: '2',
    name: 'Work',
    address: 'Salt Lake Sector V, Bidhannagar, Kolkata, West Bengal 700091',
    icon: 'briefcase',
  },
  {
    id: '3',
    name: 'College',
    address: 'JIS University, Agarpara, Kolkata, West Bengal 700109',
    icon: 'school',
  },
  {
    id: '4',
    name: 'Friend\'s Place',
    address: 'Park Street Area, Kolkata, West Bengal 700016',
    icon: 'people',
  },
];


const SellBook3: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => makeStyles(width, height), [width, height]);
  const router = useRouter();


  const [photos, setPhotos] = useState<(string | null)[]>(Array(8).fill(null));
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [location, setLocation] = useState(SAVED_LOCATIONS[0].address);
  const [isLocationSaved, setIsLocationSaved] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);


  const requestPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();


    if (cameraStatus !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera permission to take photos.'
      );
      return false;
    }
    return true;
  };

  const simulateUpload = async () => {
    setIsUploading(true);
    setUploadProgress(0);

    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadProgress(i);
    }

    setIsUploading(false);
    setUploadProgress(0);
  };


  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const photoCount = photos.filter(p => p !== null).length;

    if (photoCount >= 8) {
      Alert.alert('Limit Reached', 'You can only upload up to 8 photos.');
      return;
    }


    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });


    if (!result.canceled && result.assets && result.assets[0]) {
      await simulateUpload();
      
      setPhotos(prev => {
        const newPhotos = [...prev];
        const firstEmptyIndex = newPhotos.findIndex(p => p === null);
        if (firstEmptyIndex !== -1) {
          newPhotos[firstEmptyIndex] = result.assets[0].uri;
        }
        return newPhotos;
      });
      
      // Check if first 3 required photos are complete
      const requiredPhotosComplete = photos[0] !== null && photos[1] !== null && photos[2] !== null;
      if (requiredPhotosComplete) {
        setShowPhotoModal(false);
      }
    }
  };

  // UPDATED: Enhanced removePhoto function for required photos
  const removePhoto = (index: number) => {
    // Special handling for first 3 photos (required photos)
    if (index < 3) {
      const photoNames = ['front cover', 'back cover', 'index/first page'];
      Alert.alert(
        'Remove Required Photo?',
        `This is the ${photoNames[index]} photo. You must re-upload this photo before proceeding to the next page. The position will remain empty until you upload a new photo.`,
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => {
              setPhotos(prev => {
                const newPhotos = [...prev];
                newPhotos[index] = null;
                return newPhotos;
              });
              
              // Show alert to re-upload after a short delay
              setTimeout(() => {
                Alert.alert(
                  'Photo Required',
                  `Please upload the ${photoNames[index]} photo to complete your listing.`,
                  [{ text: 'Upload Now', onPress: () => setShowPhotoModal(true) }]
                );
              }, 500);
            }
          }
        ]
      );
    } else {
      // Regular removal for optional photos (4-8)
      setPhotos(prev => {
        const newPhotos = [...prev];
        newPhotos[index] = null;
        return newPhotos;
      });
    }
  };

  const handleUploadPress = () => {
    setShowPhotoModal(true);
  };


  const handleLocationSave = () => {
    if (location.trim() === '') {
      Alert.alert('Error', 'Please enter a location');
      return;
    }
    setIsLocationSaved(true);
  };


  const handleChangeLocation = () => {
    setIsLocationSaved(false);
    setShowLocationModal(true);
  };


  const handleSelectLocation = (selectedLocation: typeof SAVED_LOCATIONS[0]) => {
    setLocation(selectedLocation.address);
    setShowLocationModal(false);
    setIsLocationSaved(false);
  };


  const handleOpenMap = () => {
    setShowLocationModal(false);
    router.push({
      pathname: '/(screen)/UserCurrentLocation',
      params: {
        returnTo: 'SellBook3',
      },
    });
  };

  // UPDATED: Check if first 3 required photos are uploaded
  const requiredPhotosUploaded = photos[0] !== null && photos[1] !== null && photos[2] !== null;
  const requiredPhotoCount = [photos[0], photos[1], photos[2]].filter(p => p !== null).length;
  const optionalPhotoCount = photos.slice(3).filter(p => p !== null).length;
  const isFormValid = requiredPhotosUploaded && isLocationSaved;


  // UPDATED: Enhanced handleNext function
  const handleNext = () => {
    if (!requiredPhotosUploaded) {
      const missingPhotos = [];
      if (!photos[0]) missingPhotos.push('front cover');
      if (!photos[1]) missingPhotos.push('back cover');
      if (!photos[2]) missingPhotos.push('index/first page');
      
      Alert.alert(
        'Required Photos Missing',
        `Please upload the following photos: ${missingPhotos.join(', ')}.`,
        [{ text: 'Upload Now', onPress: () => setShowPhotoModal(true) }]
      );
      return;
    }
    
    if (!isLocationSaved) {
      Alert.alert('Location Required', 'Please save your pickup location.');
      return;
    }
    
    if (isFormValid) {
      const validPhotos = photos.filter(p => p !== null) as string[];
      console.log('Photos:', validPhotos);
      console.log('Location:', location);
      // Navigate to next screen
      // router.push('/next-screen');
    }
  };


  const keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : 0;

  const renderLocationItem = ({ item }: { item: typeof SAVED_LOCATIONS[0] }) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => handleSelectLocation(item)}
      activeOpacity={0.7}
    >
      <View style={styles.locationItemIcon}>
        <Ionicons name={item.icon as any} size={moderateScale(22, width)} color="#0891B2" />
      </View>
      <View style={styles.locationItemContent}>
        <Text style={styles.locationItemName}>{item.name}</Text>
        <Text style={styles.locationItemAddress} numberOfLines={2}>
          {item.address}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={moderateScale(20, width)} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#67E8F9', '#E0E7FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.mainContainer}>
            {/* Fixed Header */}
            <View style={styles.fixedHeader}>
              <TouchableOpacity style={styles.backButton}>
                <Ionicons name="chevron-back" size={normalize(24, width)} color="#1f2937" />
                <Text style={styles.headerTitle}>Shear Books</Text>
              </TouchableOpacity>
            </View>

            {/* Fixed Hero Image */}
            <View style={styles.heroCard}>
              <Image
                source={require('../../assets/images/donate-book.png')}
                style={styles.heroImage}
                resizeMode="cover"
              />
            </View>

            {/* Scrollable Content */}
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              {/* Combined Upload and Location Card */}
              <View style={styles.formCard}>
                {/* Upload Photos Section */}
                <Text style={styles.formTitle}>D. Upload Photos</Text>

                <Text style={styles.noteText}>
                  <Text style={styles.noteBold}>Note:</Text> Please upload photos of
                  the front cover, back cover, and index page. If there are any torn
                  or damaged pages, upload clear photos of the defects.
                </Text>

                {/* UPDATED: Photo Grid with Empty Placeholders */}
                <View style={styles.photoGrid}>
                  {/* Always show first 3 required photo slots */}
                  {photos.slice(0, 3).map((photo, index) => (
                    <View key={`required-${index}`} style={styles.photoContainer}>
                      {photo ? (
                        <>
                          <Image
                            source={{ uri: photo }}
                            style={styles.photoThumbnail}
                          />
                          <View style={styles.photoLabel}>
                            <Text style={styles.photoLabelText}>
                              {index === 0 ? 'Cover' : index === 1 ? 'Back' : 'Index'}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={styles.removePhotoButton}
                            onPress={() => removePhoto(index)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Ionicons
                              name="close-circle"
                              size={normalize(24, width)}
                              color="#EF4444"
                            />
                          </TouchableOpacity>
                        </>
                      ) : (
                        <View style={styles.emptyPhotoSlot}>
                          <Ionicons 
                            name={index === 0 ? 'book' : index === 1 ? 'book-outline' : 'document-text'} 
                            size={normalize(32, width)} 
                            color="#9CA3AF" 
                          />
                          <Text style={styles.emptyPhotoText}>
                            {index === 0 ? 'Front' : index === 1 ? 'Back' : 'Index'}
                          </Text>
                          <TouchableOpacity
                            style={styles.uploadEmptySlot}
                            onPress={() => setShowPhotoModal(true)}
                          >
                            <Text style={styles.uploadEmptySlotText}>Upload</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ))}
                  
                  {/* Show uploaded optional photos (4-8) */}
                  {photos.slice(3).map((photo, index) => {
                    if (!photo) return null;
                    const actualIndex = index + 3;
                    
                    return (
                      <View key={`optional-${actualIndex}`} style={styles.photoContainer}>
                        <Image
                          source={{ uri: photo }}
                          style={styles.photoThumbnail}
                        />
                        <View style={styles.photoLabel}>
                          <Text style={styles.photoLabelText}>
                            Page {index + 1}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.removePhotoButton}
                          onPress={() => removePhoto(actualIndex)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons
                            name="close-circle"
                            size={normalize(24, width)}
                            color="#EF4444"
                          />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={styles.uploadArea}
                  onPress={handleUploadPress}
                  activeOpacity={0.7}
                >
                  <Ionicons name="camera-outline" size={normalize(48, width)} color="#374151" />
                  <Text style={styles.uploadText}>
                    Take photos of your book
                  </Text>
                  <Text style={styles.uploadSubtext}>
                    Minimum 3 photos required
                  </Text>
                  <TouchableOpacity
                    style={styles.browseButton}
                    onPress={handleUploadPress}
                  >
                    <Text style={styles.browseButtonText}>Start Camera</Text>
                  </TouchableOpacity>
                </TouchableOpacity>

                {/* UPDATED: Photo Counter */}
                <Text style={styles.photoCounter}>
                  {requiredPhotosUploaded ? '✓ ' : ''}
                  Required photos: {requiredPhotoCount} / 3
                  {optionalPhotoCount > 0 && ` (+${optionalPhotoCount} optional)`}
                </Text>

                {/* Divider */}
                <View style={styles.sectionDivider} />

                {/* Pickup Location Section */}
                <Text style={styles.formTitle}>E. Pickup Location</Text>

                <View style={styles.locationDisplayBox}>
                  <View style={styles.locationIconWrapper}>
                    <Ionicons name="location" size={moderateScale(24, width)} color="#000" />
                  </View>
                  <Text style={styles.locationText} numberOfLines={3}>
                    {location}
                  </Text>
                </View>

                <View style={styles.dividerLine} />

                {!isLocationSaved ? (
                  <View style={styles.locationButtons}>
                    <TouchableOpacity
                      style={styles.changeLocationButton}
                      onPress={handleChangeLocation}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.changeLocationText}>Change Location</Text>
                    </TouchableOpacity>

                    <View style={styles.verticalDivider} />

                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={handleLocationSave}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.savedButton}
                    onPress={handleChangeLocation}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.savedButtonText}>Saved</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Next Button */}
              <TouchableOpacity
                style={[styles.nextButton, !isFormValid && styles.nextButtonDisabled]}
                onPress={handleNext}
                disabled={!isFormValid}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.nextButtonText,
                    !isFormValid && styles.nextButtonTextDisabled,
                  ]}
                >
                  Next
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Photo Upload Modal */}
      <Modal
        visible={showPhotoModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          if (requiredPhotosUploaded) {
            setShowPhotoModal(false);
          } else {
            Alert.alert('Minimum Required', 'Please upload at least 3 photos before closing.');
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.locationModalTitle}>Upload Photos</Text>
              <TouchableOpacity
                onPress={() => {
                  if (requiredPhotosUploaded) {
                    setShowPhotoModal(false);
                  } else {
                    Alert.alert('Minimum Required', 'Please upload at least 3 photos before closing.');
                  }
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={moderateScale(28, width)} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Step Progress */}
            <View style={styles.stepProgressContainer}>
              <View style={styles.stepProgressHeader}>
                <Text style={styles.stepProgressTitle}>
                  {requiredPhotoCount === 0 && 'Step 1: Upload Front Cover'}
                  {requiredPhotoCount === 1 && 'Step 2: Upload Back Cover'}
                  {requiredPhotoCount === 2 && 'Step 3: Upload Index/First Page'}
                  {requiredPhotoCount >= 3 && '✓ Required Photos Complete'}
                </Text>
                <Text style={styles.stepProgressCount}>{requiredPhotoCount} / 3</Text>
              </View>
              
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <Animated.View 
                    style={[
                      styles.progressBarFill, 
                      { width: `${Math.min((requiredPhotoCount / 3) * 100, 100)}%` }
                    ]} 
                  />
                </View>
              </View>

              <View style={styles.stepIndicators}>
                <View style={styles.stepIndicatorItem}>
                  <View style={[
                    styles.stepDot, 
                    photos[0] !== null && styles.stepDotComplete,
                    photos[0] === null && styles.stepDotActive
                  ]}>
                    {photos[0] !== null ? (
                      <Ionicons name="checkmark" size={moderateScale(14, width)} color="#fff" />
                    ) : (
                      <Text style={[styles.stepDotNumber, photos[0] === null && styles.stepDotNumberActive]}>1</Text>
                    )}
                  </View>
                  <Text style={[
                    styles.stepLabel,
                    photos[0] !== null && styles.stepLabelComplete,
                    photos[0] === null && styles.stepLabelActive
                  ]}>Front</Text>
                </View>

                <View style={[styles.stepConnector, photos[1] !== null && styles.stepConnectorComplete]} />

                <View style={styles.stepIndicatorItem}>
                  <View style={[
                    styles.stepDot,
                    photos[1] !== null && styles.stepDotComplete,
                    photos[0] !== null && photos[1] === null && styles.stepDotActive
                  ]}>
                    {photos[1] !== null ? (
                      <Ionicons name="checkmark" size={moderateScale(14, width)} color="#fff" />
                    ) : (
                      <Text style={[styles.stepDotNumber, photos[0] !== null && photos[1] === null && styles.stepDotNumberActive]}>2</Text>
                    )}
                  </View>
                  <Text style={[
                    styles.stepLabel,
                    photos[1] !== null && styles.stepLabelComplete,
                    photos[0] !== null && photos[1] === null && styles.stepLabelActive
                  ]}>Back</Text>
                </View>

                <View style={[styles.stepConnector, photos[2] !== null && styles.stepConnectorComplete]} />

                <View style={styles.stepIndicatorItem}>
                  <View style={[
                    styles.stepDot,
                    photos[2] !== null && styles.stepDotComplete,
                    photos[0] !== null && photos[1] !== null && photos[2] === null && styles.stepDotActive
                  ]}>
                    {photos[2] !== null ? (
                      <Ionicons name="checkmark" size={moderateScale(14, width)} color="#fff" />
                    ) : (
                      <Text style={[styles.stepDotNumber, photos[0] !== null && photos[1] !== null && photos[2] === null && styles.stepDotNumberActive]}>3</Text>
                    )}
                  </View>
                  <Text style={[
                    styles.stepLabel,
                    photos[2] !== null && styles.stepLabelComplete,
                    photos[0] !== null && photos[1] !== null && photos[2] === null && styles.stepLabelActive
                  ]}>Index</Text>
                </View>
              </View>
            </View>

            {isUploading && (
              <View style={styles.uploadProgressContainer}>
                <View style={styles.progressHeader}>
                  <Ionicons name="cloud-upload-outline" size={moderateScale(20, width)} color="#0891B2" />
                  <Text style={styles.progressText}>Uploading... {uploadProgress}%</Text>
                </View>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { width: `${uploadProgress}%` }
                    ]} 
                  />
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.mapOption, isUploading && styles.mapOptionDisabled]}
              onPress={takePhoto}
              activeOpacity={0.7}
              disabled={isUploading}
            >
              <View style={styles.mapIconWrapper}>
                <Ionicons name="camera" size={moderateScale(24, width)} color="#0891B2" />
              </View>
              <View style={styles.mapOptionContent}>
                <Text style={styles.mapOptionTitle}>Open Camera</Text>
                <Text style={styles.mapOptionSubtitle}>
                  {requiredPhotoCount === 0 && 'Take a clear photo of the front cover'}
                  {requiredPhotoCount === 1 && 'Take a clear photo of the back cover'}
                  {requiredPhotoCount === 2 && 'Take a clear photo of the index/first page'}
                  {requiredPhotoCount >= 3 && 'Add more photos (optional - torn/damaged pages)'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={moderateScale(20, width)} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.photoInfoSection}>
              <View style={styles.photoInfoItem}>
                <Ionicons name="images-outline" size={moderateScale(20, width)} color="#6B7280" />
                <Text style={styles.photoInfoText}>
                  {requiredPhotoCount + optionalPhotoCount} / 8 photos captured
                </Text>
              </View>
              <View style={styles.photoInfoItem}>
                <Ionicons name="checkmark-circle" size={moderateScale(20, width)} color={requiredPhotosUploaded ? "#16A34A" : "#9CA3AF"} />
                <Text style={[styles.photoInfoText, requiredPhotosUploaded && styles.photoInfoTextSuccess]}>
                  Minimum 3 photos {requiredPhotosUploaded ? 'completed' : 'required'}
                </Text>
              </View>
            </View>

            <View style={styles.dividerWithText}>
              <View style={styles.dividerLineShort} />
              <Text style={styles.dividerText}>PHOTO REQUIREMENTS</Text>
              <View style={styles.dividerLineShort} />
            </View>

            <ScrollView 
              style={styles.requirementsScrollView}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.requirementsList}>
                <View style={styles.requirementItem}>
                  <View style={[styles.requirementIconCircle, photos[0] !== null && styles.requirementIconCircleComplete]}>
                    <Ionicons 
                      name={photos[0] !== null ? "checkmark" : "book"} 
                      size={moderateScale(18, width)} 
                      color={photos[0] !== null ? "#16A34A" : "#0891B2"} 
                    />
                  </View>
                  <View style={styles.requirementContent}>
                    <Text style={styles.requirementTitle}>Front Cover {photos[0] !== null && '✓'}</Text>
                    <Text style={styles.requirementDescription}>Clear photo of the front cover</Text>
                  </View>
                </View>

                <View style={styles.requirementItem}>
                  <View style={[styles.requirementIconCircle, photos[1] !== null && styles.requirementIconCircleComplete]}>
                    <Ionicons 
                      name={photos[1] !== null ? "checkmark" : "book-outline"} 
                      size={moderateScale(18, width)} 
                      color={photos[1] !== null ? "#16A34A" : "#0891B2"} 
                    />
                  </View>
                  <View style={styles.requirementContent}>
                    <Text style={styles.requirementTitle}>Back Cover {photos[1] !== null && '✓'}</Text>
                    <Text style={styles.requirementDescription}>Clear photo of the back cover</Text>
                  </View>
                </View>

                <View style={styles.requirementItem}>
                  <View style={[styles.requirementIconCircle, photos[2] !== null && styles.requirementIconCircleComplete]}>
                    <Ionicons 
                      name={photos[2] !== null ? "checkmark" : "document-text"} 
                      size={moderateScale(18, width)} 
                      color={photos[2] !== null ? "#16A34A" : "#0891B2"} 
                    />
                  </View>
                  <View style={styles.requirementContent}>
                    <Text style={styles.requirementTitle}>Index/First Page {photos[2] !== null && '✓'}</Text>
                    <Text style={styles.requirementDescription}>Photo of the first or index page</Text>
                  </View>
                </View>

                <View style={styles.requirementItem}>
                  <View style={styles.requirementIconCircle}>
                    <Ionicons name="albums" size={moderateScale(18, width)} color="#9CA3AF" />
                  </View>
                  <View style={styles.requirementContent}>
                    <Text style={styles.requirementTitle}>Additional Pages (Optional)</Text>
                    <Text style={styles.requirementDescription}>Photos of torn or damaged pages</Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* UPDATED: Changed from "Done" to "Next" */}
            {requiredPhotosUploaded && (
              <TouchableOpacity
                style={styles.nextButtonModal}
                onPress={() => setShowPhotoModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.nextButtonModalText}>Next</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Location Modal */}
      <Modal
        visible={showLocationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.locationModalTitle}>Select Location</Text>
              <TouchableOpacity
                onPress={() => setShowLocationModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={moderateScale(28, width)} color="#374151" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.mapOption}
              onPress={handleOpenMap}
              activeOpacity={0.7}
            >
              <View style={styles.mapIconWrapper}>
                <Ionicons name="map" size={moderateScale(24, width)} color="#0891B2" />
              </View>
              <View style={styles.mapOptionContent}>
                <Text style={styles.mapOptionTitle}>Choose on Map</Text>
                <Text style={styles.mapOptionSubtitle}>
                  Select your location by moving the map
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={moderateScale(20, width)} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.dividerWithText}>
              <View style={styles.dividerLineShort} />
              <Text style={styles.dividerText}>OR SELECT FROM SAVED</Text>
              <View style={styles.dividerLineShort} />
            </View>

            <FlatList
              data={SAVED_LOCATIONS}
              renderItem={renderLocationItem}
              keyExtractor={item => item.id}
              style={styles.locationList}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            />
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const makeStyles = (width: number, height: number) => {
  // Enhanced responsive breakpoints
  const isExtraSmall = width < 340;
  const isSmall = width >= 340 && width < 375;
  const isMedium = width >= 375 && width < 414;
  const isLarge = width >= 414 && width < 480;
  const isExtraLarge = width >= 480;
  
  const aspectRatio = height / width;
  const isNarrow = aspectRatio > 2.1;
  const isWide = aspectRatio < 1.8;
  
  // Adaptive padding
  const topPad = isExtraSmall ? 16 
    : isSmall ? 20 
    : isMedium ? clamp(moderateScale(45, width), 35, 50)
    : isLarge ? clamp(moderateScale(50, width), 40, 60)
    : clamp(moderateScale(55, width), 45, 70);
    
  const sidePad = isExtraSmall ? 10
    : isSmall ? 14
    : isMedium ? clamp(moderateScale(18, width), 16, 22)
    : isLarge ? clamp(moderateScale(22, width), 18, 26)
    : clamp(moderateScale(26, width), 22, 32);
  
  const cardPadding = isExtraSmall ? 14
    : isSmall ? 16
    : clamp(moderateScale(20, width), 16, 26);
  
  // Photo grid calculations
  const availableWidth = width - (sidePad * 2) - (cardPadding * 2);
  const photoGap = isExtraSmall ? 6 : isSmall ? 8 : clamp(moderateScale(12, width), 8, 16);
  const photosPerRow = isExtraSmall ? 2 : 3;
  const totalGaps = (photosPerRow - 1) * photoGap;
  const photoSize = Math.floor((availableWidth - totalGaps) / photosPerRow);
  
  const minTouchTarget = Platform.OS === 'ios' ? 44 : 48;
  
  // Hero image height
  const heroHeight = isExtraSmall 
    ? 100
    : isSmall 
    ? 120
    : isNarrow 
    ? clamp(verticalScale(130, height), 120, 160)
    : isWide
    ? clamp(verticalScale(180, height), 160, 220)
    : clamp(verticalScale(150, height), 130, 190);

  return StyleSheet.create({
    container: { flex: 1 },
    keyboardView: { flex: 1 },
    mainContainer: { flex: 1 },
    fixedHeader: {
      paddingHorizontal: sidePad,
      paddingTop: topPad,
      paddingBottom: clamp(moderateScale(12, width), 8, 16),
      backgroundColor: 'transparent',
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: clamp(moderateScale(8, width), 4, 12),
      minHeight: minTouchTarget,
    },
    headerTitle: {
      fontSize: clamp(normalize(18, width), 15, 26),
      fontWeight: '800',
      color: '#000',
      marginLeft: clamp(moderateScale(6, width), 3, 10),
    },
    heroCard: {
      height: heroHeight,
      marginHorizontal: sidePad,
      borderRadius: clamp(moderateScale(16, width), 10, 24),
      overflow: 'hidden',
      backgroundColor: '#fff',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    heroImage: { width: '100%', height: '100%' },
    scrollContent: {
      paddingHorizontal: sidePad,
      paddingTop: clamp(moderateScale(16, width), 12, 24),
      paddingBottom: clamp(moderateScale(24, width), 20, 40),
      flexGrow: 1,
    },
    formCard: {
      backgroundColor: '#BDF4FF',
      borderRadius: clamp(moderateScale(16, width), 12, 22),
      padding: cardPadding,
      marginBottom: clamp(moderateScale(16, width), 12, 22),
    },
    formTitle: {
      fontSize: clamp(normalize(18, width), 15, 24),
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: clamp(moderateScale(10, width), 8, 16),
    },
    noteText: {
      fontSize: clamp(normalize(11, width), 9, 14),
      color: '#4b5563',
      lineHeight: clamp(normalize(16, width), 14, 21),
      marginBottom: clamp(moderateScale(14, width), 12, 20),
    },
    noteBold: { fontWeight: '700' },
    photoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: photoGap,
      marginBottom: clamp(moderateScale(14, width), 12, 20),
    },
    photoContainer: {
      position: 'relative',
      width: photoSize,
      height: photoSize,
    },
    photoThumbnail: {
      width: '100%',
      height: '100%',
      borderRadius: clamp(moderateScale(10, width), 6, 14),
      backgroundColor: '#f3f4f6',
    },
    emptyPhotoSlot: {
      width: '100%',
      height: '100%',
      borderRadius: clamp(moderateScale(10, width), 6, 14),
      backgroundColor: '#F3F4F6',
      borderWidth: 2,
      borderColor: '#E5E7EB',
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      padding: clamp(moderateScale(8, width), 6, 12),
    },
    emptyPhotoText: {
      fontSize: clamp(normalize(9, width), 8, 12),
      color: '#6B7280',
      fontWeight: '600',
      marginTop: clamp(moderateScale(4, width), 3, 6),
      textAlign: 'center',
    },
    uploadEmptySlot: {
      marginTop: clamp(moderateScale(4, width), 3, 6),
      backgroundColor: '#0891B2',
      paddingHorizontal: clamp(moderateScale(8, width), 6, 12),
      paddingVertical: clamp(moderateScale(3, width), 2, 5),
      borderRadius: clamp(moderateScale(4, width), 3, 6),
    },
    uploadEmptySlotText: {
      fontSize: clamp(normalize(8, width), 7, 11),
      color: '#FFFFFF',
      fontWeight: '600',
    },
    photoLabel: {
      position: 'absolute',
      bottom: 3,
      left: 3,
      right: 3,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingVertical: 2,
      paddingHorizontal: 3,
      borderRadius: 3,
    },
    photoLabelText: {
      fontSize: clamp(normalize(8, width), 7, 11),
      color: '#FFFFFF',
      fontWeight: '600',
      textAlign: 'center',
    },
    removePhotoButton: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: '#fff',
      borderRadius: 12,
      width: clamp(moderateScale(24, width), 20, 28),
      height: clamp(moderateScale(24, width), 20, 28),
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    uploadArea: {
      borderWidth: 2,
      borderColor: '#44D6FF',
      borderStyle: 'dashed',
      borderRadius: clamp(moderateScale(12, width), 8, 18),
      padding: clamp(moderateScale(20, width), 16, 32),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: "rgba(255, 255, 255, 0.36)",
      marginBottom: clamp(moderateScale(10, width), 8, 16),
      minHeight: isExtraSmall ? 160 : isSmall ? 180 : 200,
    },
    uploadText: {
      fontSize: clamp(normalize(13, width), 11, 17),
      color: '#374151',
      fontWeight: '600',
      marginTop: clamp(moderateScale(10, width), 8, 16),
      marginBottom: clamp(moderateScale(3, width), 2, 6),
      textAlign: 'center',
      paddingHorizontal: 6,
    },
    uploadSubtext: {
      fontSize: clamp(normalize(10, width), 9, 13),
      color: '#6b7280',
      marginBottom: clamp(moderateScale(14, width), 12, 20),
      textAlign: 'center',
      paddingHorizontal: 6,
    },
    browseButton: {
      backgroundColor: 'rgba(68, 214, 255, 0.5)',
      paddingHorizontal: clamp(moderateScale(18, width), 14, 32),
      paddingVertical: clamp(moderateScale(9, width), 7, 14),
      borderRadius: clamp(moderateScale(8, width), 6, 12),
      borderWidth: 1,
      borderColor: '#44D6FF',
      minHeight: minTouchTarget,
      justifyContent: 'center',
    },
    browseButtonText: {
      fontSize: clamp(normalize(12, width), 11, 16),
      color: '#1f2937',
      fontWeight: '600',
    },
    photoCounter: {
      fontSize: clamp(normalize(11, width), 10, 14),
      color: '#0c64f0ff',
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: clamp(moderateScale(16, width), 12, 24),
    },
    sectionDivider: {
      height: 1,
      backgroundColor: 'rgba(0,0,0,0.15)',
      marginVertical: clamp(moderateScale(20, width), 16, 28),
    },
    locationDisplayBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: clamp(moderateScale(12, width), 10, 16),
    },
    locationIconWrapper: {
      marginRight: clamp(moderateScale(10, width), 8, 14),
      marginTop: clamp(moderateScale(2, width), 1, 4),
    },
    locationText: {
      flex: 1,
      fontSize: clamp(normalize(12, width), 11, 15),
      color: '#1f2937',
      lineHeight: clamp(normalize(17, width), 15, 20),
      fontWeight: '500',
    },
    dividerLine: {
      height: 1,
      backgroundColor: 'rgba(0,0,0,0.1)',
      width: '100%',
      marginBottom: 0,
    },
    locationButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      height: clamp(moderateScale(52, width), 46, 60),
      backgroundColor: 'rgba(255,255,255,0.4)',
      borderBottomLeftRadius: clamp(moderateScale(12, width), 8, 16),
      borderBottomRightRadius: clamp(moderateScale(12, width), 8, 16),
    },
    changeLocationButton: {
      flex: 1,
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    changeLocationText: {
      fontSize: clamp(normalize(13, width), 12, 16),
      color: '#003EF9',
      fontWeight: '600',
    },
    verticalDivider: {
      width: 1,
      height: '60%',
      backgroundColor: '#9CA3AF',
    },
    saveButton: {
      flex: 1,
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveButtonText: {
      fontSize: clamp(normalize(13, width), 12, 16),
      color: '#16A34A',
      fontWeight: '600',
    },
    savedButton: {
      width: '100%',
      height: clamp(moderateScale(52, width), 46, 60),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#16A34A',
      borderBottomLeftRadius: clamp(moderateScale(12, width), 8, 16),
      borderBottomRightRadius: clamp(moderateScale(12, width), 8, 16),
    },
    savedButtonText: {
      fontSize: clamp(normalize(15, width), 14, 18),
      color: '#FFFFFF',
      fontWeight: '700',
    },
    nextButton: {
      height: Math.max(minTouchTarget, clamp(moderateScale(50, width), 46, 62)),
      borderRadius: clamp(moderateScale(12, width), 10, 18),
      backgroundColor: 'rgba(20, 218, 232, 0.9)',
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.08)',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: clamp(moderateScale(6, width), 4, 12),
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.07,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
    },
    nextButtonText: {
      fontSize: clamp(normalize(15, width), 14, 20),
      fontWeight: '700',
      color: 'rgba(255,255,255,0.78)',
    },
    nextButtonDisabled: {
      backgroundColor: 'rgba(156, 163, 175, 0.5)',
      elevation: 0,
      shadowOpacity: 0,
    },
    nextButtonTextDisabled: {
      color: 'rgba(107, 114, 128, 0.7)',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: clamp(moderateScale(22, width), 18, 32),
      borderTopRightRadius: clamp(moderateScale(22, width), 18, 32),
      maxHeight: height * 0.88,
      paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: clamp(moderateScale(18, width), 16, 26),
      paddingTop: clamp(moderateScale(18, width), 16, 26),
      paddingBottom: clamp(moderateScale(14, width), 12, 20),
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
    locationModalTitle: {
      fontSize: clamp(normalize(19, width), 17, 26),
      fontWeight: '700',
      color: '#1F2937',
    },
    stepProgressContainer: {
      marginHorizontal: clamp(moderateScale(16, width), 14, 24),
      marginTop: clamp(moderateScale(14, width), 12, 20),
      marginBottom: clamp(moderateScale(10, width), 8, 16),
      padding: clamp(moderateScale(16, width), 14, 26),
      backgroundColor: '#F0F9FF',
      borderRadius: clamp(moderateScale(14, width), 12, 20),
      borderWidth: 2,
      borderColor: '#BAE6FD',
    },
    stepProgressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: clamp(moderateScale(14, width), 12, 20),
    },
    stepProgressTitle: {
      fontSize: clamp(normalize(14, width), 12, 18),
      fontWeight: '700',
      color: '#0891B2',
      flex: 1,
    },
    stepProgressCount: {
      fontSize: clamp(normalize(13, width), 12, 16),
      fontWeight: '600',
      color: '#64748B',
      marginLeft: 6,
    },
    progressBarContainer: {
      marginBottom: clamp(moderateScale(14, width), 12, 20),
    },
    stepIndicators: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    stepIndicatorItem: {
      alignItems: 'center',
      gap: clamp(moderateScale(5, width), 3, 8),
    },
    stepDot: {
      width: clamp(moderateScale(30, width), 26, 38),
      height: clamp(moderateScale(30, width), 26, 38),
      borderRadius: clamp(moderateScale(15, width), 13, 19),
      backgroundColor: '#E5E7EB',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#D1D5DB',
    },
    stepDotActive: {
      backgroundColor: '#DBEAFE',
      borderColor: '#0891B2',
      borderWidth: 3,
    },
    stepDotComplete: {
      backgroundColor: '#16A34A',
      borderColor: '#16A34A',
    },
    stepDotNumber: {
      fontSize: clamp(normalize(13, width), 12, 16),
      fontWeight: '700',
      color: '#9CA3AF',
    },
    stepDotNumberActive: {
      color: '#0891B2',
      fontSize: clamp(normalize(14, width), 13, 17),
    },
    stepLabel: {
      fontSize: clamp(normalize(10, width), 9, 13),
      fontWeight: '600',
      color: '#9CA3AF',
      textAlign: 'center',
    },
    stepLabelActive: {
      color: '#0891B2',
      fontWeight: '700',
    },
    stepLabelComplete: {
      color: '#16A34A',
    },
    stepConnector: {
      flex: 1,
      height: 2,
      backgroundColor: '#E5E7EB',
      marginHorizontal: clamp(moderateScale(6, width), 4, 10),
    },
    stepConnectorComplete: {
      backgroundColor: '#16A34A',
    },
    uploadProgressContainer: {
      marginHorizontal: clamp(moderateScale(16, width), 14, 24),
      marginBottom: clamp(moderateScale(10, width), 8, 16),
      padding: clamp(moderateScale(14, width), 12, 20),
      backgroundColor: '#FEF3C7',
      borderRadius: clamp(moderateScale(10, width), 8, 16),
      borderWidth: 1,
      borderColor: '#FCD34D',
    },
    progressHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: clamp(moderateScale(6, width), 4, 10),
      marginBottom: clamp(moderateScale(8, width), 6, 12),
    },
    progressText: {
      fontSize: clamp(normalize(13, width), 12, 16),
      fontWeight: '600',
      color: '#0891B2',
    },
    progressBarBackground: {
      height: clamp(moderateScale(7, width), 5, 10),
      backgroundColor: '#E0F2FE',
      borderRadius: clamp(moderateScale(4, width), 3, 6),
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: '#0891B2',
      borderRadius: clamp(moderateScale(4, width), 3, 6),
    },
    mapOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: clamp(moderateScale(16, width), 14, 24),
      paddingVertical: clamp(moderateScale(14, width), 12, 20),
      backgroundColor: '#F0F9FF',
      marginHorizontal: clamp(moderateScale(14, width), 12, 20),
      marginTop: clamp(moderateScale(14, width), 12, 20),
      borderRadius: clamp(moderateScale(10, width), 8, 16),
      borderWidth: 1,
      borderColor: '#BAE6FD',
    },
    mapOptionDisabled: {
      opacity: 0.5,
    },
    mapIconWrapper: {
      width: clamp(moderateScale(44, width), 40, 54),
      height: clamp(moderateScale(44, width), 40, 54),
      borderRadius: clamp(moderateScale(22, width), 20, 27),
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: clamp(moderateScale(10, width), 8, 14),
    },
    mapOptionContent: { flex: 1 },
    mapOptionTitle: {
      fontSize: clamp(normalize(15, width), 14, 18),
      fontWeight: '600',
      color: '#0891B2',
      marginBottom: clamp(moderateScale(2, width), 1, 4),
    },
    mapOptionSubtitle: {
      fontSize: clamp(normalize(11, width), 10, 14),
      color: '#64748B',
      lineHeight: clamp(normalize(16, width), 14, 19),
    },
    dividerWithText: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: clamp(moderateScale(16, width), 14, 24),
      marginVertical: clamp(moderateScale(14, width), 12, 20),
    },
    dividerLineShort: {
      flex: 1,
      height: 1,
      backgroundColor: '#E5E7EB',
    },
    dividerText: {
      fontSize: clamp(normalize(10, width), 9, 13),
      color: '#9CA3AF',
      fontWeight: '600',
      marginHorizontal: clamp(moderateScale(10, width), 8, 14),
    },
    locationList: {
      paddingHorizontal: clamp(moderateScale(14, width), 12, 20),
    },
    locationItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: clamp(moderateScale(12, width), 10, 16),
      paddingHorizontal: clamp(moderateScale(10, width), 8, 14),
    },
    locationItemIcon: {
      width: clamp(moderateScale(40, width), 36, 50),
      height: clamp(moderateScale(40, width), 36, 50),
      borderRadius: clamp(moderateScale(20, width), 18, 25),
      backgroundColor: '#E0F2FE',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: clamp(moderateScale(10, width), 8, 14),
    },
    locationItemContent: {
      flex: 1,
      marginRight: clamp(moderateScale(6, width), 4, 10),
    },
    locationItemName: {
      fontSize: clamp(normalize(14, width), 13, 17),
      fontWeight: '600',
      color: '#1F2937',
      marginBottom: clamp(moderateScale(3, width), 2, 5),
    },
    locationItemAddress: {
      fontSize: clamp(normalize(11, width), 10, 14),
      color: '#6B7280',
      lineHeight: clamp(normalize(15, width), 14, 18),
    },
    itemSeparator: {
      height: 1,
      backgroundColor: '#F3F4F6',
      marginLeft: clamp(moderateScale(60, width), 54, 74),
    },
    photoInfoSection: {
      paddingHorizontal: clamp(moderateScale(16, width), 14, 24),
      paddingVertical: clamp(moderateScale(10, width), 8, 16),
      backgroundColor: '#F9FAFB',
      marginHorizontal: clamp(moderateScale(14, width), 12, 20),
      marginTop: clamp(moderateScale(10, width), 8, 16),
      borderRadius: clamp(moderateScale(10, width), 8, 16),
      gap: clamp(moderateScale(6, width), 4, 10),
    },
    photoInfoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: clamp(moderateScale(6, width), 4, 10),
    },
    photoInfoText: {
      fontSize: clamp(normalize(12, width), 11, 15),
      color: '#6B7280',
      fontWeight: '500',
    },
    photoInfoTextSuccess: {
      color: '#16A34A',
      fontWeight: '600',
    },
    requirementsScrollView: {
      maxHeight: height * 0.26,
    },
    requirementsList: {
      paddingHorizontal: clamp(moderateScale(16, width), 14, 24),
      gap: clamp(moderateScale(10, width), 8, 14),
      paddingBottom: clamp(moderateScale(14, width), 12, 20),
    },
    requirementItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: clamp(moderateScale(10, width), 8, 14),
    },
    requirementIconCircle: {
      width: clamp(moderateScale(34, width), 30, 42),
      height: clamp(moderateScale(34, width), 30, 42),
      borderRadius: clamp(moderateScale(17, width), 15, 21),
      backgroundColor: '#E0F2FE',
      alignItems: 'center',
      justifyContent: 'center',
    },
    requirementIconCircleComplete: {
      backgroundColor: '#DCFCE7',
    },
    requirementContent: {
      flex: 1,
    },
    requirementTitle: {
      fontSize: clamp(normalize(13, width), 12, 16),
      fontWeight: '600',
      color: '#1F2937',
      marginBottom: clamp(moderateScale(2, width), 1, 4),
    },
    requirementDescription: {
      fontSize: clamp(normalize(11, width), 10, 14),
      color: '#6B7280',
      lineHeight: clamp(normalize(15, width), 14, 18),
    },
    // UPDATED: Changed from doneButton to nextButtonModal
    nextButtonModal: {
      marginHorizontal: clamp(moderateScale(16, width), 14, 24),
      marginTop: clamp(moderateScale(14, width), 12, 20),
      height: Math.max(minTouchTarget, clamp(moderateScale(50, width), 46, 60)),
      backgroundColor: '#0891B2',
      borderRadius: clamp(moderateScale(10, width), 8, 16),
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    nextButtonModalText: {
      fontSize: clamp(normalize(15, width), 14, 18),
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
};


export default SellBook3;
