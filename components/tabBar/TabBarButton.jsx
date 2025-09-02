import { View, Text, Pressable, StyleSheet } from "react-native";
import React from "react";

const TabBarButton = (props) => {
  const { isFocused, label, color, icon } = props;

  return (
    <Pressable {...props} style={styles.container}>
      <View>{icon}</View>

      <Text
        style={{
          color,
          fontSize: 11,
        }}
        className="font-questrial"
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
});

export default TabBarButton;
