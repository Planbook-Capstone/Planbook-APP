import { Stack } from "expo-router";
import React from "react";

export default function GradingLayout() {
  const commonHeaderOptions = {
    headerBackTitle: "Quay lại",
    headerBackTitleStyle: {
      fontFamily: "Questrial",
    },
    // headerStyle: {
    //   backgroundColor: "#fff", // nền trắng
    //   elevation: 0, // Loại bỏ shadow trên Android
    //   shadowOpacity: 0, // Loại bỏ shadow trên iOS
    //   borderBottomWidth: 0, // Loại bỏ border bottom
    //   height: 60, // Chiều cao của header
    // },
    headerTitleStyle: {
      fontFamily: "CalSans",
      fontSize: 20, // Kích thước font
    },
    headerTitleAlign: "left" as "left" | "center", // Căn lề trái cho title với type assertion
    headerTintColor: "#000", // màu chữ + icon
  };

  return (
    <Stack screenOptions={commonHeaderOptions}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create-session"
        options={{
          title: "Tạo mới phiên chấm",
          headerBackTitle: "Quay lại",
          headerStyle: {
            backgroundColor: "#fff", // nền trắng
          },
          headerTintColor: "#000", // màu chữ + icon
        }}
      />

      <Stack.Screen
        name="createAnswerKey"
        options={{
          title: "Tạo đáp án",
          headerBackTitle: "Quay lại",
          headerStyle: {
            backgroundColor: "#fff", // nền trắng
          },
          headerTintColor: "#000", // màu chữ + icon
        }}
      />

      <Stack.Screen
        name="exportResults"
        options={{
          title: "Đáp án",
          headerBackTitle: "Quay lại",
          headerStyle: {
            backgroundColor: "#fff", // nền trắng
          },
          headerTintColor: "#000", // màu chữ + icon
        }}
      />
      <Stack.Screen
        name="generalInfo"
        options={{
          title: "Thông tin chung",
          headerBackTitle: "Quay lại",
          headerStyle: {
            backgroundColor: "#fff", // nền trắng
          },
          headerTintColor: "#000", // màu chữ + icon
        }}
      />
      <Stack.Screen
        name="gradedPapers"
        options={{
          title: "Bài đã chấm",
          headerBackTitle: "Quay lại",
          headerStyle: {
            backgroundColor: "#fff", // nền trắng
          },
          headerTintColor: "#000", // màu chữ + icon
        }}
      />
      <Stack.Screen
        name="gradingMenu"
        options={{
          title: "Quản lý chấm điểm",
          headerBackTitle: "Quay lại",
          headerStyle: {
            backgroundColor: "#fff", // nền trắng
          },
          headerTintColor: "#000", // màu chữ + icon
        }}
      />
      <Stack.Screen
        name="statistics"
        options={{
          title: "Thống kê",
          headerBackTitle: "Quay lại",
          headerStyle: {
            backgroundColor: "#fff", // nền trắng
          },
          headerTintColor: "#000", // màu chữ + icon
        }}
      />

      <Stack.Screen
        name="scanExam"
        options={{
          title: "Quét chấm điểm",
          headerBackTitle: "Quay lại",
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerTintColor: "#000",
        }}
      />
    </Stack>
  );
}
