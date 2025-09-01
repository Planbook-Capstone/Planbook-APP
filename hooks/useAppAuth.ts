// src/hooks/useAppAuth.ts
import { useEffect } from "react";
import { AppState } from "react-native";
import { router, useSegments } from "expo-router";
import { supabase } from "@/config/supabaseClient";
import { useLoginGoogleService } from "@/services/userService";
import { useAuthStore } from "@/store/authStore";
import { saveTokens } from "@/utils/tokenStorage";
import { useQueryClient } from "@tanstack/react-query";
import { showMessage } from "react-native-flash-message";

export function useAppAuth() {
  const segments = useSegments();
  const { mutate } = useLoginGoogleService();
  const {
    actions: { setAuth },
  } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      const inAuthGroup = segments[0] === "(auth)";

      if (session) {
        const idToken = session.access_token;

        try {
          mutate(
            { token: idToken },
            {
              onSuccess: async (res) => {
                console.log(res.data, "Google login response");

                // Save user to Zustand store
                if (res?.data?.data) {
                  setAuth(res?.data?.data);

                  await saveTokens(
                    res?.data?.data?.token,
                    res?.data?.data?.refreshToken
                  );

                  // Keep React Query for backward compatibility
                  queryClient.setQueryData(["currentUser"], res?.data?.data);
                  // Route based on role
                  router.replace("/(tabs)");
                }

                showMessage({
                  message: "Đăng nhập thành công!",
                  type: "success",
                  icon: "success",
                });
              },
              onError: (e) => {
                let message = "Đã xảy ra lỗi không xác định";

                // Nếu có response và có data
                if (e?.response?.data) {
                  const data = e.response.data;
                  if (typeof data === "string") {
                    message = data;
                  } else if (typeof data === "object" && "message" in data) {
                    message = data.message;
                  }
                }

                showMessage({
                  message: "Đăng nhập thất bại",
                  description: message,
                  type: "danger", // 'danger' là màu đỏ cho lỗi
                  icon: "danger",
                });
              },
            }
          );

          if (inAuthGroup) router.replace("/(tabs)");
        } catch (err) {
          console.error("❌ Token không hợp lệ:", err);
          if (!inAuthGroup) router.replace("/(auth)/login");
        }
      } else {
        if (!inAuthGroup) router.replace("/(auth)/login");
      }
    };

    checkSession();

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") checkSession();
    });

    return () => sub.remove();
  }, []);
}
