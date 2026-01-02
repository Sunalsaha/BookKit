// FloatingStatus.tsx
import React from "react";
import { StyleSheet, useWindowDimensions, ViewStyle, StyleProp, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";

type FloatingStatusProps = {
  children: React.ReactNode;
  hiddenContent: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function FloatingStatus({
  children,
  hiddenContent,
  style,
}: FloatingStatusProps) {
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const contextX = useSharedValue(0);

  const SWIPE_THRESHOLD = -width * 0.15; // Distance to trigger reveal
  const REVEAL_DISTANCE = width * 0.45; // How far to reveal hidden content

  const panGesture = Gesture.Pan()
    .onStart(() => {
      contextX.value = translateX.value;
    })
    .onUpdate((event) => {
      // Allow swiping left (negative) only
      let newX = contextX.value + event.translationX;
      
      // Limit swipe range
      if (newX > 0) newX = newX * 0.15; // Strong resistance right
      if (newX < -REVEAL_DISTANCE) newX = -REVEAL_DISTANCE + (newX + REVEAL_DISTANCE) * 0.15;
      
      translateX.value = newX;
    })
    .onEnd((event) => {
      if (event.translationX < SWIPE_THRESHOLD || event.velocityX < -800) {
        // Reveal hidden content
        translateX.value = withSpring(-REVEAL_DISTANCE, {
          damping: 18,
          stiffness: 100,
        });
      } else {
        // Hide it back
        translateX.value = withSpring(0, {
          damping: 18,
          stiffness: 100,
        });
      }
    });

  // Hidden content slides in from the right
  const hiddenAnimatedStyle = useAnimatedStyle(() => {
    const translateRight = interpolate(
      translateX.value,
      [-REVEAL_DISTANCE, 0],
      [0, REVEAL_DISTANCE],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      translateX.value,
      [-REVEAL_DISTANCE * 0.5, 0],
      [1, 0],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      translateX.value,
      [-REVEAL_DISTANCE, 0],
      [1, 0.85],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [
        { translateX: translateRight },
        { scale },
      ],
    };
  });

  // FloatingChip moves slightly left (but stays mostly visible)
  const chipAnimatedStyle = useAnimatedStyle(() => {
    // Only move 20% of the swipe distance to keep it mostly centered
    const chipMove = translateX.value * 0.2;
    
    return {
      transform: [{ translateX: chipMove }],
    };
  });

  return (
    <View style={[styles.container, style]} pointerEvents="box-none">
      {/* Hidden Content Layer - Slides from right */}
      <Animated.View 
        style={[styles.hiddenLayer, hiddenAnimatedStyle]}
        pointerEvents="none"
      >
        {hiddenContent}
      </Animated.View>

      {/* FloatingChip - Always Visible, Swipeable */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.chipLayer, chipAnimatedStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    height: 80,
  },
  hiddenLayer: {
    position: "absolute",
    right: 20, // Positioned to the right
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  chipLayer: {
    zIndex: 2, // Always on top
    alignItems: "center",
    justifyContent: "center",
  },
});
