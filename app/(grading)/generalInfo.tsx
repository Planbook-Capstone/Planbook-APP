import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface ExamInfo {
  examName: string;
  examCode: string;
  subject: string;
  examDate: string;
  duration: string;
  totalQuestions: number;
  maxScore: number;
  passingScore: number;
  gradingMethod: string;
  instructions: string;
}

const mockExamInfo: ExamInfo = {
  examName: "Kiểm tra giữa học kỳ - Toán học",
  examCode: "MATH2025_001",
  subject: "Toán học",
  examDate: "30-08-2025",
  duration: "90 phút",
  totalQuestions: 25,
  maxScore: 10,
  passingScore: 5,
  gradingMethod: "Tự động",
  instructions:
    "Sinh viên làm bài trên phiếu trắc nghiệm. Mỗi câu chỉ được chọn một đáp án. Không được sử dụng tài liệu.",
};

export default function GeneralInfoScreen() {
  const router = useRouter();
  const [examInfo, setExamInfo] = useState<ExamInfo>(mockExamInfo);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    Alert.alert("Xác nhận", "Bạn có muốn lưu thay đổi không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Lưu",
        onPress: () => {
          setIsEditing(false);
          Alert.alert("Thành công", "Đã lưu thông tin thành công!");
        },
      },
    ]);
  };

  const handleCancel = () => {
    setExamInfo(mockExamInfo);
    setIsEditing(false);
  };

  const InfoRow = ({
    label,
    value,
    field,
    multiline = false,
  }: {
    label: string;
    value: string | number;
    field: keyof ExamInfo;
    multiline?: boolean;
  }) => (
    <View className="mb-4">
      <Text
        className="text-sm font-medium text-gray-700 mb-2"
        style={{ fontFamily: "Questrial" }}
      >
        {label}
      </Text>
      {isEditing ? (
        <TextInput
          value={String(value)}
          onChangeText={(text) =>
            setExamInfo((prev) => ({ ...prev, [field]: text }))
          }
          className="border border-gray-300 rounded-lg px-3 py-3 text-base text-gray-900"
          style={{ fontFamily: "Questrial" }}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
      ) : (
        <Text
          className="text-base text-gray-900 bg-gray-50 px-3 py-3 rounded-lg"
          style={{ fontFamily: "Questrial" }}
        >
          {value}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center"
          >
            <Ionicons name="arrow-back" size={24} color="#292D32" />
            <Text
              className="text-xl font-normal text-black ml-2"
              style={{ fontFamily: "Questrial" }}
            >
              Quay lại
            </Text>
          </TouchableOpacity>
          <Text
            className="text-2xl font-bold text-black ml-4"
            style={{ fontFamily: "CalSans" }}
          >
            Thông tin chung
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsEditing(!isEditing)}
          className="px-3 py-2"
        >
          <Ionicons
            name={isEditing ? "close" : "pencil"}
            size={20}
            color={isEditing ? "#EF4444" : "#3B82F6"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Exam Overview */}
        <View className="px-6 py-6 bg-blue-50 border-b border-blue-100">
          <View className="flex-row items-center mb-3">
            <Ionicons name="document-text" size={24} color="#3B82F6" />
            <Text
              className="text-lg font-semibold text-blue-900 ml-2"
              style={{ fontFamily: "CalSans" }}
            >
              Tổng quan bài thi
            </Text>
          </View>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text
                className="text-2xl font-bold text-blue-600"
                style={{ fontFamily: "CalSans" }}
              >
                125
              </Text>
              <Text
                className="text-sm text-blue-800"
                style={{ fontFamily: "Questrial" }}
              >
                Bài đã chấm
              </Text>
            </View>
            <View className="items-center">
              <Text
                className="text-2xl font-bold text-green-600"
                style={{ fontFamily: "CalSans" }}
              >
                7.8
              </Text>
              <Text
                className="text-sm text-blue-800"
                style={{ fontFamily: "Questrial" }}
              >
                Điểm TB
              </Text>
            </View>
            <View className="items-center">
              <Text
                className="text-2xl font-bold text-orange-600"
                style={{ fontFamily: "CalSans" }}
              >
                78%
              </Text>
              <Text
                className="text-sm text-blue-800"
                style={{ fontFamily: "Questrial" }}
              >
                Tỷ lệ đạt
              </Text>
            </View>
          </View>
        </View>

        {/* Exam Details */}
        <View className="px-6 py-6">
          <Text
            className="text-lg font-semibold text-gray-900 mb-4"
            style={{ fontFamily: "CalSans" }}
          >
            Thông tin chi tiết
          </Text>

          <InfoRow
            label="Tên bài thi"
            value={examInfo.examName}
            field="examName"
          />
          <InfoRow
            label="Mã bài thi"
            value={examInfo.examCode}
            field="examCode"
          />
          <InfoRow label="Môn học" value={examInfo.subject} field="subject" />
          <InfoRow
            label="Ngày thi"
            value={examInfo.examDate}
            field="examDate"
          />
          <InfoRow
            label="Thời gian"
            value={examInfo.duration}
            field="duration"
          />
          <InfoRow
            label="Tổng số câu hỏi"
            value={examInfo.totalQuestions}
            field="totalQuestions"
          />
          <InfoRow
            label="Điểm tối đa"
            value={examInfo.maxScore}
            field="maxScore"
          />
          <InfoRow
            label="Điểm đạt"
            value={examInfo.passingScore}
            field="passingScore"
          />
          <InfoRow
            label="Phương thức chấm"
            value={examInfo.gradingMethod}
            field="gradingMethod"
          />
          <InfoRow
            label="Hướng dẫn làm bài"
            value={examInfo.instructions}
            field="instructions"
            multiline={true}
          />
        </View>

        {/* Action Buttons */}
        {isEditing && (
          <View className="px-6 pb-8">
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleCancel}
                className="flex-1 bg-gray-200 rounded-xl p-4"
              >
                <Text
                  className="text-center text-base font-semibold text-gray-700"
                  style={{ fontFamily: "Questrial" }}
                >
                  Hủy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                className="flex-1 bg-blue-500 rounded-xl p-4"
              >
                <Text
                  className="text-center text-base font-semibold text-white"
                  style={{ fontFamily: "Questrial" }}
                >
                  Lưu thay đổi
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        {!isEditing && (
          <View className="px-6 pb-8">
            <Text
              className="text-lg font-semibold text-gray-900 mb-4"
              style={{ fontFamily: "CalSans" }}
            >
              Hành động nhanh
            </Text>
            <TouchableOpacity className="bg-green-500 rounded-xl p-4 mb-3">
              <View className="flex-row items-center justify-center">
                <Ionicons name="share-outline" size={20} color="white" />
                <Text
                  className="text-white text-center text-base font-semibold ml-2"
                  style={{ fontFamily: "Questrial" }}
                >
                  Chia sẻ thông tin bài thi
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="bg-orange-500 rounded-xl p-4">
              <View className="flex-row items-center justify-center">
                <Ionicons name="duplicate-outline" size={20} color="white" />
                <Text
                  className="text-white text-center text-base font-semibold ml-2"
                  style={{ fontFamily: "Questrial" }}
                >
                  Sao chép thành template
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
