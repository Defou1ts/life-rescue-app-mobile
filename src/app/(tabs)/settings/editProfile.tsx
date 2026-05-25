import { useProfile } from "@/api/hooks/useProfile";
import { useUpdateProfile } from "@/api/hooks/useUpdateProfile";
import { AppText } from "@/components/app-text";
import { AppButton } from "@/components/button";
import { Input } from "@/components/input";
import { Host, Switch } from "@expo/ui/jetpack-compose";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import * as yup from "yup";

const schema = yup.object({
  fullName: yup
    .string()
    .test("full-name", "Enter first and last name", (value) => {
      if (!value) return false;

      const parts = value.trim().split(" ");

      return parts.length >= 2;
    })
    .required("Full name is required"),

  phoneNumber: yup.string().required("Phone number is required"),

  isTwoFactorEnabled: yup.boolean().required(),
});

type FormValues = yup.InferType<typeof schema>;
export default function EditProfile() {
  const { data, isLoading, isError } = useProfile();
  const { mutate, isPending } = useUpdateProfile();
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      isTwoFactorEnabled: false,
    },
  });

  const onSubmit = (values: FormValues) => {
    const [firstName, ...rest] = values.fullName.trim().split(" ");

    const lastName = rest.join(" ");

    mutate({
      firstName,
      lastName,
      phoneNumber: values.phoneNumber,
      isTwoFactorEnabled: values.isTwoFactorEnabled,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.center}>
        <Text>Error loading data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.inputsWrapper}>
          <View>
            <Input
              editable={false}
              value={data.email ?? ""}
              placeholder="Enter Email"
            />
          </View>

          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, value } }) => (
              <Input
                value={String(value ?? "")}
                onChangeText={onChange}
                placeholder="Enter First Name and Last Name"
              />
            )}
          />

          {errors.fullName && (
            <Text style={styles.error}>{errors.fullName.message}</Text>
          )}

          <View>
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, value } }) => (
                <Input
                  value={String(value ?? "")}
                  onChangeText={onChange}
                  placeholder="Enter Phone Number"
                />
              )}
            />

            {errors.phoneNumber && (
              <Text style={styles.error}>{errors.phoneNumber.message}</Text>
            )}
          </View>
        </View>

        <Controller
          control={control}
          name="isTwoFactorEnabled"
          render={({ field: { onChange, value } }) => (
            <View style={styles.switchWrapper}>
              <AppText>Two Factor Authentication</AppText>

              <Host matchContents>
                <Switch
                  value={value}
                  onCheckedChange={onChange}
                  colors={{
                    checkedThumbColor: "#098E89",
                    checkedTrackColor: "#66B9B4",
                    uncheckedThumbColor: "#66B9B4",
                    uncheckedTrackColor: "#DFE5E9",
                    uncheckedBorderColor: "#098E89",
                  }}
                />
              </Host>
            </View>
          )}
        />

        <AppButton
          onPress={() => router.push("/settings/editAllergy")}
          containerStyle={styles.button}
          type="primary"
        >
          Edit Allergy
        </AppButton>

        <AppButton
          onPress={() => router.push("/settings/editDisease")}
          containerStyle={styles.button}
          type="primary"
        >
          Edit Disease
        </AppButton>

        <AppButton containerStyle={[styles.button, styles.kyc]} type="primary">
          Send KYC
        </AppButton>

        <AppButton
          containerStyle={styles.save}
          type="primary"
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save"}
        </AppButton>
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  contentWrapper: {
    width: "80%",
  },

  inputsWrapper: {
    gap: 24,
    marginBottom: 32,
  },

  switchWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  button: {
    marginTop: 8,
  },

  kyc: {
    backgroundColor: "#F59E0B",
  },

  save: {
    marginTop: 50,
  },

  error: {
    color: "red",
    marginTop: 4,
    fontSize: 12,
  },
});
