import { AppText } from "@/components/app-text";
import { AppButton } from "@/components/button";
import { Title } from "@/components/Title";
import { Image } from "expo-image";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const ImageMap = require("@/assets/images/map.png");
const ImageMapArriving = require("@/assets/images/medics-arriving.jpg");

/**
 * MOCK DATA (потом заменишь на API)
 */
const MAIN_ISSUES = [
  { id: "injury", name: "Injury or Trauma" },
  { id: "breathing", name: "Difficulty Breathing" },
  { id: "allergy", name: "Allergic Reaction" },
  { id: "chest", name: "Chest Pain / Heart Issue" },
  { id: "unconscious", name: "Unconscious" },
  { id: "other", name: "Other" },
];

const SYMPTOMS = [
  { id: "bleeding", name: "Heavy bleeding" },
  { id: "pain", name: "Severe pain" },
  { id: "breath", name: "Difficulty breathing" },
  { id: "dizzy", name: "Dizziness or confusion" },
  { id: "weakness", name: "Numbness or weakness" },
];

const CONDITIONS = [
  { id: "allergy", name: "Drug Allergies" },
  { id: "heart", name: "Heart Disease" },
  { id: "diabetes", name: "Diabetes" },
  { id: "asthma", name: "Asthma or Lung Disease" },
  { id: "pregnancy", name: "Pregnancy" },
  { id: "none", name: "None or Unknown" },
];

type FormValues = {
  mainIssue: string | null;
  symptoms: string[];
  conditions: string[];
};

export default function Home() {
  const hasSubscribe = true;
  const activeEmergencyRequest = true;

  const [modalVisible, setModalVisible] = useState(false);

  const { watch, setValue, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      mainIssue: "injury",
      symptoms: ["pain", "breath"],
      conditions: ["none"],
    },
  });

  const values = watch();

  const toggleMulti = (field: "symptoms" | "conditions", id: string) => {
    const current = values[field] || [];

    if (current.includes(id)) {
      setValue(
        field,
        current.filter((x) => x !== id),
      );
    } else {
      setValue(field, [...current, id]);
    }
  };

  const onSave = (data: FormValues) => {
    console.log("UPDATED_EMERGENCY_DATA", data);
    setModalVisible(false);

    // API:
    // await api.updateEmergency(data)
  };

  return (
    <View style={styles.container}>
      {/* MAP */}
      <View style={styles.mapContainer}>
        <View>
          <View style={styles.medicsContainer}>
            <View style={styles.medics} />

            <AppText>
              {activeEmergencyRequest
                ? "Arriving in 5-8 min"
                : "Medics nearby: 7"}
            </AppText>
          </View>

          <View style={styles.imageContainer}>
            <Image
              source={activeEmergencyRequest ? ImageMapArriving : ImageMap}
              style={styles.image}
            />
          </View>
        </View>
      </View>

      {/* ACTIVE REQUEST */}
      {hasSubscribe ? (
        activeEmergencyRequest ? (
          <View>
            <AppButton
              type="outline"
              containerStyle={{ marginTop: 27 }}
              onPress={() => setModalVisible(true)}
            >
              Update Symptoms
            </AppButton>

            <AppButton
              type="outline"
              textStyle={{ color: "#F59E0B" }}
              containerStyle={{
                marginTop: 27,
                borderColor: "#F59E0B",
              }}
            >
              Cancel Request
            </AppButton>
          </View>
        ) : (
          <View>
            <AppButton containerStyle={{ marginTop: 27 }} type="primary">
              Recent Requests
            </AppButton>

            <AppButton containerStyle={{ marginTop: 27 }} type="outline">
              Emergency Help
            </AppButton>
          </View>
        )
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

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modal}>
          <Pressable
            onPress={() => setModalVisible(false)}
            style={styles.closeIcon}
          >
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
          <Title>Update Symptoms</Title>

          {/* MAIN ISSUE */}
          <Text style={styles.sectionTitle}>Main Issue</Text>

          <FlatList
            data={MAIN_ISSUES}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setValue("mainIssue", item.id)}
                style={[
                  styles.option,
                  values.mainIssue === item.id && styles.selected,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    values.mainIssue === item.id && styles.optionTextSelected,
                  ]}
                >
                  {item.name}
                </Text>
              </Pressable>
            )}
          />

          {/* SYMPTOMS */}
          <Text style={styles.sectionTitle}>Symptoms</Text>

          <FlatList
            data={SYMPTOMS}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => {
              const selected = values.symptoms.includes(item.id);

              return (
                <Pressable
                  onPress={() => toggleMulti("symptoms", item.id)}
                  style={[styles.option, selected && styles.selected]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              );
            }}
          />

          {/* CONDITIONS */}
          <Text style={styles.sectionTitle}>Conditions</Text>

          <FlatList
            data={CONDITIONS}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => {
              const selected = values.conditions.includes(item.id);

              return (
                <Pressable
                  onPress={() => toggleMulti("conditions", item.id)}
                  style={[styles.option, selected && styles.selected]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              );
            }}
          />

          {/* ACTIONS */}
          <AppButton
            type="primary"
            containerStyle={{ marginTop: 20, marginBottom: 20 }}
            onPress={handleSubmit(onSave)}
          >
            Update
          </AppButton>
        </View>
      </Modal>
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
    borderRadius: 24,
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

  /**
   * MODAL STYLES
   */

  modal: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    backgroundColor: "#fff",
  },

  sectionTitle: {
    fontSize: 25,
    fontWeight: "500",
    marginTop: 20,
    marginBottom: 10,
    color: "#0D9488",
    fontFamily: "Inter",
  },

  option: {
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 250,
    backgroundColor: "#EBF1F5",
    marginBottom: 10,

    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },

  optionText: {
    color: "#0D9488",
    fontSize: 25,
    fontFamily: "Inter",
    fontWeight: 300,
  },
  optionTextSelected: {
    color: "#FFFFFF",
  },

  selected: {
    backgroundColor: "#0D9488",
  },
  closeIcon: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EBF1F5",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,

    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  closeText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0D9488",
  },
});
