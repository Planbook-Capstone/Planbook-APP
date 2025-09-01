import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function StatisticsScreen() {
  const router = useRouter();

  const statsData = [
    {
      title: "Tổng số bài đã chấm",
      value: "125",
      icon: "document-text-outline",
      color: "#3B82F6",
    },
    {
      title: "Điểm trung bình",
      value: "7.8",
      icon: "trending-up-outline",
      color: "#10B981",
    },
    {
      title: "Số bài đạt",
      value: "98",
      icon: "checkmark-circle-outline",
      color: "#059669",
    },
    {
      title: "Số bài không đạt",
      value: "27",
      icon: "close-circle-outline",
      color: "#EF4444",
    },
  ];

  const gradeDistribution = [
    { range: "9-10", count: 15, percentage: 12 },
    { range: "8-8.9", count: 25, percentage: 20 },
    { range: "7-7.9", count: 35, percentage: 28 },
    { range: "6-6.9", count: 30, percentage: 24 },
    { range: "5-5.9", count: 12, percentage: 10 },
    { range: "0-4.9", count: 8, percentage: 6 },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
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
          Thống kê
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View className="px-6 py-6">
          <Text
            className="text-lg font-semibold text-gray-900 mb-4"
            style={{ fontFamily: "CalSans" }}
          >
            Tổng quan
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {statsData.map((stat, index) => (
              <View
                key={index}
                className="bg-white rounded-xl p-4 mb-4 border border-gray-200"
                style={{
                  width: "48%",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Ionicons
                    name={stat.icon as any}
                    size={24}
                    color={stat.color}
                  />
                  <Text
                    className="text-2xl font-bold"
                    style={{ color: stat.color, fontFamily: "CalSans" }}
                  >
                    {stat.value}
                  </Text>
                </View>
                <Text
                  className="text-sm text-gray-600"
                  style={{ fontFamily: "Questrial" }}
                >
                  {stat.title}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Grade Distribution */}
        <View className="px-6 pb-6">
          <Text
            className="text-lg font-semibold text-gray-900 mb-4"
            style={{ fontFamily: "CalSans" }}
          >
            Phân bố điểm số
          </Text>
          <View className="bg-white rounded-xl p-4 border border-gray-200">
            {gradeDistribution.map((grade, index) => (
              <View
                key={index}
                className="flex-row items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
              >
                <Text
                  className="text-base font-medium text-gray-900"
                  style={{ fontFamily: "Questrial" }}
                >
                  {grade.range}
                </Text>
                <View className="flex-row items-center gap-4">
                  <View className="flex-row items-center">
                    <View
                      className="h-2 rounded-full mr-2"
                      style={{
                        width: grade.percentage * 2,
                        backgroundColor:
                          grade.percentage > 20
                            ? "#10B981"
                            : grade.percentage > 10
                            ? "#F59E0B"
                            : "#EF4444",
                      }}
                    />
                    <Text
                      className="text-sm text-gray-600"
                      style={{ fontFamily: "Questrial" }}
                    >
                      {grade.percentage}%
                    </Text>
                  </View>
                  <Text
                    className="text-base font-medium text-gray-900"
                    style={{ fontFamily: "Questrial" }}
                  >
                    {grade.count}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 pb-8">
          <Text
            className="text-lg font-semibold text-gray-900 mb-4"
            style={{ fontFamily: "CalSans" }}
          >
            Hành động nhanh
          </Text>
          <TouchableOpacity className="bg-blue-500 rounded-xl p-4 mb-3">
            <Text
              className="text-white text-center text-base font-semibold"
              style={{ fontFamily: "Questrial" }}
            >
              Xuất báo cáo chi tiết
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-green-500 rounded-xl p-4">
            <Text
              className="text-white text-center text-base font-semibold"
              style={{ fontFamily: "Questrial" }}
            >
              Chia sẻ thống kê
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
