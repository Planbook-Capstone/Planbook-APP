import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGetStudentSubmissionId } from "@/services/studentSubmissionService";
import ExamIcon from "@/assets/images/icons/exam.svg";
import { formatVietnameseDateTime } from "@/utils/formatDate";
interface GradedPaper {
  id: number;
  score: number;
  grading_session_id: number;
  answer_sheet_key_id: number;
  student_code: string;
  exam_code: string;
  image_base64: string;
  total_correct: number;
  student_answer_json: any[];
  created_at: string;
  updated_at: string;
}

export default function GradedPapersScreen() {
  const router = useRouter();
  const { id: idGradingSesstion } = useLocalSearchParams();
  const { data: studentSubmissionData } = useGetStudentSubmissionId(
    [idGradingSesstion],
    { retry: 1, staleTime: 0 },
    {
      gradingSessionId: idGradingSesstion,
    }
  );

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
        router.push({
          pathname: "/(grading)/paperDetail",
          params: { id: item.id },
        });
      }}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-sm text-gray-600 font-questrial ">
            Mã học sinh{" "}
            <Text className="font-calsans text-xl">{item?.student_code}</Text>
          </Text>
        </View>
        <View className="items-end">
          <Text
            className="text-2xl font-bold mb-1"
            style={{
              color: getScoreColor(item.score, 10),
              fontFamily: "CalSans",
            }}
          >
            {item.score}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center justify-between">
        <Text
          className="text-sm text-gray-500"
          style={{ fontFamily: "Questrial" }}
        >
          Chấm lúc: {formatVietnameseDateTime(item?.created_at)}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Summary Stats */}
      <View className="flex-row justify-around py-4 bg-white border-b border-gray-100">
        <View className="items-center">
          <Text className="text-3xl font-bold text-blue-600 font-calsans">
            {studentSubmissionData?.data?.length}
          </Text>
          <Text className="text-xl text-gray-600 font-questrial">
            Tổng số bài
          </Text>
        </View>
        {/* <View className="items-center">
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
        </View> */}
      </View>

      {/* Filter Tabs */}
      {/* <View className="flex-row px-6 py-3 gap-2">
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
      </View> */}

      {/* Papers List */}
      <FlatList
        data={studentSubmissionData?.data}
        renderItem={renderPaperItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 24, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <ExamIcon width={80} height={80} />
            <Text className="text-lg font-questrial mt-4">
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
