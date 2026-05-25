import { StyleSheet, View } from "react-native";

const Logo = require("@/assets/images/logo.png");

import { logout } from "@/api/logout";
import { AppButton } from "@/components/button";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

export default function Settings() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={Logo} style={styles.image} />
      </View>
      <View style={styles.dataContainer}>
        <AppButton
          containerStyle={styles.button}
          type="primary"
          onPress={() => router.push("/(tabs)/settings/editProfile")}
        >
          Edit profile
        </AppButton>
        <AppButton
          containerStyle={styles.button}
          type="primary"
          onPress={() => router.push("/(tabs)/settings/changePassword")}
        >
          Change Password
        </AppButton>
        <AppButton
          containerStyle={styles.button}
          type="primary"
          onPress={() => router.push("/(tabs)/settings/changeEmail")}
        >
          Change Email
        </AppButton>
        <AppButton
          onPress={logout}
          containerStyle={styles.logoutButton}
          type="primary"
        >
          Logout
        </AppButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {},
  image: {
    width: 274,
    height: 274,
  },
  dataContainer: {
    marginTop: 20,
    width: "80%",
  },
  button: {
    marginBottom: 8,
  },
  logoutButton: {
    marginTop: 52,
    backgroundColor: "#FF0000",
  },
});
