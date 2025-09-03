import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useOrdersWithParamsService } from "@/services/orderServices";
import { Order, OrderStatus } from "@/types/order";
// BƯỚC 1: IMPORT DATETIMEPICKER
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

// --- Component OrderItem ---
type OrderItemProps = {
  item: Order;
  onPress: () => void;
};
const OrderItem = ({ item, onPress }: OrderItemProps) => {
  const styleConfig = useMemo(() => {
    switch (item.status) {
      case "PAID":
        return {
          icon: "credit-card-check-outline" as const,
          color: "text-green-500",
          bgColor: "bg-green-100",
        };
      case "PENDING":
        return {
          icon: "clock-outline" as const,
          color: "text-yellow-500",
          bgColor: "bg-yellow-100",
        };
      case "CANCELLED":
        return {
          icon: "close-circle-outline" as const,
          color: "text-red-500",
          bgColor: "bg-red-100",
        };
      case "FAILED":
        return {
          icon: "alert-circle-outline" as const,
          color: "text-red-500",
          bgColor: "bg-red-100",
        };
      case "EXPIRED":
        return {
          icon: "clock-alert-outline" as const,
          color: "text-gray-500",
          bgColor: "bg-gray-100",
        };
      case "RETRY":
        return {
          icon: "refresh-circle" as const,
          color: "text-orange-500",
          bgColor: "bg-orange-100",
        };
      default:
        return {
          icon: "help-circle-outline" as const,
          color: "text-gray-500",
          bgColor: "bg-gray-100",
        };
    }
  }, [item.status]);

  const formattedDate = new Date(item.createdAt).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "Chờ xử lý";
      case "PAID":
        return "Đã thanh toán";
      case "CANCELLED":
        return "Đã hủy";
      case "FAILED":
        return "Thất bại";
      case "EXPIRED":
        return "Đã hết hạn";
      case "RETRY":
        return "Thử lại";
      default:
        return status;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center p-4 bg-white border-b border-gray-100 active:bg-gray-50"
    >
      <View
        className={`w-12 h-12 rounded-full items-center justify-center ${styleConfig.bgColor}`}
      >
        <MaterialCommunityIcons
          name={styleConfig.icon}
          size={28}
          className={styleConfig.color}
        />
      </View>
      <View className="flex-1 mx-4">
        <Text
          className="text-base font-semibold text-gray-800"
          numberOfLines={2}
        >
          {item.description}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">{formattedDate}</Text>
        <Text className={`text-sm font-medium mt-1 ${styleConfig.color}`}>
          {getStatusText(item.status)}
        </Text>
      </View>
      <Text className="text-lg font-bold text-gray-800">
        {item.amount.toLocaleString("vi-VN")} VNĐ
      </Text>
    </TouchableOpacity>
  );
};

// --- Component FilterBar ---
const orderStatusOptions = [
  { label: "Tất cả", value: "" },
  { label: "Chờ xử lý", value: "PENDING" },
  { label: "Đã thanh toán", value: "PAID" },
  { label: "Thất bại", value: "FAILED" },
  { label: "Đã hủy", value: "CANCELLED" },
  { label: "Đã hết hạn", value: "EXPIRED" },
  { label: "Thử lại", value: "RETRY" },
];

