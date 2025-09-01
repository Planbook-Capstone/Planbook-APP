import React from "react";
import { View, Text } from "react-native";
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
  question: TrueFalseQuestion;
  onAnswerChange: (
    subQuestion: keyof TrueFalseQuestion["subQuestions"],
    answer: TrueFalseAnswer
  ) => void;
}

export default function TrueFalseSection({
  question,
  onAnswerChange,
}: TrueFalseSectionProps) {
  return (
    <View className="mb-8">
      <Text className="text-xl font-semibold text-black mb-6">
        Phần 2 - Đúng/sai
      </Text>

      <View className="gap-2">
        <Text className="text-xl font-normal text-black mb-1">Câu 1:</Text>

        <TrueFalseItem
          label="a"
          selectedAnswer={question.subQuestions.a}
          onAnswerChange={(answer) => onAnswerChange("a", answer)}
        />

        <TrueFalseItem
          label="b"
          selectedAnswer={question.subQuestions.b}
          onAnswerChange={(answer) => onAnswerChange("b", answer)}
        />

        <TrueFalseItem
          label="c"
          selectedAnswer={question.subQuestions.c}
          onAnswerChange={(answer) => onAnswerChange("c", answer)}
        />

        <TrueFalseItem
          label="d"
          selectedAnswer={question.subQuestions.d}
          onAnswerChange={(answer) => onAnswerChange("d", answer)}
        />
      </View>
    </View>
  );
}
