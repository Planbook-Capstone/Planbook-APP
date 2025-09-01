import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Tool {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface History {
  id: string;
  func: string;
  token: string;
}

// --- Reusable Components --- //

const ToolCard = ({ tool, onPress }: { tool: Tool; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-white rounded-2xl p-4 border border-gray-200/80 flex-row items-center shadow-sm active:bg-gray-100"
  >
    <View
      className={`w-12 h-12 ${tool.color} rounded-lg items-center justify-center mr-4`}
    >
      <Text className="text-2xl">{tool.icon}</Text>
    </View>
    <View className="flex-1">
      <Text className="text-base font-semibold text-gray-800">
        {tool.title}
      </Text>
      <Text className="text-gray-500 text-sm mt-1" numberOfLines={2}>
        {tool.description}
      </Text>
    </View>
  </TouchableOpacity>
);

const HistoryItem = ({ item, isLast }: { item: History; isLast: boolean }) => (
  <View
    className={`flex-row items-center p-4 ${
      !isLast ? "border-b border-gray-100" : ""
    }`}
  >
    <Text
      className="flex-1 text-gray-800 text-sm font-medium"
      numberOfLines={1}
    >
      {item.func}
    </Text>
    <View className="w-24 flex-row justify-end items-center">
      <Text className="text-gray-600 text-sm font-semibold mr-1">
        {item.token}
      </Text>
      <Image
        source={require("@/assets/images/flash.png")}
        height={24}
        width={24}
      />
    </View>
  </View>
);

// --- Main Screen Component --- //

export default function HomeScreen() {
  const router = useRouter();

  const toolCategory = {
    id: 1,
    title: "Chấm điểm bài thi trắc nghiệm",
    description: "Tự động chấm điểm các bài thi trắc nghiệm từ ảnh chụp",
    icon: "📚",
    color: "bg-green-100",
  };

  const answerKeyTool = {
    id: 2,
    title: "Tạo đáp án bài thi",
    description: "Tạo đáp án cho các bài thi trắc nghiệm và đúng/sai",
    icon: "📝",
    color: "bg-blue-100",
  };

  const initialHistory = [
    { id: "1", func: "Tạo đề kiểm tra", token: "5" },
    { id: "2", func: "Tạo slide bài giảng", token: "8" },
    { id: "3", func: "Trộn đề thi theo ma t...", token: "10" },
    { id: "4", func: "Tạo đề kiểm tra", token: "15" },
    { id: "5", func: "Tạo đề kiểm tra", token: "11" },
    { id: "6", func: "Tạo giáo án", token: "9" },
    { id: "7", func: "Tạo đề kiểm tra", token: "5" },
    { id: "8", func: "Tạo slide bài giảng", token: "8" },
  ];

  const [historyData, setHistoryData] = useState(initialHistory);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMoreHistory = useCallback(() => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      const newItems = Array.from({ length: 8 }).map((_, i) => ({
        id: `${Date.now()}-${i}`,
        func: `Hoạt động cũ #${historyData.length + i + 1}`,
        token: `${Math.floor(Math.random() * 10) + 5}`,
      }));
      setHistoryData((prev) => [...prev, ...newItems]);
      setIsLoadingMore(false);
    }, 1500);
  }, [isLoadingMore, historyData.length]);

  const ListHeader = () => (
    <View>
      <View className="p-4 bg-white">
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
          <Text className="text-white text-center text-2xl font-bold mb-2">
            Chào mừng minhloia
          </Text>
          <Text className="text-blue-200 text-sm text-center">
            Khám phá các công cụ AI cho giáo dục
          </Text>
        </View>
      </View>

      <View className="px-4 mb-6">
        <ToolCard
          tool={toolCategory}
          onPress={() => router.push("/(grading)")}
        />
      </View>

      <View className="px-4 mb-6">
        <ToolCard
          tool={answerKeyTool}
          onPress={() => router.push("/createAnswerKey")}
        />
      </View>

      <View className="px-4 mb-3 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-gray-800">Lịch sử</Text>
        <TouchableOpacity className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 flex-row items-center">
          <Text className="text-sm text-gray-700 mr-1.5">Tất cả</Text>
          <Ionicons name="chevron-down" size={16} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const ListFooter = () =>
    isLoadingMore ? (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#6b7280" />
      </View>
    ) : null;

  return (
    <SafeAreaView className="flex-1 bg-white pb-[100px]">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-lg items-center justify-center mr-2">
            <Image
              source={require("@/assets/images/logo.png")}
              className="w-8 h-8"
              height={24}
              width={24}
            />
          </View>
          <Text className="text-xl font-bold text-gray-800">PlanBook</Text>
        </View>
        <View className="bg-blue-100 rounded-full pl-3 pr-2 py-1 flex-row items-center">
          <Text className="text-blue-800 font-semibold text-xs mr-1">
            10000
          </Text>
          <Image
            source={require("@/assets/images/flash.png")}
            height={24}
            width={24}
          />
        </View>
      </View>

      <FlatList
        data={historyData}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <HistoryItem item={item} isLast={index === historyData.length - 1} />
        )}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        onEndReached={loadMoreHistory}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      />
    </SafeAreaView>
  );
}
