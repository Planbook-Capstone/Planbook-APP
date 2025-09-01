import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center gap-2.5 px-4 py-4 bg-white rounded-full border border-black/10 shadow-sm"
    style={{
      width: 368,
      height: 57,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    }}
  >
    <View className="w-6 h-6 items-center justify-center">{icon}</View>
    <Text
      className="text-black text-xl"
      style={{
        fontFamily: "Questrial",
        fontSize: 20,
        lineHeight: 20.6,
      }}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

export default function GradingMenuScreen() {
  const router = useRouter();

  const menuItems = [
    {
      icon: <Ionicons name="key-outline" size={24} color="#292D32" />,
      title: "Đáp án",
      onPress: () => router.push("/createAnswerKey"),
    },
    {
      icon: <MaterialIcons name="qr-code-scanner" size={24} color="#292D32" />,
      title: "Chấm điểm",
      onPress: () => router.push("/scanExam"),
    },
    {
      icon: <Ionicons name="document-text-outline" size={24} color="#292D32" />,
      title: "Bài đã chấm",
      onPress: () => router.push("/gradedPapers"),
    },
    {
      icon: <Ionicons name="layers-outline" size={24} color="#292D32" />,
      title: "Thống kê",
      onPress: () => router.push("/statistics"),
    },
    {
      icon: <Ionicons name="send-outline" size={24} color="#292D32" />,
      title: "Xuất kết quả",
      onPress: () => router.push("/exportResults"),
    },
    {
      icon: (
        <Ionicons name="information-circle-outline" size={24} color="#292D32" />
      ),
      title: "Thông tin chung",
      onPress: () => router.push("/generalInfo"),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          padding: 30,
          gap: 30,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center gap-1.5">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center gap-1.5"
          >
            <Ionicons name="arrow-back" size={24} color="#292D32" />
            <Text
              className="text-black"
              style={{
                fontFamily: "Questrial",
                fontSize: 20,
                lineHeight: 20.6,
              }}
            >
              Quay lại |
            </Text>
          </TouchableOpacity>
        </View>

        {/* Title Section */}
        <View className="items-center gap-2.5">
          <Text
            className="text-black text-center"
            style={{
              fontFamily: "CalSans",
              fontSize: 24,
              lineHeight: 31.2,
            }}
          >
            Đợt chấm (1)
          </Text>
        </View>

        {/* Menu Items */}
        <View className="gap-7.5 items-center">
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              icon={item.icon}
              title={item.title}
              onPress={item.onPress}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
