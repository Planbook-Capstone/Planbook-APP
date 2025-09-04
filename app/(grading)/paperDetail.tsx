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

interface AnswerSheetKey {
  id: number;
  code: string;
  grading_session_id: number;
  answer_json: AnswerSection[];
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
  answerSheetKey: AnswerSheetKey;
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

  // Mock data for testing
  const mockData = {
    id: 2,
    score: 2.6,
    grading_session_id: 1,
    answer_sheet_key_id: 2,
    student_code: "121232",
    exam_code: "342",
    image_base64: "https://zzfjygzmhvvsvycmvrlm.supabase.co/storage/v1/object/public/biteologystorage/marked_images/20250904_170453_311bfd5b.png?",
    total_correct: 9,
    student_answer_json: [
      {
        sectionOrder: 1,
        sectionType: "MULTIPLE_CHOICE",
        questions: [
          { questionNumber: 1, answer: "A", isCorrect: true },
          { questionNumber: 2, answer: "B", isCorrect: true },
          { questionNumber: 3, answer: "C", isCorrect: true },
          { questionNumber: 4, answer: "B", isCorrect: false },
          { questionNumber: 5, answer: "A", isCorrect: true },
        ],
      },
      {
        sectionOrder: 2,
        sectionType: "TRUE_FALSE",
        questions: [
          {
            questionNumber: 1,
            answer: {
              a: { answer: "D", isCorrect: true },
              b: { answer: "D", isCorrect: false },
              c: { answer: "S", isCorrect: false },
              d: { answer: "S", isCorrect: false },
            },
          },
        ],
      },
      {
        sectionOrder: 3,
        sectionType: "ESSAY_CODE",
        questions: [
          { questionNumber: 1, answer: "00,1", isCorrect: false },
          { questionNumber: 2, answer: "2025", isCorrect: false },
        ],
      },
    ],
    answerSheetKey: {
      id: 2,
      code: "342",
      grading_session_id: 1,
      answer_json: [
        {
          sectionOrder: 1,
          sectionType: "MULTIPLE_CHOICE",
          questions: [
            { questionNumber: 1, answer: "A" },
            { questionNumber: 2, answer: "B" },
            { questionNumber: 3, answer: "C" },
            { questionNumber: 4, answer: "D" },
            { questionNumber: 5, answer: "A" },
          ],
        },
        {
          sectionOrder: 2,
          sectionType: "TRUE_FALSE",
          questions: [
            {
              questionNumber: 1,
              answer: { a: "Đ", b: "S", c: "Đ", d: "Đ" },
            },
          ],
        },
        {
          sectionOrder: 3,
          sectionType: "ESSAY_CODE",
          questions: [
            { questionNumber: 1, answer: "-3,2" },
            { questionNumber: 2, answer: "10" },
          ],
        },
      ],
    },
    created_at: "2025-09-04T17:04:56.0777",
    updated_at: "2025-09-04T17:04:56.0777",
  };

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

