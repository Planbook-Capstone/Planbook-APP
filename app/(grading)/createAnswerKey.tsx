import { answerKeyFormSchema, answerSheetKeySchema } from "@/schemas/answerSheetKeySchema";
import { useCreateAnswerSheetKey } from "@/services/answerSheetKeyService";
import { useGetGradingSessionById } from "@/services/gradingService";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { showMessage } from "react-native-flash-message";

// Components
import EssaySection from "../../components/answerKey/EssaySection";
import ExamInfoSection from "../../components/answerKey/ExamInfoSection";
import MultipleChoiceSection from "../../components/answerKey/MultipleChoiceSection";
import TrueFalseSection from "../../components/answerKey/TrueFalseSection";

// Data
import {
  emptyAnswerKeyData,
  fakeAnswerKeyData,
  type AnswerKeyData,
  type MultipleChoiceAnswer,
  type TrueFalseAnswer
} from "../../data/answerKeyData";

export default function CreateAnswerKeyScreen() {
  const router = useRouter();
  const { examCode } = useLocalSearchParams<{ examCode?: string }>();
  const { id: idGradingSesstion } = useLocalSearchParams();
  console.log("🔎 ID truyền vào:", idGradingSesstion);
  console.log("🔎 Exam Code truyền vào:", examCode);

  // Sử dụng fake data hoặc empty data
  const [examData, setExamData] = useState<AnswerKeyData>(emptyAnswerKeyData);
  // Uncomment dòng dưới để sử dụng fake data có sẵn đáp án
  // const [examData, setExamData] = useState<AnswerKeyData>(fakeAnswerKeyData);

  // Debug log để kiểm tra examData
  console.log("🎯 Current examData:", {
    examCode: examData.examCode,
    mcCount: examData.multipleChoiceQuestions.length,
    tfCount: examData.trueFalseQuestions.length,
    essayCount: examData.essayQuestions.length,
    mcQuestions: examData.multipleChoiceQuestions,
    tfQuestions: examData.trueFalseQuestions,
    essayQuestions: examData.essayQuestions
  });

  // Hook để tạo answer sheet key
  const createAnswerSheetKeyMutation = useCreateAnswerSheetKey();

  // Hook để lấy grading session config
  const { data: gradingSessionData, isLoading: isLoadingSession } = useGetGradingSessionById(
    idGradingSesstion as string,
    { enabled: !!idGradingSesstion }
  );

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Helper function to get error message for a field
  const getFieldError = (fieldPath: string) => {
    return validationErrors[fieldPath];
  };

  // Clear error for a field
  const clearFieldError = (fieldPath: string) => {
    if (validationErrors[fieldPath]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldPath];
        return newErrors;
      });
    }
  };

  // Set exam code from navigation params
  useEffect(() => {
    if (examCode) {
      setExamData((prev) => ({ ...prev, examCode }));
    }
  }, [examCode]);

  // Generate dynamic questions based on API data
  useEffect(() => {
    if (gradingSessionData?.data) {
      const data = gradingSessionData.data;
      console.log("📋 Full Grading Session Data:", JSON.stringify(data, null, 2));

      // Check for section config in different places
      console.log("🔍 Looking for section config in:");
      console.log("- data.sectionConfigJson:", data.sectionConfigJson);
      console.log("- data.section_config_json:", data.section_config_json);
      console.log("- data.omr_template:", data.omr_template);

      // Case 1: Edit existing answer key (có examCode từ navigation)
      if (examCode && data.answer_sheet_keys) {
        console.log("🔍 Looking for examCode:", examCode);
        const existingAnswerKey = data.answer_sheet_keys.find((key: any) => key.code === examCode);
        if (existingAnswerKey) {
          console.log("✏️ Found existing answer key, loading for edit:", existingAnswerKey.code);
          loadExistingAnswerKey(existingAnswerKey);
          return;
        } else {
          console.log("❌ ExamCode not found in answer_sheet_keys");
        }
      }

      // Case 2: Create new answer key - check for section config first
      console.log("🔍 Checking for section config...");
      console.log("- data.sectionConfigJson:", !!data.sectionConfigJson);
      console.log("- data.section_config_json:", !!data.section_config_json);
      console.log("- data.answer_sheet_keys length:", data.answer_sheet_keys?.length || 0);

      if (data.sectionConfigJson) {
        console.log("🎯 Found sectionConfigJson, generating from config");
        generateQuestionsFromSectionConfig(data.sectionConfigJson);
      } else if (data.section_config_json) {
        console.log("🎯 Found section_config_json, generating from config");
        generateQuestionsFromSectionConfig(data.section_config_json);
      } else if (data.omr_template?.section_config) {
        console.log("🎯 Found section config in OMR template");
        generateQuestionsFromSectionConfig(data.omr_template.section_config);
      } else if (data.answer_sheet_keys && data.answer_sheet_keys.length > 0) {
        console.log("🆕 Creating new answer key based on existing structure");
        console.log("📊 Using structure from:", data.answer_sheet_keys[0].code);
        generateQuestionsFromExistingStructure(data.answer_sheet_keys[0]);
      } else {
        // Fallback: try to infer config from OMR template name or use default
        console.log("📝 No config found, trying to infer from OMR template");
        const omrTemplateName = data.omr_template?.name;
        if (omrTemplateName) {
          console.log("🏷️ OMR Template:", omrTemplateName);
          // You can add logic here to map template names to configs
          // For now, use default structure
        }
        generateDefaultQuestions();
      }
    } else {
      console.log("⏳ Waiting for grading session data...");
    }
  }, [gradingSessionData, examCode]);

  // Load existing answer key data for editing
  const loadExistingAnswerKey = (answerKey: any) => {
    const answerJson = answerKey.answer_json;
    console.log("✏️ Loading existing answer key:", answerKey.code);
    console.log("📋 Answer JSON:", answerJson);

    // Get section config to determine total number of questions
    const sectionConfig = gradingSessionData?.data?.sectionConfigJson || [];
    console.log("📊 Section Config for loading:", sectionConfig);

    // Generate full structure based on config, then fill existing answers
    const mcConfig = sectionConfig.find((section: any) => section.sectionType === "MULTIPLE_CHOICE");
    const mcCount = mcConfig ? mcConfig.questionCount : 5;

    // Create all MC questions first (empty)
    const multipleChoiceQuestions = Array.from({ length: mcCount }, (_, i) => ({
      id: i + 1,
      answer: null as any
    }));

    // Fill existing MC answers
    const mcSection = answerJson.find((section: any) => section.sectionType === "MULTIPLE_CHOICE");
    if (mcSection) {
      mcSection.questions.forEach((q: any) => {
        const questionIndex = multipleChoiceQuestions.findIndex(mq => mq.id === q.questionNumber);
        if (questionIndex !== -1) {
          multipleChoiceQuestions[questionIndex].answer = q.answer;
        }
      });
    }
    console.log("📝 Loaded MC Questions with config:", multipleChoiceQuestions);

    // Generate TF questions based on config
    const tfConfig = sectionConfig.find((section: any) => section.sectionType === "TRUE_FALSE");
    const tfCount = tfConfig ? tfConfig.questionCount : 1;

    // Create all TF questions first (empty)
    const trueFalseQuestions = Array.from({ length: tfCount }, (_, i) => ({
      id: i + 1,
      subQuestions: {
        a: null as any,
        b: null as any,
        c: null as any,
        d: null as any,
      }
    }));

    // Fill existing TF answers
    const tfSection = answerJson.find((section: any) => section.sectionType === "TRUE_FALSE");
    if (tfSection) {
      tfSection.questions.forEach((q: any) => {
        const questionIndex = trueFalseQuestions.findIndex(tq => tq.id === q.questionNumber);
        if (questionIndex !== -1) {
          trueFalseQuestions[questionIndex].subQuestions = q.answer;
        }
      });
    }
    console.log("📝 Loaded TF Questions with config:", trueFalseQuestions);

    // Generate Essay questions based on config
    const essayConfig = sectionConfig.find((section: any) =>
      section.sectionType === "ESSAY" || section.sectionType === "ESSAY_CODE"
    );
    const essayCount = essayConfig ? essayConfig.questionCount : 3;

    // Create all Essay questions first (empty)
    const essayQuestions = Array.from({ length: essayCount }, (_, i) => ({
      id: i + 1,
      answer: ""
    }));

    // Fill existing Essay answers
    const essaySection = answerJson.find((section: any) => section.sectionType === "ESSAY_CODE");
    if (essaySection) {
      essaySection.questions.forEach((q: any) => {
        const questionIndex = essayQuestions.findIndex(eq => eq.id === q.questionNumber);
        if (questionIndex !== -1) {
          essayQuestions[questionIndex].answer = q.answer;
        }
      });
    }
    console.log("📝 Loaded Essay Questions with config:", essayQuestions);

    const loadedData = {
      examCode: answerKey.code,
      multipleChoiceQuestions,
      trueFalseQuestions,
      essayQuestions
    };
    console.log("📋 Setting loaded exam data with full structure:", loadedData);

    setExamData(loadedData);
  };

  // Generate questions based on existing answer key structure
  const generateQuestionsFromExistingStructure = (sampleAnswerKey: any) => {
    const answerJson = sampleAnswerKey.answer_json;
    console.log("🔍 Sample Answer JSON:", answerJson);

    // Generate multiple choice questions (empty answers)
    const mcSection = answerJson.find((section: any) => section.sectionType === "MULTIPLE_CHOICE");
    const multipleChoiceQuestions = mcSection ? mcSection.questions.map((q: any) => ({
      id: q.questionNumber,
      answer: null as any
    })) : [];
    console.log("📝 Generated MC Questions:", multipleChoiceQuestions);

    // Generate true/false questions (empty answers)
    const tfSection = answerJson.find((section: any) => section.sectionType === "TRUE_FALSE");
    const trueFalseQuestions = tfSection ? tfSection.questions.map((q: any) => ({
      id: q.questionNumber,
      subQuestions: {
        a: null as any,
        b: null as any,
        c: null as any,
        d: null as any,
      }
    })) : [{
      id: 1,
      subQuestions: {
        a: null as any,
        b: null as any,
        c: null as any,
        d: null as any,
      }
    }];

    // Generate essay questions (empty answers)
    const essaySection = answerJson.find((section: any) => section.sectionType === "ESSAY_CODE");
    const essayQuestions = essaySection ? essaySection.questions.map((q: any) => ({
      id: q.questionNumber,
      answer: ""
    })) : [];
    console.log("📝 Generated Essay Questions:", essayQuestions);

    const newExamData = {
      examCode: examData.examCode,
      multipleChoiceQuestions,
      trueFalseQuestions,
      essayQuestions
    };
    console.log("📋 Setting new exam data:", newExamData);

    setExamData(newExamData);
  };

  // Generate questions from section config
  const generateQuestionsFromSectionConfig = (sectionConfig: any[]) => {
    console.log("🎯 Generating questions from section config:", sectionConfig);

    // Generate multiple choice questions
    const mcConfig = sectionConfig.find((section: any) => section.sectionType === "MULTIPLE_CHOICE");
    const multipleChoiceQuestions = mcConfig
      ? Array.from({ length: mcConfig.questionCount }, (_, i) => ({
          id: i + 1,
          answer: null as any
        }))
      : [];

    // Generate true/false questions - multiple questions, each with a,b,c,d
    const tfConfig = sectionConfig.find((section: any) => section.sectionType === "TRUE_FALSE");
    const tfCount = tfConfig ? tfConfig.questionCount : 1;

    const trueFalseQuestions = Array.from({ length: tfCount }, (_, i) => ({
      id: i + 1,
      subQuestions: {
        a: null as any,
        b: null as any,
        c: null as any,
        d: null as any,
      }
    }));

    // Generate essay questions - support both ESSAY and ESSAY_CODE
    const essayConfig = sectionConfig.find((section: any) =>
      section.sectionType === "ESSAY" || section.sectionType === "ESSAY_CODE"
    );
    const essayQuestions = essayConfig
      ? Array.from({ length: essayConfig.questionCount }, (_, i) => ({
          id: i + 1,
          answer: ""
        }))
      : [];

    console.log("📝 Generated from config:");
    console.log("- MC Config:", mcConfig);
    console.log("- TF Config:", tfConfig);
    console.log("- Essay Config:", essayConfig);
    console.log("- MC Questions:", multipleChoiceQuestions.length);
    console.log("- TF Questions:", trueFalseQuestions.length);
    console.log("- Essay Questions:", essayQuestions.length);
    console.log("- MC Questions data (first 5):", multipleChoiceQuestions.slice(0, 5));
    console.log("- TF Questions data:", trueFalseQuestions);
    console.log("- Essay Questions data:", essayQuestions);

    const newExamData = {
      examCode: examData.examCode,
      multipleChoiceQuestions,
      trueFalseQuestions,
      essayQuestions
    };

    console.log("🎯 Setting new exam data:", newExamData);
    setExamData(newExamData);
  };

  // Generate default questions structure
  const generateDefaultQuestions = () => {
    const multipleChoiceQuestions = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      answer: null as any
    }));

    const trueFalseQuestions = Array.from({ length: 1 }, (_, i) => ({
      id: i + 1,
      subQuestions: {
        a: null as any,
        b: null as any,
        c: null as any,
        d: null as any,
      }
    }));

    const essayQuestions = Array.from({ length: 3 }, (_, i) => ({
      id: i + 1,
      answer: ""
    }));

    setExamData(prev => ({
      ...prev,
      multipleChoiceQuestions,
      trueFalseQuestions,
      essayQuestions
    }));
  };

  const handleExamCodeChange = (code: string) => {
    setExamData((prev) => ({ ...prev, examCode: code }));
    // Clear error when user starts typing
    clearFieldError('examCode');
  };

  const handleMultipleChoiceAnswer = (
    questionId: number,
    answer: MultipleChoiceAnswer
  ) => {
    setExamData((prev) => ({
      ...prev,
      multipleChoiceQuestions: prev.multipleChoiceQuestions.map((q) =>
        q.id === questionId ? { ...q, answer } : q
      ),
    }));
  };

  const handleTrueFalseAnswer = (
    questionId: number,
    subQuestion: "a" | "b" | "c" | "d",
    answer: TrueFalseAnswer
  ) => {
    setExamData((prev) => ({
      ...prev,
      trueFalseQuestions: prev.trueFalseQuestions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              subQuestions: {
                ...q.subQuestions,
                [subQuestion]: answer,
              },
            }
          : q
      ),
    }));
  };

  const handleEssayAnswer = (questionId: number, answer: string) => {
    setExamData((prev) => ({
      ...prev,
      essayQuestions: prev.essayQuestions.map((q) =>
        q.id === questionId ? { ...q, answer } : q
      ),
    }));
    // Clear error when user starts typing
    clearFieldError(`essayQuestions.${questionId - 1}.answer`);
  };

  const loadFakeData = () => {
    setExamData(fakeAnswerKeyData);
  };

  const clearData = () => {
    setExamData(emptyAnswerKeyData);
  };

  // Hàm chuyển đổi data từ UI format sang API format
  const convertToAPIFormat = () => {
    const answerJson = [
      // Section 1: Multiple Choice
      {
        sectionOrder: 1,
        sectionType: "MULTIPLE_CHOICE",
        questions: examData.multipleChoiceQuestions
          .filter(q => q.answer !== null)
          .map(q => ({
            questionNumber: q.id,
            answer: q.answer
          }))
      },
      // Section 2: True/False
      {
        sectionOrder: 2,
        sectionType: "TRUE_FALSE",
        questions: examData.trueFalseQuestions.map(q => ({
          questionNumber: q.id,
          answer: {
            a: q.subQuestions.a,
            b: q.subQuestions.b,
            c: q.subQuestions.c,
            d: q.subQuestions.d,
          }
        }))
      },
      // Section 3: Essay/Code
      {
        sectionOrder: 3,
        sectionType: "ESSAY_CODE",
        questions: examData.essayQuestions
          .filter(q => q.answer.trim() !== "")
          .map(q => ({
            questionNumber: q.id,
            answer: q.answer
          }))
      }
    ];

    return {
      grading_session_id: parseInt(idGradingSesstion as string),
      code: examData.examCode,
      answer_json: answerJson
    };
  };

  // Hàm save với API call
  const handleSave = async () => {
    // Clear previous errors
    setValidationErrors({});

    if (!idGradingSesstion) {
      showMessage({
        message: "Không tìm thấy ID phiên chấm điểm",
        type: "danger",
        icon: "danger",
      });
      return;
    }

    // Check if this is editing existing answer key
    const isEditing = examCode && gradingSessionData?.data?.answer_sheet_keys?.some(
      (key: any) => key.code === examCode
    );

    try {
      // Validate form data first
      const formResult = answerKeyFormSchema.safeParse(examData);
      if (!formResult.success) {
        // Process Zod errors and map them to field paths
        const errors: Record<string, string> = {};

        console.log("Form validation errors:", JSON.stringify(formResult.error, null, 2));

        formResult.error.issues.forEach((issue: any) => {
          const path = issue.path.join(".");
          errors[path] = issue.message;
        });

        console.log("🚨 Validation errors set:", errors);
        setValidationErrors(errors);
        // Don't show toast message since errors are displayed under inputs
        return;
      }

      const apiData = convertToAPIFormat();
      console.log("📤 Data trước khi validate:", JSON.stringify(apiData, null, 2));

      // Validate API data với schema
      const result = answerSheetKeySchema.safeParse(apiData);
      if (!result.success) {
        console.error("❌ API Validation errors:", result.error.issues);
        showMessage({
          message: "Dữ liệu không hợp lệ: " + result.error.issues[0]?.message,
          type: "danger",
          icon: "danger",
        });
        return;
      }

      const validatedData = result.data;
      console.log("✅ Data sau khi validate:", JSON.stringify(validatedData, null, 2));

      const response = await createAnswerSheetKeyMutation.mutateAsync(validatedData);

      showMessage({
        message: response?.data?.message || (isEditing ? "Cập nhật đáp án thành công!" : "Tạo đáp án thành công!"),
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

  // Show loading while fetching session config
  if (isLoadingSession) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600">Đang tải cấu hình bài thi...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      {/* <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center mr-2"
        >
          <Ionicons name="arrow-back" size={24} color="#292D32" />
          <Text
            className="text-xl font-normal text-black ml-2"
            style={{ fontFamily: "Questrial" }}
          >
            Quay lại | Đáp án {examCode ? `| Mã đề: ${examCode}` : ""}
          </Text>
        </TouchableOpacity>

        <View className="ml-auto flex-row gap-2">
          <TouchableOpacity
            className="px-3 py-2 bg-gray-100 rounded"
            onPress={loadFakeData}
          >
            <Text className="text-sm font-normal text-gray-600">Load Demo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="px-3 py-2 bg-gray-100 rounded"
            onPress={clearData}
          >
            <Text className="text-sm font-normal text-gray-600">Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity className="px-4 py-2">
            <Text className="text-2xl font-normal text-black">Tạo mới</Text>
          </TouchableOpacity>
        </View>
      </View> */}

      <ScrollView
        className="flex-1 px-8 py-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Thông tin chung */}
        <ExamInfoSection
          examCode={examData.examCode}
          onExamCodeChange={handleExamCodeChange}
          error={getFieldError('examCode')}
        />

        {/* Phần 1 - Trắc nghiệm */}
        <MultipleChoiceSection
          questions={examData.multipleChoiceQuestions}
          onAnswerChange={handleMultipleChoiceAnswer}
        />

        {/* Phần 2 - Đúng/sai */}
        <TrueFalseSection
          questions={examData.trueFalseQuestions}
          onAnswerChange={handleTrueFalseAnswer}
        />

        {/* Phần 3 - Tự luận */}
        <EssaySection
          questions={examData.essayQuestions}
          onAnswerChange={handleEssayAnswer}
          getFieldError={getFieldError}
        />

        {/* Save Button */}
        <TouchableOpacity
          className="bg-blue-500 rounded-lg py-4 mt-8 mb-8"
          onPress={handleSave}
          disabled={createAnswerSheetKeyMutation.isPending}
        >
          {createAnswerSheetKeyMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="text-white text-xl font-semibold text-center">
              Lưu đáp án
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
