import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

type TrueFalseAnswer = "Đ" | "S" | null;

interface TrueFalseItemProps {
  label: string;
  selectedAnswer: TrueFalseAnswer;
  onAnswerChange: (answer: TrueFalseAnswer) => void;
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

export default function TrueFalseItem({
  label,
  selectedAnswer,
  onAnswerChange,
}: TrueFalseItemProps) {
  return (
    <View className="flex-row items-center justify-start pl-6">
      <Text className="text-lg font-normal text-black pr-4">{label}</Text>
      <View className="flex-row gap-2">
        <OptionButton
          option="Đ"
          isSelected={selectedAnswer === "Đ"}
          onPress={() => onAnswerChange("Đ")}
        />
        <OptionButton
          option="S"
          isSelected={selectedAnswer === "S"}
          onPress={() => onAnswerChange("S")}
        />
      </View>
    </View>
  );
}
