import { z } from 'zod';

// A schema for a string that must be a positive number
const PositiveNumberSchema = z.preprocess(
  (val) => String(val).trim(),
  z.string().min(1, "Vui lòng nhập giá trị")
    .refine((val) => !isNaN(parseFloat(val.replace(/,/, '.'))), { message: "Phải là một số" })
    .transform((val) => parseFloat(val.replace(/,/, '.')))
    .refine((num) => num > 0, { message: "Giá trị phải lớn hơn 0" })
);

// A schema for a string that must be a positive integer
const PositiveIntSchema = PositiveNumberSchema.refine((num) => Number.isInteger(num), { message: "Phải là số nguyên" });

// Schema for each section type
const MultipleChoiceSchema = z.object({
  sectionOrder: z.literal(1),
  sectionType: z.literal('MULTIPLE_CHOICE'),
  questionCount: PositiveIntSchema.refine(val => val <= 40, { message: 'Tối đa 40 câu' }),
  pointsPerQuestion: PositiveNumberSchema,
});

const TrueFalseSchema = z.object({
  sectionOrder: z.literal(2),
  sectionType: z.literal('TRUE_FALSE'),
  questionCount: PositiveIntSchema.refine(val => val <= 8, { message: 'Tối đa 8 câu' }),
  rule: z.object({
    '1': PositiveNumberSchema,
    '2': PositiveNumberSchema,
    '3': PositiveNumberSchema,
    '4': PositiveNumberSchema,
  }),
});

const EssaySchema = z.object({
  sectionOrder: z.literal(3),
  sectionType: z.literal('ESSAY'),
  questionCount: PositiveIntSchema.refine(val => val <= 6, { message: 'Tối đa 6 câu' }),
  pointsPerQuestion: PositiveNumberSchema,
});

// Main schema using a tuple to enforce order and types
export const gradingSessionSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên bài'),
  omr_template_id: z.number().min(1, 'Vui lòng chọn mẫu phiếu OMR'),
  book_type_id: z.string(),
  section_config_json: z.tuple([
    MultipleChoiceSchema,
    TrueFalseSchema,
    EssaySchema,
  ]),
});

export type GradingSessionFormData = z.infer<typeof gradingSessionSchema>;

