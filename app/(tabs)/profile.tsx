import { useWalletService } from "@/services/walletServices";
import { useAuthStore } from "@/store/authStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import TokenIcon from "@/assets/images/icons/token.svg";
type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

type MenuItem = {
  icon: IconName;
  text: string;
  onPress: () => void;
  color?: string;
};

// Component con để hiển thị một dòng thông tin cá nhân
const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) => (
  <View className="flex-row justify-between items-center py-3 border-b border-gray-100 ">
    <Text className=" font-questrial text-base text-gray-500">{label}</Text>
    <Text className="font-questrial text-base font-[600] text-gray-800">
      {value || "Chưa cập nhật"}
    </Text>
  </View>
);

const ProfileScreen = () => {
  const router = useRouter(); // 2. Lấy đối tượng router
  const { user } = useAuthStore();
  const {
    actions: { logout },
  } = useAuthStore();

  const { data: wallet } = useWalletService();

  // 3. Tạo hàm xử lý đăng xuất mới
  const handleLogout = () => {
    // Gọi action logout từ store để xóa state
    logout();
    // Điều hướng người dùng về trang đăng nhập và xóa lịch sử điều hướng
    router.replace("/(auth)/login");
  };

  // Hàm xử lý giới tính, an toàn với giá trị null
  const displayGender = (gender: string | null | undefined) => {
    if (!gender) return "Chưa cập nhật";
    if (gender === "MALE") return "Nam";
    if (gender === "FEMALE") return "Nữ";
    return "Khác";
  };

  // Hàm xử lý ngày sinh, an toàn với giá trị null
  const formatBirthday = (dateString: string | null | undefined) => {
    if (!dateString) return "Chưa cập nhật";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch (error) {
      return "Ngày không hợp lệ";
    }
  };

  // Menu đã được rút gọn, bỏ đi "Thông tin cá nhân"
  const menuItems: readonly MenuItem[] = [
    {
      icon: "history",
      text: "Lịch sử đơn hàng",
      onPress: () => router.push("/orderHistory"),
    },
    {
      icon: "logout",
      text: "Đăng xuất",
      // Cập nhật onPress để gọi hàm logout
      onPress: () =>
        Alert.alert(
          "Xác nhận đăng xuất",
          "Bạn có chắc chắn muốn đăng xuất không?",
          [
            {
              text: "Hủy",
              style: "cancel",
            },
            {
              text: "Đăng xuất",
              style: "destructive",
              onPress: handleLogout, // <-- GỌI HÀM LOGOUT Ở ĐÂY
            },
          ]
        ),
      color: "text-red-500",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white pb-[100px] font">
      <ScrollView>
        {/* Phần Header - ĐÃ CẬP NHẬT DÙNG ẢNH NỀN */}
        <View className="relative items-center">
          {/* Ảnh Background */}
          <Image
            source={require("@/assets/images/background.png")} // <-- THAY BẰNG ẢNH NỀN
            // Sử dụng style để ảnh nằm phía sau
            style={{
              width: "100%",
              height: 200, // Chiều cao của background
              position: "absolute",
              top: 0,
              left: 0,
            }}
            resizeMode="cover" // Đảm bảo ảnh che phủ toàn bộ khu vực
          />

          {/* Nội dung Header (đặt bên trên ảnh nền) */}
          <View className="items-center p-6 pb-8">
            <Image
              source={{ uri: user?.avatar || "https://i.pravatar.cc/150" }}
              className="w-24 h-24 mt-4 border-4 border-white rounded-full" // Đổi border thành màu trắng cho nổi bật
            />
            <Text className="mt-3 text-2xl font-bold text-white">
              Xin chào {user?.fullName ?? "Người dùng"}
            </Text>
          </View>
        </View>

        {/* Phần Ví */}
        <View className="p-5 mx-4 -mt-6 bg-white rounded-xl shadow-lg">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-gray-500">Số dư ví</Text>

              <View className="flex-row items-center mt-1">
                <Text className="text-2xl font-bold text-gray-800">
                  {wallet?.data?.balance || 0}
                </Text>
                <TokenIcon />
              </View>
            </View>

            <TouchableOpacity
              className="px-4 py-2 rounded-full bg-blue-100"
              onPress={() => router.push("/walletHistory")}
            >
              <Text className="font-questrial text-blue-600">Xem lịch sử</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PHẦN THÔNG TIN CÁ NHÂN MỚI */}
        <View className="p-5 mx-4 mt-6 bg-white rounded-xl shadow-lg ">
          <Text className="text-xl font-calsans text-gray-800 mb-2">
            Thông tin cá nhân
          </Text>
          {/* <InfoRow label="Họ và tên" value={user?.fullName} /> */}
          <InfoRow label="Email" value={user?.email} />
          <InfoRow label="Số điện thoại" value={user?.phone} />
          <InfoRow label="Ngày sinh" value={formatBirthday(user?.birthday)} />
          <InfoRow label="Giới tính" value={displayGender(user?.gender)} />
        </View>

        {/* Phần Menu (đã rút gọn) */}
        <View className="mx-4 my-6 bg-white rounded-xl shadow-lg">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              className={`flex-row items-center p-4 ${
                index < menuItems.length - 1 ? "border-b border-gray-200" : ""
              }`}
              onPress={item.onPress}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={24}
                className={`mr-4 ${item.color || "text-gray-600"}`}
              />
              <Text
                className={`font-questrial flex-1 text-base ${
                  item.color || "text-gray-800"
                }`}
              >
                {item.text}
              </Text>
              {item.text !== "Đăng xuất" && (
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  className="text-gray-400"
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
