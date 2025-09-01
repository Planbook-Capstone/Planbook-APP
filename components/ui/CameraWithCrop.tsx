import { apiSecondary } from "@/config/axios";
import { useCreateMaterialInternalService } from "@/services/materialServices";
import { OMRResponse } from "@/types/OMRResponse";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, FlashMode, useCameraPermissions } from "expo-camera";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as MediaLibrary from "expo-media-library";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface Point {
  x: number;
  y: number;
}

interface PreviewMetadata {
  width: number;
  height: number;
  fitMode: "contain" | "cover" | "preview";
}

interface ImageMetadata {
  width: number;
  height: number;
  exifOrientation?: number;
  rotation: number;
  mirrored: boolean;
}

interface MarkerROI {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Metadata format theo spec yêu cầu
interface OMRMetadata {
  // Ưu tiên: gửi imageCorners đã map sẵn
  imageCorners?: Point[];

  // Fallback: gửi đầy đủ để BE tự map
  preview?: PreviewMetadata;
  image?: ImageMetadata;
  previewCorners?: Point[];

  // Optional: ROI để BE refine nhanh hơn
  marker_rois?: MarkerROI[];
}

interface CameraWithCropProps {
  onImageCaptured?: (uri: string) => void;
  onOMRResult?: (result: OMRResponse) => void;
  onClose?: () => void;
}

export default function CameraWithCrop({
  onImageCaptured,
  onOMRResult,
  onClose,
}: CameraWithCropProps) {
  const { mutate: uploadAvatar } = useCreateMaterialInternalService();
  const [permission, requestPermission] = useCameraPermissions();
  // const [facing, setFacing] = useState<"front" | "back">("back");
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cropMode, setCropMode] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [flash, setFlash] = useState<FlashMode>('on');

  // Safe area insets để tránh status bar và tai thỏ
  const insets = useSafeAreaInsets();

  // Metadata tracking
  const [previewMetadata, setPreviewMetadata] = useState<PreviewMetadata>({
    width: screenWidth,
    height: screenHeight,
    fitMode: "cover", // Camera thường dùng cover mode
  });
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata>({
    width: 0,
    height: 0,
    exifOrientation: 1,
    rotation: 0,
    mirrored: false, // Front camera thường bị mirror
  });

  // ===== FIXED CAMERA VIEWPORT SYSTEM =====
  // Tạo viewport cố định với aspect ratio 3:4 (portrait) để đảm bảo consistency
  const VIEWPORT_ASPECT_RATIO = 3 / 4; // width / height
  const CONTROLS_HEIGHT = 120; // Chiều cao controls dưới
  const TOP_MARGIN = 60; // Margin trên cho safe area

  // Tính toán viewport dimensions
  // IMPORTANT: Status bar đã ẩn, không cần safe area insets
  const availableHeight = screenHeight - CONTROLS_HEIGHT - TOP_MARGIN;
  const availableWidth = screenWidth;

  let viewportWidth: number, viewportHeight: number;

  if (availableWidth / availableHeight > VIEWPORT_ASPECT_RATIO) {
    // Screen rộng hơn viewport ratio -> giới hạn bởi height, có black bars trái/phải
    viewportHeight = availableHeight;
    viewportWidth = viewportHeight * VIEWPORT_ASPECT_RATIO;
  } else {
    // Screen cao hơn viewport ratio -> giới hạn bởi width, có black bars trên/dưới
    viewportWidth = availableWidth;
    viewportHeight = viewportWidth / VIEWPORT_ASPECT_RATIO;
  }

  // Center viewport trong available space (không cần safe area)
  const viewportX = (screenWidth - viewportWidth) / 2;
  const viewportY = TOP_MARGIN + (availableHeight - viewportHeight) / 2;

