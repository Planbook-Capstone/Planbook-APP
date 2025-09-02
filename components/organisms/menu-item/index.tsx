import { View, Text, TouchableOpacity } from "react-native";

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    className="flex-row items-center gap-4 px-6 py-5 bg-white rounded-full border border-neutral-300"
    style={{
      width: 368,
      height: 70,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    }}
  >
    <View>{icon}</View>
    <View className="flex-1">
      <Text className="font-questrial text-xl">{title}</Text>
    </View>
  </TouchableOpacity>
);

export default MenuItem;
