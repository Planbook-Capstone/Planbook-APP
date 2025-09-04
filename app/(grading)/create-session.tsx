import { gradingSessionSchema } from "@/schemas/gradingSessionSchema";
import {
  useCreateGradingSession,
  useGetOMRTemplates,
} from "@/services/gradingService";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { showMessage } from "react-native-flash-message";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

// Interface definitions
interface SectionConfig {
  sectionOrder: number;
  sectionType: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "ESSAY";
  questionCount: number | string;
  pointsPerQuestion?: number | string;
  rule?: {
    "1": number | string;
    "2": number | string;
    "3": number | string;
    "4": number | string;
  };
}

interface FormData {
  name: string;
  book_type_id: string;
  omr_template_id: number;
  section_config_json: SectionConfig[];
}

const CreateGradingSessionScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const createGradingSessionMutation = useCreateGradingSession();
  const { id: idBooktype } = useLocalSearchParams();
  console.log("🔎 ID truyền vào:", idBooktype);

  // Get OMR templates
  const { data: omrTemplates, isLoading: isLoadingTemplates } =
    useGetOMRTemplates();

  // Log OMR templates data
  console.log("🔍 OMR Templates data:", omrTemplates?.data?.content);

  // Modal state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isStructureDisabled, setIsStructureDisabled] = useState(true);

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    book_type_id: typeof idBooktype === "string" ? idBooktype : "",
    omr_template_id: 1, // Default or based on selection
    section_config_json: [
      {
        sectionOrder: 1,
        sectionType: "MULTIPLE_CHOICE",
        questionCount: "",
        pointsPerQuestion: "",
      },
      {
        sectionOrder: 2,
        sectionType: "TRUE_FALSE",
        questionCount: "",
        rule: {
          "1": "",
          "2": "",
          "3": "",
          "4": "",
        },
      },
      {
        sectionOrder: 3,
        sectionType: "ESSAY",
        questionCount: "",
        pointsPerQuestion: "",
      },
    ],
  });

  // Helper function to get error message for a field
  const getFieldError = (fieldPath: string) => {
    return validationErrors[fieldPath];
  };

  // Update form data functions
  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const updateSectionConfig = (
    sectionIndex: number,
    field: string,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      section_config_json: prev.section_config_json.map((section, index) =>
        index === sectionIndex ? { ...section, [field]: value } : section
      ),
    }));

    // Clear error for this field when user starts typing
    const fieldPath = `section_config_json.${sectionIndex}.${field}`;
    if (validationErrors[fieldPath]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldPath];
        return newErrors;
      });
    }
  };

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template);
    updateFormData("omr_template_id", template.id);
    setShowTemplateModal(false);
    setIsStructureDisabled(false); // Enable the form section
  };

  const updateTrueFalseRule = (ruleKey: string, value: number | string) => {
    setFormData((prev) => {
      const newSections = [...prev.section_config_json];
      const trueFalseSection = newSections[1];

      if (trueFalseSection && trueFalseSection.sectionType === "TRUE_FALSE") {
        // Ensure rule exists and has a default structure
        const currentRule = trueFalseSection.rule || {
          "1": "",
          "2": "",
          "3": "",
          "4": "",
        };

        // Create the updated rule
        const updatedRule = {
          ...currentRule,
          [ruleKey]: value,
        };

        // Update the section with the new rule
        newSections[1] = { ...trueFalseSection, rule: updatedRule };
      }

      return { ...prev, section_config_json: newSections };
    });

    // Clear error for this field when user starts typing
    const fieldPath = `section_config_json.1.rule.${ruleKey}`;
    if (validationErrors[fieldPath]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldPath];
        return newErrors;
      });
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Clear previous errors
    setValidationErrors({});

    console.log(
      "📝 Dữ liệu người dùng nhập (trước khi validate):",
      JSON.stringify(formData, null, 2)
    );

    const result = gradingSessionSchema.safeParse(formData);

    if (!result.success) {
      // Process Zod errors and map them to field paths
      const errors: Record<string, string> = {};

      console.log("Validation errors:", JSON.stringify(result.error, null, 2));

      result.error.issues.forEach((issue) => {
        // The path from Zod is the complete path to the field.
        // We just need to join it to create the key for our state.
        const path = issue.path.join(".");
        errors[path] = issue.message;
      });

      setValidationErrors(errors);
      return;
    }

    const validatedData = result.data;

    try {
      // Log request data before submitting
      console.log(
        "📤 Request data trước khi POST:",
        JSON.stringify(validatedData, null, 2)
      );

      // Submit data
      const response = await createGradingSessionMutation.mutateAsync(
        validatedData as any
      );

      showMessage({
        message: response?.data?.message || "Tạo phiên thành công!",
        type: "success",
        icon: "success",
      });
      router.back();
    } catch (e: any) {
      let message = "Đã xảy ra lỗi không xác định";

      // Nếu có response và có data
      if (e?.response?.data) {
        const data = e.response.data;
        if (typeof data === "string") {
          message = data;
        } else if (typeof data === "object" && data.message) {
          message = data.message;
        }
      }
      showMessage({
        message: message,
        type: "danger",
        icon: "danger",
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white pt-8" edges={["bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80} // Có thể điều chỉnh theo header height
      >
        <ScrollView className="flex-1 px-5">
          {/* Section 1: Thông tin chung */}
          <View className="mb-4">
            <Text className="text-xl font-calsans mb-3">
              1. Thông tin chung
            </Text>
            <View>
              <Text className="mb-1 text-lg font-questrial text-gray-800">
                Tên bài
              </Text>
              <TextInput
                placeholder="Nhập tên bài"
                value={formData.name}
                onChangeText={(text) => updateFormData("name", text)}
                className={`border rounded-md py-4 pl-2 font-questrial  text-gray-900 ${
                  getFieldError("name") ? "border-red-500" : "border-gray-200"
                }`}
              />
              {getFieldError("name") && (
                <Text className="text-red-500 text-xs mt-1 mb-3">
                  {getFieldError("name")}
                </Text>
              )}
              {!getFieldError("name") && <View className="mb-4" />}

              <Text className="mb-1 text-lg font-questrial text-gray-800">
                Mẫu phiếu OMR
              </Text>
              <TouchableOpacity
                onPress={() => setShowTemplateModal(true)}
                className={`border rounded-md py-4 pl-2 font-questrial flex-row justify-between items-center ${
                  getFieldError("omr_template_id")
                    ? "border-red-500"
                    : "border-gray-200"
                }`}
              >
                <Text className="text-sm text-gray-700">
                  {selectedTemplate
                    ? selectedTemplate.name
                    : "Vui lòng chọn mẫu phiếu OMR"}
                </Text>
                <Text className="text-gray-500">{">"}</Text>
              </TouchableOpacity>
              {getFieldError("omr_template_id") && (
                <Text className="text-red-500 text-xs mt-1">
                  {getFieldError("omr_template_id")}
                </Text>
              )}

              {/* <View className="flex-row justify-between items-center">
                <Text className="text-sm text-gray-800">
                  Tùy chỉnh quét số báo danh
                </Text>
                <Switch value={isSBDEnabled} onValueChange={setIsSBDEnabled} />
              </View> */}
            </View>
          </View>

          {/* Section 2: Cấu trúc đề thi */}
          <View
            className={`mb-6 ${isStructureDisabled ? "opacity-50" : ""}`}
            pointerEvents={isStructureDisabled ? "none" : "auto"}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xl font-calsans">2. Cấu trúc đề thi</Text>
              <TouchableOpacity className="flex-row items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-400 rounded-full">
                <Text className="text-white text-sm font-medium font-questrial">
                  Tự phân bổ
                </Text>
              </TouchableOpacity>
            </View>

            {/* Phần 1 - Trắc nghiệm */}
            <View className="bg-white rounded-lg mb-3">
              <TouchableOpacity className="flex-row justify-between items-center mb-2 bg-neutral-800 px-4 py-2 rounded-full">
                <Text className="text-white text-lg font-calsans">
                  Phần 1 - Trắc nghiệm
                </Text>
                {/* <Text className="text-white">⌄</Text> */}
              </TouchableOpacity>

              <Text className="mb-1 font-questrial text-lg">Số câu</Text>
              <TextInput
                placeholder="40"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={formData.section_config_json[0].questionCount.toString()}
                onChangeText={(text) =>
                  updateSectionConfig(0, "questionCount", parseInt(text) || 0)
                }
                className={`border rounded-md px-4 py-3 text-sm text-gray-900 ${
                  getFieldError("section_config_json.0.questionCount")
                    ? "border-red-500"
                    : "border-gray-200"
                }`}
              />
              {getFieldError("section_config_json.0.questionCount") && (
                <Text className="text-red-500 text-xs mt-1 mb-3">
                  {getFieldError("section_config_json.0.questionCount")}
                </Text>
              )}
              {!getFieldError("section_config_json.0.questionCount") && (
                <View className="mb-4" />
              )}

              <Text className="mb-1 font-questrial text-lg">Điểm / câu</Text>
              <TextInput
                placeholder="0.25"
                placeholderTextColor="#9ca3af"
                keyboardType="decimal-pad"
                value={
                  formData.section_config_json[0].pointsPerQuestion?.toString() ||
                  ""
                }
                onChangeText={(text) => {
                  const sanitizedText = text.replace(/,/g, ".");
                  if (/^\d*\.?\d*$/.test(sanitizedText)) {
                    updateSectionConfig(0, "pointsPerQuestion", sanitizedText);
                  }
                }}
                className={`border rounded-md px-4 py-3 text-sm text-gray-900 ${
                  getFieldError("section_config_json.0.pointsPerQuestion")
                    ? "border-red-500"
                    : "border-gray-200"
                }`}
              />
              {getFieldError("section_config_json.0.pointsPerQuestion") && (
                <Text className="text-red-500 text-xs mt-1">
                  {getFieldError("section_config_json.0.pointsPerQuestion")}
                </Text>
              )}
            </View>

            {/* Phần 2 - Đúng/sai nhiều ý */}
            <View className="bg-white rounded-lg ">
              <TouchableOpacity className="flex-row justify-between items-center mb-2 bg-neutral-800 px-4 py-2 rounded-full">
                <Text className="text-white text-lg  font-calsans">
                  Phần 2 - Đúng/sai
                </Text>
                {/* <Text className="text-white">⌄</Text> */}
              </TouchableOpacity>

              <Text className="mb-1 text-lg text-gray-800 font-questrial">
                Số câu
              </Text>
              <TextInput
                placeholder="8"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={formData.section_config_json[1].questionCount.toString()}
                onChangeText={(text) =>
                  updateSectionConfig(1, "questionCount", parseInt(text) || 0)
                }
                className={`border rounded-md px-4 py-3  text-gray-900 ${
                  getFieldError("section_config_json.1.questionCount")
                    ? "border-red-500"
                    : "border-gray-200"
                }`}
              />
              {getFieldError("section_config_json.1.questionCount") && (
                <Text className="text-red-500 text-xs mt-1 mb-3">
                  {getFieldError("section_config_json.1.questionCount")}
                </Text>
              )}
              {!getFieldError("section_config_json.1.questionCount") && (
                <View className="mb-4" />
              )}

              <Text className="text-lg font-calsans text-gray-800 mb-2">
                Số điểm 1 câu:
              </Text>

              {["Đúng 1 Ý", "Đúng 2 Ý", "Đúng 3 Ý", "Đúng 4 Ý"].map(
                (label, index) => {
                  const ruleKey = (index + 1).toString() as
                    | "1"
                    | "2"
                    | "3"
                    | "4";
                  const currentValue =
                    formData.section_config_json[1].rule?.[ruleKey] || "";

                  return (
                    <View key={index} className="mb-3">
                      <Text className="mb-1 text-lg font-questrial text-gray-800">
                        - {label}
                      </Text>
                      <TextInput
                        placeholder={["0.1", "0.25", "0.5", "1"][index]}
                        keyboardType="decimal-pad"
                        placeholderTextColor="#9ca3af"
                        value={currentValue.toString() || ""}
                        onChangeText={(text) => {
                          const sanitizedText = text.replace(/,/g, ".");
                          if (/^\d*\.?\d*$/.test(sanitizedText)) {
                            updateTrueFalseRule(ruleKey, sanitizedText);
                          }
                        }}
                        className={`border ml-5 rounded-md px-4 py-3 text-sm text-gray-900 ${
                          getFieldError(`section_config_json.1.rule.${ruleKey}`)
                            ? "border-red-500"
                            : "border-gray-200"
                        }`}
                      />
                      {getFieldError(
                        `section_config_json.1.rule.${ruleKey}`
                      ) && (
                        <Text className="text-red-500 text-xs mt-1">
                          {getFieldError(
                            `section_config_json.1.rule.${ruleKey}`
                          )}
                        </Text>
                      )}
                    </View>
                  );
                }
              )}
            </View>

            {/* Phần 3 - Tự luận */}
            <View className="bg-white rounded-lg ">
              <TouchableOpacity className="flex-row justify-between items-center mb-2 bg-neutral-800 px-4 py-2 rounded-full">
                <Text className="text-white text-lg font-calsans">
                  Phần 3 - Tự luận
                </Text>
                {/* <Text className="text-white">⌄</Text> */}
              </TouchableOpacity>

              <Text className="mb-1 text-lg text-gray-800">Số câu</Text>
              <TextInput
                placeholder="6"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={formData.section_config_json[2].questionCount.toString()}
                onChangeText={(text) =>
                  updateSectionConfig(2, "questionCount", parseInt(text) || 0)
                }
                className={`border rounded-md px-4 py-3 text-sm text-gray-900 ${
                  getFieldError("section_config_json.2.questionCount")
                    ? "border-red-500"
                    : "border-gray-200"
                }`}
              />
              {getFieldError("section_config_json.2.questionCount") && (
                <Text className="text-red-500 text-xs mt-1 mb-3">
                  {getFieldError("section_config_json.2.questionCount")}
                </Text>
              )}
              {!getFieldError("section_config_json.2.questionCount") && (
                <View className="mb-4" />
              )}

              <Text className="mb-1 text-lg font-questrial text-gray-800">
                Điểm / câu
              </Text>
              <TextInput
                placeholder="0.5"
                placeholderTextColor="#9ca3af"
                keyboardType="decimal-pad"
                value={
                  formData.section_config_json[2].pointsPerQuestion?.toString() ||
                  ""
                }
                onChangeText={(text) => {
                  const sanitizedText = text.replace(/,/g, ".");
                  if (/^\d*\.?\d*$/.test(sanitizedText)) {
                    updateSectionConfig(2, "pointsPerQuestion", sanitizedText);
                  }
                }}
                className={`border rounded-md px-4 py-3 text-sm text-gray-900 ${
                  getFieldError("section_config_json.2.pointsPerQuestion")
                    ? "border-red-500"
                    : "border-gray-200"
                }`}
              />
              {getFieldError("section_config_json.2.pointsPerQuestion") && (
                <Text className="text-red-500 text-xs mt-1">
                  {getFieldError("section_config_json.2.pointsPerQuestion")}
                </Text>
              )}
            </View>
          </View>

          {/* Submit Button */}
          <View className=" py-6">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={createGradingSessionMutation.isPending}
              className={`rounded-full py-4 flex-row justify-center items-center ${
                createGradingSessionMutation.isPending
                  ? "bg-gray-400"
                  : "bg-cyan-400"
              }`}
            >
              {createGradingSessionMutation.isPending ? (
                <>
                  <ActivityIndicator
                    size="small"
                    color="white"
                    className="mr-2"
                  />
                  <Text className="text-white font-semibold text-base">
                    Đang tạo...
                  </Text>
                </>
              ) : (
                <Text className="text-white font-calsans text-base">
                  Tạo phiên chấm điểm
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* OMR Template Selection Modal - Bottom Sheet Style */}
      <Modal
        visible={showTemplateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTemplateModal(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setShowTemplateModal(false)}
        >
          <TouchableOpacity
            className="bg-white rounded-t-2xl max-h-[70%]"
            activeOpacity={1}
            onPress={() => {}} // Prevent closing when touching inside modal
            style={{ paddingBottom: insets.bottom }}
          >
            <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
              <Text className="text-lg font-semibold">Chọn mẫu phiếu OMR</Text>
              <TouchableOpacity onPress={() => setShowTemplateModal(false)}>
                <Text className="text-blue-600 font-medium">Xong</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {isLoadingTemplates ? (
                <View className="p-8 justify-center items-center">
                  <ActivityIndicator size="large" color="#3B82F6" />
                  <Text className="mt-2 text-gray-600">Đang tải...</Text>
                </View>
              ) : (
                <View className="py-2">
                  {omrTemplates?.data?.content?.map((template: any) => (
                    <TouchableOpacity
                      key={template.id}
                      onPress={() => handleSelectTemplate(template)}
                      className={`p-4 mx-4 my-1 rounded-lg flex-row items-center justify-between ${
                        selectedTemplate?.id === template.id
                          ? "bg-blue-50 border border-blue-200"
                          : "bg-gray-50 border border-transparent"
                      }`}
                    >
                      <View>
                        <Text
                          className={`font-semibold ${
                            selectedTemplate?.id === template.id
                              ? "text-blue-700"
                              : "text-gray-900"
                          }`}
                        >
                          {template.name}
                        </Text>
                        {template.description && (
                          <Text className="text-sm text-gray-500 mt-1">
                            {template.description}
                          </Text>
                        )}
                      </View>
                      {selectedTemplate?.id === template.id && (
                        <Text className="text-blue-600 text-2xl">✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default CreateGradingSessionScreen;
