import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ImageBackground,
  Image,
} from "react-native";

const MOCK_HISTORY = [
  {
    id: "1",
    title: "\u0110ợt chấm (1)",
    date: "30-08-2025 12:05:50",
    questions: "12 | 20 | 5",
  },
  {
    id: "2",
    title: "\u0110ợt chấm (2)",
    date: "29-08-2025 11:30:00",
    questions: "15 | 15 | 0",
  },
  {
    id: "3",
    title: "\u0110ợt chấm (3)",
    date: "28-08-2025 09:05:10",
    questions: "20 | 0 | 0",
  },
  {
    id: "4",
    title: "\u0110ợt chấm (4)",
    date: "27-08-2025 16:20:30",
    questions: "10 | 8 | 2",
  },
  {
    id: "5",
    title: "\u0110ợt chấm (5)",
    date: "26-08-2025 14:00:00",
    questions: "18 | 2 | 0",
  },
];



const HistoryCard = ({ item }: any) => (
  <TouchableOpacity className="bg-white rounded-2xl p-6 mb-5 border border-gray-200 overflow-hidden">
    <ImageBackground
      source={require("@/assets/images/card-bg-1.png")}
      className="absolute top-0 left-0 right-0 bottom-0 opacity-15"
      resizeMode="cover"
    />
    <View className="flex-row justify-between items-center mb-3">
      <Text className="text-lg font-bold text-gray-900">
        {item.title}
      </Text>
      <View className="flex-row items-center space-x-1">
        <Ionicons name="time-outline" size={16} color="#6b7280" />
        <Text className="text-sm text-gray-500">{item.date}</Text>
      </View>
    </View>
    <Text className="text-base text-gray-700">Số câu: {item.questions}</Text>
  </TouchableOpacity>
);


export default function GradingHistoryScreen() {
  const router = useRouter();

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
            onPress={() => router.push("/scanExam")}
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
        data={MOCK_HISTORY}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HistoryCard item={item} />}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
