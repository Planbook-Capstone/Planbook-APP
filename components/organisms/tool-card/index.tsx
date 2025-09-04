import { Image, Text, TouchableOpacity, View } from "react-native";
import ScanIcon from "@/assets/images/icons/scan-acitve.svg";
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
        style={{ height: 195 }}
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
            <View className="absolute">
              {/* <Image
                source={require("@/assets/images/icons/scan-active.png")}
                className="w-full h-full"
                resizeMode="cover"
              /> */}
              <ScanIcon />
            </View>

            {/* Bottom section với text */}
            <View className="flex-1 justify-end pl-2">
              <Text className="text-2xl font-calsans text-black">
                {tool.name}
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
        <Text className="text-xl font-calsans text-gray-800">{tool.name}</Text>
        <Text className="font-questrial text-sm mt-1" numberOfLines={2}>
          {tool.description}
        </Text>
      </View>

      <View className="absolute -top-2 right-9">
        <Text className="font-questrial text-xl bg-[#F93737] text-white px-4 py-1.5 rounded-full">
          Mới
        </Text>
      </View>
    </View>
  );
}

export default ToolCard;
