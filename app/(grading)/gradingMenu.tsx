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
    activeOpacity={0.8}
    className="flex-row items-center gap-4 px-6 py-5 bg-white rounded-2xl border border-gray-100"
    style={{
      width: 368,
      height: 70,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    }}
  >
    <View
      className="w-12 h-12 items-center justify-center rounded-xl bg-blue-50"
      style={{
        shadowColor: "#3B82F6",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {icon}
    </View>
    <View className="flex-1">
      <Text
        className="text-gray-900 font-semibold"
        style={{
          fontFamily: "CalSans",
          fontSize: 18,
          lineHeight: 22,
        }}
      >
        {title}
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
  </TouchableOpacity>
);

export default function GradingMenuScreen() {
  const router = useRouter();

  const menuItems = [
    {
      icon: <MaterialIcons name="qr-code-scanner" size={24} color="#3B82F6" />,
      title: "Chấm điểm",
      onPress: () => router.push("/scanExam"),
    },
    {
      icon: <Ionicons name="key-outline" size={24} color="#8B5CF6" />,
      title: "Đáp án",
      onPress: () => router.push("/exportResults"),
    },
    {
      icon: <Ionicons name="document-text-outline" size={24} color="#10B981" />,
      title: "Bài đã chấm",
      onPress: () => router.push("/gradedPapers"),
    },
    {
      icon: <Ionicons name="bar-chart-outline" size={24} color="#F59E0B" />,
      title: "Thống kê",
      onPress: () => router.push("/statistics"),
    },

    {
      icon: <Ionicons name="download-outline" size={24} color="#EF4444" />,
      title: "Xuất kết quả",
      onPress: () => router.push("/exportResults"),
    },
    {
      icon: (
        <Ionicons name="information-circle-outline" size={24} color="#6B7280" />
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
          padding: 24,
          gap: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View className="items-center gap-3 px-6 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
          <Text
            className="text-gray-900 text-center font-bold"
            style={{
              fontFamily: "CalSans",
              fontSize: 28,
              lineHeight: 34,
            }}
          >
            Đợt chấm
          </Text>
        </View>

        {/* Menu Items */}
        <View className="gap-4 items-center">
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              icon={item.icon}
              title={item.title}
              onPress={item.onPress}
            />
          ))}
        </View>

        {/* Bottom Padding */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
