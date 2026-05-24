import { useSignIn } from "@/api/hooks/useSignIn";
import { AppText } from "@/components/app-text";
import { AppButton } from "@/components/button";
import { Input } from "@/components/input";
import { Loading } from "@/components/loading";
import { Title } from "@/components/Title";
import { UnderlinedButton } from "@/components/underlined-text";
import { useLocalSearchParams, useNavigation } from "expo-router";

import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";

type VerifyEmailFormData = {
  verificationCode: string;
};

export default function VerifyEmail() {
  const { mutate, isPending, isError, error } = useSignIn();

  const local = useLocalSearchParams();

  const navigation = useNavigation();
  const email = local.email as string;
  const password = local.password as string;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyEmailFormData>({
    defaultValues: {
      verificationCode: "",
    },
  });

  const onSubmit = (data: VerifyEmailFormData) => {
    mutate({ email: email, token: data.verificationCode, password });
  };

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: 13 }}>
        <Title>Verification</Title>
      </View>
      <View style={{ marginBottom: 70 }}>
        <AppText>We’ve sent a 4-digit code to {email}</AppText>
      </View>

      <View style={styles.inputsContainer}>
        <View>
          <Controller
            control={control}
            name="verificationCode"
            rules={{
              required: "Verification Code is required",
            }}
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Verification Code"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            )}
          />

          {errors.verificationCode && (
            <Text style={styles.errorText}>
              {errors.verificationCode.message}
            </Text>
          )}
        </View>
      </View>
      {isPending && <Loading />}
      <AppButton
        containerStyle={{ marginTop: 27 }}
        type="primary"
        onPress={handleSubmit(onSubmit)}
      >
        Continue
      </AppButton>
      <UnderlinedButton
        onPress={() => {
          navigation.goBack();
        }}
        fontWeight="bold"
        style={{ marginTop: 20 }}
      >
        Go back
      </UnderlinedButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 42,
    justifyContent: "center",
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
});
