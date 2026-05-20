import { AppText } from "@/components/app-text";
import { AppButton } from "@/components/button";
import { Title } from "@/components/Title";
import { View } from "react-native";

import { Image } from "expo-image";

const ImageMap = require("@/assets/images/map.png");

import { StyleSheet } from "react-native";

export default function Home() {
  const hasSubscribe = true;

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <View>
          <View style={styles.medicsContainer}>
            <View style={styles.medics}></View>
            <AppText>Medics nearby: 7</AppText>
          </View>
          <View style={styles.imageContainer}>
            <Image source={ImageMap} style={styles.image} />
          </View>
        </View>
      </View>
      {hasSubscribe ? (
        <View>
          <AppButton containerStyle={{ marginTop: 27 }} type="primary">
            Recent Requests
          </AppButton>
          <AppButton containerStyle={{ marginTop: 27 }} type="outline">
            Emergency Help
          </AppButton>
        </View>
      ) : (
        <View>
          <View style={{ marginBottom: 15 }}>
            <Title>Activate Emergency Services</Title>
          </View>
          <View style={{ marginBottom: 30 }}>
            <AppText>
              Subscribe now to get 24/7 access to professional medical help in
              your area
            </AppText>
          </View>
          <AppButton containerStyle={{ marginTop: 27 }} type="primary">
            Join Now
          </AppButton>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 42,
    justifyContent: "center",
  },

  imageContainer: {
    width: 250,
    height: 188,
  },
  image: {
    width: 250,
    height: 188,
  },

  mapContainer: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 45,

    alignItems: "center",
    gap: 9,
    marginBottom: 25,
  },

  inputsContainer: {
    gap: 36,
    marginBottom: 70,
  },

  errorText: {
    color: "#dc2626",
    fontSize: 13,
    marginTop: 8,
    fontWeight: "500",
  },
  medicsContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginBottom: 9,
  },
  medics: {
    width: 16,
    height: 16,
    backgroundColor: "#7CEA76",
    borderRadius: 45,
  },
});
