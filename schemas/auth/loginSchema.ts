// app/(auth)/schema.ts
import { z } from 'zod';

// Schema cho form Đăng nhập
export const LoginSchema = z.object({
  username: z.string().min(1, { message: "Tên đăng nhập không được để trống" }),
  password: z.string().min(1, { message: "Mật khẩu không được để trống" }),
});
export type LoginFormData = z.infer<typeof LoginSchema>;
