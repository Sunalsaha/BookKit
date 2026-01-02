import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur'; // Import BlurView

interface LoadingComponentProps {
  messages?: string[];
  visible?: boolean;
}

const LoadingComponent: React.FC<LoadingComponentProps> = ({ 
  messages = ["UPLOADING...", "PLEASE WAIT..." , "PROCESSING..." , "ALMOST DONE..." , "Soham..."], 
  visible = true 
}) => {
  if (!visible) return null;

  // Track which message to show
  const [messageIndex, setMessageIndex] = useState(0);
  
  // Get current text and split into letters
  const currentText = messages[messageIndex];
  const letters = useMemo(() => currentText.split(''), [currentText]);

  // Create fresh animated values whenever the text changes (using useMemo)
  const animatedValues = useMemo(() => {
    return letters.map(() => new Animated.Value(0));
  }, [letters]);

  useEffect(() => {
    // 1. Define the Enter Animation (Swipe In)
    const enterAnimations = letters.map((_, index) => {
      return Animated.sequence([
        Animated.delay(index * 50), // Fast stagger for smooth wave
        Animated.timing(animatedValues[index], {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)), // Slight bounce effect
        }),
      ]);
    });

    // 2. Define the Exit Animation (Swipe Out)
    const exitAnimations = letters.map((_, index) => {
      return Animated.sequence([
        Animated.delay(index * 50),
        Animated.timing(animatedValues[index], {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
      ]);
    });

    // 3. Run the Sequence
    Animated.sequence([
      // Swipe In
      Animated.parallel(enterAnimations),
      // Stay visible for 1.2 seconds
      Animated.delay(1200),
      // Swipe Out
      Animated.parallel(exitAnimations),
    ]).start(() => {
      // After exit finishes, switch to the next message
      setMessageIndex((prev) => (prev + 1) % messages.length);
    });
  }, [messageIndex, animatedValues, letters, messages.length]);

  return (
    // Wrap everything in BlurView for the blur effect
    <BlurView intensity={20} tint="light" style={styles.container}>
      <View style={styles.content}>
        {/* Your Loading GIF */}
        <Image
          source={require('../../assets/images/loading.gif')}
          style={styles.gif}
          resizeMode="contain"
        />

        {/* Animated Text Container */}
        <View style={styles.textContainer}>
          {letters.map((letter, index) => {
            const translateY = animatedValues[index].interpolate({
              inputRange: [0, 1],
              outputRange: [10, 0], 
            });

            const opacity = animatedValues[index].interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1], 
            });

            const scale = animatedValues[index].interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1], 
            });

            return (
              <Animated.Text
                key={`${messageIndex}-${index}`}
                style={[
                  styles.text,
                  {
                    opacity,
                    transform: [{ translateY }, { scale }],
                  },
                ]}
              >
                {letter === ' ' ? '\u00A0' : letter} 
              </Animated.Text>
            );
          })}
        </View>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    // Removed specific background color so BlurView takes effect
    // But kept justification/alignment for content
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    // Optional: Add a slight white background behind the text/gif specifically 
    // if the blur isn't enough contrast
    // backgroundColor: 'rgba(255,255,255,0.4)', 
    // borderRadius: 20,
    // padding: 20,
  },
  gif: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  textContainer: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: '800',
    color: '#003EF9',
    marginHorizontal: 1,
    letterSpacing: 1,
  },
});

export default LoadingComponent;
