import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      initialRouteName="request"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#EBF1F5" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="signIn" options={{ title: "SignIn" }} />
      <Stack.Screen name="signUp" options={{ title: "SignUp" }} />
      <Stack.Screen
        name="resetPassword"
        options={{ title: "Reset Password" }}
      />
      <Stack.Screen name="verifyEmail" options={{ title: "Verify Email" }} />
      <Stack.Screen name="newPassword" options={{ title: "New Password" }} />
      <Stack.Screen name="request" options={{ title: "Request" }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