  console.log("📱 Fixed Viewport System (No Status Bar):", {
    screen: { width: screenWidth, height: screenHeight },
    available: { width: availableWidth, height: availableHeight },
    viewport: {
      width: viewportWidth.toFixed(1),
      height: viewportHeight.toFixed(1),
      x: viewportX.toFixed(1),
      y: viewportY.toFixed(1),
      aspectRatio: VIEWPORT_ASPECT_RATIO,
    },
  });

  // Tính toán vị trí 4 ô theo tỷ lệ A4 trong viewport
  const paperRatio = 297 / 210; // Tỷ lệ A4: chiều cao / chiều rộng
  const cropMargin = 40; // Margin từ edge của viewport
  const cropAvailableWidth = viewportWidth - cropMargin * 2;
  const cropAvailableHeight = viewportHeight - cropMargin * 2;

  // Tính kích thước vùng crop theo tỷ lệ A4 trong viewport
  let cropWidth, cropHeight;
  if (cropAvailableWidth / cropAvailableHeight > 1 / paperRatio) {
    // Giới hạn bởi chiều cao
    cropHeight = cropAvailableHeight;
    cropWidth = cropHeight / paperRatio;
  } else {
    // Giới hạn bởi chiều rộng
    cropWidth = cropAvailableWidth;
    cropHeight = cropWidth * paperRatio;
  }

  // Căn giữa vùng crop trong viewport (relative coordinates)
  const cropStartX = (viewportWidth - cropWidth) / 2;
  const cropStartY = (viewportHeight - cropHeight) / 2;

  // Convert sang absolute screen coordinates
  const startX = viewportX + cropStartX;
  const startY = viewportY + cropStartY;

  const cropPoints: Point[] = [
    { x: startX, y: startY }, // Top-left (góc trên trái)
    { x: startX + cropWidth, y: startY }, // Top-right (góc trên phải)
    { x: startX + cropWidth, y: startY + cropHeight }, // Bottom-right (góc dưới phải)
    { x: startX, y: startY + cropHeight }, // Bottom-left (góc dưới trái)
  ];

  console.log("🎯 Crop Points in Fixed Viewport:", {
    viewport: {
      x: viewportX.toFixed(1),
      y: viewportY.toFixed(1),
      w: viewportWidth.toFixed(1),
      h: viewportHeight.toFixed(1),
    },
    crop: { w: cropWidth.toFixed(1), h: cropHeight.toFixed(1) },
    cropRelative: { x: cropStartX.toFixed(1), y: cropStartY.toFixed(1) },
    cropAbsolute: { x: startX.toFixed(1), y: startY.toFixed(1) },
    points: cropPoints
      .map((p) => `(${p.x.toFixed(1)}, ${p.y.toFixed(1)})`)
      .join(", "),
  });

  const cameraRef = useRef<CameraView>(null);

