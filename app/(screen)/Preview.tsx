import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  useWindowDimensions,
  Alert,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const Preview: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => makeStyles(width, height), [width, height]);

  // Editable data states
  const [basicDetails, setBasicDetails] = useState({
    bookTitle: 'NCERT Mathematics Textbook',
    category: 'Textbook',
    class: 'XI',
    subject: 'NCERT Mathematics',
    authorName: 'NCERT',
    language: 'ENGLISH',
    publisher: 'CBSE',
    edition: '2021',
  });

  const [conditionDetails, setConditionDetails] = useState({
    condition: 'Used',
    description: 'Used but in good condition',
    writing: 'Any Writing/Marking Inside',
    pages: 'No',
  });

  // Custom values for "Others" option
  const [customValues, setCustomValues] = useState({
    category: '',
    class: '',
    subject: '',
  });

  const [price, setPrice] = useState('2000');
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState('Action Area I 1/2, Newtown, New Town, Cha  DG Black(Newtown) uttar 24 pargana West Bengal 74.....');

  // Track which section is being edited
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Loading and success states
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState('500');

  // Dropdown options
  const categories = [
    { label: 'Fiction', value: 'fiction' },
    { label: 'Non-Fiction', value: 'non-fiction' },
    { label: 'Textbook', value: 'textbook' },
    { label: 'Reference', value: 'reference' },
    { label: 'Others', value: 'others' },
  ];

  const classes = [
    ...Array.from({ length: 12 }, (_, i) => ({
      label: `Class ${i + 1}`,
      value: `class_${i + 1}`,
    })),
    { label: 'Others', value: 'others' },
  ];

  const subjects = [
    { label: 'Mathematics', value: 'mathematics' },
    { label: 'Science', value: 'science' },
    { label: 'English', value: 'english' },
    { label: 'History', value: 'history' },
    { label: 'Geography', value: 'geography' },
    { label: 'Physics', value: 'physics' },
    { label: 'Chemistry', value: 'chemistry' },
    { label: 'Biology', value: 'biology' },
    { label: 'Others', value: 'others' },
  ];

  const bookConditions = [
    { label: 'Like New', value: 'like_new' },
    { label: 'Very Good', value: 'very_good' },
    { label: 'Good', value: 'good' },
    { label: 'Acceptable', value: 'acceptable' },
    { label: 'Poor', value: 'poor' },
    { label: 'Used', value: 'used' },
  ];

  const writingMarkingOptions = [
    { label: 'No Writing/Marking', value: 'no' },
    { label: 'Light Markings', value: 'light' },
    { label: 'Moderate Markings', value: 'moderate' },
    { label: 'Heavy Markings', value: 'heavy' },
    { label: 'Any Writing/Marking Inside', value: 'any' },
  ];

  const pagesMissingOptions = [
    { label: 'No Pages Missing', value: 'no' },
    { label: '1-5 Pages', value: '1_5' },
    { label: '6-10 Pages', value: '6_10' },
    { label: 'More than 10 Pages', value: 'more_10' },
    { label: 'No', value: 'none' },
  ];

  // Check if all required fields are filled
  const isFormValid = useMemo(() => {
    const isBasicDetailsFilled =
      basicDetails.bookTitle.trim() !== '' &&
      basicDetails.category.trim() !== '' &&
      basicDetails.class.trim() !== '' &&
      basicDetails.subject.trim() !== '' &&
      basicDetails.authorName.trim() !== '' &&
      basicDetails.publisher.trim() !== '' &&
      basicDetails.edition.trim() !== '';

    const isConditionFilled =
      conditionDetails.condition.trim() !== '' &&
      conditionDetails.description.trim() !== '' &&
      conditionDetails.writing.trim() !== '' &&
      conditionDetails.pages.trim() !== '';

    const isPriceFilled = price.trim() !== '' && parseFloat(price) > 0;
    const hasMinPhotos = photos.length >= 3;
    const hasLocation = location.trim() !== '';

    return isBasicDetailsFilled && isConditionFilled && isPriceFilled && hasMinPhotos && hasLocation;
  }, [basicDetails, conditionDetails, price, photos, location]);

  const isEditing = editingSection !== null;

  // Request permissions
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || galleryStatus !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera and gallery permissions to upload photos.');
      return false;
    }
    return true;
  };

  // Pick image from gallery
  const pickImage = async () => {
    if (isEditing) {
      Alert.alert('Editing in Progress', 'Please finish editing before uploading photos.');
      return;
    }

    if (photos.length >= 3) {
      Alert.alert('Maximum Photos', 'You can upload maximum 3 photos only.');
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 3 - photos.length,
    });

    if (!result.canceled && result.assets) {
      const newPhotos = result.assets.map(asset => asset.uri);
      setPhotos(prev => [...prev, ...newPhotos].slice(0, 3));
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    if (isEditing) {
      Alert.alert('Editing in Progress', 'Please finish editing before uploading photos.');
      return;
    }

    if (photos.length >= 3) {
      Alert.alert('Maximum Photos', 'You can upload maximum 3 photos only.');
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets) {
      setPhotos(prev => [...prev, result.assets[0].uri].slice(0, 3));
    }
  };

  // Remove specific photo
  const removePhoto = (index: number) => {
    if (isEditing) {
      Alert.alert('Editing in Progress', 'Please finish editing before removing photos.');
      return;
    }

    Alert.alert('Remove Photo', 'Do you want to remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        onPress: () => setPhotos(prev => prev.filter((_, i) => i !== index)),
        style: 'destructive'
      },
    ]);
  };

  // Show options to pick or take photo
  const handleUploadPress = () => {
    if (isEditing) {
      Alert.alert('Editing in Progress', 'Please finish editing before uploading photos.');
      return;
    }

    Alert.alert(
      'Upload Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleEdit = (section: string) => {
    if (editingSection === section) {
      // If already editing this section, save changes
      setEditingSection(null);
      setOpenDropdown(null);
      Alert.alert('Success', `${section} section updated successfully!`);
    } else {
      // Start editing this section
      setEditingSection(section);
      setOpenDropdown(null);
    }
  };

  const handleBasicDetailChange = (field: string, value: string) => {
    setBasicDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleConditionChange = (field: string, value: string) => {
    setConditionDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleUpload = async () => {
    if (!isFormValid) {
      Alert.alert('Incomplete Form', 'Please fill all required fields and upload at least 3 photos.');
      return;
    }

    setIsUploading(true);

    setTimeout(() => {
      setIsUploading(false);
      setShowSuccessModal(true);
    }, 3000);
  };

  const handleCancel = () => {
    setShowSuccessModal(false);
  };

  const handleFindBuyer = () => {
    setShowSuccessModal(false);
    console.log('Finding buyer...');
  };

  const keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : 0;

  return (
    <LinearGradient
      colors={["#67E8F9", "#E0E7FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.fixedHeader}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1f2937" />
          <Text style={styles.headerTitle}>Preview</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.scrollView} // Added flex: 1 here
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* A. Basic Details Section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>A. Basic Details</Text>
                <TouchableOpacity
                  style={styles.editIconButton}
                  onPress={() => handleEdit('basic')}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={editingSection === 'basic' ? 'checkmark-circle' : 'pencil'}
                    size={20}
                    color={editingSection === 'basic' ? '#10B981' : '#6B7280'}
                  />
                </TouchableOpacity>
              </View>

              <EditableDetailItem
                label="Book Title"
                value={basicDetails.bookTitle}
                isEditing={editingSection === 'basic'}
                onChangeText={(value) => handleBasicDetailChange('bookTitle', value)}
                styles={styles}
              />

              <EditableDropdownItem
                label="Category"
                value={basicDetails.category}
                options={categories}
                isEditing={editingSection === 'basic'}
                onSelect={(value) => handleBasicDetailChange('category', value)}
                isOpen={openDropdown === 'category'}
                onToggle={(open) => setOpenDropdown(open ? 'category' : null)}
                styles={styles}
                customValue={customValues.category}
                onCustomInput={(text) => setCustomValues(prev => ({ ...prev, category: text }))}
              />

              <EditableDropdownItem
                label="Class"
                value={basicDetails.class}
                options={classes}
                isEditing={editingSection === 'basic'}
                onSelect={(value) => handleBasicDetailChange('class', value)}
                isOpen={openDropdown === 'class'}
                onToggle={(open) => setOpenDropdown(open ? 'class' : null)}
                styles={styles}
                customValue={customValues.class}
                onCustomInput={(text) => setCustomValues(prev => ({ ...prev, class: text }))}
              />

              <EditableDropdownItem
                label="Subject"
                value={basicDetails.subject}
                options={subjects}
                isEditing={editingSection === 'basic'}
                onSelect={(value) => handleBasicDetailChange('subject', value)}
                isOpen={openDropdown === 'subject'}
                onToggle={(open) => setOpenDropdown(open ? 'subject' : null)}
                styles={styles}
                customValue={customValues.subject}
                onCustomInput={(text) => setCustomValues(prev => ({ ...prev, subject: text }))}
              />

              <EditableDetailItem
                label="Author Name"
                value={basicDetails.authorName}
                isEditing={editingSection === 'basic'}
                onChangeText={(value) => handleBasicDetailChange('authorName', value)}
                styles={styles}
              />

              <EditableDetailItem
                label="Publisher Name"
                value={basicDetails.publisher}
                isEditing={editingSection === 'basic'}
                onChangeText={(value) => handleBasicDetailChange('publisher', value)}
                styles={styles}
              />

              <EditableDetailItem
                label="Edition"
                value={basicDetails.edition}
                isEditing={editingSection === 'basic'}
                onChangeText={(value) => handleBasicDetailChange('edition', value)}
                styles={styles}
              />
            </View>

            {/* B. Book Condition & Description Section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>B. Book Condition & Description</Text>
                <TouchableOpacity
                  style={styles.editIconButton}
                  onPress={() => handleEdit('condition')}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={editingSection === 'condition' ? 'checkmark-circle' : 'pencil'}
                    size={20}
                    color={editingSection === 'condition' ? '#10B981' : '#6B7280'}
                  />
                </TouchableOpacity>
              </View>

              <EditableDropdownItem
                label="Book Condition"
                value={conditionDetails.condition}
                options={bookConditions}
                isEditing={editingSection === 'condition'}
                onSelect={(value) => handleConditionChange('condition', value)}
                isOpen={openDropdown === 'bookCondition'}
                onToggle={(open) => setOpenDropdown(open ? 'bookCondition' : null)}
                styles={styles}
              />

              <EditableDetailItem
                label="About the Book Condition"
                value={conditionDetails.description}
                isEditing={editingSection === 'condition'}
                onChangeText={(value) => handleConditionChange('description', value)}
                multiline
                styles={styles}
              />

              <EditableDropdownItem
                label="Any Writing/Marking Inside?"
                value={conditionDetails.writing}
                options={writingMarkingOptions}
                isEditing={editingSection === 'condition'}
                onSelect={(value) => handleConditionChange('writing', value)}
                isOpen={openDropdown === 'writingMarking'}
                onToggle={(open) => setOpenDropdown(open ? 'writingMarking' : null)}
                styles={styles}
              />

              <EditableDropdownItem
                label="Any Pages Missing or Torn?"
                value={conditionDetails.pages}
                options={pagesMissingOptions}
                isEditing={editingSection === 'condition'}
                onSelect={(value) => handleConditionChange('pages', value)}
                isOpen={openDropdown === 'pagesMissing'}
                onToggle={(open) => setOpenDropdown(open ? 'pagesMissing' : null)}
                styles={styles}
              />
            </View>

            {/* C. Price Section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>C. Price</Text>
                <TouchableOpacity
                  style={styles.editIconButton}
                  onPress={() => handleEdit('price')}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={editingSection === 'price' ? 'checkmark-circle' : 'pencil'}
                    size={20}
                    color={editingSection === 'price' ? '#10B981' : '#6B7280'}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.priceFieldWrap}>
                <View style={styles.priceCheckbox}>
                  <Text style={styles.rupeeSymbol}>₹</Text>
                </View>
                {editingSection === 'price' ? (
                  <View style={styles.priceInputWrapper}>
                    <TextInput
                      style={styles.priceInput}
                      value={price}
                      onChangeText={setPrice}
                      keyboardType="numeric"
                      placeholder="Enter price"
                      placeholderTextColor="rgba(0,0,0,0.4)"
                    />
                  </View>
                ) : (
                  <View style={styles.priceDisplay}>
                    <Text style={styles.priceText}>{price}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* D. Uploaded Photos Section */}
            <View style={styles.photoCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>D. Uploaded Photos</Text>
              </View>

              <View style={[
                styles.photoGridContainer,
                isEditing && styles.photoGridContainerDisabled
              ]}>
                {photos.length > 0 && (
                  <View style={styles.photoGrid}>
                    {photos.map((photo, index) => (
                      <View key={index} style={styles.photoContainer}>
                        <Image
                          source={{ uri: photo }}
                          style={styles.photoThumbnail}
                          resizeMode="cover"
                        />
                        {!isEditing && (
                          <TouchableOpacity
                            style={styles.removePhotoButton}
                            onPress={() => removePhoto(index)}
                          >
                            <Ionicons name="close-circle" size={24} color="#EF4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {photos.length < 3 && (
                  <TouchableOpacity
                    style={[
                      styles.uploadArea,
                      isEditing && styles.uploadAreaDisabled
                    ]}
                    onPress={handleUploadPress}
                    activeOpacity={isEditing ? 1 : 0.7}
                    disabled={isEditing}
                  >
                    <Ionicons name="cloud-upload-outline" size={32} color="#374151" />
                    <Text style={[
                      styles.uploadText,
                      isEditing && styles.uploadTextDisabled
                    ]}>
                      {isEditing ? 'Upload Disabled (Editing)' : 'Upload Photo'}
                    </Text>
                    <Text style={styles.uploadSubtext}>
                      {photos.length}/3 photos ({3 - photos.length} remaining)
                    </Text>
                  </TouchableOpacity>
                )}

                <Text style={[
                  styles.photoCounter,
                  photos.length < 3 && styles.photoCounterWarning
                ]}>
                  {photos.length} / 3 photos uploaded (minimum 3 required)
                </Text>
              </View>
            </View>

            {/* E. Pickup Location Section */}
            <View style={styles.locationCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>E. Pickup Location</Text>
              </View>

              <View style={styles.locationDisplay}>
                <Ionicons name="location" size={20} color="#000" />
                <Text style={styles.locationText}>{location}</Text>
              </View>
            </View>

            {/* Upload Button */}
            <TouchableOpacity
              style={[styles.uploadButton, !isFormValid && styles.uploadButtonDisabled]}
              onPress={handleUpload}
              disabled={!isFormValid}
              activeOpacity={0.8}
            >
              <Text style={[styles.uploadButtonText, !isFormValid && styles.uploadButtonTextDisabled]}>
                Upload
              </Text>
            </TouchableOpacity>

            {/* FIXED BOTTOM PADDING SPACER for Navigation Bar */}
            <View style={{ height: 120 }} />

          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Loading Modal */}
            
      <Modal
        visible={isUploading}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.loadingContainer}>
            {/* Added Loading GIF */}
            <Image 
              source={require('../../assets/images/loading.gif')} 
              style={styles.loadingGif}
              resizeMode="contain"
            />
            <Text style={styles.loadingText}>Uploading...</Text>
          </View>
        </View>
      </Modal>


      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successContent}>
              <Text style={styles.successMessage}>
                Great news 😊 Based on the details you uploaded, you can get up to{' '}
                <Text style={styles.priceHighlight}>₹{estimatedPrice}</Text>
              </Text>
            </View>

            <View style={styles.dividerLine} />

            <View style={styles.locationButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <View style={styles.verticalDivider} />

              <TouchableOpacity
                style={styles.findBuyerButton}
                onPress={handleFindBuyer}
                activeOpacity={0.7}
              >
                <Text style={styles.findBuyerButtonText}>
                  Find Buyer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

// Component definitions
const EditableDetailItem = ({
  label,
  value,
  isEditing,
  onChangeText,
  multiline = false,
  styles,
}: {
  label: string;
  value: string;
  isEditing: boolean;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  styles: ReturnType<typeof makeStyles>;
}) => {
  const isFilled = value.trim().length > 0;

  return (
    <View style={styles.fieldWrap}>
      <View style={[styles.floatingLabel, isFilled && styles.floatingLabelFilled]}>
        <Text style={styles.floatingLabelText}>{label}</Text>
      </View>
      {isEditing ? (
        <TextInput
          style={[
            styles.editableInput,
            multiline && styles.inputMultiline
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={label}
          placeholderTextColor="rgba(0,0,0,0.4)"
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          textAlignVertical={multiline ? "top" : "center"}
          blurOnSubmit={!multiline}
        />
      ) : (
        <View style={[styles.valueBox, isFilled && styles.valueBoxFilled]}>
          <Text style={styles.valueText}>{value}</Text>
        </View>
      )}
    </View>
  );
};

const EditableDropdownItem = ({
  label,
  value,
  options,
  isEditing,
  onSelect,
  isOpen,
  onToggle,
  styles,
  customValue = '',
  onCustomInput,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  isEditing: boolean;
  onSelect: (value: string) => void;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  styles: ReturnType<typeof makeStyles>;
  customValue?: string;
  onCustomInput?: (text: string) => void;
}) => {
  const isFilled = value.length > 0;
  const isOthersSelected = value.toLowerCase() === 'others';
  const selectedLabel = options.find(opt => opt.value.toLowerCase() === value.toLowerCase())?.label || value;

  const displayValue = isOthersSelected && customValue ? customValue : selectedLabel;

  return (
    <View style={styles.fieldWrap}>
      <View style={[styles.floatingLabel, isFilled && styles.floatingLabelFilled]}>
        <Text style={styles.floatingLabelText}>{label}</Text>
      </View>

      {isEditing ? (
        <>
          <TouchableOpacity
            style={[styles.selectBox, isFilled && styles.selectBoxFilled, styles.editableInput]}
            onPress={() => onToggle(!isOpen)}
            activeOpacity={0.7}
          >
            <Text style={[styles.selectText, isFilled && styles.selectTextFilled]}>
              {displayValue}
            </Text>
            <Ionicons
              name={isOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color="#374151"
            />
          </TouchableOpacity>

          {isOpen && (
            <View style={styles.dropdownList}>
              <ScrollView
                style={styles.dropdownScrollView}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              >
                {options.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.dropdownItem,
                      option.value.toLowerCase() === value.toLowerCase() && styles.dropdownItemSelected
                    ]}
                    onPress={() => {
                      onSelect(option.label);
                      onToggle(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      option.value.toLowerCase() === value.toLowerCase() && styles.dropdownItemTextSelected
                    ]}>
                      {option.label}
                    </Text>
                    {option.value.toLowerCase() === value.toLowerCase() && (
                      <Ionicons name="checkmark" size={20} color="#003EF9" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {isOthersSelected && onCustomInput && (
            <View style={styles.customInputContainer}>
              <TextInput
                style={[styles.editableInput, styles.customInput]}
                value={customValue}
                onChangeText={onCustomInput}
                placeholder={`Specify ${label}`}
                placeholderTextColor="rgba(0,0,0,0.4)"
              />
            </View>
          )}
        </>
      ) : (
        <View style={[styles.valueBox, isFilled && styles.valueBoxFilled]}>
          <Text style={styles.valueText}>{displayValue}</Text>
        </View>
      )}
    </View>
  );
};

const makeStyles = (width: number, height: number) => {
  const s = (n: number) => (width / 375) * n;

  const isSmallScreen = width < 360;
  const isMediumScreen = width >= 360 && width < 414;

  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;
  const baseTopPad = isSmallScreen ? 20 : isMediumScreen ? clamp(s(45), 24, 60) : 60;
  const topPad = Math.max(baseTopPad, statusBarHeight + 20);

  const sidePad = isSmallScreen ? 12 : isMediumScreen ? clamp(s(16), 12, 24) : 24;

  return StyleSheet.create({
    container: {
      flex: 1
    },

    fixedHeader: {
      paddingTop: topPad,
      paddingHorizontal: sidePad,
      paddingBottom: clamp(s(10), 8, 12),
      backgroundColor: 'transparent',
      zIndex: 10,
    },

    keyboardView: {
      flex: 1,
    },

    scrollView: {
      flex: 1, // Ensure ScrollView takes up remaining space
    },

    scrollContent: {
      paddingHorizontal: sidePad,
      paddingTop: clamp(s(10), 8, 12),
      flexGrow: 1,
    },

    header: {},

    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: clamp(s(8), 6, 10),
    },

    headerTitle: {
      fontSize: clamp(s(18), 16, 22),
      fontWeight: '800',
      color: '#000',
      marginLeft: clamp(s(6), 4, 10),
    },

    sectionCard: {
      backgroundColor: 'rgba(165, 243, 252, 0.6)',
      borderRadius: clamp(s(16), 12, 20),
      marginBottom: clamp(s(16), 12, 24),
      overflow: 'hidden',
      paddingBottom: clamp(s(16), 12, 20),
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: clamp(s(20), 16, 28),
      paddingBottom: clamp(s(12), 10, 16),
    },

    sectionTitle: {
      fontSize: clamp(s(16), 15, 18),
      fontWeight: '700',
      color: '#37261fff',
      flex: 1,
    },

    editIconButton: {
      width: clamp(s(30), 29, 38),
      height: clamp(s(34), 30, 38),
      borderRadius: clamp(s(8), 7, 10),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#003EF9',

    },

    fieldWrap: {
      paddingHorizontal: clamp(s(20), 16, 28),
      marginBottom: clamp(s(12), 10, 16),
      position: 'relative',
      zIndex: 1,
    },

    floatingLabel: {
      position: 'absolute',
      left: clamp(s(34), 28, 46),
      top: clamp(s(-7), -8, -6),
      paddingHorizontal: clamp(s(6), 5, 8),
      backgroundColor: '#FFFFFF',
      borderRadius: clamp(s(6), 5, 8),
      zIndex: 2,
      borderWidth: 1,
      borderColor: '#44D6FF',
    },

    floatingLabelFilled: {
      borderColor: '#003EF9',
    },

    floatingLabelText: {
      fontSize: clamp(s(10), 9, 12),
      fontWeight: '700',
      color: 'rgba(0,0,0,0.65)',
    },

    valueBox: {
      minHeight: clamp(s(48), 44, 56),
      borderRadius: clamp(s(10), 8, 12),
      borderWidth: 1,
      borderColor: '#44D6FF',
      backgroundColor: 'rgba(255, 255, 255, 0.36)',
      paddingHorizontal: clamp(s(14), 12, 18),
      paddingVertical: clamp(s(12), 10, 16),
      justifyContent: 'center',
    },

    valueBoxFilled: {
      borderColor: '#003EF9',
    },

    valueText: {
      fontSize: clamp(s(14), 13, 16),
      color: '#0B0B0B',
      fontWeight: '500',
    },

    editableInput: {
      minHeight: clamp(s(48), 44, 56),
      borderRadius: clamp(s(10), 8, 12),
      borderWidth: 2,
      borderColor: '#10a2b9ff',
      backgroundColor: 'rgba(217, 244, 255, 0.9)',
      paddingHorizontal: clamp(s(14), 12, 18),
      fontSize: clamp(s(14), 13, 16),
      color: '#0B0B0B',
    },

    inputMultiline: {
      minHeight: clamp(s(100), 80, 130),
      paddingTop: clamp(s(12), 10, 16),
      paddingBottom: clamp(s(12), 10, 16),
    },

    selectBox: {
      minHeight: clamp(s(48), 44, 56),
      borderRadius: clamp(s(10), 8, 12),
      borderWidth: 1,
      borderColor: '#44D6FF',
      backgroundColor: 'rgba(255, 255, 255, 0.36)',
      paddingHorizontal: clamp(s(14), 12, 18),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    selectBoxFilled: {
      borderColor: '#003EF9',
    },

    selectText: {
      fontSize: clamp(s(14), 13, 16),
      color: 'rgba(0,0,0,0.5)',
      flex: 1,
    },

    selectTextFilled: {
      color: '#0B0B0B',
    },

    dropdownList: {
      marginTop: clamp(s(4), 3, 6),
      backgroundColor: '#f8f4f4ff',
      borderRadius: clamp(s(10), 8, 12),
      borderWidth: 1,
      borderColor: '#44D6FF',
      overflow: 'hidden',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },

    dropdownScrollView: {
      maxHeight: clamp(s(200), 180, 250),
    },

    dropdownItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: clamp(s(12), 10, 16),
      borderBottomWidth: 1,
      borderBottomColor: '#f3f4f6',
    },

    dropdownItemSelected: {
      backgroundColor: '#dbdee3ff',
    },

    dropdownItemText: {
      fontSize: clamp(s(14), 13, 16),
      color: '#374151',
      flex: 1,
    },

    dropdownItemTextSelected: {
      color: '#003EF9',
      fontWeight: '600',
    },

    // Custom input styles for "Others" option
    customInputContainer: {
      marginTop: clamp(s(8), 6, 10),
    },

    customInput: {
      borderColor: '#10a2b9ff',
      backgroundColor: 'rgba(217, 244, 255, 0.9)',
    },

    priceFieldWrap: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: clamp(s(12), 10, 16),
      paddingHorizontal: clamp(s(20), 16, 28),
      marginBottom: clamp(s(12), 10, 16),
    },

    priceCheckbox: {
      paddingTop: clamp(s(12), 10, 16),
    },

    rupeeSymbol: {
      fontSize: clamp(s(20), 18, 24),
      fontWeight: '700',
      color: '#003EF9',
    },

    priceDisplay: {
      flex: 1,
      minHeight: clamp(s(48), 44, 56),
      borderRadius: clamp(s(10), 8, 12),
      borderWidth: 1,
      borderColor: '#003EF9',
      backgroundColor: 'rgba(255, 255, 255, 0.36)',
      paddingHorizontal: clamp(s(14), 12, 18),
      justifyContent: 'center',
    },

    priceInputWrapper: {
      flex: 1,
    },

    priceInput: {
      minHeight: clamp(s(48), 44, 56),
      borderRadius: clamp(s(10), 8, 12),
      borderWidth: 2,
      borderColor: '#10a2b9ff',
      backgroundColor: 'rgba(217, 244, 255, 0.9)',
      paddingHorizontal: clamp(s(14), 12, 18),
      fontSize: clamp(s(14), 13, 16),
      color: '#0B0B0B',
    },

    priceText: {
      fontSize: clamp(s(14), 13, 16),
      color: '#0B0B0B',
      fontWeight: '500',
    },

    photoCard: {
      backgroundColor: 'rgba(165, 243, 252, 0.6)',
      borderRadius: clamp(s(16), 12, 20),
      padding: clamp(s(20), 16, 28),
      marginBottom: clamp(s(16), 12, 24),
    },

    photoGridContainer: {
      borderWidth: 2,
      borderColor: '#44D6FF',
      borderStyle: 'dashed',
      borderRadius: clamp(s(12), 10, 14),
      padding: clamp(s(16), 14, 20),
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      minHeight: clamp(s(120), 100, 150),
    },

    photoGridContainerDisabled: {
      opacity: 0.6,
      backgroundColor: 'rgba(200, 200, 200, 0.3)',
    },

    photoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: clamp(s(12), 10, 14),
      marginBottom: clamp(s(12), 10, 16),
    },

    photoContainer: {
      position: 'relative',
      width: clamp(s(85), 70, 100),
      height: clamp(s(85), 70, 100),
    },

    photoThumbnail: {
      width: '100%',
      height: '100%',
      borderRadius: clamp(s(8), 7, 10),
      backgroundColor: '#4B5563',
    },

    removePhotoButton: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: '#fff',
      borderRadius: 12,
    },

    uploadArea: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: clamp(s(20), 16, 24),
    },

    uploadAreaDisabled: {
      opacity: 0.5,
    },

    uploadText: {
      fontSize: clamp(s(14), 13, 16),
      color: '#374151',
      fontWeight: '600',
      marginTop: clamp(s(8), 6, 10),
    },

    uploadTextDisabled: {
      color: '#9CA3AF',
    },

    uploadSubtext: {
      fontSize: clamp(s(12), 11, 14),
      color: '#6B7280',
      marginTop: clamp(s(4), 3, 6),
    },

    photoCounter: {
      fontSize: clamp(s(12), 11, 14),
      color: '#16A34A',
      fontWeight: '600',
      textAlign: 'center',
      marginTop: clamp(s(8), 6, 10),
    },

    photoCounterWarning: {
      color: '#EF4444',
    },

    locationCard: {
      backgroundColor: 'rgba(165, 243, 252, 0.6)',
      borderRadius: clamp(s(16), 12, 20),
      padding: clamp(s(20), 16, 28),
      marginBottom: clamp(s(20), 16, 28),
    },

    locationDisplay: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: clamp(s(8), 6, 10),
    },

    locationText: {
      flex: 1,
      fontSize: clamp(s(13), 12, 15),
      color: '#1f2937',
      lineHeight: clamp(s(18), 16, 20),
      fontWeight: '500',
    },

    uploadButton: {
      height: clamp(s(50), 46, 58),
      borderRadius: clamp(s(12), 10, 14),
      backgroundColor: 'rgba(20, 218, 232, 0.9)',
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.08)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: clamp(s(20), 16, 28),
      marginTop: clamp(s(8), 6, 12),
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.07,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
    },

    uploadButtonText: {
      fontSize: clamp(s(16), 15, 18),
      fontWeight: '700',
      color: 'rgba(255,255,255,0.78)',
    },

    uploadButtonDisabled: {
      backgroundColor: 'rgba(156, 163, 175, 0.5)',
      elevation: 0,
      shadowOpacity: 0,
    },

    uploadButtonTextDisabled: {
      color: 'rgba(107, 114, 128, 0.7)',
    },

    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: clamp(s(20), 16, 24),
    },

    loadingContainer: {
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 30,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
    },

    loadingGif: {
      width: 120,
      height: 120,
    },

    loadingText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#374151',
      marginTop: 16,
    },

    successCard: {
      backgroundColor: 'rgba(165, 243, 252, 1)',
      borderRadius: clamp(s(16), 12, 20),
      width: '90%',
      maxWidth: 400,
      overflow: 'hidden',
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
    },

    successContent: {
      padding: clamp(s(20), 16, 28),
      paddingBottom: clamp(s(16), 14, 20),
    },

    successMessage: {
      fontSize: clamp(s(15), 14, 17),
      fontWeight: '600',
      color: '#1f2937',
      textAlign: 'center',
      lineHeight: clamp(s(22), 20, 24),
    },

    priceHighlight: {
      fontSize: clamp(s(20), 18, 24),
      fontWeight: '800',
      color: '#059669',
    },

    dividerLine: {
      height: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },

    locationButtons: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    cancelButton: {
      flex: 1,
      paddingVertical: clamp(s(16), 14, 18),
      alignItems: 'center',
      justifyContent: 'center',
    },

    cancelButtonText: {
      fontSize: clamp(s(16), 15, 18),
      fontWeight: '600',
      color: '#EF4444',
    },

    verticalDivider: {
      width: 1,
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.16)',
    },

    findBuyerButton: {
      flex: 1,
      paddingVertical: clamp(s(16), 14, 18),
      alignItems: 'center',
      justifyContent: 'center',
   
    },

    findBuyerButtonText: {
      fontSize: clamp(s(16), 15, 18),
      fontWeight: '700',
      color: '#003EF9',
    },
  });
};

export default Preview;
