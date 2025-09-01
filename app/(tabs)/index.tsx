import Banner from "@/components/organisms/banner";
import HistoryItem from "@/components/organisms/history-item";
import ToolCard from "@/components/organisms/tool-card";
import { useWalletService } from "@/services/walletServices";
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

// --- Main Screen Component --- //

export default function HomeScreen() {
  const router = useRouter();
  const toolCategory = {
    id: 1,
    title: "Chấm điểm bài thi trắc nghiệm",
    description: "Tự động chấm điểm các bài thi trắc nghiệm từ ảnh chụp",
    icon: null,
    color: "bg-green-100",
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
      <View className="p-2 py-5 bg-white">
        <Banner />
      </View>

      <View className="px-2 mb-6">
        <ToolCard
          tool={toolCategory}
          onPress={() => router.push("/(grading)")}
        />
      </View>

      <View className="px-4 mb-3 flex-row items-center justify-between">
        <Text className="text-2xl font-calsans ">Lịch sử</Text>
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
  const { data: wallet } = useWalletService();
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
        <View className="bg-blue-100 rounded-full py-1 px-2 flex-row items-center gap-0.5">
          <Text className=" font-calsans text-lg pl-1.5">
            {" "}
            {wallet?.data?.balance || 0}
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