  // Helper function để tạo ROI metadata từ vị trí thực tế của 4 ô xanh (Fixed Viewport System)
  const createROIFromCropPoints = (
    cropPoints: Point[],
    previewWidth: number,
    previewHeight: number
  ): any => {
    // Kích thước ROI = 60x60px (đủ bao quanh marker)
    const roiWidth = 60;
    const roiHeight = 60;

    console.log("🎯 Creating ROI from Fixed Viewport crop points:", {
      cropPoints,
      previewSize: `${previewWidth}x${previewHeight}px`,
      roiSize: `${roiWidth}x${roiHeight}px`,
      viewport: {
        x: viewportX.toFixed(1),
        y: viewportY.toFixed(1),
        w: viewportWidth.toFixed(1),
        h: viewportHeight.toFixed(1),
      },
    });

    // ===== FIXED VIEWPORT COORDINATE TRANSFORMATION =====
    // cropPoints hiện tại là absolute screen coordinates
    // Cần convert sang viewport-relative coordinates, sau đó sang preview coordinates

    const rois = cropPoints.map((point, index) => {
      // VIEWPORT CAMERA: Coordinates đã là viewport-relative từ đầu
      // Chỉ cần scale từ viewport sang preview
      const viewportRelativeX = point.x - viewportX;
      const viewportRelativeY = point.y - viewportY;

      console.log(`🔄 Point ${index + 1} (Viewport Camera):`, {
        absolute: { x: point.x.toFixed(1), y: point.y.toFixed(1) },
        viewportRelative: {
          x: viewportRelativeX.toFixed(1),
          y: viewportRelativeY.toFixed(1),
        },
      });

      // Scale từ viewport sang preview
      const scaleX = previewWidth / viewportWidth;
      const scaleY = previewHeight / viewportHeight;

      const previewX = viewportRelativeX * scaleX;
      const previewY = viewportRelativeY * scaleY;

      console.log(`   � Scale to preview:`, {
        viewport: `${viewportWidth}x${viewportHeight}`,
        preview: `${previewWidth}x${previewHeight}`,
        scale: { x: scaleX.toFixed(3), y: scaleY.toFixed(3) },
        result: { x: previewX.toFixed(1), y: previewY.toFixed(1) },
      });

      // Step 3: Center ROI on preview coordinates và clamp vào biên ảnh
      const x = Math.max(
        0,
        Math.min(previewWidth - roiWidth, Math.round(previewX - roiWidth / 2))
      );
      const y = Math.max(
        0,
        Math.min(
          previewHeight - roiHeight,
          Math.round(previewY - roiHeight / 2)
        )
      );

      const roi = {
        x,
        y,
        width: roiWidth,
        height: roiHeight,
      };

      console.log(
        `📦 ROI ${index + 1} final: screen(${point.x.toFixed(
          1
        )}, ${point.y.toFixed(1)}) → viewport(${viewportRelativeX.toFixed(
          1
        )}, ${viewportRelativeY.toFixed(1)}) → preview(${previewX.toFixed(
          1
        )}, ${previewY.toFixed(1)}) → roi(${x}, ${y})`
      );

      // Validation: Kiểm tra ROI có nằm trong bounds không
      const roiCenterX = x + roiWidth / 2;
      const roiCenterY = y + roiHeight / 2;
      const isInBounds =
        x >= 0 &&
        y >= 0 &&
        x + roiWidth <= previewWidth &&
        y + roiHeight <= previewHeight;
      const wasClampedX = x !== Math.round(previewX - roiWidth / 2);
      const wasClampedY = y !== Math.round(previewY - roiHeight / 2);

      if (wasClampedX || wasClampedY || !isInBounds) {
        console.warn(`   ⚠️ ROI ${index + 1} clamping/bounds issue:`, {
          center: { x: roiCenterX.toFixed(1), y: roiCenterY.toFixed(1) },
          bounds: { x: `0-${previewWidth}`, y: `0-${previewHeight}` },
          inBounds: isInBounds,
          clamped: { x: wasClampedX, y: wasClampedY },
        });
      }

      return roi;
    });

    console.log("✅ Fixed Viewport ROI Metadata created:", {
      system: "Fixed Viewport",
      rois: rois.length,
      roiData: rois,
      summary: `${
        rois.length
      } ROIs for ${previewWidth}x${previewHeight} preview from ${viewportWidth.toFixed(
        1
      )}x${viewportHeight.toFixed(1)} viewport`,
    });

    return {
      rois: rois, // Theo thứ tự cropPoints: TL, TR, BR, BL
    };
  };

  useEffect(() => {
    (async () => {
      // Xin quyền media library ngay từ đầu
      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
      console.log(
        "Media library permission status:",
        mediaLibraryStatus.status
      );
      if (mediaLibraryStatus.status !== "granted") {
        Alert.alert(
          "Cần quyền truy cập",
          "Ứng dụng cần quyền truy cập thư viện ảnh để lưu ảnh"
        );
      }
    })();
  }, []);

