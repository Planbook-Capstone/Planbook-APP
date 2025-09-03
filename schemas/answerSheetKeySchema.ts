import { z } from "zod";

// Schema cho câu hỏi trắc nghiệm
const MultipleChoiceQuestionSchema = z.object({
  questionNumber: z.number(),
  answer: z.enum(["A", "B", "C", "D"])
});

// Schema cho câu hỏi đúng/sai
const TrueFalseQuestionSchema = z.object({
  questionNumber: z.number(),
  answer: z.object({
    a: z.enum(["Đ", "S"]),
    b: z.enum(["Đ", "S"]),
    c: z.enum(["Đ", "S"]),
    d: z.enum(["Đ", "S"])
  })
});

// Schema cho câu hỏi tự luận/code
const EssayCodeQuestionSchema = z.object({
  questionNumber: z.number(),
  answer: z.string()
    .min(1, 'Vui lòng nhập đáp án')
    .max(4, 'Câu tự luận tối đa 4 ký tự')
    .regex(/^[0-9,-]+$/, 'Chỉ được chứa số, dấu - và dấu ,')
});

// Schema cho section
const SectionSchema = z.object({
  sectionOrder: z.number(),
  sectionType: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "ESSAY_CODE"]),
  questions: z.array(z.union([
    MultipleChoiceQuestionSchema,
    TrueFalseQuestionSchema,
    EssayCodeQuestionSchema
  ]))
});

// Schema chính cho answer sheet key
export const answerSheetKeySchema = z.object({
  grading_session_id: z.number().min(1, 'ID phiên chấm điểm không hợp lệ'),
  code: z.string()
    .min(1, 'Vui lòng nhập mã đề')
    .max(3, 'Mã đề tối đa 3 chữ số')
    .regex(/^\d+$/, 'Mã đề phải là số nguyên dương'),
  answer_json: z.array(SectionSchema).min(1, 'Phải có ít nhất một section')
});

// Schema cho form validation (trước khi convert sang API format)
export const answerKeyFormSchema = z.object({
  examCode: z.string()
    .min(1, 'Vui lòng nhập mã đề')
    .max(3, 'Mã đề tối đa 3 chữ số')
    .regex(/^\d+$/, 'Mã đề phải là số nguyên dương'),
  multipleChoiceQuestions: z.array(z.object({
    id: z.number(),
    answer: z.enum(["A", "B", "C", "D"]).nullable()
  })).refine((questions) => {
    // Check if all questions have answers
    return questions.every(q => q.answer !== null);
  }, {
    message: 'Vui lòng chọn đáp án cho tất cả câu trắc nghiệm'
  }),
  trueFalseQuestions: z.array(z.object({
    id: z.number(),
    subQuestions: z.object({
      a: z.enum(["Đ", "S"]).nullable(),
      b: z.enum(["Đ", "S"]).nullable(),
      c: z.enum(["Đ", "S"]).nullable(),
      d: z.enum(["Đ", "S"]).nullable(),
    })
  })).refine((questions) => {
    // Check if all sub-questions have answers
    return questions.every(q =>
      q.subQuestions.a !== null &&
      q.subQuestions.b !== null &&
      q.subQuestions.c !== null &&
      q.subQuestions.d !== null
    );
  }, {
    message: 'Vui lòng chọn đáp án cho tất cả câu đúng/sai'
  }),
  essayQuestions: z.array(z.object({
    id: z.number(),
    answer: z.string()
      .refine((val) => {
        if (val.trim() === "") return false; // Empty not allowed
        return /^[0-9,-]+$/.test(val); // Must contain only numbers, dash and comma
      }, 'Vui lòng nhập đáp án (chỉ số, dấu - và dấu ,)')
      .refine((val) => val.length <= 4, 'Câu tự luận tối đa 4 ký tự')
  }))
});

export type AnswerSheetKeyFormData = z.infer<typeof answerSheetKeySchema>;
