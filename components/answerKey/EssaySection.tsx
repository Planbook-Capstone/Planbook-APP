import React from "react";
import { View, Text, TextInput } from "react-native";

interface EssayQuestion {
  id: number;
  answer: string;
}

interface EssaySectionProps {
  questions: EssayQuestion[];
  onAnswerChange: (questionId: number, answer: string) => void;
}

export default function EssaySection({
  questions,
  onAnswerChange,
}: EssaySectionProps) {
  return (
    <View className="mb-8">
      <Text className="text-xl font-semibold text-black mb-6">
        Phần 3 - Tự luận
      </Text>

      {questions.map((question) => (
        <View key={question.id} className="mb-4">
          <View className="flex-row items-start gap-3">
            <Text className="text-xl font-normal text-black mt-3">
              Câu {question.id}:
            </Text>

            <View className="flex-1 bg-white border border-gray-200 rounded-md p-4 min-h-fit">
              <TextInput
                value={question.answer}
                onChangeText={(text) => onAnswerChange(question.id, text)}
                placeholder="Nhập đáp án tự luận..."
                placeholderTextColor="rgba(0, 0, 0, 0.25)"
                className="text-base font-normal text-black flex-1"
                multiline={true}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
