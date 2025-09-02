import { getToolActionName } from "@/constants/labels";
import { Image, Text, View } from "react-native";

interface History {
  id: number;
  code: string;
  description?: string;
  updatedAt: Date | string;
  sources?: string;
  lessonIds: string | number[];
  tokenUsed: number;
  input?: any;
  output?: any;
  userId?: string;
  toolId?: string;
  academicYearId?: number;
  resultId?: number | null;
  templateId?: number | null;
  status?: string;
  toolType?: string;
  createdAt?: string;
}

// Hàm định dạng ngày giờ kiểu Việt Nam: "giờ:phút - ngày/tháng/năm"
const formatVietnameseDateTime = (dateTime: Date | string): string => {
  if (!dateTime) return "";

  const date = typeof dateTime === "string" ? new Date(dateTime) : dateTime;

  // Kiểm tra nếu ngày không hợp lệ
  if (isNaN(date.getTime())) return "Ngày không hợp lệ";

  // Lấy giờ, phút
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  // Lấy ngày, tháng, năm
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Tháng bắt đầu từ 0
  const year = date.getFullYear();

  // Định dạng: "giờ:phút - ngày/tháng/năm"
  return `${hours}:${minutes} - ${day}/${month}/${year}`;
};

function HistoryItem({ item, isLast }: { item: History; isLast: boolean }) {
  return (
    <View className={`flex flex-row justify-between items-center p-4 `}>
      <View>
        <Text className="flex-1 text-xl font-calsans" numberOfLines={1}>
          {getToolActionName(item.code)}
        </Text>
        <Text
          className="flex-1 text-base text-neutral-500 font-questrial"
          numberOfLines={1}
        >
          {formatVietnameseDateTime(item?.updatedAt)}
        </Text>
      </View>
      <View className=" flex-row justify-end items-center">
        <Image
          source={require("@/assets/images/flash.png")}
          height={24}
          width={24}
        />
        <Text className="font-calsans text-xl font-semibold pr-1">
          {item.tokenUsed}
        </Text>
      </View>
    </View>
  );
}

export default HistoryItem;
