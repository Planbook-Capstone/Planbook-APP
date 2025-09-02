import React from "react";
import { Text, View } from "react-native";
import TrueFalseItem from "./TrueFalseItem";

type TrueFalseAnswer = "Đ" | "S" | null;

interface TrueFalseQuestion {
  id: number;
  subQuestions: {
    a: TrueFalseAnswer;
    b: TrueFalseAnswer;
    c: TrueFalseAnswer;
    d: TrueFalseAnswer;
  };
}

interface TrueFalseSectionProps {
  questions: TrueFalseQuestion[]; // Array of questions instead of single question
  onAnswerChange: (
    questionId: number,
    subQuestion: keyof TrueFalseQuestion["subQuestions"],
    answer: TrueFalseAnswer
  ) => void;
  error?: string;
}

export default function TrueFalseSection({
  questions,
  onAnswerChange,
  error,
}: TrueFalseSectionProps) {
  return (
    <View className="mb-8">
      <Text className="text-xl font-semibold text-black mb-6">
        Phần 2 - Đúng/sai
      </Text>

      {questions.map((question) => (
        <View key={question.id} className="mb-6">
          <Text className="text-xl font-normal text-black mb-2">Câu {question.id}:</Text>

          <View className="gap-2">
            <TrueFalseItem
              label="a"
              selectedAnswer={question.subQuestions.a}
              onAnswerChange={(answer) => onAnswerChange(question.id, "a", answer)}
            />
            <TrueFalseItem
              label="b"
              selectedAnswer={question.subQuestions.b}
              onAnswerChange={(answer) => onAnswerChange(question.id, "b", answer)}
            />
            <TrueFalseItem
              label="c"
              selectedAnswer={question.subQuestions.c}
              onAnswerChange={(answer) => onAnswerChange(question.id, "c", answer)}
            />
            <TrueFalseItem
              label="d"
              selectedAnswer={question.subQuestions.d}
              onAnswerChange={(answer) => onAnswerChange(question.id, "d", answer)}
            />
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
