import HistoryItem from "@/components/organisms/history-item";
import ToolCard from "@/components/organisms/tool-card";
import { useToolLogsWithParamsService } from "@/services/toolLogServices";
import { useWalletService } from "@/services/walletServices";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Text,
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

  // --- Pagination states ---
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const { user } = useAuthStore();
  // const { data: bookTypes, isLoading } = useBookTypesService();
  // const filtered = bookTypes.data.content.filter(
  //   (item: any) => item.code === "EXAM_GRADING"
  // );

  // console.log("✅ BookTypes lọc theo EXAM_GRADING:", filtered);

  // Call API lấy lịch sử tool log
  const { data: toolLogs, isLoading: isLoadingToolLogs } =
    useToolLogsWithParamsService(
      [currentPage, pageSize],
      { retry: 1, staleTime: 0 },
      {
        userId: user?.id,
        offset: (currentPage - 1) * pageSize,
        pageSize,
        sortBy: "createdAt",
        sortDirection: "desc",
      }
    );

  // Gộp data khi phân trang hoặc refresh
  useEffect(() => {
    if (toolLogs?.data?.content) {
      // Kiểm tra nếu không có dữ liệu trả về hoặc ít hơn pageSize thì đã hết data
      if (
        toolLogs.data.content.length === 0 ||
        toolLogs.data.content.length < pageSize
      ) {
        setHasMoreData(false);
      } else {
        setHasMoreData(true);
      }

      if (currentPage === 1) {
        setHistoryData(toolLogs.data.content);
      } else {
        setHistoryData((prev) => [...prev, ...toolLogs.data.content]);
      }

      // Debug log
      console.log(
        `Received ${
          toolLogs.data.content.length
        } items, page ${currentPage}, hasMore: ${
          toolLogs.data.content.length > 0 &&
          toolLogs.data.content.length >= pageSize
        }`
      );
    }
  }, [toolLogs, currentPage, pageSize]);

  // Load more khi scroll tới cuối
  const loadMoreHistory = useCallback(() => {
    // Chỉ load thêm nếu không đang loading, còn dữ liệu phía sau, và có dữ liệu từ API
    if (!isLoadingToolLogs && hasMoreData && toolLogs?.data?.content) {
      console.log("Loading more data, current page:", currentPage);
      setCurrentPage((prev) => prev + 1);
    }
  }, [isLoadingToolLogs, hasMoreData, toolLogs?.data?.content, currentPage]);

  // Refresh list
  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    setHistoryData([]);
    setHasMoreData(true); // Reset hasMoreData khi refresh
    setRefreshing(false);
  };

  const ListHeader = () => (
    <View className="gap-y-3">
      <View className="p-2  bg-white">
        {/* <Banner /> */}
        <View>
          <Text className="font-questrial text-3xl">
            Xin chào <Text className="font-calsans">{user?.fullName}</Text>!
          </Text>
          <Text className="font-questrial text-neutral-400 text-base pt-1">
            Trải nghiệm tính năng của chúng tôi
          </Text>
        </View>
      </View>

      <View>
        <ToolCard tool={toolCategory} onPress={() => {}} />
      </View>

      <View className="px-4 mb-3 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-calsans ">Lịch sử</Text>
          <Text className="text-base font-questrial text-[#878787] ">
            Lịch sử sử dụng chức năng
          </Text>
        </View>
      </View>
    </View>
  );

  const ListFooter = () => {
    if (isLoadingToolLogs && currentPage > 1) {
      return (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color="#6b7280" />
        </View>
      );
    }

    if (!hasMoreData && historyData.length > 0) {
      return (
        <View className="py-4 items-center">
          <Text className="text-gray-500 text-sm">Đã hiển thị tất cả</Text>
        </View>
      );
    }

    return null;
  };

  const { data: wallet } = useWalletService();
  return (
    <SafeAreaView className="flex-1 bg-white pb-[100px]">
      <View className="w-full overflow-hidden pt-10">
        {/* <MarqueeHeader 
          text="PLANBOOK PLANBOOK PLANBOOK PLANBOOK"
          speed={6000}
        /> */}
      </View>

      <FlatList
        data={historyData}
        keyExtractor={(item) => item.id?.toString() || String(item.id)}
        renderItem={({ item, index }) => (
          <HistoryItem item={item} isLast={index === historyData.length - 1} />
        )}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        onEndReached={loadMoreHistory}
        onEndReachedThreshold={0.3} // Giảm xuống để trigger sớm hơn
        onRefresh={handleRefresh}
        refreshing={refreshing}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        removeClippedSubviews={false} // Đảm bảo render đúng trên Android
        maxToRenderPerBatch={10} // Tối ưu hiệu suất
        windowSize={10} // Tối ưu hiệu suất
        initialNumToRender={10} // Số lượng item render ban đầu
      />
    </SafeAreaView>
  );
}
