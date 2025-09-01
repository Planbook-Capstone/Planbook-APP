// app/(auth)/schema.ts
import { z } from 'zod';

export const RegisterSchema = z.object({
  fullName: z.string()
    .min(1, { message: "Họ tên không được để trống" })
    .max(100, { message: "Họ tên không được vượt quá 100 ký tự" }),
  email: z.string()
    .min(1, { message: "Email không được để trống" })
    .email({ message: "Email không hợp lệ" }), // SỬA Ở ĐÂY
  username: z.string()
    .min(5, { message: "Tên người dùng phải có ít nhất 5 ký tự" }),
  password: z.string()
    .min(5, { message: "Mật khẩu phải có ít nhất 5 ký tự" }),
  confirmPassword: z.string()
    .min(1, { message: "Vui lòng xác nhận mật khẩu" })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"], // Gán lỗi này cho trường confirmPassword
});
export type RegisterFormData = z.infer<typeof RegisterSchema>;
