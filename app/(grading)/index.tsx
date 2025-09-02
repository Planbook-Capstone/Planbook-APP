import { useGetGradingSessions } from "@/services/gradingService";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const HistoryCard = ({ item }: any) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-6 mb-5 border border-gray-200 overflow-hidden"
      onPress={() => router.push("/gradingMenu")}
    >
      <ImageBackground
        source={require("@/assets/images/card-bg-1.png")}
        className="absolute top-0 left-0 right-0 bottom-0 opacity-15"
        resizeMode="cover"
      />
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-bold text-gray-900">{item.title}</Text>
        <View className="flex-row items-center space-x-1">
          <Ionicons name="time-outline" size={16} color="#6b7280" />
          <Text className="text-sm text-gray-500">{item.date}</Text>
        </View>
      </View>
      <Text className="text-base text-gray-700">Số câu: {item.questions}</Text>
    </TouchableOpacity>
  );
};

export default function GradingHistoryScreen() {
  const router = useRouter();
  const { data: gradingSessions, isLoading, error } = useGetGradingSessions();
  const { id: idBooktype } = useLocalSearchParams();
  console.log("🔎 ID truyền vào:", idBooktype);
  // Hiển thị loading khi đang tải dữ liệu
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">
          Đang tải lịch sử chấm điểm...
        </Text>
      </SafeAreaView>
    );
  }

  // Hiển thị lỗi nếu có
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center px-4">
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text className="mt-4 text-xl font-bold text-gray-900 text-center">
          Có lỗi xảy ra
        </Text>
        <Text className="mt-2 text-gray-600 text-center">
          Không thể tải lịch sử chấm điểm. Vui lòng thử lại sau.
        </Text>
        <TouchableOpacity
          onPress={() => window.location.reload()}
          className="mt-6 bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Thử lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-3xl font-bold text-gray-900 mb-5">
          Lịch sử chấm điểm
        </Text>
        <View className="flex-row items-center space-x-3">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-3 h-12">
            <Ionicons
              name="search"
              size={20}
              color="#9ca3af"
              className="mr-2"
            />
            <TextInput
              placeholder="Tìm kiếm"
              placeholderTextColor="#9ca3af"
              className="flex-1 text-base text-gray-800"
            />
          </View>
          <TouchableOpacity className="h-12 w-12 items-center justify-center bg-gray-100 mx-3 rounded-full">
            <Ionicons name="filter" size={20} color="#4b5563" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push(`/(grading)/create-session?id=${idBooktype}`)}
            className="h-12 w-12 rounded-full overflow-hidden"
          >
            <Image
              source={require("@/assets/images/icon-create.png")} // <-- THAY BẰNG ẢNH NỀN
              className="h-12 w-12"
              resizeMode="cover" // Đảm bảo ảnh che phủ toàn bộ khu vực
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={gradingSessions || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HistoryCard item={item} />}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="document-text-outline" size={64} color="#9ca3af" />
            <Text className="mt-4 text-xl font-bold text-gray-900">
              Chưa có lịch sử chấm điểm
            </Text>
            <Text className="mt-2 text-gray-600 text-center">
              Bắt đầu tạo phiên chấm điểm đầu tiên của bạn
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
