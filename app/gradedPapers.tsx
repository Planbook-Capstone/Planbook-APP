import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface GradedPaper {
  id: string;
  studentId: string;
  studentName: string;
  score: number;
  maxScore: number;
  gradedAt: string;
  status: "completed" | "pending" | "error";
}

const mockGradedPapers: GradedPaper[] = [
  {
    id: "1",
    studentId: "SV001",
    studentName: "Nguyễn Văn An",
    score: 8.5,
    maxScore: 10,
    gradedAt: "30-08-2025 14:30",
    status: "completed",
  },
  {
    id: "2",
    studentId: "SV002",
    studentName: "Trần Thị Bảo",
    score: 7.2,
    maxScore: 10,
    gradedAt: "30-08-2025 14:25",
    status: "completed",
  },
  {
    id: "3",
    studentId: "SV003",
    studentName: "Lê Hoàng Cường",
    score: 9.0,
    maxScore: 10,
    gradedAt: "30-08-2025 14:20",
    status: "completed",
  },
  {
    id: "4",
    studentId: "SV004",
    studentName: "Phạm Thị Dung",
    score: 0,
    maxScore: 10,
    gradedAt: "30-08-2025 14:15",
    status: "error",
  },
  {
    id: "5",
    studentId: "SV005",
    studentName: "Võ Minh Dần",
    score: 6.8,
    maxScore: 10,
    gradedAt: "30-08-2025 14:10",
    status: "completed",
  },
];

export default function GradedPapersScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "completed" | "error"
  >("all");

  const filteredPapers = mockGradedPapers.filter((paper) => {
    if (selectedFilter === "all") return true;
    return paper.status === selectedFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#10B981";
      case "error":
        return "#EF4444";
      case "pending":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "error":
        return "Lỗi";
      case "pending":
        return "Đang xử lý";
      default:
        return "Không xác định";
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "#10B981";
    if (percentage >= 65) return "#F59E0B";
    return "#EF4444";
  };

  const renderPaperItem = ({ item }: { item: GradedPaper }) => (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
      onPress={() => {
        // Navigate to detailed view
        console.log("View details for paper:", item.id);
      }}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text
            className="text-lg font-semibold text-gray-900 mb-1"
            style={{ fontFamily: "CalSans" }}
          >
            {item.studentName}
          </Text>
          <Text
            className="text-sm text-gray-600"
            style={{ fontFamily: "Questrial" }}
          >
            {item.studentId}
          </Text>
        </View>
        <View className="items-end">
          <Text
            className="text-2xl font-bold mb-1"
            style={{
              color: getScoreColor(item.score, item.maxScore),
              fontFamily: "CalSans",
            }}
          >
            {item.score}/{item.maxScore}
          </Text>
          <View className="flex-row items-center">
            <View
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: getStatusColor(item.status) }}
            />
            <Text
              className="text-xs"
              style={{
                color: getStatusColor(item.status),
                fontFamily: "Questrial",
              }}
            >
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
      </View>
      <View className="flex-row items-center justify-between">
        <Text
          className="text-sm text-gray-500"
          style={{ fontFamily: "Questrial" }}
        >
          Chấm lúc: {item.gradedAt}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
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
          Bài đã chấm
        </Text>
      </View>

      {/* Summary Stats */}
      <View className="flex-row justify-around py-4 bg-gray-50 border-b border-gray-100">
        <View className="items-center">
          <Text
            className="text-2xl font-bold text-blue-600"
            style={{ fontFamily: "CalSans" }}
          >
            {filteredPapers.length}
          </Text>
          <Text
            className="text-sm text-gray-600"
            style={{ fontFamily: "Questrial" }}
          >
            Tổng số bài
          </Text>
        </View>
        <View className="items-center">
          <Text
            className="text-2xl font-bold text-green-600"
            style={{ fontFamily: "CalSans" }}
          >
            {filteredPapers.filter((p) => p.status === "completed").length}
          </Text>
          <Text
            className="text-sm text-gray-600"
            style={{ fontFamily: "Questrial" }}
          >
            Hoàn thành
          </Text>
        </View>
        <View className="items-center">
          <Text
            className="text-2xl font-bold text-red-600"
            style={{ fontFamily: "CalSans" }}
          >
            {filteredPapers.filter((p) => p.status === "error").length}
          </Text>
          <Text
            className="text-sm text-gray-600"
            style={{ fontFamily: "Questrial" }}
          >
            Lỗi
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-6 py-3 gap-2">
        {[
          { key: "all", label: "Tất cả" },
          { key: "completed", label: "Hoàn thành" },
          { key: "error", label: "Lỗi" },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            onPress={() => setSelectedFilter(filter.key as any)}
            className={`px-4 py-2 rounded-full ${
              selectedFilter === filter.key ? "bg-blue-500" : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                selectedFilter === filter.key ? "text-white" : "text-gray-700"
              }`}
              style={{ fontFamily: "Questrial" }}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Papers List */}
      <FlatList
        data={filteredPapers}
        renderItem={renderPaperItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
            <Text
              className="text-lg text-gray-500 mt-4"
              style={{ fontFamily: "Questrial" }}
            >
              Không có bài đã chấm
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-blue-500 rounded-full p-4"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={() => {
          // Export or share functionality
          console.log("Export graded papers");
        }}
      >
        <Ionicons name="share-outline" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
