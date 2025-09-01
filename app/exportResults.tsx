import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface ExportOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  format: string;
}

const exportOptions: ExportOption[] = [
  {
    id: "excel",
    title: "Xuất Excel",
    description: "Danh sách điểm chi tiết theo format Excel",
    icon: "document-outline",
    format: ".xlsx",
  },
  {
    id: "pdf",
    title: "Xuất PDF",
    description: "Báo cáo tổng hợp điểm số dạng PDF",
    icon: "document-text-outline",
    format: ".pdf",
  },
  {
    id: "csv",
    title: "Xuất CSV",
    description: "Dữ liệu thô để import vào hệ thống khác",
    icon: "grid-outline",
    format: ".csv",
  },
];

const quickExportOptions = [
  {
    title: "Danh sách điểm",
    description: "Xuất bảng điểm đầy đủ",
    icon: "list-outline",
  },
  {
    title: "Thống kê tổng hợp",
    description: "Báo cáo phân tích điểm số",
    icon: "analytics-outline",
  },
  {
    title: "Bài không đạt",
    description: "Danh sách học sinh cần học lại",
    icon: "warning-outline",
  },
];

export default function ExportResultsScreen() {
  const router = useRouter();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const toggleOption = (optionId: string) => {
    setSelectedOptions((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleExport = async () => {
    if (selectedOptions.length === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn ít nhất một định dạng xuất file");
      return;
    }

    setIsExporting(true);

    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      Alert.alert(
        "Thành công",
        "Đã xuất kết quả thành công! File sẽ được lưu vào thư mục Downloads.",
        [{ text: "OK" }]
      );
    }, 2000);
  };

  const handleQuickExport = (option: any) => {
    Alert.alert("Xuất nhanh", `Bạn có muốn xuất "${option.title}" không?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xuất",
        onPress: () => {
          console.log("Quick export:", option.title);
          Alert.alert("Thành công", "Đã xuất file thành công!");
        },
      },
    ]);
  };

  const renderExportOption = (option: ExportOption) => (
    <TouchableOpacity
      key={option.id}
      onPress={() => toggleOption(option.id)}
      className={`bg-white rounded-xl p-4 mb-3 border-2 ${
        selectedOptions.includes(option.id)
          ? "border-blue-500"
          : "border-gray-200"
      }`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Ionicons name={option.icon as any} size={24} color="#3B82F6" />
          <View className="ml-3 flex-1">
            <Text
              className="text-lg font-semibold text-gray-900"
              style={{ fontFamily: "CalSans" }}
            >
              {option.title}
            </Text>
            <Text
              className="text-sm text-gray-600 mt-1"
              style={{ fontFamily: "Questrial" }}
            >
              {option.description}
            </Text>
            <Text
              className="text-xs text-blue-600 mt-1 font-medium"
              style={{ fontFamily: "Questrial" }}
            >
              {option.format}
            </Text>
          </View>
        </View>
        <View
          className={`w-6 h-6 rounded-full border-2 ${
            selectedOptions.includes(option.id)
              ? "border-blue-500 bg-blue-500"
              : "border-gray-300"
          } items-center justify-center`}
        >
          {selectedOptions.includes(option.id) && (
            <Ionicons name="checkmark" size={16} color="white" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center"
        >
          <Ionicons name="arrow-back" size={24} color="#292D32" />
          <Text
            className="text-xl font-normal text-black ml-2"
            style={{ fontFamily: "Questrial" }}
          >
            Quay lại
          </Text>
        </TouchableOpacity>
        <Text
          className="text-2xl font-bold text-black ml-4"
          style={{ fontFamily: "CalSans" }}
        >
          Xuất kết quả
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Export Summary */}
        <View className="px-6 py-6 bg-blue-50 border-b border-blue-100">
          <View className="flex-row items-center mb-3">
            <Ionicons name="information-circle" size={24} color="#3B82F6" />
            <Text
              className="text-lg font-semibold text-blue-900 ml-2"
              style={{ fontFamily: "CalSans" }}
            >
              Thông tin xuất file
            </Text>
          </View>
          <Text
            className="text-sm text-blue-800 mb-2"
            style={{ fontFamily: "Questrial" }}
          >
            Đợt chấm: Đợt chấm (1)
          </Text>
          <Text
            className="text-sm text-blue-800 mb-2"
            style={{ fontFamily: "Questrial" }}
          >
            Tổng số bài: 125 bài
          </Text>
          <Text
            className="text-sm text-blue-800"
            style={{ fontFamily: "Questrial" }}
          >
            Ngày xuất: {new Date().toLocaleDateString("vi-VN")}
          </Text>
        </View>

        {/* Export Options */}
        <View className="px-6 py-6">
          <Text
            className="text-lg font-semibold text-gray-900 mb-4"
            style={{ fontFamily: "CalSans" }}
          >
            Chọn định dạng xuất file
          </Text>
          {exportOptions.map(renderExportOption)}
        </View>

        {/* Quick Export */}
        <View className="px-6 pb-6">
          <Text
            className="text-lg font-semibold text-gray-900 mb-4"
            style={{ fontFamily: "CalSans" }}
          >
            Xuất nhanh
          </Text>
          {quickExportOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleQuickExport(option)}
              className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color="#6B7280"
                  />
                  <View className="ml-3 flex-1">
                    <Text
                      className="text-base font-medium text-gray-900"
                      style={{ fontFamily: "Questrial" }}
                    >
                      {option.title}
                    </Text>
                    <Text
                      className="text-sm text-gray-600 mt-1"
                      style={{ fontFamily: "Questrial" }}
                    >
                      {option.description}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Export Button */}
        <View className="px-6 pb-8">
          <TouchableOpacity
            onPress={handleExport}
            disabled={isExporting || selectedOptions.length === 0}
            className={`rounded-xl p-4 ${
              isExporting || selectedOptions.length === 0
                ? "bg-gray-300"
                : "bg-blue-500"
            }`}
          >
            <View className="flex-row items-center justify-center">
              {isExporting && (
                <Ionicons
                  name="sync"
                  size={20}
                  color="white"
                  className="mr-2"
                />
              )}
              <Text
                className={`text-center text-base font-semibold ${
                  isExporting || selectedOptions.length === 0
                    ? "text-gray-500"
                    : "text-white"
                }`}
                style={{ fontFamily: "Questrial" }}
              >
                {isExporting ? "Đang xuất..." : "Xuất file"}
              </Text>
            </View>
          </TouchableOpacity>

          {selectedOptions.length > 0 && (
            <Text
              className="text-center text-sm text-gray-600 mt-2"
              style={{ fontFamily: "Questrial" }}
            >
              Đã chọn {selectedOptions.length} định dạng
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
