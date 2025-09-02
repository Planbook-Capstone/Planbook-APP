import { AntDesign, Feather } from "@expo/vector-icons";
import HomeIcon from "@/assets/images/icons/home-active.svg";
import UserIcon from "@/assets/images/icons/user.svg";

export const icons = {
  index: (props) => <HomeIcon {...props} />,
  profile: (props) => <UserIcon {...props} />,
};
