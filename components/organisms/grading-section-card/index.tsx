import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";

export const GeadingSectionCard = ({ item }: any) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-6 mb-5 border border-gray-200 overflow-hidden"
      onPress={() => router.push("/gradingMenu")}
    >
      <ImageBackground
        source={require("@/assets/images/card-bg-1.png")}
        className="absolute top-0 left-0 right-0 bottom-0 opacity-15"
        resizeMode="cover"
      />
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-xl font-calsans text-gray-900">{item?.name}</Text>
        <View className="flex-row items-center space-x-1">
          <Ionicons name="time-outline" size={16} color="#6b7280" />
          <Text className="text-sm font-questrial text-gray-500">
            {new Date(item.updated_at).toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </Text>
        </View>
      </View>
      <Text className="text-base text-gray-700">Số câu: {item.questions}</Text>
    </TouchableOpacity>
  );
};
