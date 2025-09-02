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
          title: "generalInfo",
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
          title: "gradedPapers",
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
          title: "gradingMenu",
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
          title: "statistics",
          headerBackTitle: "Quay lại",
          headerStyle: {
            backgroundColor: "#fff", // nền trắng
          },
          headerTintColor: "#000", // màu chữ + icon
        }}
      />
    </Stack>
  );
}
