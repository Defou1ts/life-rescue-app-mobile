import { useAllergiesGlobal } from "@/api/hooks/useAllergiesGlobal";
import { AppButton } from "@/components/button";
import BottomSheet, { BottomSheetView } from "@expo/ui/community/bottom-sheet";
import { Image } from "expo-image";
import { useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

const Logo = require("@/assets/images/logo.png");

export default function AddAllergy() {
  const { data: allergiesData, isLoading: isLoadingAllergies } =
    useAllergiesGlobal();

  const sheetRef = useRef<BottomSheet>(null);
  if (isLoadingAllergies || !allergiesData) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const allergies =
    allergiesData.length === 0
      ? [{ id: "default", name: "No allergies" }]
      : allergiesData;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image source={Logo} style={styles.image} />
        </View>

        <View style={styles.infoWrapper}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoHeaderText}>Allergy</Text>
          </View>

          <View style={styles.listContainer}>
            <FlatList
              data={allergies}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <Text style={styles.infoText}>{item.name}</Text>
              )}
            />
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <AppButton type="primary" onPress={() => sheetRef.current?.expand()}>
            Custom Allergy
          </AppButton>

          <AppButton containerStyle={styles.saveButton} type="primary">
            Save
          </AppButton>
        </View>

        <BottomSheet
          ref={sheetRef}
          snapPoints={["50%", "100%"]}
          index={-1}
          enablePanDownToClose
        >
          <BottomSheetView style={{ flex: 1, padding: 28 }}>
            <View style={styles.infoWrapper}></View>
          </BottomSheetView>
        </BottomSheet>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    width: "90%",
    flex: 1,
    paddingBottom: 30,
  },

  imageContainer: {
    alignItems: "flex-end",
    marginBottom: 45,
    marginTop: 20,
  },

  image: {
    width: 114,
    height: 114,
  },

  infoWrapper: {
    flex: 1,
    marginBottom: 20,
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

  infoHeaderText: {
    fontSize: 25,
    fontFamily: "Inter",
    color: "#0D9488",
    fontWeight: "bold",
  },

  listContainer: {
    flex: 1,
    gap: 12,
    overflow: "hidden",
  },

  listContent: {
    borderRadius: 25,
    backgroundColor: "#EBF1F5",
    shadowColor: "#000",
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    marginHorizontal: 4,
    height: 63,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  infoText: {
    fontSize: 25,
    fontFamily: "Inter",
    color: "#0D9488",
    fontWeight: "300",
    height: 80,
  },

  buttonsContainer: {
    marginTop: "auto",
  },

  saveButton: {
    marginTop: 20,
  },
});
