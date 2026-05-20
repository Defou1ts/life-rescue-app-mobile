import { AppButton } from "@/components/button";
import { Title } from "@/components/Title";
import { useFocusEffect, useNavigation } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  BackHandler,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Option = {
  id: string;
  name: string;
};

type FormValues = {
  mainIssue: string | null;
  symptoms: string[];
  conditions: string[];
};

/**
 * Пока моканные данные.
 * Подготовлено под получение с сервера:
 * - можно заменить на API response
 * - структура уже нормализована
 */
const MAIN_ISSUES: Option[] = [
  { id: "injury_trauma", name: "Injury or Trauma" },
  { id: "difficulty_breathing", name: "Difficulty Breathing" },
  { id: "allergic_reaction", name: "Allergic Reaction" },
  { id: "chest_pain", name: "Chest Pain / Heart Issue" },
  { id: "unconscious", name: "Unconscious" },
  { id: "other", name: "Other" },
];

const SYMPTOMS: Option[] = [
  { id: "heavy_bleeding", name: "Heavy bleeding" },
  { id: "severe_pain", name: "Severe pain" },
  { id: "difficulty_breathing", name: "Difficulty breathing" },
  { id: "dizziness", name: "Dizziness or confusion" },
  { id: "numbness", name: "Numbness or weakness" },
];

const CONDITIONS: Option[] = [
  { id: "drug_allergies", name: "Drug Allergies" },
  { id: "heart_disease", name: "Heart Disease" },
  { id: "diabetes", name: "Diabetes" },
  { id: "asthma", name: "Asthma or Lung Disease" },
  { id: "pregnancy", name: "Pregnancy" },
  { id: "none", name: "None or Unknown" },
];

const STEPS = [
  {
    title: "What is the main issue?",
    field: "mainIssue",
    options: MAIN_ISSUES,
    multiple: false,
  },
  {
    title: "Are any of these symptoms present?",
    field: "symptoms",
    options: SYMPTOMS,
    multiple: true,
  },
  {
    title: "Any pre-existing conditions?",
    field: "conditions",
    options: CONDITIONS,
    multiple: true,
  },
] as const;

export default function Request() {
  const navigation = useNavigation();

  const [step, setStep] = useState(0);

  const { control, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: {
      mainIssue: null,
      symptoms: [],
      conditions: [],
    },
  });

  const currentStep = STEPS[step];

  const values = watch();

  const isNextDisabled = useMemo(() => {
    if (currentStep.field === "mainIssue") {
      return !values.mainIssue;
    }

    return false;
  }, [currentStep.field, values.mainIssue]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (step > 0) {
          setStep((prev) => prev - 1);

          return true;
        }

        navigation.goBack();

        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [navigation, step]),
  );

  const onSubmit = (data: FormValues) => {
    /**
     * Подготовлено под отправку на сервер
     *
     * Можно будет:
     * await api.requestHelp(data)
     */

    const payload = {
      mainIssue: data.mainIssue,
      symptoms: data.symptoms,
      conditions: data.conditions,
      createdAt: new Date().toISOString(),
    };

    console.log("REQUEST_HELP_PAYLOAD", payload);

    navigation.navigate("home");
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((prev) => prev + 1);
    }
  };

  return (
    <View style={styles.container}>
      <Title>{currentStep.title}</Title>

      <Controller
        control={control}
        name={currentStep.field}
        render={({ field: { value, onChange } }) => {
          return (
            <FlatList
              data={currentStep.options}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => {
                const isSelected = currentStep.multiple
                  ? Array.isArray(value) && value.includes(item.id)
                  : value === item.id;

                const handlePress = () => {
                  if (currentStep.multiple) {
                    const currentArray = Array.isArray(value) ? value : [];

                    if (currentArray.includes(item.id)) {
                      onChange(
                        currentArray.filter((selected) => selected !== item.id),
                      );
                    } else {
                      onChange([...currentArray, item.id]);
                    }

                    return;
                  }

                  onChange(item.id);
                };

                return (
                  <View style={styles.cardWrapper}>
                    <Pressable
                      onPress={handlePress}
                      style={[styles.card, isSelected && styles.selectedCard]}
                    >
                      <Text
                        style={[
                          styles.cardText,
                          isSelected && styles.selectedCardText,
                        ]}
                      >
                        {item.name}
                      </Text>
                    </Pressable>
                  </View>
                );
              }}
            />
          );
        }}
      />

      <View style={styles.buttonsWrapper}>
        {step !== STEPS.length - 1 && (
          <AppButton
            type="primary"
            disabled={isNextDisabled}
            onPress={handleNext}
            containerStyle={{
              marginBottom: 17,
              marginTop: 40,
            }}
          >
            Next
          </AppButton>
        )}

        <AppButton
          type="primary"
          onPress={handleSubmit(onSubmit)}
          containerStyle={{
            backgroundColor: "#F59E0B",
          }}
        >
          Request Help
        </AppButton>
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 70,
  },

  card: {
    paddingVertical: 22,
    minHeight: 71,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EBF1F5",
    borderRadius: 250,

    shadowColor: "#000",
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,

    elevation: 10,
  },

  selectedCard: {
    backgroundColor: "#0D9488",
  },

  buttonsWrapper: {
    paddingHorizontal: 85,
  },

  cardWrapper: {
    paddingHorizontal: 37,
    marginVertical: 15,
  },

  cardText: {
    fontFamily: "Inter",
    fontSize: 25,
    fontWeight: "400",
    color: "#0D9488",
  },

  selectedCardText: {
    color: "#FFFFFF",
  },
});
