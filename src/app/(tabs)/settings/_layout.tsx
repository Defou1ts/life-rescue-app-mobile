import { Stack } from "expo-router";

import "react-native-gesture-handler";

export const SETTINGS_SCREEN_NAMES = {
  INDEX: "index",
  EDIT_PROFILE: "editProfile",
  CHANGE_PASSWORD: "changePassword",
  CHANGE_EMAIL: "changeEmail",
  EDIT_DISEASE: "editDisease",
  EDIT_ALLERGY: "editAllergy",
  ADD_ALLERGY: "addAllergy",
} as const;

export default function SettingsLayout() {
  return (
    <Stack
      initialRouteName={SETTINGS_SCREEN_NAMES.INDEX}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#EBF1F5" },
      }}
    >
      <Stack.Screen
        name={SETTINGS_SCREEN_NAMES.INDEX}
        options={{ title: "Home" }}
      />
      <Stack.Screen
        name={SETTINGS_SCREEN_NAMES.EDIT_PROFILE}
        options={{ title: "Edit Profile" }}
      />
      <Stack.Screen
        name={SETTINGS_SCREEN_NAMES.CHANGE_PASSWORD}
        options={{ title: "Change Password" }}
      />
      <Stack.Screen
        name={SETTINGS_SCREEN_NAMES.CHANGE_EMAIL}
        options={{ title: "Change  Email" }}
      />
      <Stack.Screen
        name={SETTINGS_SCREEN_NAMES.EDIT_ALLERGY}
        options={{ title: "Edit Allergy" }}
      />
      <Stack.Screen
        name={SETTINGS_SCREEN_NAMES.ADD_ALLERGY}
        options={{ title: "Add Allergy" }}
      />
      <Stack.Screen
        name={SETTINGS_SCREEN_NAMES.EDIT_DISEASE}
        options={{ title: "Edit Disease" }}
      />
    </Stack>
  );
}
