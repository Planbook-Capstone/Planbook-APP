import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  // 1. Import thêm
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { showMessage } from "react-native-flash-message"; // 1. Import showMessage
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  RegisterSchema,
  type RegisterFormData,
} from "../../schemas/auth/registerSchema";
import { useRegisterService } from "@/services/userService";

const RegisterScreen = () => {
  const { mutate } = useRegisterService();

  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      fullName: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (payload: RegisterFormData) => {
    setIsLoading(true);
    console.log("Validation thành công, đang gửi API:", payload);
    mutate(payload, {
      onSuccess: (data) => {
        router.push("/login"); // Redirect to login after successful registration
        showMessage({
          message: "Đăng ký thành công! Vui lòng đăng nhập.",
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
          message: "Đăng ký thất bại. Vui lòng kiểm tra kỹ thông tin đăng ký",
          description: message,
          type: "danger",
          icon: "danger",
        });
      },
    });
    setIsLoading(false);
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
          {/* 3. Bọc ScrollView bằng TouchableWithoutFeedback */}
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
              style={styles.container} // Chuyển padding vào đây
              keyboardShouldPersistTaps="handled" // Giúp các nút trong ScrollView vẫn bấm được
            >
              <Text style={styles.title}>Tạo tài khoản mới</Text>
              <Text style={styles.subtitle}>
                Điền thông tin để tạo tài khoản mới.
              </Text>

              {/* ... Toàn bộ các Controller và form không đổi ... */}
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Họ và tên"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName.message}</Text>
              )}

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                )}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}

              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Tên đăng nhập"
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

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Xác nhận mật khẩu"
                      secureTextEntry={!confirmPasswordVisible}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setConfirmPasswordVisible(!confirmPasswordVisible)
                      }
                    >
                      <Ionicons
                        name={
                          confirmPasswordVisible
                            ? "eye-off-outline"
                            : "eye-outline"
                        }
                        size={24}
                        color="#9e9e9e"
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>
                  {errors.confirmPassword.message}
                </Text>
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
                    <Text style={styles.loginButtonText}>Đăng ký</Text>
                    <Ionicons name="arrow-forward" size={24} color="white" />
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Đã có tài khoản? </Text>
                <Link href="/login" asChild>
                  <TouchableOpacity>
                    <Text style={styles.signupLink}>Đăng ký ngay</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </ScrollView>
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
  rootContainer: { flex: 1, backgroundColor: "white"},
  safeArea: { flex: 1 },
  container: { paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#333", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 20 },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginTop: 15,
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
    marginTop: 15,
    marginBottom: 30,
    minHeight: 58,
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
  signupText: { fontSize: 16, color: "#666" },
  signupLink: { fontSize: 16, color: "#4dd0e1", fontWeight: "bold" },
});

export default RegisterScreen;