  // Update preview metadata when screen dimensions change
  useEffect(() => {
    setPreviewMetadata((prev) => ({
      ...prev,
      width: screenWidth,
      height: screenHeight,
    }));
  }, [screenWidth, screenHeight]);

  // Removed PanResponder - boxes are now fixed

  const takePicture = async () => {
    if (cameraRef.current && !isCapturing) {
      setIsCapturing(true);
      try {
        // Chụp ảnh preview với quality cao, không EXIF để tránh rotation
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.95, // JPEG quality ≥ 90
          base64: false,
          exif: false, // Gỡ EXIF rotation → luôn lưu ảnh ở orientation chuẩn (0°)
          skipProcessing: false, // Đảm bảo ảnh được xử lý đúng
        });

        console.log("🖼️ Ảnh gốc đã chụp (URI):", photo.uri);
        console.log("🧾 Metadata ảnh:", {
          width: photo.width,
          height: photo.height,
          uri: photo.uri,
          base64Included: !!photo.base64,
        });

        // Lấy thông tin ảnh preview thực tế
        const imageInfo = await ImageManipulator.manipulateAsync(photo.uri);
        console.log("🔧 Ảnh sau crop hoặc xử lý:", imageInfo.uri);

        const { width: previewWidth, height: previewHeight } = imageInfo;

        console.log("📐 Preview dimensions (actual):", {
          previewWidth,
          previewHeight,
        });
        console.log("📱 Screen dimensions:", {
          width: screenWidth,
          height: screenHeight,
        });

        // Cập nhật preview metadata với kích thước thực tế của ảnh
        setPreviewMetadata((prev) => ({
          ...prev,
          width: previewWidth,
          height: previewHeight,
          fitMode: "preview", // Đánh dấu đây là ảnh preview
        }));

        // Cập nhật image metadata (không cần nữa vì dùng preview)
        setImageMetadata((prev) => ({
          ...prev,
          width: previewWidth,
          height: previewHeight,
          exifOrientation: 1, // Luôn 0° vì đã gỡ EXIF
          rotation: 0,
          mirrored: false,
        }));

        // Lưu ảnh preview để gửi API
        setCapturedImage(photo.uri);
        setCropMode(true);
      } catch (error) {
        Alert.alert("Lỗi", "Không thể chụp ảnh");
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const getMimeType = (uri: string): string => {
    if (uri.endsWith(".jpg") || uri.endsWith(".jpeg")) return "image/jpeg";
    if (uri.endsWith(".png")) return "image/png";
    if (uri.endsWith(".heic")) return "image/heic"; // iOS default
    return "image/*";
  };

  const uploadToProcessImageAPI = async (imageUri: string) => {
    try {
      const formData = new FormData();
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      const fileName = imageUri.split("/").pop() || "photo.jpg";
      const mimeType = getMimeType(imageUri);
      console.log("mime type: ", mimeType);

      formData.append("file", {
        uri: imageUri,
        name: fileName,
        type: mimeType,
      } as any);

      uploadAvatar(formData, {
        onSuccess: async (response: any) => {
          const imageUrl = response?.data?.data?.url;

          if (!imageUrl) {
            console.warn("Không lấy được URL ảnh từ uploadAvatar response");
            return;
          }

          console.log("✅ Uploaded image URL:", imageUrl);

          // 2. Gửi ảnh qua API /process-image-url/ với JSON body
          const res = await apiSecondary.post("/process-image-url/", {
            image_url: imageUrl,
          });

          console.log("📬 Xử lý ảnh thành công:", res.data);
          Alert.alert("✅ Xử lý thành công", JSON.stringify(res.data, null, 2));
        },
        onError: (error: any) => {
          console.error("Avatar upload error:", error);
          // reject(error);
        },
      });

      // console.log("📬 API response:", response.data);
      // Alert.alert(
      //   "✅ Gửi ảnh thành công!",
      //   JSON.stringify(response.data, null, 2)
      // );
    } catch (err: any) {
      console.error("❌ Upload error:", err.message);
      Alert.alert("❌ Lỗi gửi ảnh", err.message || "Không rõ lỗi");
    }
  };

  const saveImageToLibrary = async () => {
    if (!capturedImage) return;

    try {
      console.log("💾 Saving ORIGINAL image to library:", capturedImage);
      console.log("📐 With corners data:", cropPoints);

      // // Lưu ảnh gốc vào thư viện
      // const asset = await MediaLibrary.createAssetAsync(capturedImage);
      // console.log("✅ Asset created successfully:", asset);

      // 2. TỐI ƯU HÓA ẢNH TRƯỚC KHI UPLOAD
      // console.log("⏳ Optimizing image for upload...");
      // const manipResult = await ImageManipulator.manipulateAsync(
      //   capturedImage, // URI của ảnh gốc
      //   [
      //     // Giảm chiều rộng ảnh xuống tối đa 1280px, chiều cao tự động điều chỉnh
      //     { resize: { width: 1280 } },
      //   ],
      //   // Nén ảnh xuống 80% chất lượng (vẫn rất tốt cho việc hiển thị)
      //   { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      // );

      // console.log("📦 Optimized image created at:", manipResult.uri);

      await uploadToProcessImageAPI(capturedImage);
      // await uploadToProcessImageAPI(manipResult.uri); // Sử dụng URI của ảnh đã được tối ưu

      // Log corners data để copy vào Swagger
      // const cornersForSwagger = logSwaggerTestData(capturedImage, cropPoints);

      // Alert.alert(
      //   "✅ Lưu ảnh thành công!",
      //   "Ảnh gốc đã được lưu vào thư viện.\nKiểm tra console để lấy data test Swagger!",
      //   [
      //     { text: "OK", onPress: () => {} },
      //     {
      //       text: "Copy Corners",
      //       onPress: () => {
      //         // Có thể thêm copy to clipboard ở đây
      //         console.log(
      //           "COPY THIS CORNERS DATA:",
      //           JSON.stringify(cornersForSwagger)
      //         );
      //       },
      //     },
      //   ]
      // );

      if (onImageCaptured) {
        onImageCaptured(capturedImage);
      }

      // Reset state
      setCapturedImage(null);
      setCropMode(false);
    } catch (error) {
      console.error("Error saving image:", error);
      Alert.alert(
        "Lỗi",
        "Không thể lưu ảnh: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
    setCropMode(false);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Đang yêu cầu quyền truy cập camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Không có quyền truy cập camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Cấp quyền</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Đóng</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Ẩn status bar để có viewport sạch */}
      <StatusBar hidden={true} />

      {!cropMode ? (
        // Fixed Viewport Camera System - Camera chỉ trong viewport
        <>
          {/* Black background cho toàn màn hình */}
          <View style={styles.fullScreenBackground} />

          {/* Fixed Viewport Container với black borders */}
          <View style={styles.fixedViewportContainer}>
            {/* Top black bar */}
            <View style={[styles.blackBar, { height: viewportY }]} />

            {/* Middle section với viewport và side bars */}
            <View style={styles.middleSection}>
              {/* Left black bar */}
              <View style={[styles.blackBar, { width: viewportX }]} />

              {/* Camera Viewport - Camera CHỈ render trong vùng này */}
              <View
                style={[
                  styles.cameraViewport,
                  {
                    width: viewportWidth,
                    height: viewportHeight,
                  },
                ]}
              >
                {/* Camera chỉ trong viewport - không fullscreen */}
                <CameraView
                  style={styles.viewportCamera}
                  facing={"back"}
                  ref={cameraRef}
                  flash={flash}
                />

                {/* Viewport border để user thấy rõ vùng active */}
                <View style={styles.viewportBorder} />

                {/* Crop points overlay - chỉ trong viewport */}
                {cropPoints.map((point, index) => (
                  <View
                    key={index}
                    style={[
                      styles.simpleCornerBox,
                      {
                        left: point.x - viewportX - 30, // Convert sang viewport coordinates
                        top: point.y - viewportY - 30,
                      },
                    ]}
                  >
                    <View style={styles.cornerSquare}>
                      {/* Bỏ số thứ tự - chỉ hiển thị ô vuông trong suốt */}
                    </View>
                  </View>
                ))}
              </View>

              {/* Right black bar */}
              <View
                style={[
                  styles.blackBar,
                  { width: screenWidth - viewportX - viewportWidth },
                ]}
              />
            </View>

            {/* Bottom black bar */}
            <View
              style={[
                styles.blackBar,
                {
                  height:
                    screenHeight - viewportY - viewportHeight - CONTROLS_HEIGHT,
                },
              ]}
            />
          </View>

          {/* Instructions overlay */}
          {showInstructions && (
            <View style={styles.instructionsOverlay}>
              <View style={styles.instructionsBox}>
                <Text style={styles.instructionsTitle}>Hướng dẫn chụp ảnh</Text>
                <Text style={styles.instructionsText}>
                  • Đặt 4 góc tờ giấy vào đúng 4 ô xanh cố định{"\n"}• Ô số 1:
                  Góc trên trái của tờ giấy{"\n"}• Ô số 2: Góc trên phải của tờ
                  giấy{"\n"}• Ô số 3: Góc dưới phải của tờ giấy{"\n"}• Ô số 4:
                  Góc dưới trái của tờ giấy{"\n"}• Giữ máy thẳng và ổn định
                  {"\n"}• Đảm bảo ánh sáng đủ và không bị mờ
                </Text>
                <TouchableOpacity
                  style={styles.instructionsButton}
                  onPress={() => setShowInstructions(false)}
                >
                  <Text style={styles.instructionsButtonText}>Đã hiểu</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.controls}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>

            <View style={styles.captureSection}>
              <TouchableOpacity
                style={[styles.captureButton, isCapturing && styles.capturing]}
                onPress={takePicture}
                disabled={isCapturing}
              >
                <View style={styles.captureButtonInner} />
                {isCapturing && (
                  <View style={styles.capturingIndicator}>
                    <Text style={styles.capturingText}>Chụp...</Text>
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.captureHint}>Chụp ảnh</Text>
            </View>

            <View style={styles.rightControls}>
              {/* <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  const newFacing = facing === "back" ? "front" : "back";
                  setFacing(newFacing);
                  // Cập nhật metadata khi đổi camera
                  setImageMetadata((prev) => ({
                    ...prev,
                    mirrored: newFacing === "front",
                  }));
                }}
              >
                <Ionicons name="camera-reverse" size={30} color="white" />
              </TouchableOpacity> */}
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  setFlash((prev) => (prev === "on" ? "off" : "on"))
                }
              >
                <Ionicons
                  name={flash === "on" ? "flash" : "flash-off"}
                  size={30}
                  color="white"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={() => setShowInstructions(true)}
              >
                <Ionicons name="help-circle" size={30} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </>
      ) : (
        // Crop Preview Mode
        <View style={styles.previewContainer}>
          {capturedImage && (
            <Image
              source={{ uri: capturedImage }}
              style={{
                width: screenWidth * 0.8,
                height: screenHeight * 0.4,
                resizeMode: "contain",
                marginBottom: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: "white",
              }}
            />
          )}

          <View style={styles.previewHeader}>
            <Ionicons name="checkmark-circle" size={40} color="#00FF00" />
            <Text style={styles.previewText}>Ảnh gốc đã chụp thành công!</Text>
          </View>

          {/* <View style={styles.cropInfoBox}>
            <Text style={styles.cropInfoTitle}>
              📋 Thông tin bài thi (CHUẨN - Cover Mode):
            </Text>
            <Text style={styles.cropInfoText}>
              {(() => {
                try {
                  // Tạo ROI để hiển thị thông tin (Fixed Viewport)
                  const metadata = createROIFromCropPoints(
                    cropPoints,
                    Math.round(viewportWidth),
                    Math.round(viewportHeight)
                  );

                  return `🔥 Fixed Viewport OMR Mode (KHÔNG CÒN LỖI COORDINATE!)
📐 Fixed Viewport: ${Math.round(viewportWidth)}x${Math.round(
                    viewportHeight
                  )}px (aspect ratio ${VIEWPORT_ASPECT_RATIO.toFixed(2)})
📱 Screen: ${screenWidth}x${screenHeight}px → Viewport: (${viewportX.toFixed(
                    1
                  )}, ${viewportY.toFixed(1)})
🎯 ROI Size: 60x60px (viewport-based coordinates)
📍 4 ROI Positions trong Viewport (TL,TR,BR,BL):
   ROI1: (${metadata.rois[0].x},${metadata.rois[0].y}) 60x60px
   ROI2: (${metadata.rois[1].x},${metadata.rois[1].y}) 60x60px
   ROI3: (${metadata.rois[2].x},${metadata.rois[2].y}) 60x60px
   ROI4: (${metadata.rois[3].x},${metadata.rois[3].y}) 60x60px
✅ Lợi ích: Consistent trên mọi device, không bị lệch safe area!
🚀 Gửi: Ảnh viewport + 4 ROI → BE tìm marker → warp → OMR`;
                } catch (error) {
                  return `❌ Lỗi hiển thị: ${error}`;
                }
              })()}
            </Text>
          </View> */}

          <Text style={styles.previewSubText}>
            Ảnh gốc + tọa độ đã convert sang image space + metadata đầy đủ sẽ
            được gửi đến FastAPI
          </Text>

          <View style={styles.previewControls}>
            <TouchableOpacity
              style={[styles.previewButton, styles.retakeButton]}
              onPress={retakePicture}
            >
              <Ionicons name="camera" size={20} color="white" />
              <Text style={styles.buttonText}>Chụp lại</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.previewButton,
                styles.testButton,
                isTestingConnection && styles.processingButton,
              ]}
              // onPress={testConnection}
              disabled={isTestingConnection}
            >
              {isTestingConnection ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="wifi" size={20} color="white" />
              )}
              <Text style={styles.buttonText}>
                {isTestingConnection ? "Đang test..." : "Test kết nối"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.previewButton,
                styles.integrationTestButton,
                isProcessing && styles.processingButton,
              ]}
              // onPress={runIntegrationTests}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="flask" size={20} color="white" />
              )}
              <Text style={styles.buttonText}>
                {isProcessing ? "Đang test..." : "Test tích hợp"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.previewButton,
                styles.omrButton,
                isProcessing && styles.processingButton,
              ]}
              // onPress={processWithOMR}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="analytics" size={20} color="white" />
              )}
              <Text style={styles.buttonText}>
                {isProcessing ? "Đang chấm..." : "Chấm điểm OMR"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.previewButton, styles.saveButton]}
              onPress={saveImageToLibrary}
            >
              <Ionicons name="save" size={20} color="white" />
              <Text style={styles.buttonText}>Lưu ảnh</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  text: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    margin: 20,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 100, // Leave space for controls
    zIndex: 1,
    pointerEvents: "box-none", // Allow touches to pass through
  },
  // ===== FIXED VIEWPORT STYLES =====
  fixedViewportContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    pointerEvents: "box-none",
  },
  blackBar: {
    backgroundColor: "rgba(0, 0, 0, 0.8)", // Semi-transparent black
  },
  middleSection: {
    flexDirection: "row",
    height: "auto",
  },
  cameraViewport: {
    position: "relative",
    overflow: "hidden",
  },
  viewportBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 8,
    zIndex: 1,
  },
  simpleCornerBox: {
    position: "absolute",
    width: 60, // Thu nhỏ từ 120 → 60px để khớp với ROI gửi đi
    height: 60, // Thu nhỏ từ 90 → 60px để khớp với ROI gửi đi
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    pointerEvents: "auto",
  },
  cornerSquare: {
    width: 60, // Thu nhỏ từ 120 → 60px để khớp với ROI gửi đi
    height: 60, // Thu nhỏ từ 90 → 60px để khớp với ROI gửi đi
    backgroundColor: "transparent", // Trong suốt để nhìn thấy camera
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3, // Thu nhỏ border từ 4 → 3px
    borderColor: "#00FF00", // Viền xanh lá
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, // Thu nhỏ shadow
    shadowOpacity: 0.8,
    shadowRadius: 4, // Thu nhỏ shadow radius
    elevation: 6, // Thu nhỏ elevation
  },
  cornerNumber: {
    color: "#00FF00",
    fontSize: 18,
    fontWeight: "bold",
    textShadowColor: "#000000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Nền đen mờ cho chữ
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  markerOuter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,255,0,0.8)",
    borderWidth: 3,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  markerInner: {
    width: 16,
    height: 16,
    backgroundColor: "white",
    borderRadius: 2,
  },
  markerNumber: {
    position: "absolute",
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textShadowColor: "black",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cornerGuides: {
    position: "absolute",
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  guideLine: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  guideHorizontal: {
    width: 60,
    height: 1,
  },
  guideVertical: {
    width: 1,
    height: 60,
  },
  centerCrosshair: {
    position: "absolute",
    left: screenWidth / 2 - 15,
    top: screenHeight / 2 - 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  crosshairLine: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  crosshairHorizontal: {
    width: 30,
    height: 1,
  },
  crosshairVertical: {
    width: 1,
    height: 30,
  },
  controls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 10,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  capturing: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "red",
  },
  previewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  previewText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  previewSubText: {
    color: "white",
    fontSize: 16,
    marginBottom: 40,
    textAlign: "center",
  },
  previewControls: {
    flexDirection: "column",
    gap: 15,
    alignItems: "center",
  },
  previewButton: {
    backgroundColor: "#666",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  instructionsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  instructionsBox: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    margin: 20,
    maxWidth: screenWidth * 0.8,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 15,
  },
  instructionsText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 20,
  },
  instructionsButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignSelf: "center",
  },
  instructionsButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  captureSection: {
    alignItems: "center",
  },
  captureHint: {
    color: "white",
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
  },
  capturingIndicator: {
    position: "absolute",
    bottom: -25,
  },
  capturingText: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
  },
  rightControls: {
    alignItems: "center",
    gap: 10,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  cropInfoBox: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  cropInfoTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cropInfoText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    lineHeight: 20,
  },
  retakeButton: {
    backgroundColor: "#666",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  gridOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  gridVertical: {
    width: 1,
    height: "100%",
  },
  gridHorizontal: {
    height: 1,
    width: "100%",
  },
  cropOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cropLine: {
    position: "absolute",
    height: 3,
    backgroundColor: "#00FF00",
    opacity: 0.8,
    transformOrigin: "0 50%",
  },
  darkBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  transparentCropArea: {
    position: "absolute",
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#00FF00",
    borderStyle: "dashed",
  },
  cropBorderLine: {
    position: "absolute",
    height: 3,
    backgroundColor: "#00FF00",
    opacity: 0.9,
    transformOrigin: "0 50%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  omrButton: {
    backgroundColor: "#FF6B35", // Màu cam nổi bật cho chức năng chính
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  processingButton: {
    backgroundColor: "#999", // Màu xám khi đang xử lý
    opacity: 0.7,
  },
  testButton: {
    backgroundColor: "#17A2B8", // Màu xanh dương cho test
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  integrationTestButton: {
    backgroundColor: "#6F42C1", // Màu tím cho integration test
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fullScreenBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
  },
  viewportCamera: {
    width: "100%",
    height: "100%",
  },
});
