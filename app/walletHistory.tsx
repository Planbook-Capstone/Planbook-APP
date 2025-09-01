import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
  TextInput, // Giữ lại TextInput nếu cần ở nơi khác, nhưng không dùng trong modal nữa
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState, useEffect } from "react";
import { useWalletTransactionsService } from "@/services/walletServices";
import { Transaction } from "@/types/wallet";
// BƯỚC 1: IMPORT DATETIMEPICKER
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

// --- Component TransactionItem (Không thay đổi) ---
type TransactionItemProps = {
  item: Transaction;
  onPress: () => void;
};
const TransactionItem = ({ item, onPress }: TransactionItemProps) => {
  const isDebit = item.type === "TOOL_USAGE";
  const styleConfig = useMemo(() => {
    if (!isDebit) {
      return {
        icon: "credit-card-plus-outline" as const,
        color: "text-green-500",
      };
    }
    return {
      icon: "credit-card-minus-outline" as const,
      color: "text-red-500",
    };
  }, [isDebit]);

  const formattedDate = new Date(item.createdAt).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center p-4 bg-white border-b border-gray-100 active:bg-gray-50"
    >
      <View
        className={`w-12 h-12 rounded-full items-center justify-center ${
          !isDebit ? "bg-green-100" : "bg-red-100"
        }`}
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
      </View>
      <Text className={`text-lg font-bold ${styleConfig.color}`}>
        {item.tokenChange.toLocaleString("vi-VN")}
      </Text>
    </TouchableOpacity>
  );
};

// --- Component FilterBar (Không thay đổi) ---
const transactionTypeOptions = [
  { label: "Tất cả", value: "" },
  { label: "Nạp tiền", value: "RECHARGE" },
  { label: "Sử dụng", value: "TOOL_USAGE" },
  { label: "Hoàn tiền", value: "REFUND" },
  { label: "Thưởng", value: "REWARD" },
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
      {transactionTypeOptions.map((option) => (
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

// --- Component Modal Bộ lọc Nâng cao (ĐÃ CẬP NHẬT) ---
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
  const [datePickerTarget, setDatePickerTarget] = useState<"from" | "to" | null>(null);
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
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
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
    if (event.type === 'set' && selectedDate) {
      const formatted = formatDate(selectedDate);
      if (datePickerTarget === 'from') {
        setCurrentFromDate(formatted);
      } else if (datePickerTarget === 'to') {
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
                  currentTimeRange === opt.value
                    ? "bg-blue-500"
                    : "bg-gray-200"
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
                <Text className="text-base">{currentFromDate || "Chọn ngày"}</Text>
                <MaterialCommunityIcons name="calendar" size={20} color="gray" />
              </TouchableOpacity>
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-sm text-gray-500 mb-1">Đến ngày</Text>
              <TouchableOpacity
                onPress={() => handleShowPicker("to")}
                className="border border-gray-300 rounded-lg p-3 flex-row justify-between items-center"
              >
                <Text className="text-base">{currentToDate || "Chọn ngày"}</Text>
                <MaterialCommunityIcons name="calendar" size={20} color="gray" />
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

// --- Component màn hình chính (Không thay đổi) ---
const WalletHistoryScreen = () => {
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

  const [selectedType, setSelectedType] = useState("");
  const [timeRange, setTimeRange] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isAdvancedFilterVisible, setAdvancedFilterVisible] = useState(false);

  const apiParams = useMemo(() => {
    const baseParams: any = {
      page: currentPage,
      size: pageSize,
      sortBy: "createdAt",
      sortDir: "desc",
    };
    if (selectedType) baseParams.type = selectedType;
    if (timeRange) baseParams.timeRange = timeRange;
    if (fromDate) baseParams.fromDate = fromDate;
    if (toDate) baseParams.toDate = toDate;

    return baseParams;
  }, [currentPage, pageSize, selectedType, timeRange, fromDate, toDate]);

  const {
    data: response,
    isLoading,
    isError,
    isFetching,
  } = useWalletTransactionsService(
    [selectedType, timeRange, fromDate, toDate, currentPage, pageSize],
    { retry: 1 },
    apiParams
  );

  useEffect(() => {
    if (response?.data?.content) {
      if (currentPage === 1) {
        setAllTransactions(response.data.content);
      } else {
        setAllTransactions((prev) => [...prev, ...response.data.content]);
      }
    }
  }, [response]);

  const resetAndFetch = () => {
    setCurrentPage(1);
    setAllTransactions([]);
  };

  const handleTypeFilterChange = (newType: string) => {
    setSelectedType(newType);
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

  const tokenAfter = useMemo(() => {
    if (!selectedTransaction) return 0;
    const change =
      selectedTransaction.type === "TOOL_USAGE"
        ? -selectedTransaction.tokenChange
        : selectedTransaction.tokenChange;
    return selectedTransaction.tokenBefore + change;
  }, [selectedTransaction]);

  if (isLoading && currentPage === 1) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-2 text-gray-500">Đang tải giao dịch...</Text>
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
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center bg-gray-50">
        <View className="flex-1">
          <FilterBar
            selectedValue={selectedType}
            onSelect={handleTypeFilterChange}
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
        data={allTransactions}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => (
          <TransactionItem
            item={item}
            onPress={() => setSelectedTransaction(item)}
          />
        )}
        ListEmptyComponent={
          !isFetching ? (
            <View className="flex-1 items-center justify-center mt-20">
              <Text className="text-lg text-gray-500">
                Chưa có giao dịch nào
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
        visible={!!selectedTransaction}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedTransaction(null)}
      >
        <TouchableOpacity
          className="flex-1 justify-end bg-black/50"
          activeOpacity={1}
          onPress={() => setSelectedTransaction(null)}
        >
          <TouchableOpacity
            activeOpacity={1}
            className="bg-white p-6 rounded-t-2xl"
          >
            <Text className="text-xl font-bold text-center mb-4">
              Chi tiết giao dịch
            </Text>
            <View className="border-b border-gray-200 pb-3 mb-3">
              <Text className="text-sm text-gray-500">Mô tả</Text>
              <Text className="text-base font-semibold mt-1">
                {selectedTransaction?.description}
              </Text>
            </View>
            <View className="flex-row justify-between py-3">
              <Text className="text-base text-gray-500">Số token trước</Text>
              <Text className="text-base">
                {selectedTransaction?.tokenBefore.toLocaleString("vi-VN")}
              </Text>
            </View>
            <View className="flex-row justify-between py-3">
              <Text className="text-base text-gray-500">Thay đổi</Text>
              <Text
                className={`text-base font-bold ${
                  selectedTransaction?.type !== "TOOL_USAGE"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {selectedTransaction?.type !== "TOOL_USAGE" ? "+" : "-"}
                {selectedTransaction?.tokenChange.toLocaleString("vi-VN")}
              </Text>
            </View>
            <View className="flex-row justify-between py-3 border-t border-gray-200">
              <Text className="text-base font-bold">Số token sau</Text>
              <Text className="text-base font-bold">
                {tokenAfter.toLocaleString("vi-VN")}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setSelectedTransaction(null)}
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

export default WalletHistoryScreen;