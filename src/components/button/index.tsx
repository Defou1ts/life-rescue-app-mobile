import { ReactNode } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

type Props = {
  type: "primary" | "outline";
  children: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
  disabled?: boolean;
};

export const AppButton = ({
  type,
  children,
  containerStyle,
  textStyle,
  onPress,
  disabled = false,
}: Props) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <View style={[styles.button, styles[type], containerStyle]}>
        <Text
          style={[
            styles.text,
            type === "primary" && styles.textPrimary,
            type === "outline" && styles.textOutline,
            textStyle,
          ]}
        >
          {children}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  button: {
    borderRadius: 555,
    paddingVertical: 22,
    paddingHorizontal: 9,
    fontFamily: "Inter",
    minWidth: 260,
    alignItems: "center",
  },
  text: {
    fontFamily: "Inter",
    fontSize: 25,
    fontWeight: "bold",
  },
  primary: {
    backgroundColor: "#0D9488",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,

    elevation: 7,
  },
  outline: {
    backgroundColor: "transparent",
    color: "#0D9488",
    borderColor: "#0D9488",
    borderWidth: 2,
  },
  textPrimary: {
    color: "#FFFFFF",
  },

  textOutline: {
    color: "#0D9488",
  },
});
