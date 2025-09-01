import { useLoginGoogleService, useUserServices } from "@/services/userService";
import { useAuthStore } from "@/store/authStore";
import { saveTokens } from "@/utils/tokenStorage"; // 1. Import getTokens từ file storage
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    GoogleSignin,
    statusCodes,
} from "@react-native-google-signin/google-signin";
import { useQueryClient } from "@tanstack/react-query";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { showMessage } from "react-native-flash-message";
import { supabase } from "../../config/supabaseClient";
import {
    LoginSchema,
    type LoginFormData,
} from "../../schemas/auth/loginSchema";

const LoginScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { mutate } = useUserServices();
  const { mutate: loginGG } = useLoginGoogleService();
  const {
    actions: { setAuth },
  } = useAuthStore();
  const queryClient = useQueryClient();

  GoogleSignin.configure({
    // scopes: ["https://www.googleapis.com/auth/userinfo.email"],
    webClientId:
      "797331175606-4b77ulnk9sjq84oo5b6mknigniueptrc.apps.googleusercontent.com", // dùng cái này
    iosClientId:
      "797331175606-hg88ji7avgl4in51p3k2hhuom9ofm6i5.apps.googleusercontent.com",
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (payload: LoginFormData) => {
    setIsLoading(true);
    console.log("Submitting login with payload:", payload);
    mutate(payload, {
      onSuccess: async (data) => {
        showMessage({
          message: "Đăng nhập thành công!",
          type: "success",
          icon: "success",
        });

        // Save to Zustand store (exclude wallet field)
        const { wallet, ...userDataWithoutWallet } = data?.data?.data || {};
        console.log(userDataWithoutWallet);

        setAuth(userDataWithoutWallet);

        await saveTokens(
          data?.data?.data?.token,
          data?.data?.data?.refreshToken
        );

        // Keep React Query for backward compatibility
        queryClient.setQueryData(["currentUser"], data?.data?.data);

        router.replace("/(tabs)");

        // // Route based on role
        // if (data.data.data.role === "ADMIN") {
        //   router.push("/admin");
        // } else if (data.data.data.role === "STAFF") {
        //   router.push("/staff");
        // } else {
        //   router.push("/home");
        // }
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
          message: message,
          type: "danger", // 'danger' là màu đỏ cho lỗi
          icon: "danger",
        });
      },
    });
    setIsLoading(false);
  };
  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo?.data?.idToken; // Android iOS đều ở đây theo code bạn
      if (idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: idToken,
        });
        console.log("Supabase response:", data?.session?.access_token);
        const payload = { token: data?.session?.access_token || "" };
        loginGG(payload, {
          onSuccess: async (data) => {
            showMessage({
              message: "Đăng nhập thành công!",
              type: "success",
              icon: "success",
            });

            // Save to Zustand store (exclude wallet field)
            const { wallet, ...userDataWithoutWallet } = data?.data?.data || {};
            console.log(userDataWithoutWallet);
            setAuth(userDataWithoutWallet);

            await saveTokens(
              data?.data?.data?.token,
              data?.data?.data?.refreshToken
            );

            // Keep React Query for backward compatibility
            queryClient.setQueryData(["currentUser"], data?.data?.data);

            router.replace("/(tabs)");

            // // Route based on role
            // if (data.data.data.role === "ADMIN") {
            //   router.push("/admin");
            // } else if (data.data.data.role === "STAFF") {
            //   router.push("/staff");
            // } else {
            //   router.push("/home");
            // }
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
              message: message,
              type: "danger", // 'danger' là màu đỏ cho lỗi
              icon: "danger",
            });
          },
        });

        if (error || !data.session) {
          console.error("Supabase sign-in error:", error);
          throw new Error(error?.message || "Lỗi đăng nhập với Supabase");
        }
      } else {
        throw new Error("no ID token present!");
      }
    } catch (error: any) {
      // THÊM DÒNG NÀY: In ra lỗi để biết chính xác nguyên nhân
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
        console.log("User cancelled the login flow");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log();

        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  };

  return (
    <View style={styles.rootContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <SafeAreaView style={styles.safeArea}>
        {/* 2. Đảm bảo KeyboardAvoidingView có flex: 1 */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flexOne}
        >
          {/* 3. Bọc toàn bộ nội dung bằng TouchableWithoutFeedback để tắt bàn phím */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
              {/* Nội dung form của bạn nằm ở đây */}
              <Text style={styles.title}>Chào mừng quay trở lại</Text>
              <Text style={styles.subtitle}>
                Nhập tài khoản và mật khẩu để đăng nhập vào hệ thống.
              </Text>

              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Tên đăng nhập"
                    placeholderTextColor="#9ca3af"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                  />
                )}
              />
              {errors.username && (
                <Text style={styles.errorText}>{errors.username.message}</Text>
              )}

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Mật khẩu"
                      placeholderTextColor="#9ca3af"
                      secureTextEntry={!passwordVisible}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                    <TouchableOpacity
                      onPress={() => setPasswordVisible(!passwordVisible)}
                    >
                      <Ionicons
                        name={
                          passwordVisible ? "eye-off-outline" : "eye-outline"
                        }
                        size={24}
                        color="#9e9e9e"
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Đăng nhập</Text>
                    <Ionicons name="arrow-forward" size={24} color="white" />
                  </>
                )}
              </TouchableOpacity>

              {/* ... Các phần còn lại không đổi */}
              <TouchableOpacity
                onPress={handleGoogleLogin}
                style={styles.googleButton}
              >
                <Text style={styles.googleButtonText}>Tiếp tục với Google</Text>
                <Ionicons name="arrow-forward" size={24} color="#757575" />
              </TouchableOpacity>

              <TouchableOpacity>
                <Text style={styles.forgotPassword}>Quên mật khẩu</Text>
              </TouchableOpacity>
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Bạn chưa có tài khoản? </Text>
                <Link href="/register" asChild>
                  <TouchableOpacity>
                    <Text style={styles.signupLink}>Đăng ký ngay</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  // ... (Các style khác giữ nguyên)
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
    marginBottom: 10,
    marginLeft: 5,
  },
  rootContainer: { flex: 1, backgroundColor: "white" },
  safeArea: { flex: 1 },
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#333", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 30 },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginTop: 15,
  },
  passwordInput: { flex: 1, paddingVertical: 15, fontSize: 16 },
  loginButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4dd0e1",
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    marginBottom: 15,
    minHeight: 58,
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
  googleButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 20,
  },
  googleButtonText: { color: "#333", fontSize: 16 },
  forgotPassword: {
    color: "#4dd0e1",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
    paddingBottom: 20,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: { fontSize: 16, color: "#666" },
  signupLink: { fontSize: 16, color: "#4dd0e1", fontWeight: "bold" },
});

export default LoginScreen;
