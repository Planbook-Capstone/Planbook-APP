import { useCreateGradingSession, useGetOMRTemplates } from "@/services/gradingService";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Interface definitions
interface SectionConfig {
  sectionOrder: number;
  sectionType: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "ESSAY";
  questionCount: number;
  pointsPerQuestion?: number;
  rule?: {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
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
  const createGradingSessionMutation = useCreateGradingSession();
  const { id: idBooktype } = useLocalSearchParams();
  console.log("🔎 ID truyền vào:", idBooktype);

  // Get OMR templates
  const { data: omrTemplates, isLoading: isLoadingTemplates } = useGetOMRTemplates();

  // Modal state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    book_type_id: typeof idBooktype === 'string' ? idBooktype : "",
    omr_template_id: 1,
    section_config_json: [
      {
        sectionOrder: 1,
        sectionType: "MULTIPLE_CHOICE",
        questionCount: 0,
        pointsPerQuestion: 0
      },
      {
        sectionOrder: 2,
        sectionType: "TRUE_FALSE",
        questionCount: 0,
        rule: {
          "1": 0,
          "2": 0,
          "3": 0,
          "4": 0
        }
      },
      {
        sectionOrder: 3,
        sectionType: "ESSAY",
        questionCount: 0,
        pointsPerQuestion: 0
      }
    ]
  });

  // Update form data functions
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateSectionConfig = (sectionIndex: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      section_config_json: prev.section_config_json.map((section, index) =>
        index === sectionIndex ? { ...section, [field]: value } : section
      )
    }));
  };

    const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template);
    updateFormData("omr_template_id", template.id);
    setShowTemplateModal(false);
  };

  const updateTrueFalseRule = (ruleKey: string, value: number) => {
    setFormData((prev) => {
      const newSections = [...prev.section_config_json];
      const trueFalseSection = newSections[1];

      if (trueFalseSection && trueFalseSection.sectionType === 'TRUE_FALSE') {
        // Ensure rule exists and has a default structure
        const currentRule = trueFalseSection.rule || { "1": 0, "2": 0, "3": 0, "4": 0 };

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
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Validate form data
      if (!formData.name.trim()) {
        Alert.alert("Lỗi", "Vui lòng nhập tên bài");
        return;
      }

      if (!formData.book_type_id) {
        Alert.alert("Lỗi", "Vui lòng chọn loại phiếu");
        return;
      }

      // Submit data
      await createGradingSessionMutation.mutateAsync(formData);

      Alert.alert(
        "Thành công",
        "Phiên chấm điểm đã được tạo thành công!",
        [
          {
            text: "OK",
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tạo phiên chấm điểm");
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
            <Text className="text-base font-bold mb-3">1. Thông tin chung</Text>
            <View className="bg-white rounded-lg p-4">
              <Text className="mb-1 text-sm text-gray-800">Tên bài</Text>
              <TextInput
                placeholder="Nhập tên bài"
                value={formData.name}
                onChangeText={(text) => updateFormData("name", text)}
                className="border border-gray-200 rounded-md px-4 py-3 mb-4 text-sm text-gray-900"
              />

              <Text className="mb-1 text-sm text-gray-800">Loại phiếu</Text>
              <TouchableOpacity className="border border-gray-200 rounded-md px-4 py-3 flex-row justify-between items-center">
                <Text className="text-sm text-gray-700">
                  Vui lòng nhấn để chọn loại phiếu
                </Text>
                <Text className="text-gray-500">{">"}</Text>
              </TouchableOpacity>

              {/* <View className="flex-row justify-between items-center">
                <Text className="text-sm text-gray-800">
                  Tùy chỉnh quét số báo danh
                </Text>
                <Switch value={isSBDEnabled} onValueChange={setIsSBDEnabled} />
              </View> */}
            </View>
          </View>

          {/* Section 2: Cấu trúc đề thi */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-bold">2. Cấu trúc đề thi</Text>
              <TouchableOpacity className="flex-row items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-400 rounded-full">
                <Text className="text-white text-sm font-medium">
                  Tự phân bổ
                </Text>
              </TouchableOpacity>
            </View>

            {/* Phần 1 - Trắc nghiệm */}
            <View className="bg-white rounded-lg p-4 mb-3">
              <TouchableOpacity className="flex-row justify-between items-center mb-2 bg-gray-900 px-4 py-2 rounded-full">
                <Text className="text-white text-sm font-semibold">
                  Phần 1 - Trắc nghiệm
                </Text>
                <Text className="text-white">⌄</Text>
              </TouchableOpacity>

              <Text className="mb-1 text-sm text-gray-800">Số câu</Text>
              <TextInput
                placeholder="Nhập số câu"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={formData.section_config_json[0].questionCount.toString()}
                onChangeText={(text) => updateSectionConfig(0, "questionCount", parseInt(text) || 0)}
                className="border border-gray-200 rounded-md px-4 py-3 mb-4 text-sm text-gray-900"
              />

              <Text className="mb-1 text-sm text-gray-800">Điểm / câu</Text>
              <TextInput
                placeholder="Nhập số điểm"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={formData.section_config_json[0].pointsPerQuestion?.toString() || "0"}
                onChangeText={(text) => updateSectionConfig(0, "pointsPerQuestion", parseFloat(text) || 0)}
                className="border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-900"
              />
            </View>

            {/* Phần 2 - Đúng/sai nhiều ý */}
            <View className="bg-white rounded-lg px-4 mb-3">
              <TouchableOpacity className="flex-row justify-between items-center mb-2 bg-gray-900 px-4 py-2 rounded-full">
                <Text className="text-white text-sm font-semibold">
                  Phần 2 - Đúng/sai
                </Text>
                <Text className="text-white">⌄</Text>
              </TouchableOpacity>

              <Text className="mb-1 text-sm text-gray-800">Số câu</Text>
              <TextInput
                placeholder="Nhập số câu"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                className="border border-gray-200 rounded-md px-4 py-3 mb-4 text-sm text-gray-900"
              />

              <Text className="text-sm font-semibold text-gray-800 mb-2">
                Số điểm 1 câu:
              </Text>

              {["Đúng 1 Ý", "Đúng 2 Ý", "Đúng 3 Ý", "Đúng 4 Ý"].map(
                (label, index) => (
                  <View key={index} className="mb-3">
                    <Text className="mb-1 text-sm text-gray-800">
                      - {label}
                    </Text>
                    <TextInput
                      placeholder={`Nhập điểm cho ${label.toLowerCase()}`}
                      keyboardType="numeric"
                      placeholderTextColor="#9ca3af"
                      className="border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-900"
                    />
                  </View>
                )
              )}
            </View>

            {/* Phần 3 - Tự luận */}
            <View className="bg-white rounded-lg px-4">
              <TouchableOpacity className="flex-row justify-between items-center mb-2 bg-gray-900 px-4 py-2 rounded-full">
                <Text className="text-white text-sm font-semibold">
                  Phần 3 - Tự luận
                </Text>
                <Text className="text-white">⌄</Text>
              </TouchableOpacity>

              <Text className="mb-1 text-sm text-gray-800">Số câu</Text>
              <TextInput
                placeholder="Nhập số câu"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                className="border border-gray-200 rounded-md px-4 py-3 mb-4 text-sm text-gray-900"
              />

              <Text className="mb-1 text-sm text-gray-800">Điểm / câu</Text>
              <TextInput
                placeholder="Nhập số điểm"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                className="border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-900"
              />
            </View>
          </View>

          {/* Submit Button */}
          <View className="px-4 py-6">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={createGradingSessionMutation.isPending}
              className={`rounded-lg py-4 flex-row justify-center items-center ${
                createGradingSessionMutation.isPending
                  ? 'bg-gray-400'
                  : 'bg-blue-600'
              }`}
            >
              {createGradingSessionMutation.isPending ? (
                <>
                  <ActivityIndicator size="small" color="white" className="mr-2" />
                  <Text className="text-white font-semibold text-base">
                    Đang tạo...
                  </Text>
                </>
              ) : (
                <Text className="text-white font-semibold text-base">
                  Tạo phiên chấm điểm
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateGradingSessionScreen;
