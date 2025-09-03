import HistoryItem from "@/components/organisms/history-item";
import ToolCard from "@/components/organisms/tool-card";
import { useBookTypesService } from "@/services/bookTypeServices";
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
import HeaderIcon from "@/assets/images/header.svg";
import TokenIcon from "@/assets/images/icons/token.svg";

// --- Main Screen Component --- //

export default function HomeScreen() {
  const router = useRouter();
  const toolCategory = {
    id: 1,
    name: "Chấm điểm bài thi trắc nghiệm hihi",
    description: "Tự động chấm điểm các bài thi trắc nghiệm từ ảnh chụp",
    icon: null,
    color: "bg-green-100",
  };

  // --- Pagination states ---
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const { user } = useAuthStore();

  const { data: bookTypes, isLoading } = useBookTypesService();
  const filtered =
    bookTypes?.data?.content?.filter((item: any) => item.app) || [];

  // console.log("✅ BookTypes lọc theo EXAM_GRADING:", filtered);

  // Call API lấy lịch sử tool log
  const { data: toolLogs, isLoading: isLoadingToolLogs } =
    useToolLogsWithParamsService(
      [currentPage, pageSize],
      { retry: 1, staleTime: 0 },
      {
        userId: user?.id,
        offset: currentPage,
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

      if (currentPage === 0) {
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
    setCurrentPage(0);
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
        <ToolCard
          tool={filtered[0] || toolCategory}
          onPress={() => {
            router.push(`/(grading)?id=${filtered[0]?.id}`);
          }}
        />
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



  const { data: wallet } = useWalletService();
  return (
    <SafeAreaView className="flex-1 bg-white pb-[100px]">
      <View className="w-full overflow-hidden ">
        {/* <MarqueeHeader 
          text="PLANBOOK PLANBOOK PLANBOOK PLANBOOK"
          speed={6000}
        /> */}
        <HeaderIcon />
        <View
          className="absolute bottom-1 right-3 rounded-full p-2 flex flex-row justify-center items-center mt-1 bg-white"
          style={{
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.15)",
            shadowColor: "rgba(0, 0, 0, 0.15)",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 1,
            shadowRadius: 8,
            elevation: 6, // For Android
          }}
        >
          <TokenIcon />
          <Text className="text-2xl font-bold text-gray-800">
            {wallet?.data?.balance || 0}
          </Text>
        </View>
      </View>

      <FlatList
        data={historyData}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item, index }) => (
          <HistoryItem item={item} isLast={index === historyData.length - 1} />
        )}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          !isLoadingToolLogs ? (
            <View className="flex-1 items-center justify-center mt-20">
              <Text className="text-lg text-gray-500">
                Chưa có lịch sử nào
              </Text>
            </View>
          ) : null
        }
        onEndReached={loadMoreHistory}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoadingToolLogs && currentPage > 0 ? (
            <ActivityIndicator size="small" className="my-4" />
          ) : null
        }
        onRefresh={handleRefresh}
        refreshing={refreshing}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      />
    </SafeAreaView>
  );
}
