import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, Dimensions, StyleSheet, LayoutChangeEvent } from "react-native";

const { width: screenWidth } = Dimensions.get("window");

interface MarqueeHeaderProps {
  text?: string;
  speed?: number; // milliseconds cho 1 vòng
  backgroundColor?: string;
  textColor?: string;
}

function MarqueeHeader({
  text = "PLANBOOK PLANBOOK PLANBOOK PLANBOOK",
  speed = 8000,
  backgroundColor = "#000000",
  textColor = "#FFFFFF",
}: MarqueeHeaderProps) {
  const [textWidth, setTextWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const backgroundAnimValue = useRef(new Animated.Value(0)).current;

  // Handle text layout to measure its width
  const onTextLayout = (e: LayoutChangeEvent) => {
    setTextWidth(e.nativeEvent.layout.width);
  };

  // Handle container layout to measure its width
  const onContainerLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  useEffect(() => {
    // Only start animation when we know both widths
    if (textWidth > 0 && containerWidth > 0) {
      // Reset to start position
      animatedValue.setValue(0);
      
      // Create a seamless loop based on actual text width
      const duration = (textWidth / containerWidth) * speed;
      
      // Seamless continuous animation
      Animated.loop(
        Animated.timing(animatedValue, {
          toValue: -1,
          duration: duration,
          useNativeDriver: true,
        })
      ).start();
    }
    
    // Background animation - slower movement
    const startBackgroundAnimation = () => {
      backgroundAnimValue.setValue(0);
      Animated.loop(
        Animated.timing(backgroundAnimValue, {
          toValue: 1,
          duration: 8000, // Slower animation for background
          useNativeDriver: true,
        })
      ).start();
    };

    startBackgroundAnimation();

    return () => {
      // Cleanup animations
      animatedValue.stopAnimation();
      backgroundAnimValue.stopAnimation();
    };
  }, [animatedValue, backgroundAnimValue, speed, textWidth, containerWidth]);

  // Animation for background skew/transform effect
  const backgroundSkew = backgroundAnimValue.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ["-3deg", "-1deg", "0deg", "-1deg", "-3deg"], // Subtle movement of background
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          transform: [{ skewY: backgroundSkew }],
        },
      ]}
      onLayout={onContainerLayout}
    >
      <View style={styles.marqueeContainer}>
        {/* First copy of text */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              transform: [
                {
                  translateX: animatedValue.interpolate({
                    inputRange: [-1, 0],
                    outputRange: [0, textWidth],
                  }),
                },
              ],
            },
          ]}
        >
          <Text
            style={[styles.marqueeText, { color: textColor }]}
            numberOfLines={1}
            className="font-calsans text-3xl"
            onLayout={onTextLayout}
          >
            {text}
          </Text>
        </Animated.View>
        
        {/* Second copy of text for seamless loop */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              transform: [
                {
                  translateX: animatedValue.interpolate({
                    inputRange: [-1, 0],
                    outputRange: [textWidth, textWidth * 2],
                  }),
                },
              ],
            },
          ]}
        >
          <Text
            style={[styles.marqueeText, { color: textColor }]}
            numberOfLines={1}
            className="font-calsans text-3xl"
          >
            {text}
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    width: "110%", // Slightly wider to account for the background effect
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    borderRadius: 0,
    marginLeft: "-5%", // Center the background
  },
  marqueeContainer: {
    flexDirection: "row",
    overflow: "hidden",
    width: "100%",
    height: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
  },
  marqueeText: {
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});

export default MarqueeHeader;
