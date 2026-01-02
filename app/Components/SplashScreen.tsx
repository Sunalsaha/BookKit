import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  runOnJS 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const LogoImage = require('../../assets/images/ExBookLogo.png');

type Props = {
  onAnimationFinish: () => void;
};

export default function AnimatedSplashScreen({ onAnimationFinish }: Props) {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // 1. Fade In & Pulse Up
    opacity.value = withTiming(1, { duration: 800 });
    scale.value = withSpring(1, { damping: 12 }, (finished) => {
      if (finished) {
        // 2. Zoom Out Massive (Portal Effect)
        scale.value = withTiming(50, { duration: 500 }); // Expands to reveal app
        opacity.value = withTiming(0, { duration: 400 }, () => {
          // 3. End Animation
          runOnJS(onAnimationFinish)();
        });
      }
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <LinearGradient
      colors={["#6FE9F0", "#CFF7FA"]} // Your requested colors
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.Image 
        source={LogoImage} 
        style={[styles.logo, animatedStyle]} 
        resizeMode="contain" 
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject, // Covers entire screen
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999, // Stays on top
  },
  logo: {
    width: 150, 
    height: 150,
  },
});
