import { useAllergies } from "@/api/hooks/useAllergies";
import { useDiseases } from "@/api/hooks/useDiseases";
import { useProfile } from "@/api/hooks/useProfile";
import { IconButton } from "@/components/icon-button";
import { Input } from "@/components/input";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { useMemo, useRef } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Logo = require("@/assets/images/logo.png");
const MoreInfoIcon = require("@/assets/images/more-info.png");

export default function PRofile() {
  const { data, isLoading } = useProfile();

  const { data: allergiesData, isLoading: isLoadingAllergies } = useAllergies();
  const { data: diseasesData, isLoading: isLoadingDiseases } = useDiseases();
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["50%", "90%"], []);

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

  const allergyItems =
    allergiesData.length === 0
      ? [{ id: "default", name: "No allergies" }]
      : allergiesData;

  const diseaseItems =
    diseasesData.length === 0
      ? [{ id: "default", name: "No diseases" }]
      : diseasesData;

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image source={Logo} style={styles.image} />
        </View>
        <View style={styles.dataContainer}>
          {data.name && data.lastName && (
            <Input value={data.name + " " + data.lastName} />
          )}
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
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose
          backgroundStyle={styles.sheetBackground}
          handleIndicatorStyle={styles.sheetHandle}
        >
          <BottomSheetScrollView
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.infoWrapper}>
              <View style={styles.infoHeader}>
                <Text style={styles.infoHeaderText}>Allergy</Text>
                <Text style={styles.infoHeaderText}>&mdash;</Text>
              </View>
              <View style={styles.listContainer}>
                {allergyItems.map((allergy) => (
                  <View style={styles.infoContent} key={allergy.id}>
                    <Text style={styles.infoText}>{allergy.name}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.infoWrapper}>
              <View style={styles.infoHeader}>
                <Text style={styles.infoHeaderText}>Disease</Text>
                <Text style={styles.infoHeaderText}>&mdash;</Text>
              </View>
              <View style={styles.listContainer}>
                {diseaseItems.map((disease) => (
                  <View style={styles.infoContent} key={disease.id}>
                    <Text style={styles.infoText}>{disease.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
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
  sheetBackground: {
    backgroundColor: "#EBF1F5",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  sheetHandle: {
    backgroundColor: "#CBD5E1",
    width: 80,
  },
  sheetContent: {
    padding: 28,
    paddingBottom: 48,
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
    marginBottom: 25,
  },
  listContainer: {
    gap: 10,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    fontWeight: "300",
  },
});
