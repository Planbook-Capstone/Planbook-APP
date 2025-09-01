import { Stack } from "expo-router";
import React from "react";

export default function GradingLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false
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
    </Stack>
  );
}
