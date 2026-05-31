import { useRequestPasswordRecovery } from "@/api/hooks/useRequestPasswordRecovery";
import { AppText } from "@/components/app-text";
import { AppButton } from "@/components/button";
import { Input } from "@/components/input";
import { Title } from "@/components/Title";
import { UnderlinedButton } from "@/components/underlined-text";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";

type FormValues = {
  email: string;
};

export default function ResetPassword() {
  const router = useRouter();
  const { mutate: requestRecovery, isPending } = useRequestPasswordRecovery();

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { email: "" },
  });

  const onSubmit = ({ email }: FormValues) => {
    clearErrors();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("email", { message: "Email is required" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("email", { message: "Enter a valid email" });
      return;
    }

    requestRecovery(trimmedEmail, {
      onSuccess: () => {
        router.push({
          pathname: "/newPassword",
          params: { email: trimmedEmail },
        });
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleWrapper}>
        <Title>Reset Password</Title>
      </View>

      <View style={styles.descriptionWrapper}>
        <AppText>
          Enter your email address and we will send you a verification code to
          reset your password
        </AppText>
      </View>

      <View style={styles.inputsContainer}>
        <View>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Email"
                value={value ?? ""}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            )}
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email.message}</Text>
          )}
        </View>
      </View>

      <AppButton
        containerStyle={styles.submitButton}
        type="primary"
        onPress={handleSubmit(onSubmit)}
        disabled={isPending}
      >
        {isPending ? "Sending..." : "Send Code"}
      </AppButton>

      <UnderlinedButton
        onPress={() => router.replace("/signIn")}
        fontWeight="bold"
        style={styles.backButton}
      >
        Back to Log In
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
