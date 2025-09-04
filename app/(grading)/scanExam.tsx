import { apiSecondary } from "@/config/axios";
import { useGetGradingSessionById } from "@/services/gradingService";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import * as MediaLibrary from "expo-media-library";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image as RNImage,
} from "react-native";
import DocumentScanner from "react-native-document-scanner-plugin";
import { showMessage } from "react-native-flash-message";
import { useAcademicYearActiceService } from "@/services/academicYearServices";

type SectionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "ESSAY";

interface BaseSection {
  sectionType: SectionType;
  sectionOrder: number;
  questionCount: number;
}

interface MultipleChoiceSection extends BaseSection {
  sectionType: "MULTIPLE_CHOICE" | "ESSAY";
  pointsPerQuestion: number;
}

interface TrueFalseSection extends BaseSection {
  sectionType: "TRUE_FALSE";
  rule: Record<string, number>;
}

type Section = MultipleChoiceSection | TrueFalseSection;

function calculateTotalPoints(
  sections: Section[],
  decimals: number = 2
): number {
  const total = sections.reduce((sum, section) => {
    if (section.sectionType === "TRUE_FALSE") {
      const maxRule = Math.max(...Object.values(section.rule));
      return sum + maxRule * section.questionCount;
    } else {
      return sum + section.pointsPerQuestion * section.questionCount;
    }
  }, 0);

  const factor = Math.pow(10, decimals);
  return Math.round(total * factor) / factor;
}

type SectionPart = {
  correct_count: number;
  total_questions: number;
  score: number;
  points_per_question?: number;
  rule?: Record<string, number>;
};

type Scores = {
  part1: SectionPart;
  part2: SectionPart;
  part3: SectionPart;
  [key: string]: any; // để bỏ qua các field khác
};

function calculateTotalCorrect(scores: Scores): number {
  return (
    scores.part1.correct_count +
    scores.part2.correct_count +
    scores.part3.correct_count
  );
}

// === MIME ===
const getMimeType = (uri: string): string => {
  if (uri.endsWith(".jpg") || uri.endsWith(".jpeg")) return "image/jpeg";
  if (uri.endsWith(".png")) return "image/png";
  if (uri.endsWith(".heic")) return "image/heic";
  return "image/*";
};

// === Gửi API ===
export const uploadAnswerSheetImage = async (
  imageUri: string,
  gradingSessionData: any,
  academicYearData: any
) => {
  try {
    const gradingSessionDataString = JSON.stringify(gradingSessionData);

    const formData = new FormData();
    const fileName = imageUri.split("/").pop() || "photo.jpg";
    const mimeType = getMimeType(imageUri);

    formData.append("file", {
      uri: imageUri,
      name: fileName,
      type: mimeType,
    } as any);

    console.log("gradingSessionDataString ------- ", gradingSessionDataString);

    formData.append("grading_session_data", gradingSessionDataString);

    const res = await apiSecondary.post("/mark-correct-answers/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(
      "gradingSessionData.sectionConfigJson[0] ------- ",
      calculateTotalPoints(gradingSessionData.sectionConfigJson)
    );
    // console.log("Total points: ",calculateTotalPoints();
    console.log("📬 academicYearId:", academicYearData.id);
    console.log("📬 student_code:", res.data.student_code);
    console.log("📬 exam_code:", res.data.exam_code);
    console.log("📬 image_base64:", res.data.image_path);
    console.log("📬 Server response:", res.data.scores);
    console.log("📬 total_correct:", calculateTotalCorrect(res.data.scores));
    console.log("📬 score:", res.data.scores.total_score);
    console.log(
      "📬 student_answer_json",
      JSON.stringify(res.data.student_answer_json, null, 2)
    );

    showMessage({
      message: "Chấm điểm thành công!",
      type: "success",
      icon: "success",
    });
    return res.data; // Return data instead of showing alert
  } catch (e: any) {
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
    console.log("message ------- ", message);

    showMessage({
      message: message,
      type: "danger", // 'danger' là màu đỏ cho lỗi
      icon: "danger",
    });
    throw e; // Throw error to be handled by caller
  }
};

type ScanState =
  | "idle"
  | "scanning"
  | "scanned"
  | "processing"
  | "success"
  | "error";

interface ScanResult {
  id: string;
  imageUri: string;
  result?: any;
  timestamp: Date;
  status: "processing" | "success" | "error";
}

