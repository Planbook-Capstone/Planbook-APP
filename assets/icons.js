import { AntDesign, Feather } from "@expo/vector-icons";
export const icons = {
  index: (props) => <Feather name="home" size={26} {...props} />,
  profile: (props) => (
    <AntDesign name="user" size={26} color="black" {...props} />
  ),
};
