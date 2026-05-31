import { useSendEmailVerification } from "@/api/hooks/useSendEmailVerification";
import { useUpdateEmail } from "@/api/hooks/useUpdateEmail";
import { AppText } from "@/components/app-text";
import { AppButton } from "@/components/button";
import { Input } from "@/components/input";
import { Title } from "@/components/Title";
import { UnderlinedButton } from "@/components/underlined-text";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";

type FormValues = {
  newEmail: string;
  token: string;
};

export default function ChangeEmail() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "verify">("email");

  const { mutate: sendCode, isPending: isSendingCode } =
    useSendEmailVerification();
  const { mutate: updateEmail, isPending: isUpdatingEmail } = useUpdateEmail();

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      newEmail: "",
      token: "",
    },
  });

  const onSendCode = () => {
    clearErrors();
    const newEmail = getValues("newEmail").trim();

    if (!newEmail) {
      setError("newEmail", { message: "Email is required" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setError("newEmail", { message: "Enter a valid email" });
      return;
    }

    sendCode(newEmail, {
      onSuccess: () => {
        setValue("token", "");
        setStep("verify");
      },
    });
  };

  const onVerify = handleSubmit((values) => {
    const token = values.token.trim();

    if (!token) {
      setError("token", { message: "Verification code is required" });
      return;
    }

    updateEmail(
      { newEmail: values.newEmail.trim(), token },
      {
        onSuccess: () => {
          router.back();
        },
      },
    );
  });

  return (
    <View style={styles.container}>
      <View style={styles.titleWrapper}>
        <Title>Change Email</Title>
      </View>

      {step === "email" ? (
        <>
          <View style={styles.descriptionWrapper}>
            <AppText>
              Enter your new email address to receive a verification code
            </AppText>
          </View>

          <View style={styles.inputsContainer}>
            <View>
              <Controller
                control={control}
                name="newEmail"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="New Email"
                    value={value ?? ""}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                  />
                )}
              />
              {errors.newEmail && (
                <Text style={styles.errorText}>{errors.newEmail.message}</Text>
              )}
            </View>
          </View>

          <AppButton
            containerStyle={styles.submitButton}
            type="primary"
            onPress={onSendCode}
            disabled={isSendingCode}
          >
            {isSendingCode ? "Sending..." : "Send Code"}
          </AppButton>
        </>
      ) : (
        <>
          <View style={styles.descriptionWrapper}>
            <AppText>
              We&apos;ve sent a verification code to {getValues("newEmail")}
            </AppText>
          </View>

          <View style={styles.inputsContainer}>
            <View>
              <Controller
                control={control}
                name="token"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Verification Code"
                    value={value ?? ""}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="one-time-code"
                    textContentType="oneTimeCode"
                  />
                )}
              />
              {errors.token && (
                <Text style={styles.errorText}>{errors.token.message}</Text>
              )}
            </View>
          </View>

          <AppButton
            containerStyle={styles.submitButton}
            type="primary"
            onPress={onVerify}
            disabled={isUpdatingEmail}
          >
            {isUpdatingEmail ? "Updating..." : "Update Email"}
          </AppButton>

          <UnderlinedButton
            onPress={() => {
              setValue("token", "");
              clearErrors("token");
              setStep("email");
            }}
            fontWeight="regular"
            style={styles.resendButton}
          >
            Change email address
          </UnderlinedButton>
        </>
      )}

      <UnderlinedButton
        onPress={() => router.back()}
        fontWeight="bold"
        style={styles.backButton}
      >
        Back to Settings
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
  titleWrapper: {
    marginBottom: 13,
  },
  descriptionWrapper: {
    marginBottom: 70,
  },
  inputsContainer: {
    gap: 36,
    marginBottom: 70,
  },
  submitButton: {
    marginTop: 27,
  },
  resendButton: {
    marginTop: 20,
  },
  backButton: {
    marginTop: 20,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 13,
    marginTop: 8,
    fontWeight: "500",
  },
});
