import { useAuthStore } from "@/store/authStore";
import React from "react";
import { Image, Text, View } from "react-native";

function Banner() {
  const { user } = useAuthStore();
  return (
    <View className="rounded-2xl  py-20 relative overflow-hidden">
      <Image
        source={require("@/assets/images/background.png")}
        style={{
          width: "100%",
          height: 200,
          position: "absolute",
          top: 0,
          left: 0,
        }}
        resizeMode="cover" // Đảm bảo ảnh che phủ toàn bộ khu vực
      />
      <View className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
      <View className="absolute -bottom-12 -left-10 w-32 h-32 bg-white/10 rounded-full" />
      <Text className="text-white text-center text-2xl font-calsans mb-2">
        Chào mừng {user?.fullName ?? "Người dùng"}
      </Text>
      <Text className="text-blue-200 text-sm text-center font-questrial">
        Khám phá các công cụ AI cho giáo dục
      </Text>
    </View>
  );
}

export default Banner;
