import { Order, OrderStatus } from "@/types/order";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import CancelIcon from "@/assets/images/status/cancel.svg";
import SuccessIcon from "@/assets/images/status/success.svg";
import PendingIcon from "@/assets/images/status/pending.svg";
import RetryIcon from "@/assets/images/status/retry.svg";

type OrderItemProps = {
  item: Order;
  onPress: () => void;
};
const OrderItem = ({ item, onPress }: OrderItemProps) => {
  const styleConfig = useMemo(() => {
    switch (item.status) {
      case "PAID":
        return {
          icon: <SuccessIcon width={50} height={50} />,
          color: "text-green-500",
          bgColor: "bg-green-100",
        };
      case "PENDING":
        return {
          icon: <PendingIcon width={50} height={50} />,
          color: "text-yellow-500",
          bgColor: "bg-yellow-100",
        };
      case "CANCELLED":
        return {
          icon: <CancelIcon width={50} height={50} />,
          color: "text-red-500",
          bgColor: "bg-red-100",
        };
      case "FAILED":
        return {
          icon: "alert-circle-outline" as const,
          color: "text-red-500",
          bgColor: "bg-red-100",
        };
      case "EXPIRED":
        return {
          icon: "clock-alert-outline" as const,
          color: "text-gray-500",
          bgColor: "bg-gray-100",
        };
      case "RETRY":
        return {
          icon: "refresh-circle" as const,
          color: "text-orange-500",
          bgColor: "bg-orange-100",
        };
      default:
        return {
          icon: "help-circle-outline" as const,
          color: "text-gray-500",
          bgColor: "bg-gray-100",
        };
    }
  }, [item.status]);

  const formattedDate = new Date(item.createdAt).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "Chờ xử lý";
      case "PAID":
        return "Đã thanh toán";
      case "CANCELLED":
        return "Đã hủy";
      case "FAILED":
        return "Thất bại";
      case "EXPIRED":
        return "Đã hết hạn";
      case "RETRY":
        return "Thử lại";
      default:
        return status;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center p-4 bg-white border-b border-gray-100 active:bg-gray-50"
    >
      <View className={`w-12 h-12 rounded-full items-center justify-center `}>
        {/* <MaterialCommunityIcons
          name=
          size={28}
          className={styleConfig.color}
        /> */}
        {styleConfig.icon}
      </View>
      <View className="flex-1 mx-4">
        <Text
          className="text-base font-calsans text-gray-800"
          numberOfLines={2}
        >
          {item?.subscriptionPackage.name}
        </Text>
        <Text className="text-sm font-questrial text-neutral-500 mt-1">
          {formattedDate}
        </Text>
        <Text className={`text-sm font-questrial mt-1 ${styleConfig.color}`}>
          {getStatusText(item.status)}
        </Text>
      </View>
      <Text className="text-lg font-calsans text-gray-800">
        {item.amount.toLocaleString("vi-VN")} VNĐ
      </Text>
    </TouchableOpacity>
  );
};

export default OrderItem;