const FilterBar = ({
  selectedValue,
  onSelect,
}: {
  selectedValue: string;
  onSelect: (value: string) => void;
}) => (
  <View className="flex-row items-center p-2 bg-white">
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="flex-grow"
    >
      {orderStatusOptions.map((option) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => onSelect(option.value)}
          className={`px-4 py-2 rounded-full mr-2 ${
            selectedValue === option.value ? "bg-blue-500" : "bg-gray-50"
          }`}
        >
          <Text
            className={`${
              selectedValue === option.value ? "text-white" : "text-gray-700"
            } font-semibold`}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

// --- Component Modal Bộ lọc Nâng cao ---
const timeRangeOptions = [
  { label: "Tất cả", value: "" },
  { label: "Hôm nay", value: "TODAY" },
  { label: "7 ngày qua", value: "LAST_7_DAYS" },
  { label: "Tháng này", value: "THIS_MONTH" },
];

type AdvancedFilterModalProps = {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: {
    timeRange: string;
    fromDate: string;
    toDate: string;
  }) => void;
  initialValues: { timeRange: string; fromDate: string; toDate: string };
};

const AdvancedFilterModal = ({
  visible,
  onClose,
  onApply,
  initialValues,
}: AdvancedFilterModalProps) => {
  const [currentTimeRange, setCurrentTimeRange] = useState(
    initialValues.timeRange
  );
  const [currentFromDate, setCurrentFromDate] = useState(
    initialValues.fromDate
  );
  const [currentToDate, setCurrentToDate] = useState(initialValues.toDate);

  // BƯỚC 2: THÊM STATE CHO DATEPICKER
  const [showPicker, setShowPicker] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<
    "from" | "to" | null
  >(null);
  const [pickerDate, setPickerDate] = useState(new Date());

  useEffect(() => {
    if (visible) {
      setCurrentTimeRange(initialValues.timeRange);
      setCurrentFromDate(initialValues.fromDate);
      setCurrentToDate(initialValues.toDate);
    }
  }, [visible, initialValues]);

  // Hàm định dạng ngày thành chuỗi 'dd-MM-yyyy'
  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // BƯỚC 3: HÀM MỞ DATEPICKER
  const handleShowPicker = (target: "from" | "to") => {
    setDatePickerTarget(target);
    setShowPicker(true);
  };

  // BƯỚC 4: HÀM XỬ LÝ KHI CHỌN NGÀY
  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false); // Ẩn picker sau khi chọn
    if (event.type === "set" && selectedDate) {
      const formatted = formatDate(selectedDate);
      if (datePickerTarget === "from") {
        setCurrentFromDate(formatted);
      } else if (datePickerTarget === "to") {
        setCurrentToDate(formatted);
      }
      setCurrentTimeRange(""); // Bỏ chọn các khoảng thời gian có sẵn
    }
  };

  const handleTimeRangeSelect = (value: string) => {
    setCurrentTimeRange(value);
    if (value) {
      setCurrentFromDate("");
      setCurrentToDate("");
    }
  };

  const handleApplyClick = () => {
    onApply({
      timeRange: currentTimeRange,
      fromDate: currentFromDate,
      toDate: currentToDate,
    });
  };

  const handleResetClick = () => {
    setCurrentTimeRange("");
    setCurrentFromDate("");
    setCurrentToDate("");
    onApply({ timeRange: "", fromDate: "", toDate: "" });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 justify-end bg-black/50"
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          className="bg-white p-6 rounded-t-2xl"
        >
          <Text className="text-xl font-bold text-center mb-4">
            Bộ lọc nâng cao
          </Text>
          <Text className="text-base font-semibold mb-2 text-gray-700">
            Khoảng thời gian
          </Text>
          <View className="flex-row flex-wrap mb-4">
            {timeRangeOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => handleTimeRangeSelect(opt.value)}
                className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                  currentTimeRange === opt.value ? "bg-blue-500" : "bg-gray-200"
                }`}
              >
                <Text
                  className={
                    currentTimeRange === opt.value
                      ? "text-white"
                      : "text-gray-800"
                  }
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text className="text-base font-semibold mb-2 text-gray-700">
            Ngày tùy chọn
          </Text>

          {/* BƯỚC 5: THAY THẾ TEXTINPUT BẰNG TOUCHABLEOPACITY */}
          <View className="flex-row justify-between mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-sm text-gray-500 mb-1">Từ ngày</Text>
              <TouchableOpacity
                onPress={() => handleShowPicker("from")}
                className="border border-gray-300 rounded-lg p-3 flex-row justify-between items-center"
              >
                <Text className="text-base">
                  {currentFromDate || "Chọn ngày"}
                </Text>
                <MaterialCommunityIcons
                  name="calendar"
                  size={20}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-sm text-gray-500 mb-1">Đến ngày</Text>
              <TouchableOpacity
                onPress={() => handleShowPicker("to")}
                className="border border-gray-300 rounded-lg p-3 flex-row justify-between items-center"
              >
                <Text className="text-base">
                  {currentToDate || "Chọn ngày"}
                </Text>
                <MaterialCommunityIcons
                  name="calendar"
                  size={20}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* BƯỚC 6: HIỂN THỊ DATETIMEPICKER */}
          {showPicker && (
            <DateTimePicker
              value={pickerDate}
              mode="date"
              display="spinner"
              onChange={onDateChange}
              locale="vi-VN"
            />
          )}

          <View className="flex-row mt-4">
            <TouchableOpacity
              onPress={handleResetClick}
              className="flex-1 bg-gray-200 p-4 rounded-full mr-2"
            >
              <Text className="text-gray-800 text-center font-bold text-lg">
                Đặt lại
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApplyClick}
              className="flex-1 bg-blue-500 p-4 rounded-full ml-2"
            >
              <Text className="text-white text-center font-bold text-lg">
                Áp dụng
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// --- Component màn hình chính ---
const OrderHistoryScreen = () => {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  const [selectedStatus, setSelectedStatus] = useState("");
  const [timeRange, setTimeRange] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isAdvancedFilterVisible, setAdvancedFilterVisible] = useState(false);

  const apiParams = useMemo(() => {
    const baseParams: any = {
      page: currentPage,
      size: pageSize,
      sortBy: "createdAt",
      sortDirection: "desc",
    };
    if (selectedStatus) baseParams.status = selectedStatus;
    if (timeRange) baseParams.timeRange = timeRange;
    if (fromDate) baseParams.fromDate = fromDate;
    if (toDate) baseParams.toDate = toDate;

    return baseParams;
  }, [currentPage, pageSize, selectedStatus, timeRange, fromDate, toDate]);

  const {
    data: response,
    isLoading,
    isError,
    isFetching,
  } = useOrdersWithParamsService(
    [selectedStatus, timeRange, fromDate, toDate, currentPage, pageSize],
    { retry: 1 },
    apiParams
  );

  console.log(response?.data?.content[0]);

  useEffect(() => {
    if (response?.data?.content) {
      if (currentPage === 1) {
        setAllOrders(response.data.content);
      } else {
        setAllOrders((prev) => [...prev, ...response.data.content]);
      }
    }
  }, [response]);

  // Refresh data khi focus vào màn hình
  useFocusEffect(
    useCallback(() => {
      // Invalidate và refetch tất cả queries liên quan đến orders
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["orders-filter"] });
      queryClient.invalidateQueries({ queryKey: ["orderByUserId"] });

      // Reset về trang đầu và clear data cũ để load lại từ đầu
      setCurrentPage(1);
      setAllOrders([]);
    }, [queryClient])
  );

  const resetAndFetch = () => {
    setCurrentPage(1);
    setAllOrders([]);
  };

  const handleStatusFilterChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    resetAndFetch();
  };

  const handleApplyAdvancedFilter = (filters: {
    timeRange: string;
    fromDate: string;
    toDate: string;
  }) => {
    setTimeRange(filters.timeRange);
    setFromDate(filters.fromDate);
    setToDate(filters.toDate);
    resetAndFetch();
    setAdvancedFilterVisible(false);
  };

  const handleLoadMore = () => {
    const totalPages = response?.data?.totalPages ?? 1;
    if (!isFetching && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  if (isLoading && currentPage === 1) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-2 text-gray-500">Đang tải đơn hàng...</Text>
      </SafeAreaView>
    );
  }
  if (isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-red-500">Đã xảy ra lỗi khi tải dữ liệu.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center bg-gray-50">
        <View className="flex-1">
          <FilterBar
            selectedValue={selectedStatus}
            onSelect={handleStatusFilterChange}
          />
        </View>
        <TouchableOpacity
          onPress={() => setAdvancedFilterVisible(true)}
          className="p-2 mr-2 bg-white rounded-full"
        >
          <MaterialCommunityIcons
            name="tune-variant"
            size={24}
            color="#3b82f6"
          />
        </TouchableOpacity>
      </View>
      <FlatList
        data={allOrders}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => (
          <OrderItem item={item} onPress={() => setSelectedOrder(item)} />
        )}
        ListEmptyComponent={
          !isFetching ? (
            <View className="flex-1 items-center justify-center mt-20">
              <Text className="text-lg text-gray-500">
                Chưa có đơn hàng nào
              </Text>
            </View>
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetching && currentPage > 1 ? (
            <ActivityIndicator size="small" className="my-4" />
          ) : null
        }
      />

      <AdvancedFilterModal
        visible={isAdvancedFilterVisible}
        onClose={() => setAdvancedFilterVisible(false)}
        onApply={handleApplyAdvancedFilter}
        initialValues={{ timeRange, fromDate, toDate }}
      />

      <Modal
        visible={!!selectedOrder}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedOrder(null)}
      >
        <TouchableOpacity
          className="flex-1 justify-end bg-black/50"
          activeOpacity={1}
          onPress={() => setSelectedOrder(null)}
        >
          <TouchableOpacity
            activeOpacity={1}
            className="bg-white p-6 rounded-t-2xl"
          >
            <Text className="text-xl font-bold text-center mb-4">
              Chi tiết đơn hàng
            </Text>
            <View className="border-b border-gray-200 pb-3 mb-3">
              <Text className="text-sm text-gray-500">Mô tả</Text>
              <Text className="text-base font-semibold mt-1">
                {selectedOrder?.description}
              </Text>
            </View>
            <View className="flex-row justify-between py-3">
              <Text className="text-base text-gray-500">Mã đơn hàng</Text>
              <Text className="text-base font-mono">{selectedOrder?.id}</Text>
            </View>
            <View className="flex-row justify-between py-3">
              <Text className="text-base text-gray-500">Trạng thái</Text>
              <Text className="text-base font-bold text-blue-500">
                {selectedOrder?.status === "PENDING" && "Chờ xử lý"}
                {selectedOrder?.status === "PAID" && "Đã thanh toán"}
                {selectedOrder?.status === "CANCELLED" && "Đã hủy"}
                {selectedOrder?.status === "FAILED" && "Thất bại"}
                {selectedOrder?.status === "EXPIRED" && "Đã hết hạn"}
                {selectedOrder?.status === "RETRY" && "Thử lại"}
              </Text>
            </View>
            <View className="flex-row justify-between py-3 border-t border-gray-200">
              <Text className="text-base font-bold">Tổng tiền</Text>
              <Text className="text-base font-bold text-green-600">
                {selectedOrder?.amount.toLocaleString("vi-VN")} VNĐ
              </Text>
            </View>
            <View className="flex-row justify-between py-3">
              <Text className="text-base text-gray-500">Ngày tạo</Text>
              <Text className="text-base">
                {selectedOrder &&
                  new Date(selectedOrder.createdAt).toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setSelectedOrder(null)}
              className="bg-blue-500 p-4 rounded-full mt-6"
            >
              <Text className="text-white text-center font-bold text-lg">
                Đóng
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default OrderHistoryScreen;
