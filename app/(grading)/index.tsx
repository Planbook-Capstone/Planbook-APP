import { useGetGradingSessions } from "@/services/gradingService";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect, useMemo } from "react";
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
import ExamIcon from "@/assets/images/icons/exam.svg";
import { GeadingSectionCard } from "@/components/organisms/grading-section-card";

export default function GradingHistoryScreen() {
  const router = useRouter();
  const { id: idBooktype } = useLocalSearchParams();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);
  const [allGradingSessions, setAllGradingSessions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // API parameters
  const apiParams = useMemo(() => {
    const baseParams: any = {
      page: currentPage,
      size: pageSize,
      sortBy: "createdAt",
      sortDir: "desc",
    };
    if (searchQuery) baseParams.search = searchQuery;
    if (idBooktype) baseParams.bookTypeId = idBooktype;

    return baseParams;
  }, [currentPage, pageSize, searchQuery, idBooktype]);

  const {
    data: response,
    isLoading,
    error,
    isFetching,
  } = useGetGradingSessions(
    [currentPage, pageSize, idBooktype],
    { retry: 1 },
    apiParams
  );

  // Effect to handle pagination data
  useEffect(() => {
    if (response?.data?.content) {
      if (currentPage === 1) {
        setAllGradingSessions(response.data.content);
      } else {
        setAllGradingSessions((prev) => [...prev, ...response.data.content]);
      }
    }
  }, [response, currentPage]);

  console.log("🔎tran", JSON.stringify(response?.data?.content, null, 2));

  // Reset and fetch functions
  const resetAndFetch = () => {
    setCurrentPage(1);
    setAllGradingSessions([]);
  };

  const handleSearchChange = (newQuery: string) => {
    setSearchQuery(newQuery);
    // resetAndFetch();
  };

  const handleLoadMore = () => {
    const totalPages = response?.data?.totalPages ?? 1;
    if (!isFetching && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Hiển thị loading khi đang tải dữ liệu lần đầu
  if (isLoading && currentPage === 1) {
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
      <View className="px-4 gap-y-5">
        <Text className="text-3xl font-calsans text-gray-900 pt-5 ">
          Lịch sử chấm điểm
        </Text>
        <View className="flex-row items-center space-x-3">
          <View className="flex-1 flex-row items-center border border-neutral-200 rounded-full px-3 h-12">
            <Ionicons name="search" size={20} color="#9ca3af" />
            <TextInput
              placeholder="Tìm kiếm"
              placeholderTextColor="#9ca3af"
              className="flex-1 text-base font-questrial ml-2"
              style={{
                height: 48, // h-12 = 48px
                paddingVertical: 0,
                textAlignVertical: "center", // Android
                includeFontPadding: false, // Android: bỏ padding font mặc định
                textAlign: "left", // căn text trái
              }}
              value={searchQuery}
              onChangeText={handleSearchChange}
            />
          </View>

          <TouchableOpacity className="h-12 w-12 items-center justify-center bg-gray-100 mx-3 rounded-full">
            <Ionicons name="filter" size={20} color="#4b5563" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              router.push(`/(grading)/create-session?id=${idBooktype}`)
            }
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
        data={allGradingSessions}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => <GeadingSectionCard item={item} />}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !isFetching ? (
            <View className="flex-1 justify-center items-center py-20">
              <ExamIcon width={50} height={50} />
              <Text className="mt-4 text-xl font-calsans text-gray-900">
                Chưa có lịch sử chấm điểm
              </Text>
              <Text className="mt-2 font-questrial text-center">
                Bắt đầu tạo phiên chấm điểm đầu tiên của bạn
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isFetching && currentPage > 1 ? (
            <ActivityIndicator size="small" className="my-4" />
          ) : null
        }
        className="pt-5"
      />
    </SafeAreaView>
  );
}