function ScanExamContent() {
  const [uri, setUri] = useState<string | null>(null);
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [currentResult, setCurrentResult] = useState<any>(null);
  const [navigationReady, setNavigationReady] = useState(false);

  const router = useRouter();
  const { id: idGradingSession } = useLocalSearchParams();

  // Navigation context recovery after DocumentScanner
  useEffect(() => {
    const timer = setTimeout(() => {
      setNavigationReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const { data: academicYear } = useAcademicYearActiceService();

  const { data: gradingSessionData } = useGetGradingSessionById(
    idGradingSession as string,
    {
      enabled: !!idGradingSession,
    }
  );

  const sessionName = gradingSessionData?.data?.name || "Phiên chấm điểm";

  // Show loading while navigation context is recovering
  if (!navigationReady) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 text-base mt-4">Đang khởi tạo...</Text>
      </SafeAreaView>
    );
  }

  const scan = async () => {
    try {
      setScanState("scanning");

      // DocumentScanner có thể làm gián đoạn navigation context
      const { scannedImages, status } = await DocumentScanner.scanDocument({
        croppedImageQuality: 95,
      });

      // Restore navigation context sau khi DocumentScanner xong
      setNavigationReady(false);
      setTimeout(() => {
        setNavigationReady(true);
      }, 200);

      if (status !== "success" || !scannedImages?.length) {
        setScanState("idle");
        return;
      }

      setUri(scannedImages[scannedImages.length - 1]);
      setScanState("scanned");
    } catch (e: any) {
      setScanState("error");
      // Restore navigation context ngay cả khi có lỗi
      setNavigationReady(false);
      setTimeout(() => {
        setNavigationReady(true);
      }, 200);
      Alert.alert("Scan lỗi", e?.message ?? "Không thể quét.");
    }
  };

  const processAndUpload = async () => {
    if (!uri) return;

    try {
      setScanState("processing");
      setIsProcessing(true);

      //   Resize và nén ảnh trước khi upload
      const optimized = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1280 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // await MediaLibrary.saveToLibraryAsync(optimized.uri);

      // Gọi API chấm điểm
      const result = await uploadAnswerSheetImage(
        optimized.uri,
        // uri,
        gradingSessionData.data,
        academicYear.data
      );

      // Tạo scan result mới
      const newScanResult: ScanResult = {
        id: Date.now().toString(),
        imageUri: optimized.uri,
        // imageUri: uri,
        result: result,
        timestamp: new Date(),
        status: "success",
      };

      // Cập nhật danh sách kết quả
      setScanResults((prev) => [...prev, newScanResult]);
      setCurrentResult(result);
      setScanState("success");

      // Reset để quét tiếp
      setUri(null);

      Alert.alert(
        "Chấm điểm thành công!",
        `Điểm: ${result.score || 0}/${
          result.total_questions || 0
        }\nBạn có thể quét phiếu tiếp theo.`,
        [{ text: "OK", onPress: () => setScanState("idle") }]
      );
    } catch (error: any) {
      setScanState("error");
      Alert.alert("Lỗi", error?.message || "Không thể xử lý ảnh");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScan = () => {
    setUri(null);
    setScanState("idle");
    setCurrentResult(null);
  };
  const renderScanButton = () => (
    <View className="flex-1 justify-center items-center px-6 py-8">
      <View>
        <Image
          source={require("@/assets/images/icons/scan-active.png")}
          style={{ width: 100, height: 100 }}
        />
      </View>
      <Text className="text-gray-900 text-3xl font-bold text-center mb-3">
        Quét phiếu trả lời
      </Text>
      <Text className="text-blue-600 text-xl font-semibold text-center mb-3">
        {sessionName}
      </Text>
      <Text className="text-gray-600 text-base text-center mb-8 leading-6 max-w-sm">
        Quét từng phiếu một, hệ thống sẽ tự động chấm điểm sau mỗi lần quét
      </Text>

      {scanResults.length > 0 && (
        <View className="bg-green-50 border border-green-200 px-6 py-4 rounded-xl mb-8">
          <Text className="text-green-700 text-base font-semibold text-center">
            ✅ Đã quét thành công: {scanResults.length} phiếu
          </Text>
        </View>
      )}

      <TouchableOpacity
        onPress={scan}
        className={`flex-row items-center justify-center bg-blue-600 px-10 py-5 rounded-2xl shadow-lg ${
          scanState === "scanning" ? "opacity-50" : ""
        }`}
        disabled={scanState === "scanning"}
      >
        {scanState === "scanning" ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Ionicons name="camera" size={28} color="white" />
        )}
        <Text className="text-white text-xl font-bold ml-3">
          {scanState === "scanning" ? "Đang quét..." : "Bắt đầu quét"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderImagePreview = () => (
    <View className="flex-1 p-6">
      <View className="relative flex-1 bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden mb-6 shadow-sm">
        {uri ? (
          // <Image
          //   source={{ uri }}
          //   className="flex-1"
          //   contentFit="contain"
          //   transition={150}
          //   onError={() => {
          //     Alert.alert("Lỗi", "Không thể hiển thị ảnh đã quét");
          //   }}
          // />

          <RNImage
            source={{ uri }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
          />
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500 text-lg">Không có ảnh</Text>
          </View>
        )}

        {scanState === "processing" && (
          <View className="absolute inset-0 bg-white/95 justify-center items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-gray-900 text-xl font-semibold mt-4">
              Đang chấm điểm...
            </Text>
            <Text className="text-gray-600 text-base mt-2">
              Vui lòng đợi trong giây lát
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row gap-4">
        <TouchableOpacity
          onPress={resetScan}
          className={`flex-1 flex-row items-center justify-center bg-gray-100 border border-gray-300 py-4 rounded-xl ${
            isProcessing ? "opacity-50" : ""
          }`}
          disabled={isProcessing}
        >
          <Ionicons name="refresh" size={22} color="#6b7280" />
          <Text className="text-gray-700 text-base font-semibold ml-2">
            Quét lại
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={processAndUpload}
          className={`flex-1 flex-row items-center justify-center bg-blue-600 py-4 rounded-xl shadow-lg ${
            isProcessing ? "opacity-50" : ""
          }`}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="checkmark" size={22} color="white" />
          )}
          <Text className="text-white text-base font-bold ml-2">
            {isProcessing ? "Đang xử lý..." : "Chấm điểm"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {!uri ? renderScanButton() : renderImagePreview()}

        {scanResults.length > 0 && (
          <View className="mx-6 mb-6">
            <Text className="text-gray-900 text-xl font-bold mb-4">
              Kết quả đã quét ({scanResults.length})
            </Text>
            {scanResults
              .slice(-3)
              .reverse()
              .map((result) => (
                <View
                  key={result.id}
                  className="flex-row items-center justify-between bg-gray-50 border border-gray-200 p-4 rounded-xl mb-3 shadow-sm"
                >
                  <View className="flex-1">
                    <Text className="text-gray-500 text-sm mb-1">
                      {result.timestamp.toLocaleTimeString("vi-VN")}
                    </Text>
                    <Text className="text-gray-900 text-base font-semibold">
                      Điểm: {result.result?.score || 0}/
                      {result.result?.total_questions || 0}
                    </Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={28} color="#10b981" />
                </View>
              ))}
            {scanResults.length > 3 && (
              <Text className="text-gray-500 text-sm text-center mt-2">
                và {scanResults.length - 3} kết quả khác...
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Wrapper với navigation context recovery
export default function ScanExam() {
  const [retryCount, setRetryCount] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Reset error state khi component mount
  useEffect(() => {
    setHasError(false);
    setRetryCount(0);
  }, []);

  if (hasError && retryCount < 3) {
    // Auto retry sau 1 giây
    setTimeout(() => {
      setRetryCount((prev) => prev + 1);
      setHasError(false);
    }, 1000);

    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 text-base mt-4">
          Đang khôi phục... ({retryCount + 1}/3)
        </Text>
      </SafeAreaView>
    );
  }

  if (hasError && retryCount >= 3) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-red-500 text-lg mb-4">Lỗi navigation</Text>
        <Text className="text-gray-600 text-base text-center px-6 mb-4">
          Không thể khôi phục navigation context
        </Text>
        <TouchableOpacity
          onPress={() => {
            setHasError(false);
            setRetryCount(0);
          }}
          className="bg-blue-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Thử lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  try {
    return <ScanExamContent />;
  } catch (error) {
    console.log("Navigation context error:", error);
    setHasError(true);
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 text-base mt-4">Đang xử lý...</Text>
      </SafeAreaView>
    );
  }
}
