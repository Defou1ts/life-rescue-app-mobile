import { Image } from "expo-image";
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  imageUrl: string;
  onPress: () => void;
  children: ReactNode;
};

export const IconButton = ({ imageUrl, onPress, children }: Props) => {
  return (
    <Pressable onPress={onPress}>
      <View style={styles.container}>
        <Image source={imageUrl} style={{ width: 50, height: 50 }} />
        <Text style={styles.text}>{children}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 45,
    backgroundColor: "#EBF1F5",
    shadowColor: "#000",
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,

    elevation: 10,
  },
  text: {
    color: "#0D9488",
    fontSize: 25,
    fontFamily: "Inter",
  },
});
