import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ToolCardProps {
  tool: any;
  onPress: () => void;
}

function ToolCard({ tool, onPress }: ToolCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl p-4 border border-gray-200/80 flex-row items-center  active:bg-gray-100"
    >
      <View className={`w-12 h-12 rounded-lg items-center justify-center mr-4`}>
        <Image
          source={require("@/assets/images/icons/scan-active.png")}
          className="w-full h-full object-cover"
        />
      </View>

      <View className="flex-1">
        <Text className="text-xl font-calsans text-gray-800">{tool.name}</Text>
        <Text className="font-questrial text-sm mt-1" numberOfLines={2}>
          {tool.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default ToolCard;
