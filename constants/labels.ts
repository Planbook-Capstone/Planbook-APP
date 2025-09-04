export const TOOL_ACTION_LABELS = {
  EXAM_GRADING: "Chấm phiếu trắc nghiệm",
  LESSON_PLAN: "Tạo giáo án",
  EXAM_CREATOR: "Tạo đề kiểm tra với AI",
  SLIDE_GENERATOR: "Tạo slide bài giảng",
  QUIZ_GAME: "Tạo trò chơi câu hỏi",
  MANUAL_EXAM_CREATOR: "Trộn đề thi theo ma trận",
  FORMU_LENS: "Tra cứu tài nguyên hoá học",
} as const;

// Type definition for tool action types
export type ToolActionType = keyof typeof TOOL_ACTION_LABELS;

/**
 * Convert tool action code to Vietnamese action name
 * @param actionCode - The tool action code (e.g., "LESSON_PLAN", "EXAM_CREATOR")
 * @returns Vietnamese action name
 */
export const getToolActionName = (actionCode: string): string => {
  return TOOL_ACTION_LABELS[actionCode as ToolActionType] || actionCode;
};
