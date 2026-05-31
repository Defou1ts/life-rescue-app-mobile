import { useResetPassword } from "@/api/hooks/useResetPassword";
import { AppText } from "@/components/app-text";
import { AppButton } from "@/components/button";
import { Input } from "@/components/input";
import { Title } from "@/components/Title";
import { UnderlinedButton } from "@/components/underlined-text";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";

type FormValues = {
  token: string;
  newPassword: string;
  confirmPassword: string;
};

export default function NewPassword() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { mutate: resetPassword, isPending } = useResetPassword();

  const {
    control,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      token: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = () => {
    clearErrors();

    if (!email) {
      router.replace("/resetPassword");
      return;
    }

    const token = getValues("token").trim();
    const newPassword = getValues("newPassword");
    const confirmPassword = getValues("confirmPassword");

    if (!token) {
      setError("token", { message: "Verification code is required" });
      return;
    }

    if (!newPassword) {
      setError("newPassword", { message: "New password is required" });
      return;
    }

    if (newPassword.length < 6) {
      setError("newPassword", { message: "Minimum 6 characters" });
      return;
    }

    if (!confirmPassword) {
      setError("confirmPassword", { message: "Confirm password is required" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("confirmPassword", { message: "Passwords must match" });
      return;
    }

    resetPassword(
      {
        email: String(email),
        token,
        newPassword,
        confirmPassword,
      },
      {
        onSuccess: () => {
          router.replace("/signIn");
        },
      },
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleWrapper}>
        <Title>New Password</Title>
      </View>

      {!!email && (
        <View style={styles.descriptionWrapper}>
          <AppText>
            Enter the verification code sent to {email} and your new password
          </AppText>
        </View>
      )}

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

        <View>
          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="New Password"
                secure
                value={value ?? ""}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
              />
            )}
          />
          {errors.newPassword && (
            <Text style={styles.errorText}>{errors.newPassword.message}</Text>
          )}
        </View>

        <View>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Confirm Password"
                secure
                value={value ?? ""}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
              />
            )}
          />
          {errors.confirmPassword && (
            <Text style={styles.errorText}>
              {errors.confirmPassword.message}
            </Text>
          )}
        </View>
      </View>

      <AppButton
        containerStyle={styles.submitButton}
        type="primary"
        onPress={onSubmit}
        disabled={isPending}
      >
        {isPending ? "Updating..." : "Update Password"}
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
