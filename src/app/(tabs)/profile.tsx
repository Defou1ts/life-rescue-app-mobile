import { useProfile } from "@/api/hooks/useProfile";
import { IconButton } from "@/components/icon-button";
import { Input } from "@/components/input";
import { Image } from "expo-image";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
const Logo = require("@/assets/images/logo.png");
const MoreInfoIcon = require("@/assets/images/more-info.png");
export default function PRofile() {
  const { data, isLoading } = useProfile();

  if (isLoading || !data) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={Logo} style={styles.image} />
      </View>
      <View style={styles.dataContainer}>
        {data.name && <Input value={data.name} />}
        {data.email && <Input value={data.email} />}
        {data.phoneNumber && <Input value={data.phoneNumber} />}
        {data.isTwoFactorEnabled && (
          <Text style={styles.text}>2FA Enabled</Text>
        )}
        <IconButton imageUrl={MoreInfoIcon} onPress={() => {}}>
          More information
        </IconButton>
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
    marginTop: 120,
    width: "80%",
  },
  text: {
    marginTop: 50,
    color: "#0D9488",
    textAlign: "center",
    marginBottom: 50,
  },
});
