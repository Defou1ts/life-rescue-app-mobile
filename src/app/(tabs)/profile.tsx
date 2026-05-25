import { useAllergies } from "@/api/hooks/useAllergies";
import { useDiseases } from "@/api/hooks/useDiseases";
import { useProfile } from "@/api/hooks/useProfile";
import { IconButton } from "@/components/icon-button";
import { Input } from "@/components/input";
import BottomSheet, { BottomSheetView } from "@expo/ui/community/bottom-sheet";
import { Image } from "expo-image";
import { useRef } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

const Logo = require("@/assets/images/logo.png");
const MoreInfoIcon = require("@/assets/images/more-info.png");

export default function PRofile() {
  const { data, isLoading } = useProfile();

  const { data: allergiesData, isLoading: isLoadingAllergies } = useAllergies();
  const { data: diseasesData, isLoading: isLoadingDiseases } = useDiseases();
  const sheetRef = useRef<BottomSheet>(null);
  if (
    isLoading ||
    !data ||
    isLoadingAllergies ||
    isLoadingDiseases ||
    !allergiesData ||
    !diseasesData
  ) {
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
        <IconButton
          imageUrl={MoreInfoIcon}
          onPress={() => sheetRef.current?.expand()}
        >
          More information
        </IconButton>
      </View>
      <BottomSheet
        ref={sheetRef}
        snapPoints={["50%", "100%"]}
        index={-1}
        onChange={(index) => {
          console.log("onChange", index);
        }}
        onClose={() => {
          console.log("closed");
        }}
        enablePanDownToClose
      >
        <BottomSheetView style={{ flex: 1, padding: 28 }}>
          <View style={styles.infoWrapper}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoHeaderText}>Allergy</Text>
              <Text style={styles.infoHeaderText}>&mdash;</Text>
            </View>
            <View style={styles.infoContent}>
              {[
                allergiesData.length === 0
                  ? { id: "default", name: "No allergies" }
                  : null,
                ...allergiesData,
              ]?.map((allergy) => {
                if (!allergy) return null;
                return (
                  <Text style={styles.infoText} key={allergy.id}>
                    {allergy.name}
                  </Text>
                );
              })}
            </View>
          </View>
          <View style={styles.infoWrapper}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoHeaderText}>Disease</Text>
              <Text style={styles.infoHeaderText}>&mdash;</Text>
            </View>
            <View style={styles.infoContent}>
              {[
                diseasesData.length === 0
                  ? { id: "default", name: "No diseases" }
                  : null,
                ...diseasesData,
              ]?.map((disease) => {
                if (!disease) return null;
                return (
                  <Text style={styles.infoText} key={disease.id}>
                    {disease.name}
                  </Text>
                );
              })}
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
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
  infoWrapper: {
    marginBottom: 30,
    borderRadius: 45,
    backgroundColor: "#EBF1F5",
    shadowColor: "#000",
    padding: 20,
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,

    elevation: 10,
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#0D9488",
  },
  infoHeaderText: {
    fontSize: 25,
    fontFamily: "Inter",
    color: "#0D9488",
    fontWeight: "bold",
  },
  infoContent: {
    paddingVertical: 18,
    paddingHorizontal: 12,

    backgroundColor: "#EBF1F5",
    shadowColor: "#000",
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,

    elevation: 10,
    borderRadius: 25,
  },
  infoText: {
    fontSize: 25,
    fontFamily: "Inter",
    color: "#0D9488",
    fontWeight: "light",
  },
});
