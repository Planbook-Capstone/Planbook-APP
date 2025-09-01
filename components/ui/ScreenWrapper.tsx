// components/ui/ScreenWrapper.tsx
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_BAR_HEIGHT = 90; // Chiều cao của TabBar bạn đã định nghĩa

interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean; // Thêm tùy chọn cho màn hình có cần cuộn hay không
}

export const ScreenWrapper = ({ children, scrollable = false }: ScreenWrapperProps) => {
  const insets = useSafeAreaInsets();

  // Tính toán padding dưới cùng = chiều cao TabBar + khoảng cách an toàn của thiết bị
  const paddingBottom = TAB_BAR_HEIGHT + insets.bottom;

  if (scrollable) {
    return (
      <ScrollView
        style={[styles.container]}
        contentContainerStyle={{ paddingBottom }}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom }]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Hoặc màu nền bạn muốn
  },
});