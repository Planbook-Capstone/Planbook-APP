import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type MultipleChoiceAnswer = "A" | "B" | "C" | "D" | null;

interface Question {
  id: number;
  answer: MultipleChoiceAnswer;
}

interface MultipleChoiceSectionProps {
  questions: Question[];
  onAnswerChange: (questionId: number, answer: MultipleChoiceAnswer) => void;
  error?: string;
}

const OptionButton = ({
  option,
  isSelected,
  onPress,
}: {
  option: string;
  isSelected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={`w-[54px] h-[54px] rounded-full border border-gray-200 items-center justify-center ${
      isSelected ? "bg-blue-500 border-blue-500" : "bg-white"
    }`}
    style={{
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    }}
  >
    <Text
      className={`text-xl font-normal ${
        isSelected ? "text-white" : "text-black"
      }`}
    >
      {option}
    </Text>
  </TouchableOpacity>
);

export default function MultipleChoiceSection({
  questions,
  onAnswerChange,
  error,
}: MultipleChoiceSectionProps) {
  return (
    <View className="mb-8">
      <Text className="text-xl font-semibold text-black mb-6">
        Phần 1 - Trắc nghiệm
      </Text>

      {questions.map((question) => (
        <View
          key={question.id}
          className="flex-row items-center justify-between mb-6"
        >
          <Text className="text-xl font-normal text-black">
            Câu {question.id}
          </Text>

          <View className="flex-row items-center gap-3">
            {["A", "B", "C", "D"].map((option) => (
              <OptionButton
                key={option}
                option={option}
                isSelected={question.answer === option}
                onPress={() =>
                  onAnswerChange(question.id, option as MultipleChoiceAnswer)
                }
              />
            ))}
          </View>
        </View>
      ))}

      {/* Error message */}
      <View className="h-[20px] mt-1">
        {error && (
          <Text className="text-red-500 text-sm">
            {error}
          </Text>
        )}
      </View>
    </View>
  );
}
