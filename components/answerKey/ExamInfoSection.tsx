import React from "react";
import { Text, TextInput, View } from "react-native";

interface ExamInfoSectionProps {
  examCode: string;
  onExamCodeChange: (code: string) => void;
  error?: string;
}

export default function ExamInfoSection({
  examCode,
  onExamCodeChange,
  error,
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

        <View className={`bg-white border rounded-md py-4 px-4 h-[57px] ${
          error ? 'border-red-500' : 'border-gray-200'
        }`}>
          <TextInput
            value={examCode}
            onChangeText={onExamCodeChange}
            placeholder="Nhập mã đề"
            placeholderTextColor="rgba(0, 0, 0, 0.25)"
            className="text-xl font-normal text-black flex-1"
          />
        </View>

        {/* Fixed height container for error message to prevent layout shift */}
        <View className="h-[20px] mt-1 ml-1">
          {error && (
            <Text className="text-red-500 text-sm">
              {error}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
