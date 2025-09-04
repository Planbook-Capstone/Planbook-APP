import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGetStudentSubmissionBySubmissonId } from "@/services/studentSubmissionService";
import { formatVietnameseDateTime } from "@/utils/formatDate";

// Types
interface StudentAnswer {
  questionNumber: number;
  answer: string | any;
  isCorrect?: boolean;
}

interface AnswerSection {
  sectionOrder: number;
  sectionType: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "ESSAY_CODE";
  questions: StudentAnswer[];
}

interface StudentSubmission {
  id: number;
  score: number;
  grading_session_id: number;
  answer_sheet_key_id: number;
  student_code: string;
  exam_code: string;
  image_base64: string;
  total_correct: number;
  student_answer_json: AnswerSection[];
  created_at: string;
  updated_at: string;
}

export default function PaperDetailScreen() {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedSection, setSelectedSection] = useState<number>(1);

  // Get student submission data by ID
  const { data: submissionData } = useGetStudentSubmissionBySubmissonId(
    id as string
  );

  // Use actual data if available, otherwise use mock data
  const currentData = submissionData?.data || [];

  // Loading state
  if (!currentData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600 font-questrial">
          Đang tải dữ liệu...
        </Text>
      </SafeAreaView>
    );
  }

  const getSectionName = (sectionType: string) => {
    switch (sectionType) {
      case "MULTIPLE_CHOICE":
        return "Trắc nghiệm";
      case "TRUE_FALSE":
        return "Đúng/Sai";
      case "ESSAY_CODE":
        return "Tự luận";
      default:
        return "Không xác định";
    }
  };

  const getScoreColor = (score: number, maxScore: number = 10) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "#10B981";
    if (percentage >= 65) return "#F59E0B";
    return "#EF4444";
  };

  const renderMultipleChoiceSection = (section: AnswerSection) => (
    <View className="mb-6">
      <Text className="text-xl font-semibold text-black mb-4 font-calsans">
        {getSectionName(section.sectionType)}
      </Text>

      {section.questions.map((question) => (
        <View
          key={question.questionNumber}
          className="flex-row items-center justify-between mb-4 p-4 bg-white rounded-lg border border-gray-200"
        >
          <Text className="text-lg font-questrial">
            Câu {question.questionNumber}
          </Text>

          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-questrial text-gray-600">
                Đáp án:
              </Text>
              <View
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  question.isCorrect
                    ? "bg-green-100 border-green-500"
                    : "bg-red-100 border-red-500"
                } border-2`}
              >
                <Text
                  className={`text-lg font-semibold ${
                    question.isCorrect ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {question.answer}
                </Text>
              </View>
            </View>

            <Ionicons
              name={question.isCorrect ? "checkmark-circle" : "close-circle"}
              size={24}
              color={question.isCorrect ? "#10B981" : "#EF4444"}
            />
          </View>
        </View>
      ))}
    </View>
  );

  const renderTrueFalseSection = (section: AnswerSection) => (
    <View className="mb-6">
      <Text className="text-xl font-semibold text-black mb-4 font-calsans">
        {getSectionName(section.sectionType)}
      </Text>

      {section.questions.map((question) => (
        <View
          key={question.questionNumber}
          className="mb-6 p-4 bg-white rounded-lg border border-gray-200"
        >
          <Text className="text-lg font-questrial mb-3">
            Câu {question.questionNumber}
          </Text>

          <View className="gap-2">
            {Object.entries(question.answer).map(
              ([subKey, subAnswer]: [string, any]) => (
                <View
                  key={subKey}
                  className="flex-row items-center justify-between pl-4"
                >
                  <Text className="text-base font-questrial">
                    {subKey.toUpperCase()}
                  </Text>

                  <View className="flex-row items-center gap-2">
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center ${
                        subAnswer.isCorrect
                          ? "bg-green-100 border-green-500"
                          : "bg-red-100 border-red-500"
                      } border-2`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          subAnswer.isCorrect
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {subAnswer.answer === "D" ? "Đ" : "S"}
                      </Text>
                    </View>

                    <Ionicons
                      name={
                        subAnswer.isCorrect
                          ? "checkmark-circle"
                          : "close-circle"
                      }
                      size={20}
                      color={subAnswer.isCorrect ? "#10B981" : "#EF4444"}
                    />
                  </View>
                </View>
              )
            )}
          </View>
        </View>
      ))}
    </View>
  );

  const renderEssaySection = (section: AnswerSection) => (
    <View className="mb-6">
      <Text className="text-xl font-semibold text-black mb-4 font-calsans">
        {getSectionName(section.sectionType)}
      </Text>

      {section.questions.map((question) => (
        <View
          key={question.questionNumber}
          className="flex-row items-center justify-between mb-4 p-4 bg-white rounded-lg border border-gray-200"
        >
          <Text className="text-lg font-questrial">
            Câu {question.questionNumber}
          </Text>

          <View className="flex flex-row gap-5 ml-4">
            <View className="bg-gray-50 border border-gray-200 rounded-md p-3">
              <Text className="text-base font-questrial text-gray-800">
                {question.answer}
              </Text>
            </View>
            <View
              className={`w-1/2 rounded-md items-center justify-center ${
                question.isCorrect
                  ? "bg-green-100 border-green-500"
                  : "bg-red-100 border-red-500"
              } border-2`}
            >
              <Text
                className={`text-lg font-semibold ${
                  question.isCorrect ? "text-green-700" : "text-red-700"
                }`}
              >
                {question.answer}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Student Info */}
        <View className="bg-white mx-6 mt-6 p-6 rounded-xl border border-gray-200">
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-sm text-gray-600 font-questrial">
                Mã học sinh
              </Text>
              <Text className="text-2xl font-bold font-calsans">
                {currentData?.student_code}
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-sm text-gray-600 font-questrial">
                Điểm số
              </Text>
              <Text
                className="text-3xl font-bold font-calsans"
                style={{ color: getScoreColor(currentData.score) }}
              >
                {currentData.score}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between">
            <View>
              <Text className="text-sm text-gray-600 font-questrial">
                Số câu đúng
              </Text>
              <Text className="text-lg font-semibold font-calsans text-green-600">
                {currentData.total_correct}
              </Text>
            </View>

            <View>
              <Text className="text-sm text-gray-600 font-questrial">
                Mã đề
              </Text>
              <Text className="text-lg font-semibold font-calsans">
                {currentData.exam_code}
              </Text>
            </View>
          </View>

          <View className="mt-4 pt-4 border-t border-gray-200">
            <Text className="text-sm text-gray-600 font-questrial">
              Thời gian chấm: {formatVietnameseDateTime(currentData.created_at)}
            </Text>
          </View>
        </View>

        {/* Answer Sheet Image */}
        <View className="mx-6 mt-6">
          <Text className="text-lg font-semibold font-calsans mb-3">
            Ảnh bài làm
          </Text>
          <TouchableOpacity
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            onPress={() => setIsImageOpen(true)}
          >
            <Image
              source={{ uri: currentData.image_base64 }}
              className="w-full h-96"
              resizeMode="contain"
            />
            <View className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-2">
              <Ionicons name="expand-outline" size={20} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Section Tabs */}
        <View className="mx-6 mt-6">
          <Text className="text-lg font-semibold font-calsans mb-3">
            Chi tiết đáp án
          </Text>

          <View className="flex-row mb-4">
            {currentData?.student_answer_json?.map((section: AnswerSection) => (
              <TouchableOpacity
                key={section.sectionOrder}
                onPress={() => setSelectedSection(section.sectionOrder)}
                className={`flex-1 py-3 px-4 rounded-lg mr-2 ${
                  selectedSection === section.sectionOrder
                    ? "bg-blue-500"
                    : "bg-white border border-gray-200"
                }`}
              >
                <Text
                  className={`text-center font-questrial ${
                    selectedSection === section.sectionOrder
                      ? "text-white font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {getSectionName(section.sectionType)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Modal visible={isImageOpen} transparent={true}>
            <View className="flex-1 bg-black">
              {/* Nút đóng */}
              <TouchableOpacity
                onPress={() => setIsImageOpen(false)}
                className="absolute top-12 right-6 z-50"
              >
                <Ionicons name="close-circle" size={36} color="white" />
              </TouchableOpacity>

              {/* Zoom ảnh */}
              <ScrollView
                style={{ flex: 1 }}
                maximumZoomScale={5}
                minimumZoomScale={1}
                contentContainerStyle={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={{ uri: currentData.image_base64 }}
                  style={{
                    width: "100%",
                    height: "100%",
                    resizeMode: "contain",
                  }}
                />
              </ScrollView>
            </View>
          </Modal>
          {/* Section Content */}
          {currentData?.student_answer_json
            ?.filter(
              (section: AnswerSection) =>
                section.sectionOrder === selectedSection
            )
            .map((section: AnswerSection) => (
              <View key={section.sectionOrder}>
                {section.sectionType === "MULTIPLE_CHOICE" &&
                  renderMultipleChoiceSection(section)}
                {section.sectionType === "TRUE_FALSE" &&
                  renderTrueFalseSection(section)}
                {section.sectionType === "ESSAY_CODE" &&
                  renderEssaySection(section)}
              </View>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
