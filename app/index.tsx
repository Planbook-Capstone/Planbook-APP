import { Redirect } from 'expo-router';

// Dùng biến này để giả lập trạng thái đăng nhập
// true = đã đăng nhập, false = chưa đăng nhập
const isSignedIn = false; 

export default function IndexPage() {
  // Nếu đã đăng nhập, chuyển hướng vào màn hình chính trong (tabs)
  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  // Nếu chưa đăng nhập, chuyển hướng đến màn hình login
  return <Redirect href="/(auth)/login" />;
}