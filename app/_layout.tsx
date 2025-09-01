import { CustomFlashMessage } from "@/components/toast/CustomFlashMessage";
import "@/global.css";
import { useColorScheme } from "@/hooks/useColorScheme";
import { AppProvider } from "@/store/authStore";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen"; // 1. Import SplashScreen
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import FlashMessage from "react-native-flash-message";
import "react-native-reanimated";

// 2. Giữ màn hình chờ hiển thị, không để tự động ẩn đi
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const queryClient = new QueryClient();
  const colorScheme = useColorScheme();

  // 3. Sử dụng fontsLoaded và fontError để xử lý trạng thái tốt hơn
  const [fontsLoaded, fontError] = useFonts({
    // 4. Sửa lại đường link uri cho đúng
    Questrial: require("../assets/fonts/Questrial-Regular.ttf"),
  });

  // 5. Dùng useEffect để ẩn màn hình chờ khi font đã tải xong
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // 6. Nếu font chưa tải xong hoặc có lỗi, không render gì cả
  // Màn hình chờ sẽ tiếp tục hiển thị
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Khi font đã sẵn sàng, render toàn bộ ứng dụng
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen
              name="walletHistory"
              options={{
                title: "Lịch sử giao dịch",
                headerBackTitle: "Profile",
                headerStyle: {
                  backgroundColor: "#fff", // nền trắng
                },
              }}
            />
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="omrPage" options={{ headerShown: false }} />
            <Stack.Screen name="scanExam" options={{ headerShown: false }} />
          </Stack>

          <StatusBar style="auto" />
          <FlashMessage
            floating={true}
            position="top"
            MessageComponent={CustomFlashMessage}
          />
        </ThemeProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}
