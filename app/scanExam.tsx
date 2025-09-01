import { apiSecondary } from "@/config/axios";
import { Image } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DocumentScanner from "react-native-document-scanner-plugin";
import * as MediaLibrary from "expo-media-library";


// === MIME ===
const getMimeType = (uri: string): string => {
  if (uri.endsWith(".jpg") || uri.endsWith(".jpeg")) return "image/jpeg";
  if (uri.endsWith(".png")) return "image/png";
  if (uri.endsWith(".heic")) return "image/heic";
  return "image/*";
};

// === Gửi API ===
const uploadToProcessImageAPI = async (imageUri: string) => {
  try {
    const formData = new FormData();
    const fileName = imageUri.split("/").pop() || "photo.jpg";
    const mimeType = getMimeType(imageUri);

    formData.append("file", {
      uri: imageUri,
      name: fileName,
      type: mimeType,
    } as any);

    const res = await apiSecondary.post("/process-image/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    Alert.alert("✅ Gửi ảnh thành công!", JSON.stringify(res.data, null, 2));
    console.log("📬 Server response:", res.data);
  } catch (err: any) {
    console.error("❌ Upload error:", err.message);
    Alert.alert("❌ Lỗi gửi ảnh", err.message || "Không rõ lỗi");
  }
};

export default function ScanLikeNotes() {
  const [uri, setUri] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const scan = async () => {
    try {
      const { scannedImages, status } = await DocumentScanner.scanDocument({
        croppedImageQuality: 95,
      });

      if (status !== "success" || !scannedImages?.length) return;

      setUri(scannedImages[0]);
    } catch (e: any) {
      Alert.alert("Scan lỗi", e?.message ?? "Không thể quét.");
    }
  };

  const processAndUpload = async () => {
    if (!uri) return;

    try {
      setSending(true);

      // Resize và nén ảnh trước khi upload
      const optimized = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1280 } }],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      console.log("📦 Ảnh đã nén:", optimized.uri);

      // Gửi ảnh đã tối ưu lên server
      await uploadToProcessImageAPI(optimized.uri);

        // (tuỳ chọn) Lưu vào thư viện
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === "granted") {
          await MediaLibrary.saveToLibraryAsync(optimized.uri);
          Alert.alert("Đã lưu", "Ảnh đã quét đã lưu vào Photos.");
        }

      // Reset
      setUri(null);
    } catch (error: any) {
      Alert.alert("Lỗi", error?.message || "Không thể xử lý ảnh");
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0b0b0b", padding: 16 }}>
      {!uri ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Text style={{ color: "#e5e7eb", fontSize: 18, textAlign: "center" }}>
            Quét tài liệu như Apple Notes (on-device)
          </Text>
          <TouchableOpacity
            onPress={scan}
            style={{
              backgroundColor: "#22d3ee",
              padding: 14,
              borderRadius: 14,
            }}
          >
            <Text style={{ color: "#001a1a", fontWeight: "800" }}>
              Bắt đầu quét
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <Image
            source={{ uri }}
            style={{ flex: 1 }}
            contentFit="contain"
            transition={150}
          />
          <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
            <TouchableOpacity
              onPress={() => setUri(null)}
              style={{
                flex: 1,
                padding: 14,
                backgroundColor: "#111827",
                borderRadius: 12,
              }}
              disabled={sending}
            >
              <Text style={{ color: "#fff", textAlign: "center" }}>
                {sending ? "Đang xử lý…" : "Quét lại"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={processAndUpload}
              style={{
                flex: 1,
                padding: 14,
                backgroundColor: "#22d3ee",
                borderRadius: 12,
              }}
              disabled={sending}
            >
              <Text
                style={{
                  color: "#001a1a",
                  textAlign: "center",
                  fontWeight: "800",
                }}
              >
                {sending ? "Đang gửi..." : "Gửi & Lưu"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
