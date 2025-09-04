// Fake data cho trang tạo đáp án

export type MultipleChoiceAnswer = "A" | "B" | "C" | "D" | null;
export type TrueFalseAnswer = "Đ" | "S" | null;

export interface Question {
  id: number;
  answer: MultipleChoiceAnswer;
}

export interface TrueFalseQuestion {
  id: number;
  subQuestions: {
    a: TrueFalseAnswer;
    b: TrueFalseAnswer;
    c: TrueFalseAnswer;
    d: TrueFalseAnswer;
  };
}

export interface EssayQuestion {
  id: number;
  answer: string;
}

export interface AnswerKeyData {
  examCode: string;
  multipleChoiceQuestions: Question[];
  trueFalseQuestions: TrueFalseQuestion[]; // Array of TF questions
  essayQuestions: EssayQuestion[];
}

// Fake data mẫu với đáp án đã điền sẵn
export const fakeAnswerKeyData: AnswerKeyData = {
  examCode: "DE001",
  multipleChoiceQuestions: [
    { id: 1, answer: "A" },
    { id: 2, answer: "B" },
    { id: 3, answer: "C" },
    { id: 4, answer: "D" },
    { id: 5, answer: "A" },
  ],
  trueFalseQuestions: [
    {
      id: 1,
      subQuestions: {
        a: "Đ",
        b: "S",
        c: "Đ",
        d: "S",
      },
    }
  ],
  essayQuestions: [
    {
      id: 1,
      answer:
        "Đây là đáp án cho câu tự luận số 1. Học sinh cần trình bày rõ ràng về khái niệm và ví dụ minh họa.",
    },
    {
      id: 2,
      answer:
        "Đáp án câu 2 yêu cầu phân tích so sánh giữa hai khái niệm và đưa ra kết luận.",
    },
    {
      id: 3,
      answer:
        "Câu 3 cần giải thích quá trình và nêu các bước thực hiện chi tiết.",
    },
  ],
};

// Fake data rỗng để khởi tạo
export const emptyAnswerKeyData: AnswerKeyData = {
  examCode: "",
  multipleChoiceQuestions: [
    { id: 1, answer: null },
    { id: 2, answer: null },
    { id: 3, answer: null },
    { id: 4, answer: null },
    { id: 5, answer: null },
  ],
  trueFalseQuestions: [
    {
      id: 1,
      subQuestions: {
        a: null,
        b: null,
        c: null,
        d: null,
      },
    }
  ],
  essayQuestions: [
    { id: 1, answer: "" },
    { id: 2, answer: "" },
    { id: 3, answer: "" },
  ],
};
