import { Tabs } from "expo-router";
import React from "react";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import TabBar from "@/components/tabBar/TabBar";
import HomeIcon from "@/assets/images/icons/home-active.svg";
import UserIcon from "@/assets/images/icons/user.svg";
import SVGIcon from "@/components/ui/SVGIcon";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarStyle: { height: 90 },
        tabBarItemStyle: { paddingTop: 10 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color, focused }) => (
            <SVGIcon iconName="home" color={focused ? "black" : "#D4D4D4"} />
          ),
        }}
      />
      <Tabs.Screen
        name="orderHistory"
        options={{
          title: "Lịch sử đơn hàng",
          tabBarIcon: ({ color, focused }) => (
            <SVGIcon iconName="order" color={focused ? "black" : "#D4D4D4"} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Hồ sơ",
          tabBarIcon: ({ color, focused }) => (
            <SVGIcon iconName="user" color={focused ? "black" : "#D4D4D4"} />
          ),
        }}
      />
    </Tabs>
  );
}
