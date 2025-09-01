import { View } from "react-native";
import CameraWithCrop from "@/components/ui/CameraWithCrop";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1 }}>
      <CameraWithCrop />
    </View>
  );
}
