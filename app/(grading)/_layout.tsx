import { Stack } from "expo-router";
import React from "react";

export default function GradingLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          // title: "Phiên chấm điểm",
          // headerBackTitle: "Quay lại",
          // headerStyle: {
          //   backgroundColor: "#fff", // nền trắng
          // },
          // headerTintColor: "#000", // màu chữ + icon
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

        <Stack.Screen name="scanExam" 
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
