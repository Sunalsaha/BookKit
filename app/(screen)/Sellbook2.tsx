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
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const SellBook2: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => makeStyles(width, height), [width, height]);

  const [formData, setFormData] = useState({
    bookCondition: '',
    aboutCondition: '',
    writingMarking: '',
    pagesMissing: '',
    originalMRP: ''
  });

  // Track which dropdowns are open
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Dropdown options
  const bookConditions = [
    { label: 'Like New', value: 'like_new' },
    { label: 'Very Good', value: 'very_good' },
    { label: 'Good', value: 'good' },
    { label: 'Acceptable', value: 'acceptable' },
    { label: 'Poor', value: 'poor' },
  ];

  const writingMarkingOptions = [
    { label: 'No Writing/Marking', value: 'no' },
    { label: 'Light Markings', value: 'light' },
    { label: 'Moderate Markings', value: 'moderate' },
    { label: 'Heavy Markings', value: 'heavy' },
  ];

  const pagesMissingOptions = [
    { label: 'No Pages Missing', value: 'no' },
    { label: '1-5 Pages', value: '1_5' },
    { label: '6-10 Pages', value: '6_10' },
    { label: 'More than 10 Pages', value: 'more_10' },
  ];

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Form validation - check if all required fields are filled
  const isFormValid = useMemo(() => {
    return (
      formData.bookCondition !== '' &&
      formData.aboutCondition.trim() !== '' &&
      formData.writingMarking !== '' &&
      formData.pagesMissing !== '' &&
      formData.originalMRP.trim() !== ''
    );
  }, [formData]);

  const handleNext = () => {
    if (isFormValid) {
      console.log('Form data:', formData);
      // Navigate to next screen or submit form
    }
  };

  // Calculate keyboard vertical offset based on device
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : 0;

  return (
    <LinearGradient
      colors={["#67E8F9", "#E0E7FF"]}
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
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="#1f2937" />
                <Text style={styles.headerTitle}>Shear Books</Text>
              </TouchableOpacity>
            </View>

            {/* Hero Image Card */}
            <View style={styles.heroCard}>
              <Image
                source={require('../../assets/images/donate-book.png')}
                style={styles.heroImage}
                resizeMode="cover"
              />
            </View>

            {/* Form Section */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>B. Book Condition & Description</Text>
              
              {/* Book Condition */}
              <DropdownField
                styles={styles}
                label="Book Condition"
                placeholder="Select Book Condition"
                value={formData.bookCondition}
                options={bookConditions}
                onSelect={(value) => handleInputChange('bookCondition', value)}
                isOpen={openDropdown === 'bookCondition'}
                onToggle={(open) => setOpenDropdown(open ? 'bookCondition' : null)}
              />

              {/* About the Book Condition */}
              <InputField
                styles={styles}
                label="About the Book Condition"
                placeholder="Any Writing/Marking Inside?"
                value={formData.aboutCondition}
                onChangeText={(value) => handleInputChange('aboutCondition', value)}
                multiline
              />

              {/* Select Any Writing/Marking Inside? */}
              <DropdownField
                styles={styles}
                label="Any Writing/Marking Inside?"
                placeholder="Select Any Writing/Marking Inside?"
                value={formData.writingMarking}
                options={writingMarkingOptions}
                onSelect={(value) => handleInputChange('writingMarking', value)}
                isOpen={openDropdown === 'writingMarking'}
                onToggle={(open) => setOpenDropdown(open ? 'writingMarking' : null)}
              />

              {/* Select Any Pages Missing or Torn? */}
              <DropdownField
                styles={styles}
                label="Any Pages Missing or Torn?"
                placeholder="Select Any Pages Missing or Torn?"
                value={formData.pagesMissing}
                options={pagesMissingOptions}
                onSelect={(value) => handleInputChange('pagesMissing', value)}
                isOpen={openDropdown === 'pagesMissing'}
                onToggle={(open) => setOpenDropdown(open ? 'pagesMissing' : null)}
              />
            </View>

            {/* Price Section */}
            <View style={styles.priceCard}>
              <Text style={styles.formTitle}>C. Price</Text>
              
              {/* Original MRP Printed */}
              <View style={styles.priceFieldWrap}>
                <View style={styles.priceCheckbox}>
                  <Text style={styles.rupeeSymbol}>₹</Text>
                </View>
                <InputField
                  styles={styles}
                  label="Price"
                  placeholder="Original MRP Printed"
                  value={formData.originalMRP}
                  onChangeText={(value) => handleInputChange('originalMRP', value)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Next Button - Enabled only when form is valid */}
            <TouchableOpacity 
              style={[styles.nextButton, !isFormValid && styles.nextButtonDisabled]} 
              onPress={handleNext}
              disabled={!isFormValid}
              activeOpacity={0.8}
            >
              <Text style={[styles.nextButtonText, !isFormValid && styles.nextButtonTextDisabled]}>
                Next
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

// Reusable Input Field Component
const InputField = ({
  styles,
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  multiline = false,
}: {
  styles: ReturnType<typeof makeStyles>;
  label: string;
  placeholder: string;
  value: string;
  onChangeText?: (text: string) => void;
  keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'numeric';
  multiline?: boolean;
}) => {
  const isFilled = value.trim().length > 0;
  
  return (
    <View style={styles.fieldWrap}>
      <View style={[styles.floatingLabel, isFilled && styles.floatingLabelFilled]}>
        <Text style={styles.floatingLabelText}>{label}</Text>
      </View>
      <TextInput
        style={[
          styles.input, 
          isFilled && styles.inputFilled,
          multiline && styles.inputMultiline
        ]}
        placeholder={placeholder}
        placeholderTextColor="rgba(0,0,0,0.4)"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? "top" : "center"}
        blurOnSubmit={!multiline}
      />
    </View>
  );
};

// Reusable Dropdown Field Component with inline dropdown
const DropdownField = ({
  styles,
  label,
  placeholder,
  value,
  options,
  onSelect,
  isOpen,
  onToggle,
}: {
  styles: ReturnType<typeof makeStyles>;
  label: string;
  placeholder: string;
  value: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}) => {
  const isFilled = value.length > 0;
  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  return (
    <View style={styles.fieldWrap}>
      <View style={[styles.floatingLabel, isFilled && styles.floatingLabelFilled]}>
        <Text style={styles.floatingLabelText}>{label}</Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.selectBox, isFilled && styles.selectBoxFilled]} 
        onPress={() => onToggle(!isOpen)}
        activeOpacity={0.7}
      >
        <Text style={[styles.selectText, isFilled && styles.selectTextFilled]}>
          {selectedLabel}
        </Text>
        <Ionicons 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#374151" 
        />
      </TouchableOpacity>

      {/* Inline Dropdown List */}
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
                  option.value === value && styles.dropdownItemSelected
                ]}
                onPress={() => {
                  onSelect(option.value);
                  onToggle(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.dropdownItemText,
                  option.value === value && styles.dropdownItemTextSelected
                ]}>
                  {option.label}
                </Text>
                {option.value === value && (
                  <Ionicons name="checkmark" size={20} color="#003EF9" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const makeStyles = (width: number, height: number) => {
  // Enhanced responsive scaling function based on screen width
  const s = (n: number) => (width / 375) * n;
  
  // Responsive breakpoints
  const isSmallScreen = width < 360;
  const isMediumScreen = width >= 360 && width < 414;
  const isLargeScreen = width >= 414;
  
  // Dynamic spacing based on screen size
  const topPad = isSmallScreen ? 20 : isMediumScreen ? clamp(s(45), 24, 60) : 60;
  const sidePad = isSmallScreen ? 12 : isMediumScreen ? clamp(s(16), 12, 24) : 24;

  return StyleSheet.create({
    container: { 
      flex: 1 
    },
    
    keyboardView: {
      flex: 1,
    },
    
    scrollContent: {
      paddingHorizontal: sidePad,
      paddingTop: topPad,
      paddingBottom: clamp(s(30), 20, 50),
      flexGrow: 1,
    },
    
    header: { 
      marginBottom: clamp(s(16), 12, 24) 
    },
    
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
    
    heroCard: {
      height: clamp(s(180), 140, 240),
      borderRadius: clamp(s(16), 12, 20),
      overflow: 'hidden',
      marginBottom: clamp(s(20), 16, 28),
      backgroundColor: '#fff',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    
    heroImage: {
      width: '100%',
      height: '100%',
    },
    
    formCard: {
      backgroundColor: 'rgba(165, 243, 252, 0.6)',
      borderRadius: clamp(s(16), 12, 20),
      padding: clamp(s(20), 16, 28),
      marginBottom: clamp(s(16), 12, 24),
    },
    
    priceCard: {
      backgroundColor: 'rgba(165, 243, 252, 0.6)',
      borderRadius: clamp(s(16), 12, 20),
      padding: clamp(s(20), 16, 28),
      marginBottom: clamp(s(16), 12, 24),
    },
    
    formTitle: {
      fontSize: clamp(s(18), 16, 22),
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: clamp(s(16), 14, 24),
    },
    
    fieldWrap: {
      marginBottom: clamp(s(16), 14, 22),
      position: 'relative',
      zIndex: 1,
    },
    
    priceFieldWrap: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: clamp(s(12), 10, 16),
    },
    
    priceCheckbox: {
      paddingTop: clamp(s(12), 10, 16),
    },
    
    rupeeSymbol: {
      fontSize: clamp(s(20), 18, 24),
      fontWeight: '700',
      color: '#003EF9',
    },
    
    floatingLabel: {
      position: 'absolute',
      left: clamp(s(14), 12, 18),
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
    
    input: {
      minHeight: clamp(s(48), 44, 56),
      borderRadius: clamp(s(10), 8, 12),
      borderWidth: 1,
      borderColor: '#44D6FF',
      backgroundColor: 'rgba(255, 255, 255, 0.36)',
      paddingHorizontal: clamp(s(14), 12, 18),
      fontSize: clamp(s(14), 13, 16),
      color: '#0B0B0B',
      flex: 1,
    },
    
    inputFilled: {
      borderColor: '#003EF9',
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
    
    nextButton: {
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
    
    nextButtonText: {
      fontSize: clamp(s(16), 15, 18),
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
    
    dropdownList: {
      marginTop: clamp(s(4), 3, 6),
      backgroundColor: '#fff',
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
      backgroundColor: '#eff6ff',
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
  });
};

export default SellBook2;
