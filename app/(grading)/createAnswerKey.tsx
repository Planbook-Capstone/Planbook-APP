import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

// Components
import ExamInfoSection from "../../components/answerKey/ExamInfoSection";
import MultipleChoiceSection from "../../components/answerKey/MultipleChoiceSection";
import TrueFalseSection from "../../components/answerKey/TrueFalseSection";
import EssaySection from "../../components/answerKey/EssaySection";

// Data
import {
  fakeAnswerKeyData,
  emptyAnswerKeyData,
  type AnswerKeyData,
  type MultipleChoiceAnswer,
  type TrueFalseAnswer,
  type Question,
  type TrueFalseQuestion,
  type EssayQuestion,
} from "../../data/answerKeyData";

export default function CreateAnswerKeyScreen() {
  const router = useRouter();
  const { examCode } = useLocalSearchParams<{ examCode?: string }>();
  const { id: idGradingSesstion } = useLocalSearchParams();
  console.log("🔎 ID truyền vào:", idGradingSesstion);

  // Sử dụng fake data hoặc empty data
  const [examData, setExamData] = useState<AnswerKeyData>(emptyAnswerKeyData);
  // Uncomment dòng dưới để sử dụng fake data có sẵn đáp án
  // const [examData, setExamData] = useState<AnswerKeyData>(fakeAnswerKeyData);

  // Set exam code from navigation params
  useEffect(() => {
    if (examCode) {
      setExamData((prev) => ({ ...prev, examCode }));
    }
  }, [examCode]);

  const handleExamCodeChange = (code: string) => {
    setExamData((prev) => ({ ...prev, examCode: code }));
  };

  const handleMultipleChoiceAnswer = (
    questionId: number,
    answer: MultipleChoiceAnswer
  ) => {
    setExamData((prev) => ({
      ...prev,
      multipleChoiceQuestions: prev.multipleChoiceQuestions.map((q) =>
        q.id === questionId ? { ...q, answer } : q
      ),
    }));
  };

  const handleTrueFalseAnswer = (
    subQuestion: keyof TrueFalseQuestion["subQuestions"],
    answer: TrueFalseAnswer
  ) => {
    setExamData((prev) => ({
      ...prev,
      trueFalseQuestion: {
        ...prev.trueFalseQuestion,
        subQuestions: {
          ...prev.trueFalseQuestion.subQuestions,
          [subQuestion]: answer,
        },
      },
    }));
  };

  const handleEssayAnswer = (questionId: number, answer: string) => {
    setExamData((prev) => ({
      ...prev,
      essayQuestions: prev.essayQuestions.map((q) =>
        q.id === questionId ? { ...q, answer } : q
      ),
    }));
  };

  const loadFakeData = () => {
    setExamData(fakeAnswerKeyData);
  };

  const clearData = () => {
    setExamData(emptyAnswerKeyData);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      {/* <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center mr-2"
        >
          <Ionicons name="arrow-back" size={24} color="#292D32" />
          <Text
            className="text-xl font-normal text-black ml-2"
            style={{ fontFamily: "Questrial" }}
          >
            Quay lại | Đáp án {examCode ? `| Mã đề: ${examCode}` : ""}
          </Text>
        </TouchableOpacity>

        <View className="ml-auto flex-row gap-2">
          <TouchableOpacity
            className="px-3 py-2 bg-gray-100 rounded"
            onPress={loadFakeData}
          >
            <Text className="text-sm font-normal text-gray-600">Load Demo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="px-3 py-2 bg-gray-100 rounded"
            onPress={clearData}
          >
            <Text className="text-sm font-normal text-gray-600">Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity className="px-4 py-2">
            <Text className="text-2xl font-normal text-black">Tạo mới</Text>
          </TouchableOpacity>
        </View>
      </View> */}

      <ScrollView
        className="flex-1 px-8 py-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Thông tin chung */}
        <ExamInfoSection
          examCode={examData.examCode}
          onExamCodeChange={handleExamCodeChange}
        />

        {/* Phần 1 - Trắc nghiệm */}
        <MultipleChoiceSection
          questions={examData.multipleChoiceQuestions}
          onAnswerChange={handleMultipleChoiceAnswer}
        />

        {/* Phần 2 - Đúng/sai */}
        <TrueFalseSection
          question={examData.trueFalseQuestion}
          onAnswerChange={handleTrueFalseAnswer}
        />

        {/* Phần 3 - Tự luận */}
        <EssaySection
          questions={examData.essayQuestions}
          onAnswerChange={handleEssayAnswer}
        />

        {/* Save Button */}
        <TouchableOpacity
          className="bg-blue-500 rounded-lg py-4 mt-8 mb-8"
          onPress={() => {
            // Handle save logic here
            console.log("Answer Key Data:", examData);
          }}
        >
          <Text className="text-white text-xl font-semibold text-center">
            Lưu đáp án
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
