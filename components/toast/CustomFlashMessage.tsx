// components/CustomFlashMessage.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MessageComponentProps } from "react-native-flash-message";

// CẬP NHẬT BẢNG MÀU SANG TÔNG NHẠT HƠN
const toastConfig = {
  success: {
    backgroundColor: "#E8F5E9", // Xanh lá pastel
    textColor: "#1B5E20", // Xanh lá đậm
    icon: "checkmark-circle",
  },
  danger: {
    backgroundColor: "#FFEBEE", // Đỏ pastel (hồng nhạt)
    textColor: "#B71C1C", // Đỏ đậm
    icon: "alert-circle",
  },
  info: {
    backgroundColor: "#E3F2FD", // Xanh dương pastel
    textColor: "#0D47A1", // Xanh dương đậm
    icon: "information-circle",
  },
};

export const CustomFlashMessage = ({ message }: MessageComponentProps) => {
  const messageType = (message.type as keyof typeof toastConfig) || "info";
  const config = toastConfig[messageType] || toastConfig.info;

  const { backgroundColor, textColor, icon } = config;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Ionicons
        name={icon as any}
        size={24}
        color={textColor}
        style={styles.icon}
      />
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: textColor }]}>
          {message.message}
        </Text>
        {message.description && (
          <Text style={[styles.description, { color: textColor }]}>
            {message.description}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    // marginBottom: 80,
    marginTop: 80,
    borderRadius: 25,
    // Thêm viền nhẹ cho đẹp hơn
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    // color đã được đặt tự động
    fontWeight: "bold",
    fontSize: 16,
  },
  description: {
    // color đã được đặt tự động
    fontSize: 14,
    marginTop: 2,
  },
});
