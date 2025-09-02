import {
  Image,
  ImageBackground,
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
    <View className="w-full relative" style={{ height: 185, marginTop: 8 }}>
      {/* Container cho card chính */}
      <View
        className="w-full rounded-2xl overflow-hidden"
        style={{ height: 185 }}
      >
        {/* Background image */}
        <Image
          source={require("@/assets/images/background/bg-card-tool.png")}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
          }}
          resizeMode="stretch"
        />

        <TouchableOpacity
          onPress={onPress}
          className="w-full h-full active:bg-gray-100/20"
          style={{ borderRadius: 16 }}
        >
          <View className="w-full h-full p-6">
            {/* Top section với icon */}
            <View className="w-1/3 h-1/2 -ml-2">
              <Image
                source={require("@/assets/images/icons/scan-active.png")}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>

            {/* Bottom section với text */}
            <View className="flex-1 justify-end pl-2">
              <Text className="text-2xl font-calsans text-black">
                {tool.title}
              </Text>
              <Text
                className="font-questrial text-base text-neutral-600 mt-1"
                numberOfLines={2}
              >
                {tool.description}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        <Text className="text-xl font-calsans text-gray-800">{tool.title}</Text>
        <Text className="font-questrial text-sm mt-1" numberOfLines={2}>
          {tool.description}
        </Text>
      </View>
    </View>
  );
}

export default ToolCard;
