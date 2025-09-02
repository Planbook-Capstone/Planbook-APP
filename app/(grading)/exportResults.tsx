import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

interface ExamCode {
  id: string;
  code: string;
  studentCount: number;
  isCompleted: boolean;
}

// Danh sách mã đề mẫu
const examCodes: ExamCode[] = [
  { id: "1", code: "3128", studentCount: 42, isCompleted: true },
  { id: "2", code: "3129", studentCount: 38, isCompleted: true },
  { id: "3", code: "3130", studentCount: 41, isCompleted: false },
  { id: "4", code: "3131", studentCount: 39, isCompleted: true },
  { id: "5", code: "3132", studentCount: 45, isCompleted: false },
];

export default function ExportResultsScreen() {
  const router = useRouter();
  const { id: idGradingSesstion } = useLocalSearchParams();
  console.log("🔎 ID truyền vào:", idGradingSesstion);

  const handleExamCodePress = (examCode: ExamCode) => {
    // Chuyển đến trang createAnswerKey với mã đề được chọn
    router.push({
      pathname: "/(grading)/createAnswerKey",
      params: { examCode: examCode.code },
    });
  };

  const handleCreateNewExamCode = () => {
    // Chuyển đến trang createAnswerKey để tạo mã đề mới
    router.push(`/(grading)/createAnswerKey?id=${idGradingSesstion}`);
  };

  const renderExamCodeItem = (examCode: ExamCode) => (
    <TouchableOpacity
      key={examCode.id}
      onPress={() => handleExamCodePress(examCode)}
      className="bg-white rounded-full px-4  mb-3 border border-gray-200 flex-row items-center"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        width: 368,
        height: 57,
      }}
    >
      <Ionicons name="key-outline" size={24} color="#292D32" />
      <Text
        className="text-xl font-normal text-black ml-3"
        style={{ fontFamily: "Questrial" }}
      >
        {examCode.code}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-8"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 30 }}
      >
        {/* Create New Exam Code Button */}
        <View className="items-center mt-10">
          <TouchableOpacity
            onPress={handleCreateNewExamCode}
            className="bg-blue-500 rounded-full px-6 py-4 flex-row items-center shadow-md"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
              width: 368,
              height: 57,
            }}
          >
            <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
            <Text
              className="text-xl font-semibold text-white ml-3"
              style={{ fontFamily: "Questrial" }}
            >
              Tạo mã đề mới
            </Text>
          </TouchableOpacity>
        </View>

        {/* Exam Codes List */}
        <View className="items-center">
          {examCodes.map(renderExamCodeItem)}
        </View>

        {/* Instructions */}
        <View className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text
              className="text-base font-semibold text-blue-900 ml-2"
              style={{ fontFamily: "CalSans" }}
            >
              Hướng dẫn
            </Text>
          </View>
          <Text
            className="text-sm text-blue-800"
            style={{ fontFamily: "Questrial" }}
          >
            Bấm vào mã đề để xem và chỉnh sửa đáp án cho từng mã đề cụ thể.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
