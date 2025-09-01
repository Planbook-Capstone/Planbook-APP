import { Image, Text, View } from "react-native";

interface History {
  id: string;
  func: string;
  token: string;
}

function HistoryItem({ item, isLast }: { item: History; isLast: boolean }) {
  return (
    <View
      className={`flex flex-row justify-between items-center p-4 ${
        !isLast ? "border-b border-gray-100" : ""
      }`}
    >
      <View>
        <Text className="flex-1 text-lg font-questrial" numberOfLines={1}>
          {item.func}
        </Text>
        <Text
          className="flex-1 text-sm text-neutral-500 font-questrial"
          numberOfLines={1}
        >
          10:33 - 20/08/2025
        </Text>
      </View>
      <View className=" flex-row justify-end items-center">
        <Text className="font-questrial text-sm font-semibold pr-1">
          {item.token}
        </Text>
        <Image
          source={require("@/assets/images/flash.png")}
          height={24}
          width={24}
        />
      </View>
    </View>
  );
}

export default HistoryItem;
