import { apiSecondary } from "@/config/axios";
import { useGetGradingSessionById } from "@/services/gradingService";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DocumentScanner from "react-native-document-scanner-plugin";

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
  answerSheetKeys: any[]
) => {
  try {
    const correctAnswersString = JSON.stringify(answerSheetKeys);

    const formData = new FormData();
    const fileName = imageUri.split("/").pop() || "photo.jpg";
    const mimeType = getMimeType(imageUri);

    formData.append("file", {
      uri: imageUri,
      name: fileName,
      type: mimeType,
    } as any);

    console.log("correctAnswersString ------- ", correctAnswersString);

    formData.append("correct_answers", correctAnswersString);

    const res = await apiSecondary.post("/mark-correct-answers/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("📬 Server response:", res.data);
    return res.data; // Return data instead of showing alert
  } catch (err: any) {
    console.error("❌ Upload error:", err.message);
    throw err; // Throw error to be handled by caller
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

export default function ScanExam() {
  const [uri, setUri] = useState<string | null>(null);
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [currentResult, setCurrentResult] = useState<any>(null);

  const { id: idGradingSession } = useLocalSearchParams();
  const { data: gradingSessionData } = useGetGradingSessionById(
    idGradingSession as string,
    {
      enabled: !!idGradingSession,
    }
  );

  const answerSheetKeys = gradingSessionData?.data?.answer_sheet_keys || [];
  const sessionName = gradingSessionData?.data?.name || "Phiên chấm điểm";

  const scan = async () => {
    try {
      setScanState("scanning");
      const { scannedImages, status } = await DocumentScanner.scanDocument({
        croppedImageQuality: 95,
      });

      if (status !== "success" || !scannedImages?.length) {
        setScanState("idle");
        return;
      }

      setUri(scannedImages[0]);
      setScanState("scanned");
    } catch (e: any) {
      setScanState("error");
      Alert.alert("Scan lỗi", e?.message ?? "Không thể quét.");
    }
  };

  const processAndUpload = async () => {
    if (!uri) return;

    try {
      setScanState("processing");
      setIsProcessing(true);

      // Resize và nén ảnh trước khi upload
      const optimized = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1280 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Gọi API chấm điểm
      const result = await uploadAnswerSheetImage(
        optimized.uri,
        answerSheetKeys
      );

      // Tạo scan result mới
      const newScanResult: ScanResult = {
        id: Date.now().toString(),
        imageUri: optimized.uri,
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
        <Image
          source={{ uri: uri! }}
          className="flex-1"
          contentFit="contain"
          transition={150}
        />
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