  const renderMultipleChoiceSection = (section: AnswerSection) => {
    // Find corresponding teacher answer section
    const teacherSection = currentData?.answerSheetKey?.answer_json?.find(
      (s: AnswerSection) => s.sectionType === "MULTIPLE_CHOICE"
    );

    return (
      <View className="mb-6">
        <Text className="text-xl font-semibold text-black mb-4 font-calsans">
          {getSectionName(section.sectionType)}
        </Text>

        {section.questions.map((question) => {
          // Find corresponding teacher answer
          const teacherAnswer = teacherSection?.questions?.find(
            (q: any) => q.questionNumber === question.questionNumber
          );

          return (
            <View
              key={question.questionNumber}
              className="mb-4 p-4 bg-white rounded-lg border border-gray-200"
            >
              <Text className="text-lg font-questrial mb-3">
                Câu {question.questionNumber}
              </Text>

              <View className="flex-row justify-between items-center">
                {/* Student Answer */}
                <View className="flex-1 mr-4">
                  <Text className="text-sm font-questrial text-gray-600 mb-2">
                    Đáp án học sinh:
                  </Text>
                  <View className="flex-row items-center gap-2">
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
                    <Ionicons
                      name={question.isCorrect ? "checkmark-circle" : "close-circle"}
                      size={20}
                      color={question.isCorrect ? "#10B981" : "#EF4444"}
                    />
                  </View>
                </View>

                {/* Teacher Answer */}
                <View className="flex-1">
                  <Text className="text-sm font-questrial text-gray-600 mb-2">
                    Đáp án đúng:
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <View className="w-10 h-10 rounded-full items-center justify-center bg-blue-100 border-blue-500 border-2">
                      <Text className="text-lg font-semibold text-blue-700">
                        {teacherAnswer?.answer || "?"}
                      </Text>
                    </View>
                    <Ionicons
                      name="school-outline"
                      size={20}
                      color="#3B82F6"
                    />
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderTrueFalseSection = (section: AnswerSection) => {
    // Find corresponding teacher answer section
    const teacherSection = currentData?.answerSheetKey?.answer_json?.find(
      (s: AnswerSection) => s.sectionType === "TRUE_FALSE"
    );

    return (
      <View className="mb-6">
        <Text className="text-xl font-semibold text-black mb-4 font-calsans">
          {getSectionName(section.sectionType)}
        </Text>

        {section.questions.map((question) => {
          // Find corresponding teacher answer
          const teacherAnswer = teacherSection?.questions?.find(
            (q: any) => q.questionNumber === question.questionNumber
          );

          return (
            <View
              key={question.questionNumber}
              className="mb-6 p-4 bg-white rounded-lg border border-gray-200"
            >
              <Text className="text-lg font-questrial mb-3">
                Câu {question.questionNumber}
              </Text>

              <View className="gap-3">
                {Object.entries(question.answer).map(
                  ([subKey, subAnswer]: [string, any]) => {
                    const teacherSubAnswer = teacherAnswer?.answer?.[subKey];

                    return (
                      <View key={subKey} className="pl-4">
                        <Text className="text-base font-calsans mb-2">{subKey.toUpperCase()}</Text>

                        <View className="flex-row justify-between items-center">
                          {/* Student Answer */}
                          <View className="flex-1 mr-4">
                            <Text className="text-xs font-questrial text-gray-600 mb-1">
                              Học sinh:
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
                                size={16}
                                color={subAnswer.isCorrect ? "#10B981" : "#EF4444"}
                              />
                            </View>
                          </View>

                          {/* Teacher Answer */}
                          <View className="flex-1">
                            <Text className="text-xs font-questrial text-gray-600 mb-1">
                              Đáp án đúng:
                            </Text>
                            <View className="flex-row items-center gap-2">
                              <View className="w-8 h-8 rounded-full items-center justify-center bg-blue-100 border-blue-500 border-2">
                                <Text className="text-sm font-semibold text-blue-700">
                                  {teacherSubAnswer || "?"}
                                </Text>
                              </View>
                              <Ionicons
                                name="school-outline"
                                size={16}
                                color="#3B82F6"
                              />
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  }
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderEssaySection = (section: AnswerSection) => {
    // Find corresponding teacher answer section
    const teacherSection = currentData?.answerSheetKey?.answer_json?.find(
      (s: AnswerSection) => s.sectionType === "ESSAY_CODE"
    );

    return (
      <View className="mb-6">
        <Text className="text-xl font-semibold text-black mb-4 font-calsans">
          {getSectionName(section.sectionType)}
        </Text>

        {section.questions.map((question) => {
          // Find corresponding teacher answer
          const teacherAnswer = teacherSection?.questions?.find(
            (q: any) => q.questionNumber === question.questionNumber
          );

          return (
            <View
              key={question.questionNumber}
              className="mb-4 p-4 bg-white rounded-lg border border-gray-200"
            >
              <Text className="text-lg font-questrial mb-3">
                Câu {question.questionNumber}
              </Text>

              <View className="gap-3">
                {/* Student Answer */}
                <View>
                  <Text className="text-sm font-questrial text-gray-600 mb-2">
                    Đáp án học sinh:
                  </Text>
                  <View className="flex-row items-center gap-3">
                    <View className="flex-1 bg-gray-50 border border-gray-200 rounded-md p-3">
                      <Text className="text-base font-questrial text-gray-800">
                        {question.answer}
                      </Text>
                    </View>
                    <View
                      className={`px-3 py-2 rounded-md items-center justify-center ${
                        question.isCorrect
                          ? "bg-green-100 border-green-500"
                          : "bg-red-100 border-red-500"
                      } border-2`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          question.isCorrect ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {question.isCorrect ? "Đúng" : "Sai"}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Teacher Answer */}
                <View>
                  <Text className="text-sm font-questrial text-gray-600 mb-2">
                    Đáp án đúng:
                  </Text>
                  <View className="flex-row items-center gap-3">
                    <View className="flex-1 bg-blue-50 border border-blue-200 rounded-md p-3">
                      <Text className="text-base font-questrial text-blue-800">
                        {teacherAnswer?.answer || "Chưa có đáp án"}
                      </Text>
                    </View>
                    <View className="px-3 py-2 rounded-md items-center justify-center bg-blue-100 border-blue-500 border-2">
                      <Ionicons
                        name="school-outline"
                        size={16}
                        color="#3B82F6"
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

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

          {/* Legend */}
          <View className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
            <Text className="text-sm font-semibold font-questrial mb-2 text-gray-700">
              Chú thích:
            </Text>
            <View className="flex-row justify-between">
              <View className="flex-row items-center gap-2">
                <View className="w-6 h-6 rounded-full bg-green-100 border-green-500 border-2 items-center justify-center">
                  <Ionicons name="checkmark" size={12} color="#10B981" />
                </View>
                <Text className="text-xs font-questrial text-gray-600">Học sinh đúng</Text>
              </View>

              <View className="flex-row items-center gap-2">
                <View className="w-6 h-6 rounded-full bg-red-100 border-red-500 border-2 items-center justify-center">
                  <Ionicons name="close" size={12} color="#EF4444" />
                </View>
                <Text className="text-xs font-questrial text-gray-600">Học sinh sai</Text>
              </View>

              <View className="flex-row items-center gap-2">
                <View className="w-6 h-6 rounded-full bg-blue-100 border-blue-500 border-2 items-center justify-center">
                  <Ionicons name="school" size={12} color="#3B82F6" />
                </View>
                <Text className="text-xs font-questrial text-gray-600">Đáp án chuẩn</Text>
              </View>
            </View>
          </View>

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
