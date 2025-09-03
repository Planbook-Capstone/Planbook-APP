import React from "react";
import { Text, TextInput, View } from "react-native";

interface EssayQuestion {
  id: number;
  answer: string;
}

interface EssaySectionProps {
  questions: EssayQuestion[];
  onAnswerChange: (questionId: number, answer: string) => void;
  getFieldError?: (fieldPath: string) => string | undefined;
}

export default function EssaySection({
  questions,
  onAnswerChange,
  getFieldError,
}: EssaySectionProps) {
  return (
    <View className="mb-8">
      <Text className="text-xl font-semibold text-black mb-6">
        Phần 3 - Tự luận
      </Text>

      {questions.map((question, index) => {
        const fieldPath = `essayQuestions.${index}.answer`;
        const error = getFieldError?.(fieldPath);

        return (
          <View key={question.id} className="mb-4">
            <View className="flex-row items-start gap-3">
              <Text className="text-xl font-normal text-black mt-3">
                Câu {question.id}:
              </Text>

              <View className="flex-1">
                <View className={`bg-white border rounded-md p-4 h-[60px] ${
                  error ? 'border-red-500' : 'border-gray-200'
                }`}>
                  <TextInput
                    value={question.answer}
                    onChangeText={(text) => onAnswerChange(question.id, text)}
                    placeholder="Nhập đáp án tự luận..."
                    placeholderTextColor="rgba(0, 0, 0, 0.25)"
                    className="text-base font-normal text-black flex-1"
                    multiline={false}
                    textAlignVertical="center"
                  />
                </View>

                {error && (
                  <Text className="text-red-500 text-sm mt-1 ml-1">
                    {error}
                  </Text>
                )}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}
