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
  trueFalseQuestion: TrueFalseQuestion;
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
  trueFalseQuestion: {
    id: 1,
    subQuestions: {
      a: "Đ",
      b: "S",
      c: "Đ",
      d: "S",
    },
  },
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
  trueFalseQuestion: {
    id: 1,
    subQuestions: {
      a: null,
      b: null,
      c: null,
      d: null,
    },
  },
  essayQuestions: [
    { id: 1, answer: "" },
    { id: 2, answer: "" },
    { id: 3, answer: "" },
  ],
};

// Fake data cho nhiều đề thi khác nhau
export const multipleAnswerKeys: AnswerKeyData[] = [
  {
    examCode: "DE001",
    multipleChoiceQuestions: [
      { id: 1, answer: "A" },
      { id: 2, answer: "B" },
      { id: 3, answer: "C" },
      { id: 4, answer: "D" },
      { id: 5, answer: "A" },
    ],
    trueFalseQuestion: {
      id: 1,
      subQuestions: { a: "Đ", b: "S", c: "Đ", d: "S" },
    },
    essayQuestions: [
      { id: 1, answer: "Đáp án câu 1 đề 001" },
      { id: 2, answer: "Đáp án câu 2 đề 001" },
      { id: 3, answer: "Đáp án câu 3 đề 001" },
    ],
  },
  {
    examCode: "DE002",
    multipleChoiceQuestions: [
      { id: 1, answer: "B" },
      { id: 2, answer: "C" },
      { id: 3, answer: "A" },
      { id: 4, answer: "D" },
      { id: 5, answer: "B" },
    ],
    trueFalseQuestion: {
      id: 1,
      subQuestions: { a: "S", b: "Đ", c: "S", d: "Đ" },
    },
    essayQuestions: [
      { id: 1, answer: "Đáp án câu 1 đề 002" },
      { id: 2, answer: "Đáp án câu 2 đề 002" },
      { id: 3, answer: "Đáp án câu 3 đề 002" },
    ],
  },
  {
    examCode: "DE003",
    multipleChoiceQuestions: [
      { id: 1, answer: "C" },
      { id: 2, answer: "A" },
      { id: 3, answer: "D" },
      { id: 4, answer: "B" },
      { id: 5, answer: "C" },
    ],
    trueFalseQuestion: {
      id: 1,
      subQuestions: { a: "Đ", b: "Đ", c: "S", d: "S" },
    },
    essayQuestions: [
      { id: 1, answer: "Đáp án câu 1 đề 003" },
      { id: 2, answer: "Đáp án câu 2 đề 003" },
      { id: 3, answer: "Đáp án câu 3 đề 003" },
    ],
  },
];
