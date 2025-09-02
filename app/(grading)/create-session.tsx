import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CreateGradingSessionScreen = () => {
  const [isSBDEnabled, setIsSBDEnabled] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white pt-8" edges={["bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80} // Có thể điều chỉnh theo header height
      >
        <ScrollView className="flex-1 px-5">
          {/* Section 1: Thông tin chung */}
          <View className="mb-4">
            <Text className="text-base font-bold mb-3">1. Thông tin chung</Text>
            <View className="bg-white rounded-lg p-4">
              <Text className="mb-1 text-sm text-gray-800">Tên bài</Text>
              <TextInput
                placeholder="Nhập tên bài"
                className="border border-gray-200 rounded-md px-4 py-3 mb-4 text-sm text-gray-900"
              />

              <Text className="mb-1 text-sm text-gray-800">Loại phiếu</Text>
              <TouchableOpacity className="border border-gray-200 rounded-md px-4 py-3 flex-row justify-between items-center">
                <Text className="text-sm text-gray-700">
                  Vui lòng nhấn để chọn loại phiếu
                </Text>
                <Text className="text-gray-500">{">"}</Text>
              </TouchableOpacity>

              {/* <View className="flex-row justify-between items-center">
                <Text className="text-sm text-gray-800">
                  Tùy chỉnh quét số báo danh
                </Text>
                <Switch value={isSBDEnabled} onValueChange={setIsSBDEnabled} />
              </View> */}
            </View>
          </View>

          {/* Section 2: Cấu trúc đề thi */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-bold">2. Cấu trúc đề thi</Text>
              <TouchableOpacity className="flex-row items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-400 rounded-full">
                <Text className="text-white text-sm font-medium">
                  Tự phân bổ
                </Text>
              </TouchableOpacity>
            </View>

            {/* Phần 1 - Trắc nghiệm */}
            <View className="bg-white rounded-lg p-4 mb-3">
              <TouchableOpacity className="flex-row justify-between items-center mb-2 bg-gray-900 px-4 py-2 rounded-full">
                <Text className="text-white text-sm font-semibold">
                  Phần 1 - Trắc nghiệm
                </Text>
                <Text className="text-white">⌄</Text>
              </TouchableOpacity>

              <Text className="mb-1 text-sm text-gray-800">Số câu</Text>
              <TextInput
                placeholder="Nhập số câu"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                className="border border-gray-200 rounded-md px-4 py-3 mb-4 text-sm text-gray-900"
              />

              <Text className="mb-1 text-sm text-gray-800">Điểm / câu</Text>
              <TextInput
                placeholder="Nhập số điểm"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                className="border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-900"
              />
            </View>

            {/* Phần 2 - Đúng/sai nhiều ý */}
            <View className="bg-white rounded-lg px-4 mb-3">
              <TouchableOpacity className="flex-row justify-between items-center mb-2 bg-gray-900 px-4 py-2 rounded-full">
                <Text className="text-white text-sm font-semibold">
                  Phần 2 - Đúng/sai
                </Text>
                <Text className="text-white">⌄</Text>
              </TouchableOpacity>

              <Text className="mb-1 text-sm text-gray-800">Số câu</Text>
              <TextInput
                placeholder="Nhập số câu"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                className="border border-gray-200 rounded-md px-4 py-3 mb-4 text-sm text-gray-900"
              />

              <Text className="text-sm font-semibold text-gray-800 mb-2">
                Số điểm 1 câu:
              </Text>

              {["Đúng 1 Ý", "Đúng 2 Ý", "Đúng 3 Ý", "Đúng 4 Ý"].map(
                (label, index) => (
                  <View key={index} className="mb-3">
                    <Text className="mb-1 text-sm text-gray-800">
                      - {label}
                    </Text>
                    <TextInput
                      placeholder={`Nhập điểm cho ${label.toLowerCase()}`}
                      keyboardType="numeric"
                      placeholderTextColor="#9ca3af"
                      className="border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-900"
                    />
                  </View>
                )
              )}
            </View>

            {/* Phần 3 - Tự luận */}
            <View className="bg-white rounded-lg px-4">
              <TouchableOpacity className="flex-row justify-between items-center mb-2 bg-gray-900 px-4 py-2 rounded-full">
                <Text className="text-white text-sm font-semibold">
                  Phần 3 - Tự luận
                </Text>
                <Text className="text-white">⌄</Text>
              </TouchableOpacity>

              <Text className="mb-1 text-sm text-gray-800">Số câu</Text>
              <TextInput
                placeholder="Nhập số câu"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                className="border border-gray-200 rounded-md px-4 py-3 mb-4 text-sm text-gray-900"
              />

              <Text className="mb-1 text-sm text-gray-800">Điểm / câu</Text>
              <TextInput
                placeholder="Nhập số điểm"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                className="border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-900"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateGradingSessionScreen;
