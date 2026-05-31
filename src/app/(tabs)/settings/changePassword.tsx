import { useUpdatePassword } from "@/api/hooks/useUpdatePassword";
import { AppButton } from "@/components/button";
import { Input } from "@/components/input";
import { Title } from "@/components/Title";
import { UnderlinedButton } from "@/components/underlined-text";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import * as yup from "yup";

const schema = yup.object({
  oldPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .required("New password is required")
    .min(6, "Minimum 6 characters"),
  confirmPassword: yup
    .string()
    .required("Confirm password is required")
    .oneOf([yup.ref("newPassword")], "Passwords must match"),
});

type FormValues = yup.InferType<typeof schema>;

export default function ChangePassword() {
  const router = useRouter();
  const { mutate, isPending } = useUpdatePassword();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    mutate(values, {
      onSuccess: () => {
        reset();
        router.back();
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleWrapper}>
        <Title>New Password</Title>
      </View>

      <View style={styles.inputsContainer}>
        <View>
          <Controller
            control={control}
            name="oldPassword"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Current Password"
                secure
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
              />
            )}
          />
          {errors.oldPassword && (
            <Text style={styles.errorText}>{errors.oldPassword.message}</Text>
          )}
        </View>

        <View>
          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="New Password"
                secure
                value={value}
                onChangeText={onChange}
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
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Confirm Password"
                secure
                value={value}
                onChangeText={onChange}
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
        onPress={handleSubmit(onSubmit)}
        disabled={isPending}
      >
        {isPending ? "Updating..." : "Update Password"}
      </AppButton>

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
