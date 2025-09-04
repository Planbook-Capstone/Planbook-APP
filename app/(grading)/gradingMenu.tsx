import { View, Text, ScrollView, SafeAreaView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import MenuItem from "@/components/organisms/menu-item";
import KeyIcon from "@/assets/images/icons/key.svg";
import ExamIcon from "@/assets/images/icons/exam.svg";
import ScanIcon from "@/assets/images/icons/scan.svg";
import LayerIcon from "@/assets/images/icons/layer.svg";
import InfoIcon from "@/assets/images/icons/info.svg";
import SendIcon from "@/assets/images/icons/send.svg";
import { useGetGradingSessionById } from "@/services/gradingService";

export default function GradingMenuScreen() {
  const router = useRouter();
  const { id: idGradingSesstion } = useLocalSearchParams();
  const { data } = useGetGradingSessionById(idGradingSesstion as string);
  const menuItems = [
    {
      icon: <KeyIcon />,
      title: "Đáp án",
      onPress: () => router.push(`/exportResults?id=${idGradingSesstion}`),
    },
    {
      icon: <ScanIcon />,
      title: "Chấm điểm",
      onPress: () => router.push(`/scanExam?id=${idGradingSesstion}`),
    },
    {
      icon: <SendIcon />,
      title: "Xuất kết quả",
      onPress: () => router.push("/exportResults"),
    },
    {
      icon: <ExamIcon />,
      title: "Bài đã chấm",
      onPress: () => router.push(`/gradedPapers?id=${idGradingSesstion}`),
    },
    {
      icon: <LayerIcon />,
      title: "Thống kê",
      onPress: () => router.push("/statistics"),
    },

    {
      icon: <InfoIcon />,
      title: "Thông tin chung",
      onPress: () => router.push("/generalInfo"),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          padding: 24,
          gap: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View className="items-center gap-3 px-6 py-6 ">
          <Text className="text-gray-900 text-center font-questrial text-2xl">
            Bài kiểm tra
            <Text className="font-calsans">{" " + data?.data?.name}</Text>
          </Text>
        </View>

        {/* Menu Items */}
        <View className="gap-4 items-center">
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              icon={item.icon}
              title={item.title}
              onPress={item.onPress}
            />
          ))}
        </View>

        {/* Bottom Padding */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
