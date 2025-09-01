import React from "react";
import { View, Text, TextInput } from "react-native";

interface ExamInfoSectionProps {
  examCode: string;
  onExamCodeChange: (code: string) => void;
}

export default function ExamInfoSection({
  examCode,
  onExamCodeChange,
}: ExamInfoSectionProps) {
  return (
    <View className="mb-8">
      <Text className="text-xl font-semibold text-black mb-5">
        Thông tin chung
      </Text>

      <View className="gap-1">
        <View className="flex-row items-center px-4 py-0">
          <Text className="text-base font-normal text-black">Mã đề</Text>
        </View>

        <View className="w-[368px] h-[57px] bg-white border border-gray-200 rounded-md px-4 py-4">
          <TextInput
            value={examCode}
            onChangeText={onExamCodeChange}
            placeholder="Nhập mã đề"
            placeholderTextColor="rgba(0, 0, 0, 0.25)"
            className="text-xl font-normal text-black flex-1"
          />
        </View>
      </View>
    </View>
  );
}
