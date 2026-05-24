import { router } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function SubscriptionSuccessScreen() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/(tabs)");
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Subscription activated 🎉</Text>
    </View>
  );
}
