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
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const SellBook1: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => makeStyles(width, height), [width, height]);

  const [formData, setFormData] = useState({
    bookName: '',
    category: '',
    categoryOther: '',
    bookClass: '',
    classOther: '',
    subject: '',
    subjectOther: '',
    authorName: '',
    publisherName: '',
    edition: '',
    other: ''
  });

  // Track which dropdowns are open
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Check if "Others" option is selected for any dropdown
  const showOtherBox = formData.category === 'others' || 
                        formData.bookClass === 'others' || 
                        formData.subject === 'others';

  // Form validation - check if all required fields are filled
  const isFormValid = useMemo(() => {
    const isBasicFieldsFilled = 
      formData.bookName.trim() !== '' &&
      formData.category !== '' &&
      formData.bookClass !== '' &&
      formData.subject !== '' &&
      formData.authorName.trim() !== '' &&
      formData.publisherName.trim() !== '' &&
      formData.edition.trim() !== '';

    // Check if "Others" fields are filled when needed
    const isCategoryOtherValid = formData.category !== 'others' || formData.categoryOther.trim() !== '';
    const isClassOtherValid = formData.bookClass !== 'others' || formData.classOther.trim() !== '';
    const isSubjectOtherValid = formData.subject !== 'others' || formData.subjectOther.trim() !== '';

    // Check if "Other" box is filled when any "Others" option is selected
    const isOtherBoxValid = !showOtherBox || formData.other.trim() !== '';

    return isBasicFieldsFilled && 
           isCategoryOtherValid && 
           isClassOtherValid && 
           isSubjectOtherValid && 
           isOtherBoxValid;
  }, [formData, showOtherBox]);

  const handleNext = () => {
    if (isFormValid) {
      console.log('Form data:', formData);
      // Navigate to next screen or submit form
    }
  };

  // Calculate keyboard offset based on platform and navigation bar
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : 0;

  return (
    <LinearGradient
      colors={["#ffffffff", "#f2fbfbff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
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
              <Text style={styles.formTitle}>A. Basic Details</Text>
              
              {/* Book Name */}
              <InputField
                styles={styles}
                label="Book Title"
                placeholder="Book Name and Full Description"
                value={formData.bookName}
                onChangeText={(value) => handleInputChange('bookName', value)}
              />

              {/* Category */}
              <DropdownField
                styles={styles}
                label="Category"
                placeholder="Select Book Category"
                value={formData.category}
                options={categories}
                onSelect={(value) => handleInputChange('category', value)}
                isOpen={openDropdown === 'category'}
                onToggle={(open) => setOpenDropdown(open ? 'category' : null)}
              />
              {formData.category === 'others' && (
                <InputField
                  styles={styles}
                  label="Specify Category"
                  placeholder="Enter category"
                  value={formData.categoryOther}
                  onChangeText={(value) => handleInputChange('categoryOther', value)}
                />
              )}

              {/* Book Class */}
              <DropdownField
                styles={styles}
                label="Class"
                placeholder="Select Book Class"
                value={formData.bookClass}
                options={classes}
                onSelect={(value) => handleInputChange('bookClass', value)}
                isOpen={openDropdown === 'class'}
                onToggle={(open) => setOpenDropdown(open ? 'class' : null)}
              />
              {formData.bookClass === 'others' && (
                <InputField
                  styles={styles}
                  label="Specify Class"
                  placeholder="Enter class"
                  value={formData.classOther}
                  onChangeText={(value) => handleInputChange('classOther', value)}
                />
              )}

              {/* Subject */}
              <DropdownField
                styles={styles}
                label="Subject"
                placeholder="Select Subject"
                value={formData.subject}
                options={subjects}
                onSelect={(value) => handleInputChange('subject', value)}
                isOpen={openDropdown === 'subject'}
                onToggle={(open) => setOpenDropdown(open ? 'subject' : null)}
              />
              {formData.subject === 'others' && (
                <InputField
                  styles={styles}
                  label="Specify Subject"
                  placeholder="Enter subject"
                  value={formData.subjectOther}
                  onChangeText={(value) => handleInputChange('subjectOther', value)}
                />
              )}

              {/* Author Name */}
              <InputField
                styles={styles}
                label="Author Name"
                placeholder="Author Name"
                value={formData.authorName}
                onChangeText={(value) => handleInputChange('authorName', value)}
              />

              {/* Publisher Name */}
              <InputField
                styles={styles}
                label="Publisher Name"
                placeholder="Publisher Name"
                value={formData.publisherName}
                onChangeText={(value) => handleInputChange('publisherName', value)}
              />

              {/* Edition */}
              <InputField
                styles={styles}
                label="Edition"
                placeholder="Edition (e.g. 2021, 3rd Edition)"
                value={formData.edition}
                onChangeText={(value) => handleInputChange('edition', value)}
              />

              {/* Note Box */}
              <View style={styles.noteBox}>
                <Text style={styles.noteText}>
                  <Text style={styles.noteBold}>Note:</Text> Use 'Others' when the category, class, or subject is missing
                </Text>
              </View>

              {/* Other Text Input - Styled like Author Name input with floating label */}
              {showOtherBox && (
                <InputField
                  styles={styles}
                  label="Other"
                  placeholder="Category: Example, Class: 10, Subject: Xyz"
                  value={formData.other}
                  onChangeText={(value) => handleInputChange('other', value)}
                  multiline
                />
              )}
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
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
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
  // Responsive scaling function based on screen width
  const s = (n: number) => (width / 375) * n;
  
  // Calculate padding and spacing based on screen size
  const topPad = clamp(s(45), 24, 60);
  const sidePad = clamp(s(16), 12, 24);

  return StyleSheet.create({
    container: { 
      flex: 1 
    },
    
    keyboardAvoidingView: {
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
    
    noteBox: {
      backgroundColor: 'rgba(207, 250, 254, 0.5)',
      borderWidth: 2,
      borderColor: '#44D6FF',
      borderRadius: clamp(s(10), 8, 12),
      borderStyle: 'dashed',
      padding: clamp(s(12), 10, 16),
      marginTop: clamp(s(8), 6, 12),
      marginBottom: clamp(s(8), 6, 12),
    },
    
    noteText: {
      fontSize: clamp(s(11), 10, 13),
      color: '#4b5563',
      lineHeight: clamp(s(16), 14, 18),
    },
    
    noteBold: {
      fontWeight: '700',
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
    
    // Disabled button styles
    nextButtonDisabled: {
      backgroundColor: 'rgba(156, 163, 175, 0.5)',
      elevation: 0,
      shadowOpacity: 0,
    },
    
    nextButtonTextDisabled: {
      color: 'rgba(107, 114, 128, 0.7)',
    },
    
    // Inline Dropdown Styles
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

export default SellBook1;
